import { describe, expect, it, vi } from 'vitest';
import { buildPackageSeedData, buildPackageSeedPayloads, findAvailableLockerForPackageSeed } from '@/database/seeders/seed-packages.ts';
import { BaseRepository } from '@/database/repositories/BaseRepository.ts';
import { LockerAvailabilityServiceInterface } from '@/services/interfaces/LockerAvailabilityServiceInterface.ts';

describe('buildPackageSeedData', () => {
  it('assigns the package to a customer user and an agent user', () => {
    const customerUser = { id: 7, role: 'customer' } as any;
    const agentUser = { id: 9, role: 'delivery_agent' } as any;
    const locker = { id: 13 } as any;

    const payload = buildPackageSeedData({
      customerUser,
      agentUser,
      locker,
      customerName: 'Priya Sharma',
    });

    expect(payload.customer_id).toBe(7);
    expect(payload.agent_id).toBe(9);
    expect(payload.locker_id).toBe(13);
    expect(payload.delivery_status).toBe('ASSIGNED_TO_AGENT');
  });

  it('selects an available locker that is not already assigned to a package', async () => {
    const availableLocker = { id: 21, status: 'available' } as any;
    const lockerService: LockerAvailabilityServiceInterface = {
      getAvailableLockers: async () => [availableLocker],
    };

    const locker = await findAvailableLockerForPackageSeed({ lockerService });

    expect(locker.id).toBe(21);
  });

  it('passes through findOne options without wrapping them in an extra where object', async () => {
    const fakeRepository = {
      findOne: vi.fn().mockResolvedValue(null),
    } as any;

    class TestRepository extends BaseRepository<{ id: number }> {}

    const repo = new TestRepository(fakeRepository);
    await repo.findOne({ where: { id: 7 } as any });

    expect(fakeRepository.findOne).toHaveBeenCalledWith({ where: { id: 7 } });
  });

  it('distributes a package batch evenly across two agents', () => {
    const customerUsers = [{ id: 1, role: 'customer' }, { id: 2, role: 'customer' }];
    const agentUsers = [{ id: 10, role: 'delivery_agent' }, { id: 11, role: 'delivery_agent' }];
    const lockers = [{ id: 101 }, { id: 102 }, { id: 103 }, { id: 104 }, { id: 105 }, { id: 106 }, { id: 107 }, { id: 108 }, { id: 109 }, { id: 110 }];

    const payloads = buildPackageSeedPayloads({
      customerUsers: customerUsers as any,
      agentUsers: agentUsers as any,
      lockers: lockers as any,
      count: 10,
    });

    expect(payloads).toHaveLength(10);
    expect(payloads.filter((payload) => payload.agent_id === 10)).toHaveLength(5);
    expect(payloads.filter((payload) => payload.agent_id === 11)).toHaveLength(5);
  });
});
