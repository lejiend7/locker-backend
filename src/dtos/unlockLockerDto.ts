import { BaseDto } from '@/dtos/baseDto.ts';

export type UnlockLockerDtoInput = {
  lockerId?: unknown;
  lockerLabel?: unknown;
  pickupCode?: unknown;
};

export type UnlockLockerDtoValue = {
  lockerId: string;
  pickupCode: string;
};

export class UnlockLockerDto extends BaseDto<UnlockLockerDtoInput, UnlockLockerDtoValue> {
  static validate(input: UnlockLockerDtoInput) {
    const lockerId = this.normalizeString(input.lockerId || input.lockerLabel);
    const pickupCode = this.normalizeString(input.pickupCode);
    const errors: string[] = [];

    if (!lockerId) {
      errors.push('lockerId is required');
    }

    if (!pickupCode) {
      errors.push('pickupCode is required');
    }

    return this.buildValidationResult(
      errors,
      {
        lockerId,
        pickupCode,
      },
      errors.length > 0 ? 'Invalid unlock locker request' : 'Validation succeeded'
    );
  }
}