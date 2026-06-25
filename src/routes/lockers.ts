import { Router } from 'express';
import { AppDataSource } from '@/database/data-source.js';
import { Locker } from '@/database/entities/Locker.js';
import { LockerRepository } from '@/database/repositories/LockerRepository.js';
import { requireAuth } from '@/middleware/authMiddleware.js';
import { asyncHandler } from '@/utils/errorHandler.js';
import { buildApiResponse } from '@/utils/response.js';

const router = Router();
const jwtSecret = process.env.JWT_SECRET || 'dev-only-jwt-secret';
const lockerRepository = new LockerRepository(AppDataSource.getRepository(Locker));

router.get(
  '/',
  requireAuth(jwtSecret),
  asyncHandler(async (req, res) => {
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
  })
);

router.post(
  '/',
  requireAuth(jwtSecret),
  asyncHandler(async (req, res) => {
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

    const { size, stationId, label } = req.body ?? {};

    if (!size || !stationId || !label) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: 'Missing required locker fields',
          data: [],
          errors: ['size, stationId and label are required'],
        })
      );
    }

    if (!['small', 'medium', 'large'].includes(size)) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: 'Invalid locker size',
          data: [],
          errors: ['size must be one of small, medium, large'],
        })
      );
    }

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
  })
);

export default router;
