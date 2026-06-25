import type { Express, Request, Response, NextFunction } from 'express';
import router from '@/routes/index.ts';
import type { AppError } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

export class RouteService {
  mount(app: Express) {
    app.use('/', router);
    app.use('/api', router);

    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) {
        res.status(404).json(
          buildApiResponse({
            success: false,
            statusCode: 404,
            message: 'Route not found',
            data: [],
            errors: ['Route not found'],
          })
        );
        return;
      }

      next();
    });

    app.use(this.errorHandler);
  }

  errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction) {
    const statusCode = err.statusCode ?? err.status ?? 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json(
      buildApiResponse({
        success: false,
        statusCode,
        message,
        data: [],
        errors: [message],
      })
    );
  }
}

export const routeService = new RouteService();
