import { type Request, type Response } from 'express';
import { HealthServiceInterface } from '@/services/interfaces/HealthServiceInterface.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';

export class HealthController {
  constructor(private readonly healthService: HealthServiceInterface) {}

  index = asyncHandler(async (req: Request, res: Response) => {
    const status = await this.healthService.getHealthStatus();

    if (status.status === 'ok') {
      return res.json(status);
    }

    return res.status(500).json(status);
  });
}
