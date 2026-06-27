import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Station } from './entities/Station.ts';
import { Locker } from './entities/Locker.ts';
import { User } from './entities/User.ts';
import { Package } from './entities/Package.ts';
import { Notification } from './entities/Notification.ts';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.MYSQL_USER || '',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.DB_NAME || '',
  synchronize: false,
  logging: false,
  entities: [Station, Locker, User, Package, Notification],
  migrations: process.env.NODE_ENV === 'test' ? [] : ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
