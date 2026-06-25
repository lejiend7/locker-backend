import { Router } from 'express';
import authRouter from '@/routes/auth.js';
import stationsRouter from '@/routes/stations.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Locker API' });
});

router.use('/auth', authRouter);
router.use('/stations', stationsRouter);

export default router;
