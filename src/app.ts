import 'reflect-metadata';
import express, { Express } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = (): Express => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'SmartLocker API', version: '1.0.0' });
  });

  // Serve index
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'backend-index.html'));
  });

  // TODO: Wire API routes here when endpoints are implemented
  // app.use('/api', apiRouter);

  return app;
};
