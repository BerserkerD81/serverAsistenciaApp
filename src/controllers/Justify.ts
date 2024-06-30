import { Request, Response } from 'express';
import Asistencia from '../models/Asistencia';

export const postJustify = async (req: Request, res: Response) => {
    const { id, motivo } = req.body;

    try {
        // Buscamos la justificación existente por su ID
        const justification = await Asistencia.findByPk(id);

        if (!justification) {
            return res.status(404).json({
                msg: `Justificación con id ${id} no encontrada`
            });
        }

        // Actualizamos el motivo de la justificación
        justification.motivo = motivo;

        // Guardamos los cambios en la base de datos
        await justification.save();

        res.json({
            msg: 'Justificación actualizada exitosamente!'
        });
    } catch (error) {
        res.status(400).json({
            msg: 'Upps ocurrió un error',
            error
        });
    }
};
