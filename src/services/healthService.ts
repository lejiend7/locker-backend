import { AppDataSource } from '@/database/data-source.ts';

export type HealthStatus = {
  status: 'ok' | 'error';
  service: string;
  version: string;
  database: {
    connected: boolean;
    host: string;
    database: string;
    version?: string;
    error?: string;
  };
};

export class HealthService {
  async getHealthStatus(): Promise<HealthStatus> {
    try {
      const result = await AppDataSource.query('SELECT VERSION() as version');
      const version = result?.[0]?.version || 'unknown';
      const connected = Boolean(result?.[0]?.version);

      console.log('[health] database connected', {
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'smartlocker',
        version,
      });

      return {
        status: connected ? 'ok' : 'error',
        service: 'SmartLocker API',
        version: '1.0.0',
        database: {
          connected,
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'smartlocker',
          version,
        },
      };
    } catch (error) {
      console.error('[health] database connection failed', {
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'smartlocker',
        error: error instanceof Error ? error.message : 'Unknown database error',
      });

      return {
        status: 'error',
        service: 'SmartLocker API',
        version: '1.0.0',
        database: {
          connected: false,
          host: process.env.DB_HOST || 'localhost',
          database: process.env.DB_NAME || 'smartlocker',
          error: error instanceof Error ? error.message : 'Unknown database error',
        },
      };
    }
  }
}
