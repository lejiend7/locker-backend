import { Router } from 'express';
import { AppDataSource } from '@/database/data-source.js';
import { Station } from '@/database/entities/Station.js';
import { StationRepository } from '@/database/repositories/StationRepository.js';
import { requireAuth } from '@/middleware/authMiddleware.js';
import { asyncHandler } from '@/utils/errorHandler.js';
import { buildApiResponse } from '@/utils/response.js';

const router = Router();
const jwtSecret = process.env.JWT_SECRET || 'dev-only-jwt-secret';
const stationRepository = new StationRepository(AppDataSource.getRepository(Station));

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

    const stations = await stationRepository.findAll();

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Stations fetched successfully',
        data: stations,
      })
    );
  })
);

export default router;
