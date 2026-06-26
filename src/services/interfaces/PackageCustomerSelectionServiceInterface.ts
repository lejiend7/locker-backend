import { User } from '@/database/entities/User.ts';

export interface PackageCustomerSelectionServiceInterface {
  getEligibleCustomer(): Promise<User | null>;
}
