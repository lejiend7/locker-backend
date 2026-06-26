import { Router } from 'express';
import { authController } from '@/controllers/authController.js';
import { healthController } from '@/controllers/healthController.js';
import { landingController } from '@/controllers/landingController.js';
import { stationController } from '@/controllers/stationController.js';
import { lockerController } from '@/controllers/lockerController.js';
import { packageController } from '@/controllers/packageController.js';
import { authMiddleware } from '@/middleware/authMiddleware.js';
import { guestMiddleware } from '@/middleware/guestMiddleware.js';

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
