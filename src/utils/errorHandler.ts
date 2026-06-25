import type { NextFunction, Request, Response } from 'express';

export type AppError = Error & {
  statusCode?: number;
  status?: number;
};

export const asyncHandler = <T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(
  fn: T
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.statusCode ?? err.status ?? 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
  });
};
