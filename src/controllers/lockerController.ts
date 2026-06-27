import { type Request, type Response } from 'express';
import { LockerRepositoryInterface } from '@/database/repositories/interfaces/LockerRepositoryInterface.ts';
import { CreateLockerDto } from '@/dtos/createLockerDto.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

export class LockerController {
  constructor(private readonly lockerRepository: LockerRepositoryInterface) {}

  list = asyncHandler((req: Request, res: Response) => this.handleList(req, res));

  create = asyncHandler((req: Request, res: Response) => this.handleCreate(req, res));

  private async handleList(req: Request, res: Response) {
    const stationIdQuery = typeof req.query.stationId === 'string' && req.query.stationId.length > 0
      ? req.query.stationId
      : typeof req.query.station === 'string' && req.query.station.length > 0
        ? req.query.station
        : null;

    const lockers = stationIdQuery
      ? await this.lockerRepository.findByStationId(Number(stationIdQuery))
      : await this.lockerRepository.findAll();

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Lockers fetched successfully',
        data: lockers,
      })
    );
  }

  private async handleCreate(req: Request, res: Response) {
    const validation = CreateLockerDto.validate(req.body ?? {});

    if (!validation.isValid) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: validation.message,
          data: [],
          errors: validation.errors,
        })
      );
    }

    const { size, stationId, label } = validation.value;

    const createdLocker = await this.lockerRepository.create({
      station_id: Number(stationId),
      size,
      label,
      status: 'available',
      version: 1,
    } as any);

    return res.status(201).json(
      buildApiResponse({
        success: true,
        statusCode: 201,
        message: 'Locker created successfully',
        data: createdLocker,
      })
    );
  }
}
