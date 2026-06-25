import { type Request, type Response } from 'express';
import { LandingPageService } from '@/services/landingPageService.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';

export class LandingController {
  private readonly landingPageService = new LandingPageService();

  index = asyncHandler((req: Request, res: Response) => {
    const landingPagePath = this.landingPageService.getLandingPagePath();
    return res.sendFile(landingPagePath);
  });
}

export const landingController = new LandingController();
