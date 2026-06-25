import jwt from 'jsonwebtoken';
import { type Request, type Response, type NextFunction } from 'express';

export type JwtUser = {
  sub: string;
  email: string;
  name: string;
  role: 'customer' | 'delivery_agent' | 'admin';
};

declare global {
  namespace Express {
    interface Request {
      authUser?: JwtUser;
    }
  }
}

function getAccessToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length);
  }

  const headerToken = req.headers['x-access-token'];
  if (typeof headerToken === 'string' && headerToken.length > 0) {
    return headerToken;
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('access_token') || window.localStorage.getItem('accessToken');
  }

  return null;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const jwtSecret = process.env.JWT_SECRET || '';
  const token = getAccessToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtUser;
    req.authUser = decoded;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}
