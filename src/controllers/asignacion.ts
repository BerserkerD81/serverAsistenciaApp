import { Request, Response } from "express";
import Asistencia from '../models/Asistencia';
import { CursosAsignados } from '../models/CursosAsignados';
import { Cursos } from '../models/Cursos';
import { User } from '../models/user';
import { Sala } from '../models/sala'; // Importar el modelo de Sala
import moment from 'moment';
import { Op } from 'sequelize';
import { Area } from '../models/Area';
import { Edificio } from '../models/edificios';
import {PeriodoAcademico} from '../models/PeriodoAcademico';

// Define una interfaz para el modelo de Cursos
interface Curso {
    nombre: string;
    horaInicio: string;
    horaFin: string;
    dia: number;
    seccion: string;
    // Agrega cualquier otra propiedad que necesites
}

export const setAsignacion = async (req: Request, res: Response) => {
    const { rut, nombre, seccion, provisorio, salaEscaneada, ip, latitud, longitud, } = req.body;

    try {
        // Obtener el usuario_id usando el rut proporcionado
        const usuario = await User.findOne({
            where: { rut: rut }
        });

        if (!usuario) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        const salaEncontrada = await Sala.findOne({ where: { label: salaEscaneada } });
        if (!salaEncontrada) {
            return res.status(404).json({ msg: `No se encontró la sala con el label ${salaEscaneada}` });
        }
        const areaEncontrada = await Area.findByPk(salaEncontrada.dataValues.area_id);
        if (!areaEncontrada) {
            return res.status(404).json({ msg: `No se encontró el área correspondiente a la sala` });
        }
        const edificioEncontrado = await Edificio.findOne({ where: { nombre_edificio: areaEncontrada.dataValues.nombre } });
        if (!edificioEncontrado) {
            return res.status(404).json({ msg: `No se encontró el edificio` });
        }
  	const periodo = await PeriodoAcademico.findOne({
        order: [['id', 'DESC']] });
	if (!periodo) {
        return res.status(404).json({ msg: `No se encontró el PeriodoAcademico` });
        }
        console.log("periodoAcademico end.date:", periodo.dataValues.endDate)

                // Validar que la latitud y longitud estén dentro del rango del edificio
                const latitudEdificio = parseFloat(edificioEncontrado.dataValues.latitud);
                const longitudEdificio = parseFloat(edificioEncontrado.dataValues.longitud);
                const radioEdificio = edificioEncontrado.dataValues.radio;
                const distancia = calcularDistancia(latitud, longitud, latitudEdificio, longitudEdificio);
                console.log("distancia:", distancia);
                if (distancia > radioEdificio) {
                    return res.status(400).json({ msg: 'La ubicación ingresada está fuera del rango del edificio' });
                }

        const usuario_id = usuario.dataValues.id;

        if (provisorio == false) {
            // Verificar si ya existe una asignación para el usuario y el curso
            const asignacionExistente = await CursosAsignados.findOne({
                where: {
                    usuario_id: usuario_id,
                    curso_nombre: nombre,
                    curso_seccion: seccion,
                    semestre:periodo.dataValues.label
                }
            });
            

            if (!asignacionExistente) {
            // Crear una nueva fila en la tabla CursosAsignados usando el usuario_id obtenido
            await CursosAsignados.create({
                usuario_id: usuario_id,
                curso_nombre: nombre,
                curso_seccion: seccion,
                semestre:periodo.dataValues.label 
            });}

            // Crear filas de asistencias para las próximas dos semanas si no existen
            const crearAsistenciasParaDosSemanas = async () => {
                const hoy = moment().tz('America/Santiago');
                const diahoy = moment().tz('America/Santiago').format('YYYY-MM-DD');
            
                
            
                // Iterar sobre cada día desde hoy hasta dos semanas después
                while (hoy.isSameOrBefore(periodo.dataValues.fecha_fin, 'day')) {
                    const fecha = hoy.format('YYYY-MM-DD');
// Verificar si ya existe una asistencia para esta fecha, curso y sección
const asistenciasExistentes = await Asistencia.findAll({
    where: {
        fecha: fecha,
        curso_nombre: nombre,
        seccion: seccion
    }
});

// Verificar si ya existe un curso asignado para este usuario y esta sección del curso
const cursosAsignados = await CursosAsignados.findAll({
    where: {
        curso_nombre: nombre,
        curso_seccion: seccion,
        usuario_id: usuario_id,
        semestre: periodo.dataValues.label
    }
});

// Iterar sobre todos los cursos asignados para este usuario y esta sección
for (let asignacion of cursosAsignados) {
    // Obtener la sala correspondiente al curso encontrado
    const curso = await Cursos.findOne({
        where: {
            nombre: asignacion.dataValues.curso_nombre,  // Asegúrate de tener un campo 'curso_id' o similar en tu modelo CursosAsignados
            dia: hoy.isoWeekday()
        }
    });

    // Continuar con el siguiente curso si no se encontró ninguno
    if (!curso) {
        console.log("No se encontró el curso para el día:", hoy.format('YYYY-MM-DD'));
        hoy.add(1, 'day');
        continue;
    }

    // Obtener la sala correspondiente al curso encontrado
    const sala = await Sala.findOne({
        where: { id: curso.dataValues.sala_id }
    });

    // Si no se encuentra la sala correspondiente, continuar con el siguiente curso
    if (!sala) {
        console.log("No se encontró la sala para el curso:", curso.dataValues.nombre);
        continue;
    }
let auxhoraActual= null;
    let estado = "Ausente"; // Establecer el estado predeterminado
    console.log("var hoy=", hoy);
    console.log("var diaHoy", diahoy);
let semaforoAux="";
let aux= 0;
let locacion="";
    if (hoy.format('YYYY-MM-DD') == diahoy) {
        console.log("entro al if");
        const horaActual = moment().tz('America/Santiago').format('HH:mm:ss');

        if (moment(horaActual, 'HH:mm:ss').isBetween(moment(curso.dataValues.horaInicio, 'HH:mm:ss'), moment(curso.dataValues.horaFin, 'HH:mm:ss'))) {
            estado = "Presente";
            semaforoAux="Marcado de Inicio de Clase solamente"
            aux=1;
            locacion = latitud + "," + longitud;
            auxhoraActual=horaActual
            console.log("llego:" + estado);
        }
    }

    console.log("actual:" + estado);

    // Crear la fila de asistencia correspondiente
    const horaActual = moment().tz('America/Santiago').format('HH:mm:ss');

    await Asistencia.create({
        curso_nombre: curso.dataValues.nombre,
        fecha: fecha,
        hora_inicio: curso.dataValues.horaInicio,
        hora_fin: curso.dataValues.horaFin,
        dia: curso.dataValues.dia,
        estado: estado,
        profesor_rut: rut,
        seccion: curso.dataValues.seccion,
        sala: sala.dataValues.label,
        ip: ip,
        locacion: locacion,
        hora_iniciada: auxhoraActual,
        realizandose: aux,
        semaforo: semaforoAux,
        semestre: periodo.dataValues.label
    });

    console.log(`Fila de asistencia creada para ${fecha} - Curso: ${curso.dataValues.nombre}, Sección: ${curso.dataValues.seccion}`);
}

                    
            
                    // Moverse al siguiente día
                    hoy.add(1, 'day');
                }
            };
            

            // Llamar a la función para crear las asistencias para las próximas dos semanas
            await crearAsistenciasParaDosSemanas();

            // Si se crea la fila con éxito, enviar una respuesta
            return res.status(200).json({ message: "Matricula creada exitosamente y filas de asistencias generadas hasta fin de semestre" });
        } else {
            // Caso provisorio verdadero
            const hoy = moment().tz('America/Santiago');
            const diaActual = hoy.isoWeekday();
            const horaActual = moment().tz('America/Santiago').format('HH:mm:ss');

            // Buscar el curso que coincida con el nombre, seccion, día actual y cuyo rango de horas contenga la hora actual
            const curso = await Cursos.findOne({
                where: {
                    nombre: nombre,
                    seccion: seccion,
                    dia: diaActual,
                    horaInicio: { [Op.lte]: horaActual },
                    horaFin: { [Op.gte]: horaActual }
                }
            });

            if (curso) {
                                // Obtener la sala correspondiente al curso encontrado
                                const sala = await Sala.findOne({
                                    where: { id: curso.dataValues.sala_id }
                                });
                
                                if (!sala) {
                                    return res.status(404).json({ message: "Sala no encontrada para el curso actual" });
                                }
                                let locacion = latitud + "," + longitud;
				const horaActual = moment().tz('America/Santiago').format('HH:mm:ss');
                
                                // Crear una fila de asistencia para el curso encontrado
                                await Asistencia.create({
                                    curso_nombre: curso.dataValues.nombre,
                                    fecha: hoy.format('YYYY-MM-DD'),
                                    hora_inicio: curso.dataValues.horaInicio,
                                    hora_fin: curso.dataValues.horaFin,
                                    dia: curso.dataValues.dia,
                                    estado: 'Provisorio', // Por defecto, el estado es pendiente
                                    profesor_rut: rut, // Usar el rut proporcionado
                                    seccion: curso.dataValues.seccion,
                                    sala: sala.dataValues.label, // Usar la etiqueta de la sala en lugar del ID de la sala
                                    ip: ip,
                                    locacion: locacion,                            
			            hora_iniciada:horaActual,
                                    realizandose:1,
                                    semaforo:"Marcado de Inicio de Clase solamente",
			            semestre:periodo.dataValues.label 
                
                                });
                
                                return res.status(200).json({ message: "Asistencia provisoria creada exitosamente para el curso actual" });
                            
            } else {
                return res.status(404).json({ message: "No hay cursos coincidentes con los criterios actuales" });
            }
        }
    } catch (error) {
        // Si hay algún error, enviar una respuesta de error
        console.log(error);
        return res.status(500).json({ message: "Error al crear la asignación", error: error });
    }
};
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 * 1000; // Radio de la Tierra en metros
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    return distancia;
}

function toRad(valor: number) {
    return valor * Math.PI / 180;
}
