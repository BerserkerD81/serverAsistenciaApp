import { Request, Response } from "express";
import  Asistencia  from "../models/Asistencia";
import { Op } from "sequelize";
import { Sala } from '../models/sala';
import { Area } from '../models/Area';
import { Edificio } from '../models/edificios';
import moment from 'moment';
import {PeriodoAcademico} from '../models/PeriodoAcademico';
import {User} from '../models/user';

export const getAsistencia = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await Asistencia.findAll({});
        res.json(data);
    } catch (error) {
        res.status(400).json({
            msg: 'Error al obtener la asistencia',
            error,
        });
    }
};
export const getAsistenciaCarrera = async (req: Request, res: Response): Promise<void> => {
    const { carrera, rol } = req.body;
    try {
        if (rol === "Administrador") {
            const data = await Asistencia.findAll({});
            res.json(data);
        } else {
            const users = await User.findAll({
                where: {
                    [Op.or]: [
                        { carrera: carrera },
                        { carrera: "Plan Comun" }
                    ]
                }
            });

            if (users.length > 0) {
                const userRuts = users.map(user => user.rut);
                const currentDatePlusOne = moment.tz("America/Santiago").add(1, 'day').endOf('day').toDate();

                const asistencias = await Asistencia.findAll({
                    where: {
                        profesor_rut: {
                            [Op.in]: userRuts
                        }
                    }
                });

                // Filtrar asistencias con fecha como string
                const asistenciasFiltradas = asistencias.filter(asistencia => {
                    const asistenciaFecha = moment(asistencia.fecha, 'YYYY-MM-DD'); // Ajusta el formato según corresponda
                    return asistenciaFecha.isSameOrBefore(currentDatePlusOne);
                });

                res.json(asistenciasFiltradas);
            } else {
                res.status(404).json({ msg: 'No se encontraron usuarios con esa carrera' });
            }
        }
    } catch (error) {
        res.status(400).json({
            msg: 'Error al obtener la asistencia',
            error,
        });
    }
};

export const asistenciaManual = async (req: Request, res: Response) => {

    const { curso_nombre, fecha, hora_inicio, hora_fin, dia, estado, motivo, profesor_rut, seccion, sala ,latitud,longitud,ip} = req.body;

    try {
        console.log(req.body);

        // Buscar si ya existe una asistencia para el profesor, el curso y la fecha dada
        let asistencia = await Asistencia.findOne({
            where: {
                fecha: fecha,
                curso_nombre:curso_nombre,
                profesor_rut: profesor_rut,
                hora_inicio: {
                    [Op.lte]: hora_inicio // Hora inicio <= hora actual
                },
                hora_fin: {
                    [Op.gte]: hora_fin // Hora fin >= hora actual
                }
            }
        });
        const salaEncontrada = await Sala.findOne({ where: { label: sala } });
        if (!salaEncontrada) {
            return res.status(404).json({ msg: `No se encontró la sala con el label ${sala}` });
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

        // Validar que la latitud y longitud estén dentro del rango del edificio
        const latitudEdificio = parseFloat(edificioEncontrado.dataValues.latitud);
        const longitudEdificio = parseFloat(edificioEncontrado.dataValues.longitud);
        const radioEdificio = edificioEncontrado.dataValues.radio;
        const distancia = calcularDistancia(latitud, longitud, latitudEdificio, longitudEdificio);
	console.log("distancia:",distancia);
        if (distancia > radioEdificio) {
            return res.status(400).json({ msg: 'La ubicación ingresada está fuera del rango del edificio' });
        }

        if (asistencia) {
            // Si existe, actualizar la entrada existente
            asistencia.estado = 'Presente';
            let locacion=latitud+","+longitud;
                    asistencia.estado = 'Provisorio';
		    asistencia.locacion =locacion;
                    asistencia.ip=ip;
                    asistencia.motivo=motivo;
const horaActual = moment().tz('America/Santiago').format('HH:mm:ss');
                    asistencia.hora_iniciada=horaActual;
		   asistencia.realizandose =1;

            asistencia.sala =sala;
            await asistencia.save();

            res.json({
                msg: `Asistencia actualizada exitosamente`
            });
        } else {
let hora_iniciada= moment().tz('America/Santiago').format('HH:mm:ss');
                  

            let locacion=latitud+","+longitud;
            let semestre=periodo.dataValues.label
            let realizandose=1;
            // Si no existe, crear una nueva entrada
            await Asistencia.create({
                curso_nombre,
                fecha,
                hora_inicio,
                hora_fin,
                dia,
                estado,
                motivo,
                profesor_rut,
                seccion,
                sala,
		        ip,
                locacion,
                realizandose,
	        hora_iniciada,
            semestre


            });

            res.json({
                msg: `Ingreso registrado exitosamente`
            });
        }
    } catch (error) {
        res.status(400).json({
            msg: "Error al ingresar", error
        });
    }
};
// Función para calcular la distancia entre dos puntos geográficos
function calcularDistancia(lat1:number, lon1:number, lat2:number, lon2:number) {
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

function toRad(valor:number) {
    return valor * Math.PI / 180;
}
