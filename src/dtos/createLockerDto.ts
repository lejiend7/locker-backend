import { BaseDto } from '@/dtos/baseDto.ts';

export type CreateLockerDtoInput = {
  size?: unknown;
  stationId?: unknown;
  label?: unknown;
};

export type CreateLockerDtoValue = {
  size: string;
  stationId: string;
  label: string;
};

export class CreateLockerDto extends BaseDto<CreateLockerDtoInput, CreateLockerDtoValue> {
  static validate(input: CreateLockerDtoInput) {
    const size = this.normalizeString(input.size);
    const stationId = this.normalizeString(input.stationId);
    const label = this.normalizeString(input.label);

    const errors: string[] = [];

    if (!size || !stationId || !label) {
      errors.push('size, stationId and label are required');
    }

    if (size && !['small', 'medium', 'large'].includes(size)) {
      errors.push('size must be one of small, medium, large');
    }

    return this.buildValidationResult(errors, {
      size,
      stationId,
      label,
    }, errors.length > 0 ? 'Missing required locker fields' : 'Validation succeeded');
  }
}
