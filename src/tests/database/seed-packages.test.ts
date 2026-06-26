import { describe, expect, it } from 'vitest';
import { buildPackageSeedData, findAvailableLockerForPackageSeed } from '@/database/seeders/seed-packages.ts';
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
});
