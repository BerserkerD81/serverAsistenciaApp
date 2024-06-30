import { Router } from 'express';
import { setExecpcion } from '../controllers/excepcion';

const router = Router();

router.post("/",setExecpcion)

export default router;