import { Repository } from 'typeorm';
import { Package } from '@/database/entities/Package.ts';
import { BaseRepository } from '@/database/repositories/BaseRepository.ts';

export class PackageRepository extends BaseRepository<Package> {
  constructor(repository: Repository<Package>) {
    super(repository);
  }

  async findByUserId(user_id: number): Promise<Package[]> {
    return this.find({ user_id } as any);
  }

  async findByLockerId(locker_id: number): Promise<Package | null> {
    return this.findOne({ locker_id } as any);
  }

  async findByPickupCode(pickup_code: string): Promise<Package | null> {
    return this.findOne({ pickup_code } as any);
  }

  async findByPickupCodeAndLockerId(pickup_code: string, locker_id: number): Promise<Package | null> {
    return this.repository.findOne({
      where: { pickup_code, locker_id } as any,
      relations: ['locker', 'user'],
    });
  }

  async findReadyToPickByLockerId(locker_id: number): Promise<Package | null> {
    return this.repository.findOne({
      where: { locker_id, delivery_status: 'READY_TO_PICK' } as any,
    });
  }
}
