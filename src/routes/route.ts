import {
	authController,
	healthController,
	landingController,
	stationController,
	lockerController,
	packageController,
} from '@/composition/controllers.ts';
import { authMiddleware } from '@/middleware/authMiddleware.ts';
import { guestMiddleware } from '@/middleware/guestMiddleware.ts';
import { routeService } from '@/services/routeService.ts';

const router = routeService;
router.get('/', guestMiddleware, landingController.index);
router.get('/health', guestMiddleware, healthController.index);

router.post('/auth/signup', guestMiddleware, authController.signup);
router.post('/auth/signup/admin', guestMiddleware, authController.signupAdmin);
router.post('/auth/login', guestMiddleware, authController.login);
router.get('/auth/session', authMiddleware, authController.session);

router.get('/stations', authMiddleware, stationController.list).role(['admin']);
router.get('/agent/stations', authMiddleware, stationController.agentList).role(['delivery_agent']);
router.get('/lockers', authMiddleware, lockerController.list).role(['admin', 'delivery_agent']);
router.post('/lockers', authMiddleware, lockerController.create).role(['admin']);
router.get('/packages', authMiddleware, packageController.list).role(['delivery_agent']);
router.put('/packages/assign-locker', authMiddleware, packageController.assignLocker).role(['delivery_agent']);
router.put('/packages/store', authMiddleware, packageController.store).role(['delivery_agent']);

export default router.toExpressRouter();
