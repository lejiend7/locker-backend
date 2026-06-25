import 'reflect-metadata';
import { AppDataSource } from '@/database/data-source.js';
import { Station } from '@/database/entities/Station.js';
import { Locker } from '@/database/entities/Locker.js';

type StationSeed = {
  name: string;
  type: 'mall' | 'office' | 'residential';
  city: string;
  address: string;
  lockers: Array<{
    label: string;
    size: 'small' | 'medium' | 'large';
    status: 'available' | 'occupied';
  }>;
};

const stationSeeds: StationSeed[] = [
  {
    name: 'The Curve',
    type: 'mall',
    city: 'Petaling Jaya',
    address: 'Ground Floor, Mutiara Damansara, 47800 Petaling Jaya',
    lockers: [
      { label: 'A-01', size: 'small', status: 'available' },
      { label: 'A-02', size: 'medium', status: 'available' },
      { label: 'B-01', size: 'large', status: 'available' },
    ],
  },
  {
    name: 'Damansara Uptown Business Centre',
    type: 'office',
    city: 'Petaling Jaya',
    address: 'SS21, Damansara Utama, 47400 Petaling Jaya',
    lockers: [
      { label: 'C-01', size: 'small', status: 'available' },
      { label: 'C-02', size: 'medium', status: 'available' },
      { label: 'D-01', size: 'large', status: 'available' },
    ],
  },
  {
    name: 'Empire Damansara Residences',
    type: 'residential',
    city: 'Petaling Jaya',
    address: 'Jalan PJU 8/8A, Damansara Perdana, 47820 Petaling Jaya',
    lockers: [
      { label: 'E-01', size: 'small', status: 'available' },
      { label: 'E-02', size: 'medium', status: 'available' },
      { label: 'F-01', size: 'large', status: 'available' },
    ],
  },
];

async function seedStations() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for station seeding');

    const stationRepo = AppDataSource.getRepository(Station);
    const lockerRepo = AppDataSource.getRepository(Locker);

    for (const stationSeed of stationSeeds) {
      let station = await stationRepo.findOne({ where: { name: stationSeed.name } });

      if (!station) {
        station = stationRepo.create({
          name: stationSeed.name,
          type: stationSeed.type,
          city: stationSeed.city,
          address: stationSeed.address,
        });
        station = await stationRepo.save(station);
        console.log(`Inserted station ${station.name}`);
      } else {
        station.type = stationSeed.type;
        station.city = stationSeed.city;
        station.address = stationSeed.address;
        station = await stationRepo.save(station);
        console.log(`Updated station ${station.name}`);
      }

      for (const lockerSeed of stationSeed.lockers) {
        const existingLocker = await lockerRepo.findOne({
          where: {
            station_id: station.id,
            label: lockerSeed.label,
          } as any,
        });

        if (!existingLocker) {
          const locker = lockerRepo.create({
            station_id: station.id,
            size: lockerSeed.size,
            status: lockerSeed.status,
            label: lockerSeed.label,
            version: 1,
          });
          await lockerRepo.save(locker);
          console.log(`Inserted locker ${locker.label} for ${station.name}`);
        }
      }
    }

    console.log('✅ Station seed data completed');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Station seeding failed:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

seedStations();
