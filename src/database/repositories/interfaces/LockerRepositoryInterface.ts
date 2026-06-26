import { Locker } from '@/database/entities/Locker.ts';

export interface LockerRepositoryInterface {
  findAvailableLockers(): Promise<Locker[]>;
}
