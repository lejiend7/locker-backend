import { StoragePriceServiceInterface } from '@/services/interfaces/StoragePriceServiceInterface.ts';

export class StoragePriceService implements StoragePriceServiceInterface {
  calculateStoragePrice(storedAt: Date, referenceAt: Date): number {
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const rawDays = (referenceAt.getTime() - storedAt.getTime()) / millisecondsPerDay;
    const days = Math.max(1, Math.ceil(rawDays));

    const tier1 = Math.min(days, 5) * 1;
    const tier2 = Math.min(Math.max(days - 5, 0), 5) * 2;
    const tier3 = Math.max(days - 10, 0) * 3;

    return Number((tier1 + tier2 + tier3).toFixed(2));
  }
}

export const storagePriceService: StoragePriceServiceInterface = new StoragePriceService();
