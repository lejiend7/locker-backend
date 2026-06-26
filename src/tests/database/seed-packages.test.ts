import { describe, expect, it, vi } from 'vitest';
import { buildPackageSeedData, buildPackageSeedPayloads, findAvailableLockerForPackageSeed } from '@/database/seeders/seed-packages.js';
import { BaseRepository } from '@/database/repositories/BaseRepository.js';
import { LockerAvailabilityServiceInterface } from '@/services/interfaces/LockerAvailabilityServiceInterface.js';
import { PackageServiceInterface } from '@/services/interfaces/PackageServiceInterface.js';
import { PackageService } from '@/services/packageService.js';

const packageServiceMock: PackageServiceInterface = {
  getEligibleCustomer: async () => null,
  buildDeliveryDetails: ({ deliveryStatus, sequence, assignedAt }) => {
    if (deliveryStatus === 'ASSIGNED_TO_AGENT') {
      return {
        pickup_code: null,
        deposited_at: null,
        pickup_at: null,
        retrieved_at: null,
        storage_price: null,
      };
    }

    const pickupAt = new Date(assignedAt.getTime() + 60 * 60 * 1000);
    const depositedAt = new Date(assignedAt.getTime() + 2 * 60 * 60 * 1000);
    const pickupCode = `PKG-${deliveryStatus}-${String(sequence).padStart(4, '0')}`;

    if (deliveryStatus === 'READY_TO_PICK') {
      return {
        pickup_code: pickupCode,
        deposited_at: depositedAt,
        pickup_at: pickupAt,
        retrieved_at: null,
        storage_price: null,
      };
    }

    return {
      pickup_code: pickupCode,
      deposited_at: depositedAt,
      pickup_at: pickupAt,
      retrieved_at: new Date(depositedAt.getTime() + 3 * 24 * 60 * 60 * 1000),
      storage_price: 3,
    };
  },
  calculateStoragePrice: () => 0,
  listByAgent: async () => [],
};

describe('buildPackageSeedData', () => {
  it('assigns the package to a customer user and an agent user', () => {
    const customerUser = { id: 7, role: 'customer' } as any;
    const agentUser = { id: 9, role: 'delivery_agent' } as any;
    const locker = { id: 13 } as any;

    const payload = buildPackageSeedData({
      customerUser,
      agentUser,
      locker,
      packageService: packageServiceMock,
      customerName: 'Priya Sharma',
    });

    expect(payload.customer_id).toBe(7);
    expect(payload.agent_id).toBe(9);
    expect(payload.locker_id).toBeNull();
    expect(payload.package_code).toBe('PKG-00000001');
    expect(payload.delivery_status).toBe('ASSIGNED_TO_AGENT');
  });

  it('keeps locker_id populated for READY_TO_PICK payloads', () => {
    const customerUser = { id: 7, role: 'customer' } as any;
    const agentUser = { id: 9, role: 'delivery_agent' } as any;
    const locker = { id: 13 } as any;

    const payload = buildPackageSeedData({
      customerUser,
      agentUser,
      locker,
      packageService: packageServiceMock,
      customerName: 'Priya Sharma',
      deliveryStatus: 'READY_TO_PICK',
    });

    expect(payload.locker_id).toBe(13);
    expect(payload.package_code).toBe('PKG-00000001');
    expect(payload.delivery_status).toBe('READY_TO_PICK');
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
    await repo.findOne({ id: 7 } as any);

    expect(fakeRepository.findOne).toHaveBeenCalledWith({ id: 7 });
  });

  it('distributes a package batch evenly across two agents', () => {
    const customerUsers = [{ id: 1, role: 'customer' }, { id: 2, role: 'customer' }];
    const agentUsers = [{ id: 10, role: 'delivery_agent' }, { id: 11, role: 'delivery_agent' }];
    const lockers = [{ id: 101 }, { id: 102 }, { id: 103 }, { id: 104 }, { id: 105 }, { id: 106 }, { id: 107 }, { id: 108 }, { id: 109 }, { id: 110 }];

    const payloads = buildPackageSeedPayloads({
      customerUsers: customerUsers as any,
      agentUsers: agentUsers as any,
      lockers: lockers as any,
      packageService: packageServiceMock,
      count: 10,
    });

    expect(payloads).toHaveLength(10);
    expect(payloads.filter((payload) => payload.agent_id === 10)).toHaveLength(5);
    expect(payloads.filter((payload) => payload.agent_id === 11)).toHaveLength(5);
  });

  it('builds 3 ready-to-pick payloads with valid pickup codes', () => {
    const customerUsers = [{ id: 1, role: 'customer' }, { id: 2, role: 'customer' }];
    const agentUsers = [{ id: 10, role: 'delivery_agent' }, { id: 11, role: 'delivery_agent' }];
    const lockers = [{ id: 201 }, { id: 202 }, { id: 203 }];

    const payloads = buildPackageSeedPayloads({
      customerUsers: customerUsers as any,
      agentUsers: agentUsers as any,
      lockers: lockers as any,
      packageService: packageServiceMock,
      count: 3,
      deliveryStatus: 'READY_TO_PICK',
      sequenceStart: 1,
    });

    expect(payloads).toHaveLength(3);
    expect(payloads.every((payload) => payload.delivery_status === 'READY_TO_PICK')).toBe(true);
    expect(payloads.map((payload) => payload.package_code)).toEqual([
      'PKG-00000001',
      'PKG-00000002',
      'PKG-00000003',
    ]);
    expect(payloads.every((payload) => payload.pickup_code?.startsWith('PKG-READY_TO_PICK-'))).toBe(true);
    expect(payloads.every((payload) => payload.deposited_at instanceof Date)).toBe(true);
    expect(payloads.every((payload) => payload.pickup_at instanceof Date)).toBe(true);
    expect(payloads.every((payload) => payload.retrieved_at === null)).toBe(true);
  });

  it('builds 3 picked payloads with pickup and retrieved timestamps', () => {
    const customerUsers = [{ id: 1, role: 'customer' }, { id: 2, role: 'customer' }];
    const agentUsers = [{ id: 10, role: 'delivery_agent' }, { id: 11, role: 'delivery_agent' }];
    const lockers = [{ id: 301 }, { id: 302 }, { id: 303 }];

    const packageService = new PackageService(
      { findAll: async () => [], findOne: async () => null } as any,
      { findOne: async () => null } as any,
    );

    const payloads = buildPackageSeedPayloads({
      customerUsers: customerUsers as any,
      agentUsers: agentUsers as any,
      lockers: lockers as any,
      packageService,
      count: 3,
      deliveryStatus: 'PICKED',
      sequenceStart: 1,
    });

    expect(payloads).toHaveLength(3);
    expect(payloads.every((payload) => payload.delivery_status === 'PICKED')).toBe(true);
    expect(payloads.every((payload) => payload.pickup_at instanceof Date)).toBe(true);
    expect(payloads.every((payload) => payload.deposited_at instanceof Date)).toBe(true);
    expect(payloads.every((payload) => payload.retrieved_at instanceof Date)).toBe(true);
    expect(payloads.map((payload) => payload.storage_price)).toEqual([3, 9, 21]);
  });

  it('calculates tiered storage price from deposited and retrieved dates', () => {
    const packageService = new PackageService(
      { findAll: async () => [], findOne: async () => null } as any,
      { findOne: async () => null } as any,
    );

    const depositedAt = new Date('2026-06-01T08:00:00.000Z');
    expect(packageService.calculateStoragePrice(depositedAt, new Date('2026-06-04T08:00:00.000Z'))).toBe(3);
    expect(packageService.calculateStoragePrice(depositedAt, new Date('2026-06-08T08:00:00.000Z'))).toBe(9);
    expect(packageService.calculateStoragePrice(depositedAt, new Date('2026-06-13T08:00:00.000Z'))).toBe(21);
  });
});
