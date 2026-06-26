import { beforeEach, describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import apiRouter from '@/routes/index.ts';

const { mockCreate, mockFindAll, mockFindByStationId } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockFindAll: vi.fn(),
  mockFindByStationId: vi.fn(),
}));

vi.mock('@/middleware/authMiddleware.js', () => ({
  authMiddleware: (req: any, _res: any, next: () => void) => {
    req.authUser = {
      sub: 'admin-user',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    };
    next();
  },
}));

vi.mock('@/database/data-source.js', () => ({
  AppDataSource: {
    getRepository: vi.fn(),
  },
}));

vi.mock('@/database/repositories/LockerRepository.js', () => ({
  LockerRepository: class {
    constructor() {
      this.create = mockCreate;
      this.findAll = mockFindAll;
      this.findByStationId = mockFindByStationId;
    }
  },
}));

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', apiRouter);
  return app;
}

describe('lockers route unit tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the shared envelope for invalid locker creation payloads', async () => {
    const app = createTestApp();

    const res = await request(app).post('/api/lockers').send({ size: 'small' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      statusCode: 400,
      message: 'Missing required locker fields',
      data: [],
      errors: ['size, stationId and label are required'],
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('creates a locker and returns the shared envelope', async () => {
    const createdLocker = {
      id: 42,
      station_id: 3,
      size: 'small',
      status: 'available',
      label: 'A-01',
      version: 1,
      created_at: '2026-06-26T00:00:00.000Z',
    };

    mockCreate.mockResolvedValue(createdLocker);

    const app = createTestApp();

    const res = await request(app).post('/api/lockers').send({
      size: 'small',
      stationId: 3,
      label: 'A-01',
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      statusCode: 201,
      message: 'Locker created successfully',
      data: {
        id: 42,
        stationId: 3,
        size: 'small',
        status: 'available',
        label: 'A-01',
        version: 1,
        createdAt: '2026-06-26T00:00:00.000Z',
      },
      errors: [],
    });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      station_id: 3,
      size: 'small',
      label: 'A-01',
      status: 'available',
      version: 1,
    }));
  });
});
