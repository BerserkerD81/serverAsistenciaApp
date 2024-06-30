import{Router} from "express";
import { updateAsistencia } from "../controllers/updateAsistencia";

const router = Router()

router.post("/",updateAsistencia)


export default router;