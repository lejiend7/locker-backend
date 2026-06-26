import { describe, expect, it } from 'vitest';
import { CreateLockerDto } from '@/dtos/createLockerDto.js';
import { LoginDto } from '@/dtos/loginDto.js';
import { SignupAdminDto } from '@/dtos/signupAdminDto.js';
import { SignupDto } from '@/dtos/signupDto.js';

describe('request DTO validation', () => {
  it('rejects incomplete signup payloads', () => {
    const result = SignupDto.validate({ name: 'Ada' });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('name, email, and password are required');
  });

  it('rejects incomplete admin signup payloads', () => {
    const result = SignupAdminDto.validate({ email: 'admin@example.com' });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('name, email, and password are required');
  });

  it('rejects incomplete login payloads', () => {
    const result = LoginDto.validate({ email: 'ada@example.com' });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('email and password are required');
  });

  it('rejects invalid locker sizes', () => {
    const result = CreateLockerDto.validate({ size: 'tiny', stationId: '1', label: 'A1' });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('size must be one of small, medium, large');
  });
});
