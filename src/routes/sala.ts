import { Router } from 'express';
import { getsala } from '../controllers/sala';

const router = Router();

router.get('/', getsala)

export default router;