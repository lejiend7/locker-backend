import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '@/app.js';
import { AppDataSource } from '@/database/data-source.js';
import { Station } from '@/database/entities/Station.js';
import { Locker } from '@/database/entities/Locker.js';

const jwtSecret = process.env.JWT_SECRET || 'dev-only-jwt-secret';
function createToken() {
  return jwt.sign({ sub: 'admin-user', email: 'admin@example.com', name: 'Admin User', role: 'admin' }, jwtSecret);
}

describe('lockers route integration', () => {
  let stationRepository: any;
  let lockerRepository: any;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    stationRepository = AppDataSource.getRepository(Station);
    lockerRepository = AppDataSource.getRepository(Locker);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('creates a locker through POST /api/lockers and returns the shared envelope', async () => {
    const station = await stationRepository.save({
      name: `Integration Station ${Date.now()}`,
      type: 'mall',
      city: 'Test City',
      address: 'Test Address',
    });

    const res = await request(createApp())
      .post('/api/lockers')
      .set('Authorization', `Bearer ${createToken()}`)
      .send({ size: 'small', stationId: station.id, label: 'Z-99' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.statusCode).toBe(201);
    expect(res.body.message).toBe('Locker created successfully');
    expect(res.body.data).toEqual(expect.objectContaining({
      station_id: station.id,
      size: 'small',
      label: 'Z-99',
      status: 'available',
    }));

    const createdLocker = await lockerRepository.findOne({ where: { id: res.body.data.id } });
    expect(createdLocker).toBeTruthy();
  });

  it('lists lockers through GET /api/lockers with stationId filtering', async () => {
    const station = await stationRepository.save({
      name: `Integration Station ${Date.now() + 1}`,
      type: 'office',
      city: 'Test City',
      address: 'Test Address 2',
    });

    await lockerRepository.save({
      station_id: station.id,
      size: 'medium',
      status: 'available',
      label: 'B-01',
      version: 1,
    });

    const res = await request(createApp())
      .get(`/api/lockers?stationId=${station.id}`)
      .set('Authorization', `Bearer ${createToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.statusCode).toBe(200);
    expect(res.body.message).toBe('Lockers fetched successfully');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ station_id: station.id, label: 'B-01' }),
    ]));
  });
});
