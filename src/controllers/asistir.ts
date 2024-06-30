import { Request, Response } from 'express';
import Asistencia from '../models/Asistencia';
import moment from 'moment-timezone';
import { Op } from 'sequelize';
import { Sala } from '../models/sala';
import { Area } from '../models/Area';
import { Edificio } from '../models/edificios';

export const postAsistencia = async (req: Request, res: Response) => {
    const { rut, sala, latitud, longitud, ip } = req.body;
    console.log(req.body);

    try {
        const currentTime = moment.tz('America/Santiago').format('HH:mm:ss');
        const today = moment.tz('America/Santiago').format('YYYY-MM-DD');
        const endTimeMargin = moment(currentTime, 'HH:mm:ss').subtract(8, 'minutes').format('HH:mm:ss');

        let asistencia = await Asistencia.findOne({
            where: {
                fecha: today,
                profesor_rut: rut,
                hora_inicio: { [Op.lte]: currentTime },
                hora_fin: { [Op.gte]: endTimeMargin } // Adjusted query
            }
        });

        if (!asistencia) {
            console.log("No se encontró asistencia");
            return res.status(404).json({ msg: `No se encontró asistencia para el rut ${rut} en la fecha actual` });
        }
        let msg = "";

        if (asistencia.realizandose === 0 && asistencia.estado === "Ausente") {
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

            // Validar que la latitud y longitud estén dentro del rango del edificio
            const latitudEdificio = parseFloat(edificioEncontrado.dataValues.latitud);
            const longitudEdificio = parseFloat(edificioEncontrado.dataValues.longitud);
            const radioEdificio = edificioEncontrado.dataValues.radio;
            const distancia = calcularDistancia(latitud, longitud, latitudEdificio, longitudEdificio);
            console.log("distancia:", distancia);
            if (distancia > radioEdificio) {
                return res.status(400).json({ msg: 'La ubicación ingresada está fuera del rango del edificio' });
            }

            if (asistencia.sala === sala) {
                asistencia.estado = 'Presente';
            } else {
                asistencia.estado = 'Provisorio';
                asistencia.sala = sala;
            }

            asistencia.hora_iniciada = currentTime;
            asistencia.realizandose = 1;
            asistencia.semaforo= "Marcado de inicio de Clase Solamente"
            asistencia.locacion = `${latitud},${longitud}`;
            asistencia.ip = ip;
            await asistencia.save();
            msg="Asistencia encontrada exitosamente y estado actualizado!"
        } else if (asistencia.estado !== "Ausente" && asistencia.realizandose === 1) {

	    if(asistencia.hora_finalizada==null){
            asistencia.hora_finalizada = currentTime;
            asistencia.semaforo= "Marcado de inicio de Clase y Maracado de cierre de clase"
            await asistencia.save();
msg="Asistencia ha sido cerrada correctamente "
}
            else{
            msg="Asistencia habia sido cerrada correctamente "
            }
        }
        res.json({
            msg: msg,
            asistencia:asistencia
        });
    } catch (error) {
        res.status(400).json({ msg: 'Ocurrió un error', error });
    }
};
export const cerrarAsistencia = async (req: Request, res:Response)=>{
    const { rut} = req.body;
    console.log(req.body);
    try{const currentTime = moment.tz('America/Santiago').format('HH:mm:ss');
    const today = moment.tz('America/Santiago').format('YYYY-MM-DD');
    const endTimeMargin = moment(currentTime, 'HH:mm:ss').subtract(8, 'minutes').format('HH:mm:ss');

    let asistencia = await Asistencia.findOne({
        where: {
            fecha: today,
            profesor_rut: rut,
            hora_inicio: { [Op.lte]: currentTime },
            hora_fin: { [Op.gte]: endTimeMargin } // Adjusted query
        }
    });

    if (!asistencia) {
        console.log("No se encontró asistencia");
        return res.status(404).json({ msg: `No se encontró asistencia para el rut ${rut} en la fecha actual` });
    }
    if (asistencia.estado !== "Ausente" && asistencia.realizandose === 1) {
        asistencia.hora_finalizada = currentTime;
 asistencia.semaforo= "Marcado de inicio de Clase y Maracado de cierre de clase"
        await asistencia.save();
    }
	res.json({
            msg: 'Asistencia cerrada correctamente!'});
           

}

    catch(error)
    {
        res.status(400).json({ msg: 'Ocurrió un error', error });
    }

};

// Función para calcular la distancia entre dos puntos geográficos
function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 * 1000; // Radio de la Tierra en metros
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(valor: number): number {
    return valor * Math.PI / 180;
}
