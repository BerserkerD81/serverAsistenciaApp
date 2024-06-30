import { DataTypes } from 'sequelize';
import sequelize from '../db/conection';

export const Carreras = sequelize.define('Carreras', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Codigo: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    Nombre: {
        type: DataTypes.STRING(100),
        unique: false,
        allowNull: false
    }
});
