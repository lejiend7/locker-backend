import { BaseDto } from '@/dtos/baseDto.ts';

export type AssignLockerDtoInput = {
  packageId?: unknown;
  stationId?: unknown;
  lockerId?: unknown;
};

export type AssignLockerDtoValue = {
  packageId: string;
  stationId: string | null;
  lockerId: string | null;
};

export class AssignLockerDto extends BaseDto<AssignLockerDtoInput, AssignLockerDtoValue> {
  static validate(input: AssignLockerDtoInput) {
    const packageId = this.normalizeString(input.packageId);
    const stationId = this.normalizeString(input.stationId);
    const lockerId = this.normalizeString(input.lockerId);
    const errors: string[] = [];

    if (!packageId) {
      errors.push('packageId is required');
    }

    if (packageId && Number.isNaN(Number(packageId))) {
      errors.push('packageId must be a valid number');
    }

    if (stationId && Number.isNaN(Number(stationId))) {
      errors.push('stationId must be a valid number');
    }

    if (lockerId && Number.isNaN(Number(lockerId))) {
      errors.push('lockerId must be a valid number');
    }

    return this.buildValidationResult(
      errors,
      {
        packageId,
        stationId: stationId ?? null,
        lockerId: lockerId ?? null,
      },
      errors.length > 0 ? 'Invalid assign locker request' : 'Validation succeeded'
    );
  }
}
