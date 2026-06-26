import 'reflect-metadata';
import { pathToFileURL } from 'node:url';
import { AppDataSource } from '@/database/data-source.ts';
import { Locker } from '@/database/entities/Locker.ts';
import { Package } from '@/database/entities/Package.ts';
import { User } from '@/database/entities/User.ts';
import { LockerRepository } from '@/database/repositories/LockerRepository.ts';
import { PackageRepository } from '@/database/repositories/PackageRepository.ts';
import { UserRepository } from '@/database/repositories/UserRepository.ts';
import { LockerAvailabilityServiceInterface } from '@/services/interfaces/LockerAvailabilityServiceInterface.ts';
import { PackageCustomerSelectionServiceInterface } from '@/services/interfaces/PackageCustomerSelectionServiceInterface.ts';
import { LockerService } from '@/services/lockerService.ts';
import { PackageService } from '@/services/packageService.ts';

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

export async function findEligibleCustomerForPackageSeed({
  customerSelectionService,
}: {
  customerSelectionService: PackageCustomerSelectionServiceInterface;
}) {
  return customerSelectionService.getEligibleCustomer();
}

export function buildPackageSeedData({
  customerUser,
  agentUser,
  locker,
  customerName = 'Priya Sharma',
  deliveryStatus = 'ASSIGNED_TO_AGENT',
}: {
  customerUser: Pick<User, 'id' | 'role'>;
  agentUser: Pick<User, 'id' | 'role'>;
  locker: Pick<Locker, 'id'>;
  customerName?: string;
  deliveryStatus?: Package['delivery_status'];
}) {
  if (!customerUser || customerUser.role !== 'customer') {
    throw new Error('A customer user with role customer is required.');
  }

  if (!agentUser || agentUser.role !== 'delivery_agent') {
    throw new Error('An agent user with role delivery_agent is required.');
  }

  return {
    customer_id: customerUser.id,
    agent_id: agentUser.id,
    locker_id: locker.id,
    package_size: 'medium' as const,
    delivery_status: deliveryStatus,
    customer_name: customerName,
    assigned_at: new Date('2026-06-25T08:00:00.000Z'),
    created_at: new Date('2026-06-25T08:00:00.000Z'),
  };
}

export function buildPackageSeedPayloads({
  customerUsers,
  agentUsers,
  lockers,
  count,
}: {
  customerUsers: Array<Pick<User, 'id' | 'role'>>;
  agentUsers: Array<Pick<User, 'id' | 'role'>>;
  lockers: Array<Pick<Locker, 'id'>>;
  count: number;
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
        customerName: customerUser.id === 1 ? 'Priya Sharma' : `Customer ${customerUser.id}`,
      }),
    );
  }

  return payloads;
}

async function seedPackages() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for package seeding');

    const packageRepo = AppDataSource.getRepository(Package);
    const userRepo = AppDataSource.getRepository(User);
    const lockerRepo = AppDataSource.getRepository(Locker);

    const agentUsers = await userRepo.find({
      where: { role: 'delivery_agent' } as any,
    });
    const lockerService = new LockerService(new LockerRepository(lockerRepo));
    const customerSelectionService = new PackageService(
      new UserRepository(userRepo),
      new PackageRepository(packageRepo)
    );

    const customerUsers = await userRepo.find({ where: { role: 'customer' } as any });

    if (agentUsers.length < 2) {
      throw new Error('At least two delivery agents are required for package seeding.');
    }

    const availableLockers = await lockerService.getAvailableLockers();

    if (customerUsers.length === 0 || availableLockers.length === 0) {
      throw new Error('Required customer users or available lockers were not found. Seed users and stations first.');
    }

    const packagePayloads = buildPackageSeedPayloads({
      customerUsers,
      agentUsers: agentUsers.slice(0, 2),
      lockers: availableLockers,
      count: 10,
    });

    const packageRecords = packageRepo.create(packagePayloads);
    await packageRepo.save(packageRecords);

    console.log('Package seeding completed');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Package seeding failed:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

const isDirectExecution = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isDirectExecution) {
  seedPackages();
}
