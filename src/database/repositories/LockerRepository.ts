import { Repository } from 'typeorm';
import { Locker } from '@/database/entities/Locker.ts';
import { BaseRepository } from '@/database/repositories/BaseRepository.ts';
import { LockerRepositoryInterface } from '@/database/repositories/interfaces/LockerRepositoryInterface.js';

export class LockerRepository extends BaseRepository<Locker> implements LockerRepositoryInterface {
  constructor(repository: Repository<Locker>) {
    super(repository);
  }

  async findByStationId(station_id: number): Promise<Locker[]> {
    return this.find({ station_id } as any);
  }

  async findAvailableByStationAndSize(station_id: number, size: string): Promise<Locker[]> {
    return this.repository.find({
      where: { station_id, status: 'available' } as any,
      order: { size: 'ASC' } as any,
    });
  }

  async findAvailableByStationId(station_id: number): Promise<Locker[]> {
    return this.find({ station_id, status: 'available' } as any);
  }

  async findAvailableLockers(): Promise<Locker[]> {
    return this.repository.find({
      where: { status: 'available' } as any,
      order: { id: 'DESC' } as any,
    });
  }

  async updateStatus(id: number, status: 'available' | 'occupied'): Promise<Locker | null> {
    const locker = await this.findById(id);
    if (locker) {
      locker.version += 1;
      locker.status = status;
      return this.repository.save(locker);
    }
    return null;
  }
}
