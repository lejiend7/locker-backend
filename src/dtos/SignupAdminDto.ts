import { BaseDto } from '@/dtos/baseDto.js';

export type SignupAdminDtoInput = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
};

export type SignupAdminDtoValue = {
  name: string;
  email: string;
  password: string;
};

export class SignupAdminDto extends BaseDto<SignupAdminDtoInput, SignupAdminDtoValue> {
  static validate(input: SignupAdminDtoInput) {
    const name = this.normalizeString(input.name);
    const email = this.normalizeString(input.email);
    const password = this.normalizeString(input.password);

    const errors: string[] = [];

    if (!name || !email || !password) {
      errors.push('name, email, and password are required');
    }

    return this.buildValidationResult(errors, {
      name,
      email,
      password,
    });
  }
}
