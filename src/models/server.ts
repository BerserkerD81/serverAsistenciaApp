import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';
import routerProduct from "../routes/product";
import routesUser from "../routes/user";
import routesUpload from "../routes/upload";
import routesJustify from "../routes/Justify";
import routesHistory from "../routes/history";
import routesCursos from "../routes/Cursos";
import rouresAsignacion from "../routes/asignacion";
import routesAsistir from "../routes/asistir";
import routesAsistenciaManual from "../routes/asistenciaManual";
import routesSala from "../routes/sala";
import routesExcepcion from "../routes/excepcion";
import routeUpdate from "../routes/updateAsistencia";
import routeHorario from "../routes/horario";
import { User } from "./user";
import routeCarreras from "../routes/carreras"
import routesSemestres from "../routes/periodo";

class Server {
    private app: express.Application;
    private port: string;

    constructor() {
        this.app = express();
        this.port = "443";
        this.middlewares();
        this.routes();
        this.listen();
        this.dbConnect();
    }

    listen() {
        const options = {
            key: fs.readFileSync('/etc/letsencrypt/live/apputal_mooo_com/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/apputal_mooo_com/fullchain.pem')
        };

        https.createServer(options, this.app).listen(this.port, () => {
            console.log('App running on HTTPS');
        });
    }

    routes() {
        this.app.use("/api/products", routerProduct);
        this.app.use("/api/users", routesUser);
        this.app.use("/upload", routesUpload);
        this.app.use("/justify", routesJustify);
        this.app.use("/history", routesHistory);
        this.app.use("/cursos", routesCursos);
        this.app.use("/asignacion", rouresAsignacion);
        this.app.use("/asistir", routesAsistir);
        this.app.use("/asistencia", routesAsistenciaManual);
        this.app.use("/salas", routesSala);
        this.app.use("/excepcion", routesExcepcion);
        this.app.use("/updateAsistencia", routeUpdate);
        this.app.use("/Horario",routeHorario);
        this.app.use("/carreras", routeCarreras);
        this.app.use("/semestre", routesSemestres);

    }

   middlewares() {
    this.app.use(cors()); // Permitir todas las solicitudes de origen
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));
}

    async dbConnect() {
        try {
            await User.sync();
        } catch (error) {
            console.log("No se pudo conectar a la base de datos", error);
        }
    }
}

export default Server;

