import { Locker } from '@/database/entities/Locker.ts';

export interface LockerServiceInterface {
  getAvailableLockers(): Promise<Locker[]>;
}
