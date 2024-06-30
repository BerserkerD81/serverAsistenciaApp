import { Request, Response } from "express";
import { Cursos } from '../models/Cursos';

export const getCursos = async (req: Request, res: Response) => {
    try {
        const cursos = await Cursos.findAll(); // Asumiendo que estás usando Sequelize para interactuar con la base de datos
        res.json({
            message: "Lista de cursos obtenida exitosamente",
            data: cursos,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener los cursos",
        });
    }
};
