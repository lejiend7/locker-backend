import 'reflect-metadata';
import { pathToFileURL } from 'node:url';
import { AppDataSource } from '@/database/data-source.ts';
import { Locker } from '@/database/entities/Locker.ts';
import { Package } from '@/database/entities/Package.ts';
import { User } from '@/database/entities/User.ts';
import { LockerAvailabilityServiceInterface } from '@/services/interfaces/LockerAvailabilityServiceInterface.ts';

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

async function seedPackages() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for package seeding');

    const packageRepo = AppDataSource.getRepository(Package);
    const userRepo = AppDataSource.getRepository(User);
    const lockerRepo = AppDataSource.getRepository(Locker);

    const customerUser = await userRepo.findOne({
      where: { email: 'priya@example.com', role: 'customer' } as any,
    });
    const agentUser = await userRepo.findOne({
      where: { email: 'ahmad@example.com', role: 'delivery_agent' } as any,
    });
    const lockerService = new LockerAvailabilityService({
      lockerRepository: new (require('@/database/repositories/LockerRepository.ts').LockerRepository)(lockerRepo),
    } as any);

    const locker = await findAvailableLockerForPackageSeed({
      lockerService,
    });

    if (!customerUser || !agentUser || !locker) {
      throw new Error('Required customer user, agent user, or locker not found. Seed users and stations first.');
    }

    const existingPackage = await packageRepo.findOne({
      where: {
        customer_id: customerUser.id,
        agent_id: agentUser.id,
        locker_id: locker.id,
        customer_name: 'Priya Sharma',
      } as any,
    });

    if (existingPackage) {
      console.log('Package already exists for Priya Sharma and locker L-003');
      await AppDataSource.destroy();
      process.exit(0);
    }

    const packageRecord = packageRepo.create(
      buildPackageSeedData({
        customerUser,
        agentUser,
        locker,
      }),
    );

    await packageRepo.save(packageRecord);

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
