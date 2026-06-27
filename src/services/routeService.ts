import { Router, type ErrorRequestHandler, type Express, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { authMiddleware } from '@/middleware/authMiddleware.ts';
import { roleService, type AppRole } from '@/services/roleService.ts';
import type { AppError } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type RoleChain = {
  role: (roles: AppRole[]) => RouteService;
};

export class RouteService {
  private readonly router: Router;

  constructor(router: Router = Router()) {
    this.router = router;
  }

  toExpressRouter(): Router {
    return this.router;
  }

  use(...handlers: RequestHandler[]): this {
    this.router.use(...handlers);
    return this;
  }

  mountApiNotFound(app: Express): this {
    app.use(this.apiNotFoundHandler);
    return this;
  }

  mountErrorHandler(app: Express): this {
    app.use(this.errorHandler);
    return this;
  }

  get(path: string, ...handlers: RequestHandler[]): RoleChain {
    return this.register('get', path, handlers);
  }

  post(path: string, ...handlers: RequestHandler[]): RoleChain {
    return this.register('post', path, handlers);
  }

  put(path: string, ...handlers: RequestHandler[]): RoleChain {
    return this.register('put', path, handlers);
  }

  patch(path: string, ...handlers: RequestHandler[]): RoleChain {
    return this.register('patch', path, handlers);
  }

  delete(path: string, ...handlers: RequestHandler[]): RoleChain {
    return this.register('delete', path, handlers);
  }

  private register(method: HttpMethod, path: string, handlers: RequestHandler[]): RoleChain {
    let allowedRoles: AppRole[] | null = null;
    let registered = false;

    const commitRegistration = () => {
      if (registered) {
        return;
      }

      registered = true;
      const finalHandlers = allowedRoles
        ? this.injectRoleGuard(handlers, allowedRoles)
        : handlers;

      (this.router[method] as any)(path, ...finalHandlers);
    };

    queueMicrotask(commitRegistration);

    return {
      role: (roles: AppRole[]) => {
        allowedRoles = roles;
        return this;
      },
    };
  }

  private injectRoleGuard(handlers: RequestHandler[], allowedRoles: AppRole[]): RequestHandler[] {
    const authIndex = handlers.findIndex((handler) => handler === authMiddleware);
    const guard = roleService.createRoleGuard(allowedRoles);

    if (authIndex === -1) {
      return [guard, ...handlers];
    }

    return [
      ...handlers.slice(0, authIndex + 1),
      guard,
      ...handlers.slice(authIndex + 1),
    ];
  }

  private readonly apiNotFoundHandler: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/api')) {
      next();
      return;
    }

    res.status(404).json(
      buildApiResponse({
        success: false,
        statusCode: 404,
        message: 'Route not found',
        data: [],
        errors: ['Route not found'],
      })
    );
  };

  private readonly errorHandler: ErrorRequestHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
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
  };
}

export const routeService = new RouteService();
