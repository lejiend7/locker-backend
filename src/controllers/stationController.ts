import { type Request, type Response } from 'express';
import { StationRepositoryInterface } from '@/database/repositories/interfaces/StationRepositoryInterface.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

export class StationController {
  constructor(private readonly stationRepository: StationRepositoryInterface) {}

  list = asyncHandler((req: Request, res: Response) => this.handleList(req, res));
  agentList = asyncHandler((req: Request, res: Response) => this.handleAgentList(req, res));

  private async handleList(_req: Request, res: Response) {
    const stations = await this.stationRepository.findAll();

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Stations fetched successfully',
        data: stations,
      })
    );
  }

  private async handleAgentList(_req: Request, res: Response) {
    const stations = await this.stationRepository.findAll();

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Stations fetched successfully',
        data: stations,
      })
    );
  }
}
