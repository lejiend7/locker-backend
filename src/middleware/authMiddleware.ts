import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

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

export function requireAuth(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      const decoded = jwt.verify(token, jwtSecret) as JwtUser;
      req.authUser = decoded;
      return next();
    } catch {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  };
}
