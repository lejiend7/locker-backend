import { type Request, type Response } from 'express';
import { HealthService } from '@/services/healthService.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';

export class HealthController {
  private readonly healthService = new HealthService();

  index = asyncHandler(async (req: Request, res: Response) => {
    const status = await this.healthService.getHealthStatus();

    if (status.status === 'ok') {
      return res.json(status);
    }

    return res.status(500).json(status);
  });
}

export const healthController = new HealthController();
