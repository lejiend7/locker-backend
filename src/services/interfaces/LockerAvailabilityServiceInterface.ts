import { Locker } from '@/database/entities/Locker.ts';

export interface LockerAvailabilityServiceInterface {
  getAvailableLockers(): Promise<Locker[]>;
}
