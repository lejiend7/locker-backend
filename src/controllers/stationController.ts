import { type Request, type Response } from 'express';
import { AppDataSource } from '@/database/data-source.ts';
import { Station } from '@/database/entities/Station.ts';
import { StationRepository } from '@/database/repositories/StationRepository.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

const stationRepository = new StationRepository(AppDataSource.getRepository(Station));

export class StationController {
  list = asyncHandler((req: Request, res: Response) => this.handleList(req, res));

  private async handleList(req: Request, res: Response) {
    if (!req.authUser || req.authUser.role !== 'admin') {
      return res.status(403).json(
        buildApiResponse({
          success: false,
          statusCode: 403,
          message: 'Admin access required',
          data: [],
          errors: ['Admin access required'],
        })
      );
    }

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
