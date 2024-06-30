import { Request, Response } from "express";
import { Carreras } from "../models/carreras";


export const getCarreras = async (req: Request, res: Response): Promise<void> => {
    try {
      const nombres = await Carreras.findAll({
        attributes: ['Nombre']
      });
      res.json(nombres);
    } catch (error) {
      res.status(400).json({
        msg: 'Error al obtener los nombres',
        error,
      });
    }
  };
