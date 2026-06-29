import { Package } from '@/database/entities/Package.ts';

export interface PackageRepositoryInterface {
  findById(id: number): Promise<Package | null>;
  findOne(options: any): Promise<Package | null>;
  update(id: number, data: Partial<Package>): Promise<Package | null>;
  findByCustomerId(customer_id: number): Promise<Package[]>;
  findByLockerId(locker_id: number): Promise<Package | null>;
  findByPickupCode(pickup_code: string): Promise<Package | null>;
  findByPickupCodeAndLockerId(pickup_code: string, locker_id: number): Promise<Package | null>;
  findReadyToPickByLockerId(locker_id: number): Promise<Package | null>;
  listByCustomer(customer_id: number): Promise<Package[]>;
  listByAgent(agent_id: number): Promise<Package[]>;
}
