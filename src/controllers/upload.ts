import { Request, Response } from 'express';
import { Cursos } from '../models/Cursos';
import { Sala } from '../models/sala';
import { Area } from '../models/Area';
import { PeriodoAcademico } from '../models/PeriodoAcademico';
import sequelize from '../db/conection';
import { Op } from 'sequelize';
import moment from 'moment';
import Asistencia from '../models/Asistencia';
import { CursosAsignados } from '../models/CursosAsignados';
import { User } from '../models/user';

export const upload = async (req: Request, res: Response) => {
  try {
    const { headers, data, startDate, endDate, semester } = req.body as { headers: string[], data: any[][], startDate: string, endDate: string, semester: string };

    if (!data || !headers) {
      return res.status(400).json({ message: "Missing data or headers" });
    }

    const nombreIndex = headers.indexOf('NOMBRE');
    const seccionIndex = headers.indexOf('SECCION');
    const salaIndex = headers.indexOf('Sala');
    const edificioIndex = headers.indexOf('Edificio');
    const horaInicioIndex = headers.indexOf('HORA INICIO');
    const horaFinIndex = headers.indexOf('HORA FIN');
    const diaIndex = headers.indexOf('DIA');

    if (nombreIndex === -1 || seccionIndex === -1 || salaIndex === -1 || edificioIndex === -1) {
      return res.status(400).json({ message: "Missing required headers" });
    }

    await sequelize.transaction(async (t) => {
      await Promise.all([
        Cursos.destroy({ where: {}, transaction: t }),
        Sala.destroy({ where: {}, transaction: t }),
        Area.destroy({ where: {}, transaction: t })
      ]);

      const uniqueAreas = [...new Set(data.map((row) => row[edificioIndex] as string))];
      const areas = await Area.bulkCreate(uniqueAreas.map((nombre) => ({ nombre })), { returning: true, transaction: t });
      const areaMap = new Map(areas.map((area) => [area.dataValues.nombre, area.dataValues.id]));

      const salasData = data.map((row) => ({
        label: row[salaIndex],
        area_id: areaMap.get(row[edificioIndex] as string)
      }));
      const salas = await Sala.bulkCreate(salasData, { returning: true, transaction: t });
      const salaMap = new Map(salas.map((sala) => [sala.dataValues.label, sala.dataValues.id]));

      const cursosData = data.map((row) => ({
        nombre: row[nombreIndex],
        seccion: row[seccionIndex],
        horaInicio: row[horaInicioIndex] || "sin definir",
        horaFin: row[horaFinIndex] || "sin definir",
        dia: row[diaIndex],
        sala_id: salaMap.get(row[salaIndex]) || null
      }));
      await Cursos.bulkCreate(cursosData, { transaction: t });
    });

    const periodo = await PeriodoAcademico.findOne({ where: { label: semester } });
    if (periodo) {
      await periodo.update({ fecha_inicio: startDate, fecha_fin: endDate });
    } else {
      await PeriodoAcademico.create({ label: semester, fecha_inicio: startDate, fecha_fin: endDate });
    }

    const actualizarAsistencias = async (nombre: string, seccion: string, rut: string, endDate: string) => {
      const hoy = moment().tz('America/Santiago');
      const fechaFin = moment(endDate).add(1, 'day').tz('America/Santiago');

      await Asistencia.destroy({
        where: {
          fecha: { [Op.gt]: endDate },
          semestre: semester
        }
      });

      const cursos = await Cursos.findAll({
        where: {
          nombre: nombre,
          seccion: seccion,
          dia: { [Op.between]: [1, 7] }
        }
      });

      const salaIds = [...new Set(cursos.map((curso) => curso.dataValues.sala_id))];
      const salas = await Sala.findAll({ where: { id: salaIds } });
      const salaMap = new Map(salas.map((sala) => [sala.dataValues.id, sala.dataValues.label]));

      const asistenciaBatch = [];
      while (hoy.isSameOrBefore(fechaFin, 'day')) {
        const fecha = hoy.format('YYYY-MM-DD');
        const cursosDelDia = cursos.filter((curso) => curso.dataValues.dia === hoy.isoWeekday());

        for (const curso of cursosDelDia) {
          const salaLabel = salaMap.get(curso.dataValues.sala_id);
          asistenciaBatch.push({
            curso_nombre: curso.dataValues.nombre,
            fecha,
            hora_inicio: curso.dataValues.horaInicio,
            hora_fin: curso.dataValues.horaFin,
            dia: curso.dataValues.dia,
            estado: "Ausente",
            sala: salaLabel,
            profesor_rut: rut,
            seccion: curso.dataValues.seccion,
            semestre: semester
          });
        }
        hoy.add(1, 'day');
      }

      if (asistenciaBatch.length > 0) {
        await Asistencia.bulkCreate(asistenciaBatch);
      }
    };

    const cursosMatriculados = await CursosAsignados.findAll();
    await Promise.all(cursosMatriculados.map(async (matricula) => {
      const profesor = await User.findByPk(matricula.dataValues.usuario_id);
      if (profesor && matricula.dataValues.semestre === semester) {
        await actualizarAsistencias(matricula.dataValues.curso_nombre, matricula.dataValues.curso_seccion, profesor.dataValues.rut, endDate);
      }
    }));

    res.json({ message: "Data received and processed successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
