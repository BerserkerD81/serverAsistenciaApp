import { Request, Response } from "express";
import { Op } from "sequelize";
import Asistencia from "../models/Asistencia";

export const setExecpcion = async (req: Request, res: Response) => {
    const { fecha_inicio, fecha_fin, hora_inicio, hora_fin } = req.body;

    try {
        // Buscar todas las asistencias dentro del rango de fechas y horas especificadas
        let Asistencias = await Asistencia.findAll({
            where: {
                fecha: { [Op.gte]: fecha_inicio, [Op.lte]: fecha_fin },
                hora_inicio: { [Op.gte]: hora_inicio },
                hora_fin: { [Op.lte]: hora_fin }
            }
        });

        // Actualizar el estado de todas las asistencias encontradas a "presente"
        await Asistencia.update(
            {
                estado: "Presente",
                motivo: "excepcion"
            },
            {
                where: {
                    fecha: { [Op.gte]: fecha_inicio, [Op.lte]: fecha_fin },
                    hora_inicio: { [Op.gte]: hora_inicio },
                    hora_fin: { [Op.lte]: hora_fin }
                }
            }
        );

        res.json({
            message: "Asistencias puestas presentes exitosamente"
        });
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: error,
        });
    }
};
