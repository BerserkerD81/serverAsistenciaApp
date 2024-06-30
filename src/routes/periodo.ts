import { Router } from 'express';

import { getPeriodos } from '../controllers/periodo';

const router = Router();

router.get('/',getPeriodos)

export default router;
