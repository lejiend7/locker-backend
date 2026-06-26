import { Router } from 'express';
import { authController } from '@/controllers/authController.ts';
import { healthController } from '@/controllers/healthController.ts';
import { landingController } from '@/controllers/landingController.ts';
import { stationController } from '@/controllers/stationController.ts';
import { lockerController } from '@/controllers/lockerController.ts';
import { packageController } from '@/controllers/packageController.ts';
import { authMiddleware } from '@/middleware/authMiddleware.ts';
import { guestMiddleware } from '@/middleware/guestMiddleware.ts';

const router = Router();
router.get('/', guestMiddleware, landingController.index);
router.get('/health', guestMiddleware, healthController.index);

router.post('/auth/signup', guestMiddleware, authController.signup);
router.post('/auth/signup/admin', guestMiddleware, authController.signupAdmin);
router.post('/auth/login', guestMiddleware, authController.login);
router.get('/auth/session', authMiddleware, authController.session);

router.get('/stations', authMiddleware, stationController.list);
router.get('/lockers', authMiddleware, lockerController.list);
router.post('/lockers', authMiddleware, lockerController.create);
router.get('/packages', authMiddleware, packageController.list);

export default router;
