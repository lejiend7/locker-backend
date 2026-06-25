import 'reflect-metadata';
import express, { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import { HealthService } from './services/healthService.js';
import { LandingPageService } from './services/landingPageService.js';
import { errorHandler } from './utils/errorHandler.js';
import { buildApiResponse } from './utils/response.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (): Express => {
  const app = express();
  const healthService = new HealthService();
  const landingPageService = new LandingPageService();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS' && req.path.startsWith('/api')) {
      const knownApiPrefixes = ['/api', '/api/health', '/api/auth', '/api/stations'];
      const isKnownApiRoute = knownApiPrefixes.some((prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`));

      if (isKnownApiRoute) {
        res.sendStatus(204);
        return;
      }
    }

    next();
  });
  app.use(express.static(path.join(__dirname, 'public')));

  // Serve health check with real DB status
  app.get('/health', async (req, res) => {
    const status = await healthService.getHealthStatus();

    if (status.status === 'ok') {
      res.json(status);
    } else {
      res.status(500).json(status);
    }
  });

  // Serve landing page
  app.get('/', (req, res) => {
    const landingPagePath = landingPageService.getLandingPagePath();
    res.sendFile(landingPagePath);
  });

  app.use('/api', apiRouter);

  app.use((req, res, next) => {
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

  app.use(errorHandler);

  return app;
};
