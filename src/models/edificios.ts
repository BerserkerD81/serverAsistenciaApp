
import { DataTypes } from 'sequelize';
import sequelize from '../db/conection';
export const Edificio = sequelize.define('Edificio', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_edificio: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  latitud: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitud: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  radio: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 100
  }
}, {
  tableName: 'edificios', // Nombre de la tabla en la base de datos
  timestamps: false // Indica a Sequelize que no gestione automáticamente los campos createdAt y updatedAt
});

