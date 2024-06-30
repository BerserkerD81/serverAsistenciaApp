import{Router} from "express";
import { postAsistencia, cerrarAsistencia } from "../controllers/asistir";

const router = Router()

router.post("/",postAsistencia)
router.post("/cerrar",cerrarAsistencia)



export default router;
