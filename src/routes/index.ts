import { Router } from 'express';
import authRouter from '@/routes/auth.js';
import stationsRouter from '@/routes/stations.js';
import lockersRouter from '@/routes/lockers.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Locker API' });
});

router.use('/auth', authRouter);
router.use('/stations', stationsRouter);
router.use('/lockers', lockersRouter);

export default router;
