import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Repository } from 'typeorm';
import { AppDataSource } from '@/database/data-source.ts';
import { User } from '@/database/entities/User.ts';
import { UserRepository } from '@/database/repositories/UserRepository.ts';
import type { UserRepositoryInterface } from '@/database/repositories/interfaces/UserRepositoryInterface.ts';
import { AuthService } from '@/services/authService.ts';

function createRandomTestIdentity(prefix = 'test') {
  const randomSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: `${prefix} user ${randomSuffix}`,
    email: `${prefix}-${randomSuffix}@example.com`,
  };
}

describe('AuthService integration', () => {
  let userRepository: Repository<User>;
  let userRepoInterface: UserRepositoryInterface;
  let authService: AuthService;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    userRepository = AppDataSource.getRepository(User);
    userRepoInterface = new UserRepository(userRepository);
    authService = new AuthService(userRepoInterface, 'test-secret');
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('creates customer, delivery agent, and admin users and allows login for each role', async () => {
    const password = 'SecurePass1!';
    const customerIdentity = createRandomTestIdentity('customer');
    const agentIdentity = createRandomTestIdentity('agent');
    const adminIdentity = createRandomTestIdentity('admin');

    const customerSignupResult = await authService.signup({
      name: customerIdentity.name,
      email: customerIdentity.email,
      password,
      role: 'customer',
    });

    expect(customerSignupResult.success).toBe(true);
    if (!customerSignupResult.success) {
      throw new Error(customerSignupResult.message);
    }

    const agentSignupResult = await authService.signup({
      name: agentIdentity.name,
      email: agentIdentity.email,
      password,
      role: 'delivery_agent',
    });

    expect(agentSignupResult.success).toBe(true);
    if (!agentSignupResult.success) {
      throw new Error(agentSignupResult.message);
    }

    const adminSignupResult = await authService.signupAdmin({
      name: adminIdentity.name,
      email: adminIdentity.email,
      password,
    });

    expect(adminSignupResult.success).toBe(true);
    if (!adminSignupResult.success) {
      throw new Error(adminSignupResult.message);
    }

    const storedCustomer = await userRepository.findOne({ where: { email: customerIdentity.email } });
    const storedAgent = await userRepository.findOne({ where: { email: agentIdentity.email } });
    const storedAdmin = await userRepository.findOne({ where: { email: adminIdentity.email } });

    expect(storedCustomer?.name).toBe(customerIdentity.name);
    expect(storedCustomer?.email).toBe(customerIdentity.email);
    expect(storedCustomer?.role).toBe('customer');

    expect(storedAgent?.name).toBe(agentIdentity.name);
    expect(storedAgent?.email).toBe(agentIdentity.email);
    expect(storedAgent?.role).toBe('delivery_agent');

    expect(storedAdmin?.name).toBe(adminIdentity.name);
    expect(storedAdmin?.email).toBe(adminIdentity.email);
    expect(storedAdmin?.role).toBe('admin');

    const customerLoginResult = await authService.login({
      email: customerIdentity.email,
      password,
    });
    const agentLoginResult = await authService.login({
      email: agentIdentity.email,
      password,
    });
    const adminLoginResult = await authService.login({
      email: adminIdentity.email,
      password,
    });

    expect(customerLoginResult.success).toBe(true);
    if (!customerLoginResult.success) {
      throw new Error(customerLoginResult.message);
    }

    expect(agentLoginResult.success).toBe(true);
    if (!agentLoginResult.success) {
      throw new Error(agentLoginResult.message);
    }

    expect(adminLoginResult.success).toBe(true);
    if (!adminLoginResult.success) {
      throw new Error(adminLoginResult.message);
    }

    expect(customerLoginResult.data.user.role).toBe('customer');
    expect(agentLoginResult.data.user.role).toBe('delivery_agent');
    expect(adminLoginResult.data.user.role).toBe('admin');
  });
});
