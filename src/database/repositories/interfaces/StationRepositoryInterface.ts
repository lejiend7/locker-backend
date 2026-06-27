import { Station } from '@/database/entities/Station.ts';

export interface StationRepositoryInterface {
  findAll(): Promise<Station[]>;
  findByCity(city: string): Promise<Station[]>;
  findByType(type: string): Promise<Station[]>;
}
