import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '@/database/data-source.ts';
import { User } from '@/database/entities/User.ts';
import users from '@/database/seeders/seeder-data/users.ts';

const DEFAULT_SEED_PASSWORD = 'SecurePass123!';

async function seedUsers() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for user seeding');

    const userRepo = AppDataSource.getRepository(User);

    const passwordHash = await bcrypt.hash(DEFAULT_SEED_PASSWORD, 10);
    let insertedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      const existingUser = await userRepo.findOne({ where: { email: user.email } });

      if (!existingUser) {
        const newUser = userRepo.create({
          name: user.name,
          email: user.email,
          password: passwordHash,
          role: user.role,
        });
        await userRepo.save(newUser);
        insertedCount += 1;
        console.log(`Inserted user ${user.email} (${user.role})`);
      } else {
        skippedCount += 1;
        console.log(`Skipped existing user ${user.email} (${existingUser.role})`);
      }
    }

    console.log(`User seeding completed (inserted: ${insertedCount}, skipped: ${skippedCount})`);
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('User seeding failed:', error);
    process.exit(1);
  }
}

seedUsers();
