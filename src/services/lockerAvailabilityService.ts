import { Locker } from '@/database/entities/Locker.ts';
import { LockerRepositoryInterface } from '@/database/repositories/interfaces/LockerRepositoryInterface.ts';
import { LockerAvailabilityServiceInterface } from '@/services/interfaces/LockerAvailabilityServiceInterface.ts';

export class LockerAvailabilityService implements LockerAvailabilityServiceInterface {
  constructor(private readonly lockerRepository: LockerRepositoryInterface) {}

  async getAvailableLockers(): Promise<Locker[]> {
    return this.lockerRepository.findAvailableLockers();
  }
}
