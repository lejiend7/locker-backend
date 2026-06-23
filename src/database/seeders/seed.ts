import 'reflect-metadata';
import { AppDataSource } from '../data-source.js';
import { Station } from '../entities/Station.js';
import { Locker } from '../entities/Locker.js';
import { User } from '../entities/User.js';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for seeding');

    // Clear existing data (optional)
    // await AppDataSource.dropDatabase();
    // await AppDataSource.synchronize();

    // Seed stations
    const stationRepo = AppDataSource.getRepository(Station);
    const userRepo = AppDataSource.getRepository(User);
    const lockerRepo = AppDataSource.getRepository(Locker);

    console.log('Seeding stations...');
    const station1 = stationRepo.create({
      id: 'ST-1749200000000',
      name: 'The Curve',
      type: 'mall',
      city: 'Petaling Jaya',
      address: 'Ground Floor, Mutiara Damansara, 47800 Petaling Jaya',
    });

    const station2 = stationRepo.create({
      id: 'ST-1749200000001',
      name: 'Damansara Uptown Business Centre',
      type: 'office',
      city: 'Petaling Jaya',
      address: 'SS21, Damansara Utama, 47400 Petaling Jaya',
    });

    const station3 = stationRepo.create({
      id: 'ST-1749200000002',
      name: 'Empire Damansara Residences',
      type: 'residential',
      city: 'Petaling Jaya',
      address: 'Jalan PJU 8/8A, Damansara Perdana, 47820 Petaling Jaya',
    });

    await stationRepo.save([station1, station2, station3]);

    console.log('Seeding lockers...');
    const locker1 = lockerRepo.create({
      id: 'L-001',
      station_id: 'ST-1749200000000',
      size: 'small',
      status: 'available',
      label: 'A-01',
    });

    const locker2 = lockerRepo.create({
      id: 'L-002',
      station_id: 'ST-1749200000000',
      size: 'medium',
      status: 'available',
      label: 'A-02',
    });

    const locker3 = lockerRepo.create({
      id: 'L-003',
      station_id: 'ST-1749200000000',
      size: 'large',
      status: 'available',
      label: 'B-01',
    });

    await lockerRepo.save([locker1, locker2, locker3]);

    console.log('Seeding users...');
    const user1 = userRepo.create({
      id: 'U-001',
      name: 'Priya Sharma',
      email: 'priya@example.com',
    });

    const user2 = userRepo.create({
      id: 'U-002',
      name: 'Ahmad Hassan',
      email: 'ahmad@example.com',
    });

    await userRepo.save([user1, user2]);

    console.log('✅ Seed data inserted successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
