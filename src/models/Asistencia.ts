import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/conection';

class Asistencia extends Model {
  public id!: number;
  public curso_nombre!: string;
  public fecha!: string;
  public hora_inicio!: string;
  public hora_fin!: string;
  public dia!: number;
  public estado!: string;
  public motivo!: string;
  public profesor_rut!: string;
  public seccion!: number;
  public sala!: string;
  public ip!: string;
  public locacion!: string;
  public hora_iniciada!: string;
  public hora_finalizada!: string;
  public realizandose!: number;
  public semaforo!: string;
  public semestre!: string;
}

Asistencia.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  curso_nombre: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  fecha: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  hora_inicio: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  hora_fin: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  dia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  motivo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  profesor_rut: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  seccion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sala: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  ip: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  locacion: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  hora_iniciada: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  hora_finalizada: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  realizandose: {
    type: DataTypes.SMALLINT,
    allowNull: true
  },
  semaforo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },semestre: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'Asistencia',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_0900_ai_ci'
});

export default Asistencia;
