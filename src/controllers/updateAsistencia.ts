import { Request, Response } from 'express';
import Asistencia from '../models/Asistencia';

export const updateAsistencia = async (req: Request, res: Response) => {
    const { id } = req.body;
    
    try {
        const update = await Asistencia.findByPk(id);

        if (!update) {
            return res.status(404).json({
                msg: `Asistencia con id ${id} no encontrada`
            });
        }

        update.estado = 'Presente';

        await update.save();

        res.json({
            msg: 'Asistencia actualizada exitosamente!'
        });
    } catch (error) {
        res.status(400).json({
            msg: 'Upps ocurrió un error',
            error
        });
    }
};