import { DataTypes } from 'sequelize';
import sequelize from '../db/conection';
const Asistencia = require('./Asistencia');
const CursosAsignados = require('./CursosAsignados');

export const AsistenciaCurso = sequelize.define('AsistenciaCurso', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asistencia_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Asistencia,
      key: 'id'
    }
  },
  curso_asignado_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: CursosAsignados,
      key: 'id'
    }
  }
}, {
  tableName: 'AsistenciaCurso',
  timestamps: false
});
