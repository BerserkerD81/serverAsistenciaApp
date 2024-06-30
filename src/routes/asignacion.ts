import{Router} from "express";
import { setAsignacion } from "../controllers/asignacion";

const router = Router()

router.post("/",setAsignacion);



export default router;