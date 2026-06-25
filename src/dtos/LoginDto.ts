import { BaseDto } from '@/dtos/BaseDto.ts';

export type LoginDtoInput = {
  email?: unknown;
  password?: unknown;
};

export type LoginDtoValue = {
  email: string;
  password: string;
};

export class LoginDto extends BaseDto<LoginDtoInput, LoginDtoValue> {
  static validate(input: LoginDtoInput) {
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
