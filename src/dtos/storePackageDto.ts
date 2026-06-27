import { BaseDto } from '@/dtos/baseDto.ts';

export type StorePackageDtoInput = {
  packageId?: unknown;
  storedAt?: unknown;
};

export type StorePackageDtoValue = {
  packageId: string;
  storedAt: string | null;
};

export class StorePackageDto extends BaseDto<StorePackageDtoInput, StorePackageDtoValue> {
  static validate(input: StorePackageDtoInput) {
    const packageId = this.normalizeString(input.packageId);
    const storedAt = this.normalizeString(input.storedAt);
    const errors: string[] = [];

    if (!packageId) {
      errors.push('packageId is required');
    }

    if (packageId && Number.isNaN(Number(packageId))) {
      errors.push('packageId must be a valid number');
    }

    if (storedAt && Number.isNaN(Date.parse(storedAt))) {
      errors.push('storedAt must be a valid ISO datetime');
    }

    return this.buildValidationResult(
      errors,
      {
        packageId,
        storedAt: storedAt || null,
      },
      errors.length > 0 ? 'Invalid store package request' : 'Validation succeeded'
    );
  }
}
