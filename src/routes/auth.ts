import { Router } from 'express';
import { AppDataSource } from '../database/data-source.js';
import { User } from '../database/entities/User.js';
import { AuthService } from '../services/authService.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

const jwtSecret = process.env.JWT_SECRET || 'dev-only-jwt-secret';
const authService = new AuthService(AppDataSource.getRepository(User), jwtSecret);

router.post('/signup', async (req, res) => {
  const result = await authService.signup(req.body ?? {});

  if (!result.success) {
    const status = result.message === 'Email address already registered' ? 400 : 400;
    return res.status(status).json(result);
  }

  return res.status(201).json(result);
});

router.post('/login', async (req, res) => {
  const result = await authService.login(req.body ?? {});

  if (!result.success) {
    const status = result.message === 'Invalid email or password' ? 401 : 400;
    return res.status(status).json(result);
  }

  return res.status(200).json(result);
});

router.get('/session', requireAuth(jwtSecret), async (req, res) => {
  if (!req.authUser) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  return res.status(200).json({
    success: true,
    message: 'Session restored',
    data: {
      user: {
        id: req.authUser.sub,
        email: req.authUser.email,
        name: req.authUser.name,
      },
      accessToken: '',
    },
  });
});

export default router;
