import { BaseDto } from '@/dtos/baseDto.ts';

export type LoginAdminDtoInput = {
  email?: unknown;
  password?: unknown;
};

export type LoginAdminDtoValue = {
  email: string;
  password: string;
};

export class LoginAdminDto extends BaseDto<LoginAdminDtoInput, LoginAdminDtoValue> {
  static validate(input: LoginAdminDtoInput) {
    const email = this.normalizeString(input.email);
    const password = this.normalizeString(input.password);
    const errors: string[] = [];

    if (!email || !password) {
      errors.push('email and password are required');
    }

    return this.buildValidationResult(errors, {
      email,
      password,
    });
  }
}
