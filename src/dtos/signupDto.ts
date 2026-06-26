import { BaseDto } from '@/dtos/baseDto.ts';

export type SignupDtoInput = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  role?: unknown;
};

export type SignupDtoValue = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export class SignupDto extends BaseDto<SignupDtoInput, SignupDtoValue> {
  static validate(input: SignupDtoInput) {
    const name = this.normalizeString(input.name);
    const email = this.normalizeString(input.email);
    const password = this.normalizeString(input.password);
    const role = this.normalizeString(input.role);

    const errors: string[] = [];

    if (!name || !email || !password) {
      errors.push('name, email, and password are required');
    }

    if (role && !['customer', 'delivery_agent'].includes(role)) {
      errors.push('role must be customer or delivery_agent');
    }

    return this.buildValidationResult(errors, {
      name,
      email,
      password,
      role: role || 'customer',
    }, errors.length > 0 ? 'Validation failed' : 'Validation succeeded');
  }
}
