import { DataTypes } from 'sequelize';
import sequelize from '../db/conection';


export const PeriodoAcademico = sequelize.define('PeriodoAcademico', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    label: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    fecha_inicio: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_fin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'PeriodoAcademico',
    timestamps: false
  });
  
