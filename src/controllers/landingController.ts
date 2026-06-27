import { type Request, type Response } from 'express';
import { LandingPageServiceInterface } from '@/services/interfaces/LandingPageServiceInterface.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';

export class LandingController {
  constructor(private readonly landingPageService: LandingPageServiceInterface) {}

  index = asyncHandler((req: Request, res: Response) => {
    const landingPagePath = this.landingPageService.getLandingPagePath();
    return res.sendFile(landingPagePath);
  });
}
