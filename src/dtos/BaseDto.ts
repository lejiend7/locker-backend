export type ValidationResult<T> = {
  isValid: boolean;
  errors: string[];
  message: string;
  value: T;
};

export abstract class BaseDto<TInput extends Record<string, unknown>, TValue> {
  protected static normalizeString(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number') {
      return String(value).trim();
    }

    return '';
  }

  protected static buildValidationResult<TValue>(
    errors: string[],
    value: TValue,
    message = 'Validation failed'
  ): ValidationResult<TValue> {
    return {
      isValid: errors.length === 0,
      errors,
      message,
      value,
    };
  }

  static validate(_input: TInput): ValidationResult<TValue> {
    throw new Error('validate must be implemented by a subclass');
  }
}
