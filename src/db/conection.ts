import { Sequelize } from "sequelize";


const sequelize = new Sequelize('utal_asistencia_1', 'test', 'password', {
    host: '34.170.100.252',
    dialect: 'mysql',   
});

export default sequelize;