import { Request, Response } from "express";
import Asistencia from '../models/Asistencia';
import moment from 'moment';
import { Op } from 'sequelize';

export const getHistory = async (req: Request, res: Response) => {
    const { rut } = req.body;

    // Get today's date in the same format as stored in the database
    const today = moment().tz('America/Santiago').format('YYYY-MM-DD');

    try {
        // Fetch all attendance records up to today with the given professor's rut
        const asistencias = await Asistencia.findAll({
            where: {
                profesor_rut: rut,
                fecha: {
                    [Op.lte]: today
                }
            }
        });

        res.json({
            message: "Attendance records fetched successfully",
            data: asistencias
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "An error occurred while fetching attendance records",
        });
    }
};
