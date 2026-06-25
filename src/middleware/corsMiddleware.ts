import type { Express, Request, Response, NextFunction } from 'express';

const handler = (req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS' && req.path.startsWith('/api')) {
    const knownApiPrefixes = ['/api', '/api/health', '/api/auth', '/api/stations', '/api/lockers'];
    const isKnownApiRoute = knownApiPrefixes.some((prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`));

    if (isKnownApiRoute) {
      res.sendStatus(204);
      return;
    }
  }

  next();
};

export const corsMiddleware = {
  mount(app: Express) {
    app.use(handler);
  },
};
