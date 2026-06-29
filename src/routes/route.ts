import {
	authController,
	adminUserController,
	healthController,
	landingController,
	stationController,
	lockerController,
	packageController,
	notificationController,
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
router.post('/auth/login/admin', guestMiddleware, authController.loginAdmin);
router.get('/auth/session', authMiddleware, authController.session);
router.get('/admin/users', authMiddleware, adminUserController.list).role(['admin']);
router.put('/admin/users/:userId/reset-password', authMiddleware, adminUserController.resetPassword).role(['admin']);

router.get('/stations', authMiddleware, stationController.list).role(['admin']);
router.get('/agent/stations', authMiddleware, stationController.agentList).role(['delivery_agent']);
router.get('/lockers', authMiddleware, lockerController.list).role(['admin', 'delivery_agent']);
router.post('/lockers', authMiddleware, lockerController.create).role(['admin']);
router.get('/packages', authMiddleware, packageController.list).role(['delivery_agent']);
router.get('/customer/packages', authMiddleware, packageController.customerList).role(['customer']);
router.get('/customer/bills', authMiddleware, packageController.customerBills).role(['customer']);
router.put('/packages/assign-locker', authMiddleware, packageController.assignLocker).role(['delivery_agent']);
router.put('/packages/store', authMiddleware, packageController.store).role(['delivery_agent']);
router.post('/locker/unlock', authMiddleware, packageController.unlock).role(['customer']);
router.post('/locker/retrieve/confirm', authMiddleware, packageController.confirmRetrieve).role(['customer']);
router.get('/notifications', authMiddleware, notificationController.list).role(['customer']);
router.put('/notifications/:notificationId/read', authMiddleware, notificationController.markRead).role(['customer']);

export default router.toExpressRouter();
