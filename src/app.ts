import 'reflect-metadata';
import express, { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes/index.js';
import { HealthService } from './services/healthService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (): Express => {
  const app = express();
  const healthService = new HealthService();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
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
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
  });

  app.use('/api', apiRouter);

  return app;
};
