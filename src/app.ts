import 'reflect-metadata';
import express, { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsMiddleware } from '@/middleware/corsMiddleware.ts';
import { routeService } from '@/services/routeService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  corsMiddleware.mount(app);
  app.use(express.static(path.join(__dirname, 'public')));

  routeService.mount(app);

  return app;
};
