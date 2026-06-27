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

export interface HealthServiceInterface {
  getHealthStatus(): Promise<HealthStatus>;
}
