import { Router } from 'express';
import { asistenciaManual, getAsistencia, getAsistenciaCarrera } from '../controllers/asistencia';

const router = Router();

router.post('/', asistenciaManual)
router.get('/getAsistencia', getAsistencia)
router.post('/getAsistenciaCarrera', getAsistenciaCarrera)

export default router;
