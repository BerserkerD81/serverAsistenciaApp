// models/AsistenciaDetalle.js
const { DataTypes } = require('sequelize');
const sequelize = require('../database/connection');
const Asistencia = require('./Asistencia');
const User = require('./user');

export const AsistenciaDetalle = sequelize.define('AsistenciaDetalle', {
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
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: true
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: true
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  }
}, {
  tableName: 'AsistenciaDetalle',
  timestamps: false
});

