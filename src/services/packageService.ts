import { User } from '@/database/entities/User.ts';
import { UserRepositoryInterface } from '@/database/repositories/interfaces/UserRepositoryInterface.ts';
import { PackageRepositoryInterface } from '@/database/repositories/interfaces/PackageRepositoryInterface.ts';
import { PackageCustomerSelectionServiceInterface } from '@/services/interfaces/PackageCustomerSelectionServiceInterface.ts';

export class PackageService implements PackageCustomerSelectionServiceInterface {
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
}
