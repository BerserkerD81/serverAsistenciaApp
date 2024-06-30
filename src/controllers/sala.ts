import { Request, Response } from "express";

import { Sala } from "../models/sala";



export const getsala = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await Sala.findAll({});
        res.json(data);
    } catch (error) {
        res.status(400).json({
            msg: 'Error al obtener las salas',
            error,
        });
    }
};