import { Request, Response } from "express";
import {PeriodoAcademico} from '../models/PeriodoAcademico';


export const getPeriodos = async (req: Request, res: Response) => {
    try {
        const periodo = await PeriodoAcademico.findAll(); // Asumiendo que estás usando Sequelize para interactuar con la base de datos
        res.json({
            message: "Lista de cursos obtenida exitosamente",
            data: periodo,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener los Semestres",
        });
    }
};
