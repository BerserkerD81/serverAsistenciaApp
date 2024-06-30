import { Router } from 'express';
import { getCarreras } from '../controllers/carreras';

const router = Router();

router.get('/', getCarreras)

export default router;
