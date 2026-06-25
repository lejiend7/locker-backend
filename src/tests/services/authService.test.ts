import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../services/authService.js';

function createRandomTestIdentity(prefix = 'test') {
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return {
    name: `${prefix} ${randomSuffix}`,
    email: `${prefix}+${randomSuffix}@example.com`,
  };
}

function createMockRepo() {
  return {
    findOne: vi.fn(),
    create: vi.fn((input) => input),
    save: vi.fn(async (input) => ({ id: 1, ...input })),
  };
}

describe('AuthService', () => {
  const jwtSecret = 'test-secret';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('signup returns validation error when required fields are missing', async () => {
    const repo = createMockRepo();
    const service = new AuthService(repo as any, jwtSecret);
    const { email } = createRandomTestIdentity('test');

    const result = await service.signup({ email });

    expect(result.success).toBe(false);
    expect(result.message).toBe('name, email, and password are required');
  });

  it('signup fails when email already exists', async () => {
    const repo = createMockRepo();
    const { name, email } = createRandomTestIdentity('test');
    repo.findOne.mockResolvedValue({ id: 7, email });

    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.signup({ name, email, password: 'Secret123!' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Email address already registered');
  });

  it('signup creates user with hashed password, default role, and token', async () => {
    const repo = createMockRepo();
    repo.findOne.mockResolvedValue(null);

    vi.spyOn(bcrypt, 'hash').mockResolvedValue('$hashed' as never);
    vi.spyOn(jwt, 'sign').mockReturnValue('jwt-token' as never);

    const { name, email } = createRandomTestIdentity('test');
    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.signup({
      name,
      email,
      password: 'SecurePass1!',
      role: 'customer',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accessToken).toBe('jwt-token');
      expect(result.data.user.email).toBe(email);
      expect(result.data.user.role).toBe('customer');
    }

    expect(repo.create).toHaveBeenCalledWith({
      name,
      email,
      password: '$hashed',
      role: 'customer',
    });
  });

  it('signup rejects admin role on the public endpoint', async () => {
    const repo = createMockRepo();
    repo.findOne.mockResolvedValue(null);

    const { name, email } = createRandomTestIdentity('test');
    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.signup({
      name,
      email,
      password: 'SecurePass1!',
      role: 'admin',
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('role must be customer or delivery_agent');
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('signupAdmin allows admin role for the separate admin endpoint', async () => {
    const repo = createMockRepo();
    repo.findOne.mockResolvedValue(null);

    vi.spyOn(bcrypt, 'hash').mockResolvedValue('$hashed' as never);
    vi.spyOn(jwt, 'sign').mockReturnValue('jwt-admin-token' as never);

    const { name, email } = createRandomTestIdentity('test');
    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.signupAdmin({
      name,
      email,
      password: 'SecurePass1!',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accessToken).toBe('jwt-admin-token');
      expect(result.data.user.role).toBe('admin');
    }

    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }));
  });

  it('login fails when user does not exist', async () => {
    const repo = createMockRepo();
    repo.findOne.mockResolvedValue(null);
    const { email } = createRandomTestIdentity('test');

    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.login({ email, password: 'x' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email or password');
  });

  it('login fails on invalid password', async () => {
    const repo = createMockRepo();
    const { name, email } = createRandomTestIdentity('test');
    repo.findOne.mockResolvedValue({ id: 2, name, email, password: '$hash' });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.login({ email, password: 'wrong' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email or password');
  });

  it('login returns token and user on valid credentials', async () => {
    const repo = createMockRepo();
    const { name, email } = createRandomTestIdentity('test');
    repo.findOne.mockResolvedValue({ id: 3, name, email, password: '$hash' });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    vi.spyOn(jwt, 'sign').mockReturnValue('jwt-login-token' as never);

    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.login({ email, password: 'SecurePass2!' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accessToken).toBe('jwt-login-token');
      expect(result.data.user).toEqual({
        id: '3',
        email,
        name,
      });
    }
  });
});
