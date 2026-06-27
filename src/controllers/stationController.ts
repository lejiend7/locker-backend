import { type Request, type Response } from 'express';
import { AppDataSource } from '@/database/data-source.ts';
import { Station } from '@/database/entities/Station.ts';
import { StationRepository } from '@/database/repositories/StationRepository.ts';
import { StationRepositoryInterface } from '@/database/repositories/interfaces/StationRepositoryInterface.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

const stationRepository: StationRepositoryInterface = new StationRepository(AppDataSource.getRepository(Station));

export class StationController {
  list = asyncHandler((req: Request, res: Response) => this.handleList(req, res));
  agentList = asyncHandler((req: Request, res: Response) => this.handleAgentList(req, res));

  private async handleList(_req: Request, res: Response) {
    const stations = await stationRepository.findAll();

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
    const stations = await stationRepository.findAll();

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

export const stationController = new StationController();
