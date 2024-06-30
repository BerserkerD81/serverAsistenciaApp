import { DataTypes } from 'sequelize';
import sequelize from '../db/conection';
import { User } from './user';

export const CursosAsignados = sequelize.define('CursosAsignados', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  curso_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  curso_seccion: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  semestre:{
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'CursosAsignados',
  timestamps: false
});

