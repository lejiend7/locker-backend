import { type Request, type Response, type NextFunction } from 'express';

export function guestMiddleware(req: Request, res: Response, next: NextFunction) {

  return next();
}
