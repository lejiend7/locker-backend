import { Package } from '@/database/entities/Package.ts';
import { User } from '@/database/entities/User.ts';

export interface PackageDeliveryDetails {
  pickup_code: string | null;
  stored_at: Date | null;
  pickup_at: Date | null;
  retrieved_at: Date | null;
  storage_price: number | null;
}

export interface PackageServiceInterface {
  getEligibleCustomer(): Promise<User | null>;
  buildDeliveryDetails(params: {
    deliveryStatus: Package['delivery_status'];
    sequence: number;
    assignedAt: Date;
  }): PackageDeliveryDetails;
  listByAgent(agentId: number): Promise<Package[]>;
}
