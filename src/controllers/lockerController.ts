import { type Request, type Response } from 'express';
import { AppDataSource } from '@/database/data-source.ts';
import { Locker } from '@/database/entities/Locker.ts';
import { LockerRepository } from '@/database/repositories/LockerRepository.ts';
import { CreateLockerDto } from '@/dtos/CreateLockerDto.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

const lockerRepository = new LockerRepository(AppDataSource.getRepository(Locker));

export class LockerController {
  list = asyncHandler((req: Request, res: Response) => this.handleList(req, res));

  create = asyncHandler((req: Request, res: Response) => this.handleCreate(req, res));

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

    const stationId = req.query.stationId;
    const lockers = typeof stationId === 'string' && stationId.length > 0
      ? await lockerRepository.findByStationId(Number(stationId))
      : await lockerRepository.findAll();

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

    const createdLocker = await lockerRepository.create({
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

export const lockerController = new LockerController();
