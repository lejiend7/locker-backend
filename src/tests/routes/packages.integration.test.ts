import 'dotenv/config';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET;

function createToken(agentId: number) {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET must be defined in the environment');
  }

  return jwt.sign({ sub: String(agentId), email: 'agent@example.com', name: 'Agent User', role: 'delivery_agent' }, jwtSecret);
}

describe('packages route integration', () => {
  let createApp: typeof import('@/app.ts').createApp;
  let AppDataSource: typeof import('@/database/data-source.ts').AppDataSource;
  let Station: typeof import('@/database/entities/Station.ts').Station;
  let Locker: typeof import('@/database/entities/Locker.ts').Locker;
  let Package: typeof import('@/database/entities/Package.ts').Package;
  let User: typeof import('@/database/entities/User.ts').User;
  let stationRepository: any;
  let lockerRepository: any;
  let packageRepository: any;
  let userRepository: any;

  beforeAll(async () => {
    if (!process.env.DB_HOST) {
      throw new Error('DB_HOST must be defined in the environment');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be defined in the environment');
    }

    ({ createApp } = await import('@/app.ts'));
    ({ AppDataSource } = await import('@/database/data-source.ts'));
    ({ Station } = await import('@/database/entities/Station.ts'));
    ({ Locker } = await import('@/database/entities/Locker.ts'));
    ({ Package } = await import('@/database/entities/Package.ts'));
    ({ User } = await import('@/database/entities/User.ts'));

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    stationRepository = AppDataSource.getRepository(Station);
    lockerRepository = AppDataSource.getRepository(Locker);
    packageRepository = AppDataSource.getRepository(Package);
    userRepository = AppDataSource.getRepository(User);
  });

  afterAll(async () => {
    if (AppDataSource?.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('lists agent packages through GET /api/packages', async () => {
    const station = await stationRepository.save({
      name: `Integration Station ${Date.now()}`,
      type: 'mall',
      city: 'Test City',
      address: 'Test Address',
    });

    const locker = await lockerRepository.save({
      station_id: station.id,
      size: 'medium',
      status: 'occupied',
      label: `AV-${Date.now()}`,
      version: 1,
    });

    const customer = await userRepository.save({
      name: `Customer ${Date.now()}`,
      email: `customer-${Date.now()}@example.com`,
      password: 'hashed-password',
      role: 'customer',
    });
    const agent = await userRepository.save({
      name: `Agent ${Date.now()}`,
      email: `agent-${Date.now()}@example.com`,
      password: 'hashed-password',
      role: 'delivery_agent',
    });
    const otherAgent = await userRepository.save({
      name: `Other Agent ${Date.now()}`,
      email: `other-agent-${Date.now()}@example.com`,
      password: 'hashed-password',
      role: 'delivery_agent',
    });

    await packageRepository.save({
      package_code: `PKG-${Date.now()}-1`,
      locker_id: locker.id,
      customer_id: customer.id,
      agent_id: agent.id,
      package_size: 'medium',
      delivery_status: 'ASSIGNED_TO_AGENT',
      pickup_code: null,
      customer_name: 'Available Customer',
      assigned_at: new Date('2026-06-25T08:00:00.000Z'),
      stored_at: null,
      pickup_at: null,
      retrieved_at: null,
      storage_price: null,
    });
    await packageRepository.save({
      package_code: `PKG-${Date.now()}-2`,
      locker_id: locker.id,
      customer_id: customer.id,
      agent_id: otherAgent.id,
      package_size: 'medium',
      delivery_status: 'ASSIGNED_TO_AGENT',
      pickup_code: null,
      customer_name: 'Other Agent Available Customer',
      assigned_at: new Date('2026-06-25T08:00:00.000Z'),
      stored_at: null,
      pickup_at: null,
      retrieved_at: null,
      storage_price: null,
    });

    const res = await request(createApp())
      .get('/api/packages')
      .set('Authorization', `Bearer ${createToken(agent.id)}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.statusCode).toBe(200);
    expect(res.body.message).toBe('Packages fetched successfully');
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        packageCode: expect.any(String),
        deliveryStatus: 'ASSIGNED_TO_AGENT',
        customerName: customer.name,
        agentId: agent.id,
        customer: expect.objectContaining({
          id: customer.id,
          role: 'customer',
        }),
        agent: expect.objectContaining({
          id: agent.id,
          role: 'delivery_agent',
        }),
      }),
    ]));
    expect(res.body.data).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ agentId: otherAgent.id }),
    ]));
  });

  it('returns delivered package statuses through GET /api/packages', async () => {
    const station = await stationRepository.save({
      name: `Integration Station ${Date.now() + 1}`,
      type: 'office',
      city: 'Test City',
      address: 'Test Address 2',
    });

    const locker = await lockerRepository.save({
      station_id: station.id,
      size: 'small',
      status: 'occupied',
      label: `DL-${Date.now()}`,
      version: 1,
    });

    const customer = await userRepository.save({
      name: `Customer Delivered ${Date.now()}`,
      email: `delivered-${Date.now()}@example.com`,
      password: 'hashed-password',
      role: 'customer',
    });
    const agent = await userRepository.save({
      name: `Delivered Agent ${Date.now()}`,
      email: `delivered-agent-${Date.now()}@example.com`,
      password: 'hashed-password',
      role: 'delivery_agent',
    });
    const otherAgent = await userRepository.save({
      name: `Other Delivered Agent ${Date.now()}`,
      email: `other-delivered-agent-${Date.now()}@example.com`,
      password: 'hashed-password',
      role: 'delivery_agent',
    });

    await packageRepository.save({
      package_code: `PKG-${Date.now()}-3`,
      locker_id: locker.id,
      customer_id: customer.id,
      agent_id: agent.id,
      package_size: 'large',
      delivery_status: 'PICKED',
      pickup_code: `PKG-PICKED-${Date.now()}`,
      customer_name: 'Delivered Customer',
      assigned_at: new Date('2026-06-20T08:00:00.000Z'),
      stored_at: new Date('2026-06-21T08:00:00.000Z'),
      pickup_at: new Date('2026-06-22T08:00:00.000Z'),
      retrieved_at: new Date('2026-06-25T08:00:00.000Z'),
      storage_price: 9,
    });
    await packageRepository.save({
      package_code: `PKG-${Date.now()}-4`,
      locker_id: locker.id,
      customer_id: customer.id,
      agent_id: otherAgent.id,
      package_size: 'large',
      delivery_status: 'PICKED',
      pickup_code: `PKG-OTHER-PICKED-${Date.now()}`,
      customer_name: 'Other Agent Delivered Customer',
      assigned_at: new Date('2026-06-20T08:00:00.000Z'),
      stored_at: new Date('2026-06-21T08:00:00.000Z'),
      pickup_at: new Date('2026-06-22T08:00:00.000Z'),
      retrieved_at: new Date('2026-06-25T08:00:00.000Z'),
      storage_price: 9,
    });

    const res = await request(createApp())
      .get('/api/packages')
      .set('Authorization', `Bearer ${createToken(agent.id)}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.statusCode).toBe(200);
    expect(res.body.message).toBe('Packages fetched successfully');
    expect(res.body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        deliveryStatus: 'PICKED',
        customerName: customer.name,
        agentId: agent.id,
        locker: expect.objectContaining({
          id: locker.id,
          station: expect.objectContaining({
            id: station.id,
          }),
        }),
      }),
    ]));
    expect(res.body.data).not.toEqual(expect.arrayContaining([
      expect.objectContaining({ agentId: otherAgent.id }),
    ]));
  });
});
