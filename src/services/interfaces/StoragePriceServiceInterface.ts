export interface StoragePriceServiceInterface {
  calculateStoragePrice(storedAt: Date, referenceAt: Date): number;
}
