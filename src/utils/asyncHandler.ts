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
