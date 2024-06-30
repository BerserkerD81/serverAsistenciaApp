import { DataTypes,Model } from 'sequelize';
import sequelize from '../db/conection';
interface UserAttributes {
  id: number;
  nombre: string;
  rut: string;
  password: string;
  rol: string;
  email: string;
  estado: string;
  verificationToken: string | null;
  carrera:string;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id'> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

export const User = sequelize.define<UserInstance>('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    unique: false,
    allowNull: false
  },
  rut: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  rol: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  estado: {
    type: DataTypes.STRING,
    defaultValue: 'inactivo',
  },
  verificationToken: {
    type: DataTypes.STRING,
  },
  carrera: {
    type: DataTypes.STRING,
  },
});
