import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthService } from '../../services/authService.js';

type UserEntity = {
  id: number;
  name: string;
  email: string;
  password: string;
};

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

    const result = await service.signup({ email: 'a@test.com' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('name, email, and password are required');
  });

  it('signup fails when email already exists', async () => {
    const repo = createMockRepo();
    repo.findOne.mockResolvedValue({ id: 7, email: 'a@test.com' });

    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.signup({ name: 'A', email: 'a@test.com', password: 'Secret123!' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Email address already registered');
  });

  it('signup creates user with hashed password and token', async () => {
    const repo = createMockRepo();
    repo.findOne.mockResolvedValue(null);

    vi.spyOn(bcrypt, 'hash').mockResolvedValue('$hashed' as never);
    vi.spyOn(jwt, 'sign').mockReturnValue('jwt-token' as never);

    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.signup({
      name: 'Priya',
      email: 'priya@example.com',
      password: 'SecurePass1!',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accessToken).toBe('jwt-token');
      expect(result.data.user.email).toBe('priya@example.com');
    }

    expect(repo.create).toHaveBeenCalledWith({
      name: 'Priya',
      email: 'priya@example.com',
      password: '$hashed',
    });
  });

  it('login fails when user does not exist', async () => {
    const repo = createMockRepo();
    repo.findOne.mockResolvedValue(null);

    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.login({ email: 'none@test.com', password: 'x' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email or password');
  });

  it('login fails on invalid password', async () => {
    const repo = createMockRepo();
    repo.findOne.mockResolvedValue({ id: 2, name: 'A', email: 'a@test.com', password: '$hash' });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.login({ email: 'a@test.com', password: 'wrong' });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid email or password');
  });

  it('login returns token and user on valid credentials', async () => {
    const repo = createMockRepo();
    repo.findOne.mockResolvedValue({ id: 3, name: 'Ahmad', email: 'ahmad@test.com', password: '$hash' });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
    vi.spyOn(jwt, 'sign').mockReturnValue('jwt-login-token' as never);

    const service = new AuthService(repo as any, jwtSecret);
    const result = await service.login({ email: 'ahmad@test.com', password: 'SecurePass2!' });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.accessToken).toBe('jwt-login-token');
      expect(result.data.user).toEqual({
        id: '3',
        email: 'ahmad@test.com',
        name: 'Ahmad',
      });
    }
  });
});
