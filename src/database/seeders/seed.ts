import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '@/database/data-source.js';
import { Station } from '@/database/entities/Station.js';
import { Locker } from '@/database/entities/Locker.js';
import { User } from '@/database/entities/User.js';

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
      name: 'The Curve',
      type: 'mall',
      city: 'Petaling Jaya',
      address: 'Ground Floor, Mutiara Damansara, 47800 Petaling Jaya',
    });

    const station2 = stationRepo.create({
      name: 'Damansara Uptown Business Centre',
      type: 'office',
      city: 'Petaling Jaya',
      address: 'SS21, Damansara Utama, 47400 Petaling Jaya',
    });

    const station3 = stationRepo.create({
      name: 'Empire Damansara Residences',
      type: 'residential',
      city: 'Petaling Jaya',
      address: 'Jalan PJU 8/8A, Damansara Perdana, 47820 Petaling Jaya',
    });

    const savedStations = await stationRepo.save([station1, station2, station3]);

    console.log('Seeding lockers...');
    const locker1 = lockerRepo.create({
      station_id: savedStations[0].id,
      size: 'small',
      status: 'available',
      label: 'A-01',
    });

    const locker2 = lockerRepo.create({
      station_id: savedStations[0].id,
      size: 'medium',
      status: 'available',
      label: 'A-02',
    });

    const locker3 = lockerRepo.create({
      station_id: savedStations[0].id,
      size: 'large',
      status: 'available',
      label: 'B-01',
    });

    await lockerRepo.save([locker1, locker2, locker3]);

    console.log('Seeding users...');
    const user1Password = await bcrypt.hash('SecurePass1!', 10);
    const user2Password = await bcrypt.hash('SecurePass2!', 10);

    const user1 = userRepo.create({
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: user1Password,
    });

    const user2 = userRepo.create({
      name: 'Ahmad Hassan',
      email: 'ahmad@example.com',
      password: user2Password,
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
