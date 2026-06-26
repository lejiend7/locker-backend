import { Package } from '@/database/entities/Package.ts';

export interface PackageRepositoryInterface {
  findByCustomerId(customer_id: number): Promise<Package[]>;
  findByLockerId(locker_id: number): Promise<Package | null>;
  findByPickupCode(pickup_code: string): Promise<Package | null>;
  findByPickupCodeAndLockerId(pickup_code: string, locker_id: number): Promise<Package | null>;
  findReadyToPickByLockerId(locker_id: number): Promise<Package | null>;
}
