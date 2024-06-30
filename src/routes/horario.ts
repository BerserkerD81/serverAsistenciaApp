import{Router} from "express";
import { eliminarMatricula, getHorario } from "../controllers/horario";

const router = Router()

router.post("/",getHorario)
router.post("/delete",eliminarMatricula)


export default router;
