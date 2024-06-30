import { DataTypes } from 'sequelize';
import sequelize from '../db/conection';
const Area = require('./Area');

export const Sala = sequelize.define('Sala', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  label: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  area_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Area,
      key: 'id'
    }
  }
}, {
  tableName: 'Sala',
  timestamps: false
});

