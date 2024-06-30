import { DataTypes } from 'sequelize';
import sequelize from '../db/conection';
import { Sala } from './sala';

export const Cursos = sequelize.define('Cursos', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    seccion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    horaInicio: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    horaFin: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    dia: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sala_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Sala,
        key: 'id'
      }
    }
  }, {
    tableName: 'Cursos',
    timestamps: false
  });
  
