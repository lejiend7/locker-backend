import 'reflect-metadata';
import { pathToFileURL } from 'node:url';
import { AppDataSource } from '@/database/data-source.js';
import { Locker } from '@/database/entities/Locker.js';
import { Package } from '@/database/entities/Package.js';
import { User } from '@/database/entities/User.js';
import { LockerRepository } from '@/database/repositories/LockerRepository.js';
import { PackageRepository } from '@/database/repositories/PackageRepository.js';
import { UserRepository } from '@/database/repositories/UserRepository.js';
import { LockerAvailabilityServiceInterface } from '@/services/interfaces/LockerAvailabilityServiceInterface.js';
import { PackageServiceInterface } from '@/services/interfaces/PackageServiceInterface.js';
import { LockerService } from '@/services/lockerService.js';
import { PackageService } from '@/services/packageService.js';

function buildPackageCode(sequence: number): string {
  return `PKG-${String(sequence).padStart(8, '0')}`;
}

export async function findAvailableLockerForPackageSeed({
  lockerService,
}: {
  lockerService: LockerAvailabilityServiceInterface;
}) {
  const availableLockers = await lockerService.getAvailableLockers();

  if (availableLockers.length === 0) {
    throw new Error('No available lockers found for package seeding.');
  }

  return availableLockers[0];
}

export function buildPackageSeedData({
  customerUser,
  agentUser,
  locker,
  packageService,
  customerName = 'Priya Sharma',
  deliveryStatus = 'ASSIGNED_TO_AGENT',
  sequence = 1,
}: {
  customerUser: Pick<User, 'id' | 'role'>;
  agentUser: Pick<User, 'id' | 'role'>;
  locker?: Pick<Locker, 'id'>;
  packageService: PackageServiceInterface;
  customerName?: string;
  deliveryStatus?: Package['delivery_status'];
  sequence?: number;
}) {
  if (!customerUser || customerUser.role !== 'customer') {
    throw new Error('A customer user with role customer is required.');
  }

  if (!agentUser || agentUser.role !== 'delivery_agent') {
    throw new Error('An agent user with role delivery_agent is required.');
  }

  const assignedAt = new Date('2026-06-25T08:00:00.000Z');
  const deliveryDetails = packageService.buildDeliveryDetails({
    deliveryStatus,
    sequence,
    assignedAt,
  });

  if (deliveryStatus !== 'ASSIGNED_TO_AGENT' && !locker) {
    throw new Error('A locker is required when seeding READY_TO_PICK or PICKED packages.');
  }

  return {
    package_code: buildPackageCode(sequence),
    customer_id: customerUser.id,
    agent_id: agentUser.id,
    locker_id: deliveryStatus === 'ASSIGNED_TO_AGENT' ? null : locker!.id,
    package_size: 'medium' as const,
    delivery_status: deliveryStatus,
    pickup_code: deliveryDetails.pickup_code,
    customer_name: customerName,
    assigned_at: assignedAt,
    deposited_at: deliveryDetails.deposited_at,
    pickup_at: deliveryDetails.pickup_at,
    retrieved_at: deliveryDetails.retrieved_at,
    storage_price: deliveryDetails.storage_price,
    created_at: assignedAt,
  };
}

export function buildPackageSeedPayloads({
  customerUsers,
  agentUsers,
  lockers,
  packageService,
  count,
  deliveryStatus = 'ASSIGNED_TO_AGENT',
  sequenceStart = 1,
}: {
  customerUsers: Array<Pick<User, 'id' | 'role'>>;
  agentUsers: Array<Pick<User, 'id' | 'role'>>;
  lockers: Array<Pick<Locker, 'id'>>;
  packageService: PackageServiceInterface;
  count: number;
  deliveryStatus?: Package['delivery_status'];
  sequenceStart?: number;
}) {
  if (agentUsers.length < 2) {
    throw new Error('At least two delivery agents are required for package seeding.');
  }

  const payloads = [] as Array<ReturnType<typeof buildPackageSeedData>>;
  const eligibleCustomers = customerUsers.filter((user) => user.role === 'customer');

  if (eligibleCustomers.length === 0) {
    throw new Error('At least one customer user is required for package seeding.');
  }

  for (let index = 0; index < count; index += 1) {
    const customerUser = eligibleCustomers[index % eligibleCustomers.length];
    const agentUser = agentUsers[index % agentUsers.length];
    const locker = lockers[index % lockers.length];

    payloads.push(
      buildPackageSeedData({
        customerUser,
        agentUser,
        locker,
        packageService,
        customerName: customerUser.id === 1 ? 'Priya Sharma' : `Customer ${customerUser.id}`,
        deliveryStatus,
        sequence: sequenceStart + index,
      }),
    );
  }

  return payloads;
}

async function seedPackages() {
  const closeDataSource = async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  };

  try {
    await AppDataSource.initialize();
    console.log('Database connected for package seeding');

    const packageRepo = AppDataSource.getRepository(Package);
    const userRepo = AppDataSource.getRepository(User);
    const lockerRepo = AppDataSource.getRepository(Locker);
    const packageService: PackageServiceInterface = new PackageService(
      new UserRepository(userRepo),
      new PackageRepository(packageRepo),
    );

    const agentUsers = await userRepo.find({
      where: { role: 'delivery_agent' } as any,
    });
    const lockerService = new LockerService(new LockerRepository(lockerRepo));

    const customerUsers = await userRepo.find({ where: { role: 'customer' } as any });

    if (agentUsers.length < 2) {
      throw new Error('At least two delivery agents are required for package seeding.');
    }

    const availableLockers = await lockerService.getAvailableLockers();

    if (customerUsers.length === 0 || availableLockers.length === 0) {
      throw new Error('Required customer users or available lockers were not found. Seed users and stations first.');
    }

    const existingPackageCount = await packageRepo.count();

    const assignedPayloads = buildPackageSeedPayloads({
      customerUsers,
      agentUsers: agentUsers.slice(0, 2),
      lockers: availableLockers,
      packageService,
      count: 3,
      deliveryStatus: 'ASSIGNED_TO_AGENT',
      sequenceStart: existingPackageCount + 1,
    });

    const readyToPickPayloads = buildPackageSeedPayloads({
      customerUsers,
      agentUsers: agentUsers.slice(0, 2),
      lockers: availableLockers,
      packageService,
      count: 3,
      deliveryStatus: 'READY_TO_PICK',
      sequenceStart: existingPackageCount + 1001,
    });
    const pickedPayloads = buildPackageSeedPayloads({
      customerUsers,
      agentUsers: agentUsers.slice(0, 2).reverse(),
      lockers: availableLockers,
      packageService,
      count: 3,
      deliveryStatus: 'PICKED',
      sequenceStart: existingPackageCount + 10001,
    });

    const packagePayloads = [...assignedPayloads, ...readyToPickPayloads, ...pickedPayloads];

    const packageRecords = packageRepo.create(packagePayloads);
    await packageRepo.save(packageRecords);

    console.log('Package seeding completed');
    await closeDataSource();
    process.exit(0);
  } catch (error) {
    console.error('Package seeding failed:', error);
    await closeDataSource();
    process.exit(1);
  }
}

const isDirectExecution = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectExecution) {
  seedPackages();
}
