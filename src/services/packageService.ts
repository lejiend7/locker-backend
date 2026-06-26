import { User } from '@/database/entities/User.ts';
import { Package } from '@/database/entities/Package.ts';
import { UserRepositoryInterface } from '@/database/repositories/interfaces/UserRepositoryInterface.ts';
import { PackageRepositoryInterface } from '@/database/repositories/interfaces/PackageRepositoryInterface.ts';
import { PackageCustomerSelectionServiceInterface } from '@/services/interfaces/PackageCustomerSelectionServiceInterface.ts';
import {
  PackageDeliveryDetails,
  PackageServiceInterface,
} from '@/services/interfaces/PackageServiceInterface.ts';

export class PackageService
  implements PackageCustomerSelectionServiceInterface, PackageServiceInterface
{
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly packageRepository: PackageRepositoryInterface
  ) {}

  async getEligibleCustomer(): Promise<User | null> {
    const customers = await this.userRepository.findAll();

    const eligibleCustomer = await Promise.all(
      customers
        .filter((user) => user.role === 'customer')
        .map(async (user) => {
          const activePackage = await this.packageRepository.findOne({
            where: { customer_id: user.id, delivery_status: 'ASSIGNED_TO_AGENT' } as any,
          });

          if (activePackage) {
            return null;
          }

          const readyToPickPackage = await this.packageRepository.findOne({
            where: { customer_id: user.id, delivery_status: 'READY_TO_PICK' } as any,
          });

          if (readyToPickPackage) {
            return null;
          }

          return user;
        })
    );

    return eligibleCustomer.find((user): user is User => Boolean(user)) ?? null;
  }

  buildDeliveryDetails({
    deliveryStatus,
    sequence,
    assignedAt,
  }: {
    deliveryStatus: Package['delivery_status'];
    sequence: number;
    assignedAt: Date;
  }): PackageDeliveryDetails {
    if (deliveryStatus === 'ASSIGNED_TO_AGENT') {
      return {
        pickup_code: null,
        deposited_at: null,
        pickup_at: null,
        retrieved_at: null,
        storage_price: null,
      };
    }

    const pickupAt = new Date(assignedAt.getTime() + 60 * 60 * 1000);
    const depositedAt = new Date(pickupAt.getTime() + 2 * 60 * 60 * 1000);
    const pickupCode = `PKG-${deliveryStatus}-${String(sequence).padStart(4, '0')}`;

    if (deliveryStatus === 'READY_TO_PICK') {
      return {
        pickup_code: pickupCode,
        deposited_at: depositedAt,
        pickup_at: pickupAt,
        retrieved_at: null,
        storage_price: null,
      };
    }

    const storageDaysPattern = [3, 7, 12];
    const storageDays = storageDaysPattern[(sequence - 1) % storageDaysPattern.length];
    const retrievedAt = new Date(depositedAt.getTime() + storageDays * 24 * 60 * 60 * 1000);

    return {
      pickup_code: pickupCode,
      deposited_at: depositedAt,
      pickup_at: pickupAt,
      retrieved_at: retrievedAt,
      storage_price: this.calculateStoragePrice(depositedAt, retrievedAt),
    };
  }

  calculateStoragePrice(depositedAt: Date, retrievedAt: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const rawDays = (retrievedAt.getTime() - depositedAt.getTime()) / millisecondsPerDay;
    const days = Math.max(1, Math.ceil(rawDays));

    const tier1 = Math.min(days, 5) * 1;
    const tier2 = Math.min(Math.max(days - 5, 0), 5) * 2;
    const tier3 = Math.max(days - 10, 0) * 3;

    return Number((tier1 + tier2 + tier3).toFixed(2));
  }

  async listByAgent(agentId: number): Promise<Package[]> {
    return this.packageRepository.listByAgent(agentId);
  }
}
