import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Repository } from 'typeorm';
import { AppDataSource } from '../../database/data-source.js';
import { User } from '../../database/entities/User.js';
import { AuthService } from '../../services/authService.js';

function createRandomTestIdentity(prefix = 'test') {
  const randomSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: `${prefix} user ${randomSuffix}`,
    email: `${prefix}-${randomSuffix}@example.com`,
  };
}

describe('AuthService integration', () => {
  let userRepository: Repository<User>;
  let authService: AuthService;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    userRepository = AppDataSource.getRepository(User);
    authService = new AuthService(userRepository, 'test-secret');
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it('creates a real user in the database and allows login with the same credentials', async () => {
    const identity = createRandomTestIdentity('test');
    const password = 'SecurePass1!';

    const signupResult = await authService.signup({
      name: identity.name,
      email: identity.email,
      password,
      role: 'customer',
    });

    expect(signupResult.success).toBe(true);
    if (!signupResult.success) {
      throw new Error(signupResult.message);
    }

    const storedUser = await userRepository.findOne({ where: { email: identity.email } });
    expect(storedUser).toBeTruthy();
    expect(storedUser?.name).toBe(identity.name);
    expect(storedUser?.email).toBe(identity.email);
    expect(storedUser?.role).toBe('customer');

    const loginResult = await authService.login({
      email: identity.email,
      password,
    });

    expect(loginResult.success).toBe(true);
    if (!loginResult.success) {
      throw new Error(loginResult.message);
    }

    expect(loginResult.data.user.email).toBe(identity.email);
    expect(loginResult.data.user.name).toBe(identity.name);
    expect(loginResult.data.user.role).toBe('customer');
  });
});
