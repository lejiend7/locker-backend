import { Locker } from '@/database/entities/Locker.ts';

export interface LockerRepositoryInterface {
  findAll(): Promise<Locker[]>;
  findById(id: number): Promise<Locker | null>;
  findByLabel(label: string): Promise<Locker | null>;
  create(data: Partial<Locker>): Promise<Locker>;
  findByStationId(station_id: number): Promise<Locker[]>;
  findAvailableLockers(): Promise<Locker[]>;
  updateStatus(id: number, status: 'available' | 'occupied'): Promise<Locker | null>;
}
