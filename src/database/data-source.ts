import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Station } from './entities/Station.js';
import { Locker } from './entities/Locker.js';
import { User } from './entities/User.js';
import { Package } from './entities/Package.js';
import { Message } from './entities/Message.js';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.MYSQL_USER || '',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.DB_NAME || '',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [Station, Locker, User, Package, Message],
  migrations: ['src/database/migrations/*.ts'],
  migrationsTableName: 'migrations',
});
