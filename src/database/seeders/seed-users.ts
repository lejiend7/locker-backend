import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '@/database/data-source.ts';
import { User } from '@/database/entities/User.ts';

async function seedUsers() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected for user seeding');

    const userRepo = AppDataSource.getRepository(User);

    const users = [
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        plainPassword: 'SecurePass1!',
      },
      {
        name: 'Ahmad Hassan',
        email: 'ahmad@example.com',
        plainPassword: 'SecurePass2!',
      },
      {
        name: 'Lejiend Test',
        email: 'lejiend@test.com',
        plainPassword: 'SecurePass3!',
      },
    ];

    for (const user of users) {
      const existingUser = await userRepo.findOne({ where: { email: user.email } });
      const passwordHash = await bcrypt.hash(user.plainPassword, 10);

      if (!existingUser) {
        const newUser = userRepo.create({
          name: user.name,
          email: user.email,
          password: passwordHash,
        });
        await userRepo.save(newUser);
        console.log(`Inserted user ${user.email}`);
      } else {
        existingUser.name = user.name;
        existingUser.password = passwordHash;
        await userRepo.save(existingUser);
        console.log(`Updated user ${user.email}`);
      }
    }

    console.log('User seeding completed');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('User seeding failed:', error);
    process.exit(1);
  }
}

seedUsers();
