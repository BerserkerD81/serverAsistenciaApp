import { DataTypes } from 'sequelize';
import sequelize from '../db/conection';

export const Justify = sequelize.define('justifyTests', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.STRING(100),
        unique: false,
        allowNull: false
    },
    bloques: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    asignatura: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    sala: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    motivo: {
        type: DataTypes.STRING(100),
        allowNull: false
    }
});
