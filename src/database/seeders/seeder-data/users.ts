import type { User } from '@/database/entities/User.ts';

export type UserSeedInput = Pick<User, 'name' | 'email' | 'role'>;

export const users: UserSeedInput[] = [
  // Admin (10)
  { name: 'Alice Johnson', email: 'alice.admin@example.com', role: 'admin' },
  { name: 'Brian Smith', email: 'brian.admin@example.com', role: 'admin' },
  { name: 'Catherine Lee', email: 'catherine.admin@example.com', role: 'admin' },
  { name: 'Daniel Wong', email: 'daniel.admin@example.com', role: 'admin' },
  { name: 'Emily Tan', email: 'emily.admin@example.com', role: 'admin' },
  { name: 'Farid Hassan', email: 'farid.admin@example.com', role: 'admin' },
  { name: 'Grace Lim', email: 'grace.admin@example.com', role: 'admin' },
  { name: 'Henry Davis', email: 'henry.admin@example.com', role: 'admin' },
  { name: 'Isabella Martin', email: 'isabella.admin@example.com', role: 'admin' },
  { name: 'Jason Wilson', email: 'jason.admin@example.com', role: 'admin' },

  // Customer (10)
  { name: 'Kevin Brown', email: 'kevin.customer@example.com', role: 'customer' },
  { name: 'Linda Taylor', email: 'linda.customer@example.com', role: 'customer' },
  { name: 'Michael Anderson', email: 'michael.customer@example.com', role: 'customer' },
  { name: 'Natalie Clark', email: 'natalie.customer@example.com', role: 'customer' },
  { name: 'Oliver White', email: 'oliver.customer@example.com', role: 'customer' },
  { name: 'Patricia Young', email: 'patricia.customer@example.com', role: 'customer' },
  { name: 'Quentin Harris', email: 'quentin.customer@example.com', role: 'customer' },
  { name: 'Rachel Lewis', email: 'rachel.customer@example.com', role: 'customer' },
  { name: 'Samuel Walker', email: 'samuel.customer@example.com', role: 'customer' },
  { name: 'Teresa Hall', email: 'teresa.customer@example.com', role: 'customer' },

  // Delivery Agent (10)
  { name: 'Umar Rahman', email: 'umar.delivery@example.com', role: 'delivery_agent' },
  { name: 'Victor Allen', email: 'victor.delivery@example.com', role: 'delivery_agent' },
  { name: 'William Scott', email: 'william.delivery@example.com', role: 'delivery_agent' },
  { name: 'Xavier King', email: 'xavier.delivery@example.com', role: 'delivery_agent' },
  { name: 'Yusuf Ahmad', email: 'yusuf.delivery@example.com', role: 'delivery_agent' },
  { name: 'Zara Ibrahim', email: 'zara.delivery@example.com', role: 'delivery_agent' },
  { name: 'Adam Cooper', email: 'adam.delivery@example.com', role: 'delivery_agent' },
  { name: 'Bella Morgan', email: 'bella.delivery@example.com', role: 'delivery_agent' },
  { name: 'Charles Evans', email: 'charles.delivery@example.com', role: 'delivery_agent' },
  { name: 'Diana Parker', email: 'diana.delivery@example.com', role: 'delivery_agent' },
];

export default users;