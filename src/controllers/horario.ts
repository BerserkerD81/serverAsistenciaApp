import { Request, Response } from "express";
import { Cursos } from '../models/Cursos';
import { CursosAsignados } from "../models/CursosAsignados";
import { PeriodoAcademico } from "../models/PeriodoAcademico";
import { User } from '../models/user';
import sequelize from '../db/conection'; // Adjust based on your setup
import Asistencia from "../models/Asistencia";
import { Sala } from "../models/sala";

interface CursoAttributes {
    id: number;
    nombre: string | null;
    seccion: number;
    horaInicio: string | null;
    horaFin: string | null;
    dia: number;
    sala_id: number | null;
}

interface CursoInstance extends CursoAttributes {
    createdAt?: Date;
    updatedAt?: Date;
}

export const getHorario = async (req: Request, res: Response) => {
    const { rut } = req.body;

    try {
        // Find the user by rut
        const user = await User.findOne({ where: { rut } });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Find the latest academic period
        const ultimoPeriodo= await PeriodoAcademico.findOne({
            order: [['id', 'DESC']] });

        if (!ultimoPeriodo || !ultimoPeriodo.dataValues.label) {
            return res.status(404).json({ message: "No se encontró ningún periodo académico válido" });
        }

        // Find assigned courses for the user in the latest semester
        const cursosAsignados = await CursosAsignados.findAll({
            where: {
                usuario_id: user.id,
                semestre: ultimoPeriodo.dataValues.label
            }
        });

        if (!cursosAsignados.length) {
            return res.status(404).json({ message: "No hay cursos asignados para este usuario en el último semestre" });
        }

        // Prepare an array to store course schedules
        let horario: CursoInstance[] = [];

        // Retrieve course details for each assigned course
        for (let matriculado of cursosAsignados) {
            const cursos = await Cursos.findAll({
                where: {
                    seccion: matriculado.dataValues.curso_seccion,
                    nombre: matriculado.dataValues.curso_nombre
                }
            });
            for (let curso of cursos) {
            if (curso) {
                let sala = await Sala.findByPk(curso.dataValues.sala_id);

                // Push relevant data into horario array
                horario.push({
                    id: curso.dataValues.id,
                    nombre: curso.dataValues.nombre,
                    seccion: curso.dataValues.seccion,
                    horaInicio: curso.dataValues.horaInicio,
                    horaFin: curso.dataValues.horaFin,
                    dia: curso.dataValues.dia,
                    sala_id: sala?.dataValues.label,
                    createdAt: curso.dataValues.createdAt,
                    updatedAt: curso.dataValues.updatedAt
                });
            }}
        }

        res.status(200).json({ horario });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener los cursos" });
    }
};

export const eliminarMatricula = async (req: Request, res: Response) => {
    const { rut, nombre, seccion } = req.body;

    try {
        const user = await User.findOne({ where: { rut } });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const ultimoPeriodo = await PeriodoAcademico.findOne({
            order: [['id', 'DESC']]
        });

        if (!ultimoPeriodo || !ultimoPeriodo.dataValues.label) {
            return res.status(404).json({ message: "No se encontró ningún periodo académico válido" });
        }

        const transaction = await sequelize.transaction();

        try {
            const resultadoMatricula = await CursosAsignados.destroy({
                where: {
                    usuario_id: user.id,
                    curso_nombre: nombre,
                    curso_seccion: seccion,
                    semestre: ultimoPeriodo.dataValues.label
                },
                transaction
            });

            if (resultadoMatricula === 0) {
                await transaction.rollback();
                return res.status(404).json({ message: "No se encontró ninguna matrícula para eliminar" });
            }

            await Asistencia.destroy({
                where: {
                    profesor_rut: user.rut,
                    curso_nombre: nombre,
                    seccion: seccion,
                    semestre: ultimoPeriodo.dataValues.label
                },
                transaction
            });

            await transaction.commit();
            res.json({ message: "Matrícula y asistencias eliminadas correctamente" });

        } catch (error) {
            await transaction.rollback();
            throw error; // Propagate error to outer handler
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar la matrícula" });
    }
};
