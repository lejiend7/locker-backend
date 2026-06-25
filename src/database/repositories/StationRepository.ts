import { Repository } from 'typeorm';
import { Station } from '@/database/entities/Station.js';
import { BaseRepository } from './BaseRepository.js';

export class StationRepository extends BaseRepository<Station> {
  constructor(repository: Repository<Station>) {
    super(repository);
  }

  async findByCity(city: string): Promise<Station[]> {
    return this.find({ city } as any);
  }

  async findByType(type: string): Promise<Station[]> {
    return this.find({ type } as any);
  }
}
