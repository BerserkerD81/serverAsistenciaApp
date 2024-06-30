import { Router } from 'express';
import { getCursos } from '../controllers/Cursos';

const router = Router();

router.get('/', getCursos)

export default router;