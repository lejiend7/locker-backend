import { Repository } from 'typeorm';
import { Locker } from '@/database/entities/Locker.js';
import { BaseRepository } from './BaseRepository.js';

export class LockerRepository extends BaseRepository<Locker> {
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
