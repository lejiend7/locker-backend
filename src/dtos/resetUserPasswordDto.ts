import { BaseDto } from '@/dtos/baseDto.ts';

export type ResetUserPasswordDtoInput = {
  password?: unknown;
  confirmPassword?: unknown;
};

export type ResetUserPasswordDtoValue = {
  password: string;
  confirmPassword: string;
};

export class ResetUserPasswordDto extends BaseDto<ResetUserPasswordDtoInput, ResetUserPasswordDtoValue> {
  static validate(input: ResetUserPasswordDtoInput) {
    const password = this.normalizeString(input.password);
    const confirmPassword = this.normalizeString(input.confirmPassword);
    const errors: string[] = [];

    if (!password) {
      errors.push('password is required');
    }

    if (password && password.length < 8) {
      errors.push('password must be at least 8 characters');
    }

    if (!confirmPassword) {
      errors.push('confirmPassword is required');
    }

    if (password && confirmPassword && password !== confirmPassword) {
      errors.push('password and confirmPassword must match');
    }

    return this.buildValidationResult(
      errors,
      {
        password,
        confirmPassword,
      },
      errors.length > 0 ? 'Invalid reset password request' : 'Validation succeeded',
    );
  }
}
