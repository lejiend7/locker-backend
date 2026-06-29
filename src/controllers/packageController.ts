import { type Request, type Response } from 'express';
import type { Package as PackageEntity } from '@/database/entities/Package.ts';
import { PackageRepositoryInterface } from '@/database/repositories/interfaces/PackageRepositoryInterface.ts';
import { LockerRepositoryInterface } from '@/database/repositories/interfaces/LockerRepositoryInterface.ts';
import { NotificationRepositoryInterface } from '@/database/repositories/interfaces/NotificationRepositoryInterface.ts';
import { PackageServiceInterface } from '@/services/interfaces/PackageServiceInterface.ts';
import { StoragePriceServiceInterface } from '@/services/interfaces/StoragePriceServiceInterface.ts';
import { AssignLockerDto } from '@/dtos/assignLockerDto.ts';
import { StorePackageDto } from '@/dtos/storePackageDto.ts';
import { UnlockLockerDto } from '@/dtos/unlockLockerDto.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

function generateRandomNineDigitCode(): string {
  return Math.floor(100000000 + Math.random() * 900000000).toString();
}

type PackageSummary = {
  id: number;
  package_code: string;
  locker_id: number | null;
  customer_id: number;
  agent_id: number | null;
  customer_name: string;
  package_size: PackageEntity['package_size'];
  pickup_code: string | null;
  delivery_status: PackageEntity['delivery_status'];
  assigned_at: Date;
  stored_at: Date | null;
  pickup_at: Date | null;
  retrieved_at: Date | null;
  storage_price: number | null;
  created_at: Date;
  locker_label: string | null;
  station_name: string | null;
  station_address: string | null;
  locker: unknown;
  customer: unknown;
  agent: unknown;
};

type BillTierBreakdown = {
  tier: 1 | 2 | 3;
  label: string;
  from_day: number;
  to_day: number | null;
  charged_days: number;
  rate_per_day: number;
  amount: number;
};

type CustomerBillSummary = {
  package_id: number;
  package_code: string;
  locker_id: number | null;
  locker_label: string | null;
  station_name: string | null;
  station_address: string | null;
  pickup_at: Date;
  retrieved_at: Date;
  billable_days: number;
  calculated_storage_price: number;
  recorded_storage_price: number | null;
  tier_breakdown: BillTierBreakdown[];
};

export class PackageController {
  constructor(
    private readonly packageRepository: PackageRepositoryInterface,
    private readonly lockerRepository: LockerRepositoryInterface,
    private readonly notificationRepository: NotificationRepositoryInterface,
    private readonly packageService: PackageServiceInterface,
    private readonly storagePriceService: StoragePriceServiceInterface,
  ) {}

  private async generateUniquePickupCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = generateRandomNineDigitCode();
      const existing = await this.packageRepository.findByPickupCode(candidate);

      if (!existing) {
        return candidate;
      }
    }

    return `${Date.now()}`.slice(-9);
  }

  list = asyncHandler((req: Request, res: Response) => this.handleList(req, res));
  customerList = asyncHandler((req: Request, res: Response) => this.handleCustomerList(req, res));
  customerBills = asyncHandler((req: Request, res: Response) => this.handleCustomerBills(req, res));
  assignLocker = asyncHandler((req: Request, res: Response) => this.handleAssignLocker(req, res));
  store = asyncHandler((req: Request, res: Response) => this.handleStore(req, res));
  unlock = asyncHandler((req: Request, res: Response) => this.handleUnlock(req, res));

  private buildTierBreakdown(days: number): BillTierBreakdown[] {
    const tier1Days = Math.min(days, 5);
    const tier2Days = Math.min(Math.max(days - 5, 0), 5);
    const tier3Days = Math.max(days - 10, 0);

    return [
      {
        tier: 1,
        label: 'Day 1-5',
        from_day: 1,
        to_day: 5,
        charged_days: tier1Days,
        rate_per_day: 1,
        amount: Number((tier1Days * 1).toFixed(2)),
      },
      {
        tier: 2,
        label: 'Day 6-10',
        from_day: 6,
        to_day: 10,
        charged_days: tier2Days,
        rate_per_day: 2,
        amount: Number((tier2Days * 2).toFixed(2)),
      },
      {
        tier: 3,
        label: 'Day 11+',
        from_day: 11,
        to_day: null,
        charged_days: tier3Days,
        rate_per_day: 3,
        amount: Number((tier3Days * 3).toFixed(2)),
      },
    ];
  }

  private summarizeCustomerBill(pkg: PackageEntity): CustomerBillSummary | null {
    if (!pkg.pickup_at || !pkg.retrieved_at) {
      return null;
    }

    const calculatedStoragePrice = this.storagePriceService.calculateStoragePrice(
      pkg.pickup_at,
      pkg.retrieved_at,
    );

    const billableDays = Math.max(
      1,
      Math.ceil((pkg.retrieved_at.getTime() - pkg.pickup_at.getTime()) / (24 * 60 * 60 * 1000)),
    );

    return {
      package_id: pkg.id,
      package_code: pkg.package_code,
      locker_id: pkg.locker_id,
      locker_label: pkg.locker?.label ?? null,
      station_name: pkg.locker?.station?.name ?? null,
      station_address: pkg.locker?.station
        ? `${pkg.locker.station.address}, ${pkg.locker.station.city}`
        : null,
      pickup_at: pkg.pickup_at,
      retrieved_at: pkg.retrieved_at,
      billable_days: billableDays,
      calculated_storage_price: calculatedStoragePrice,
      recorded_storage_price: pkg.storage_price === null ? null : Number(pkg.storage_price),
      tier_breakdown: this.buildTierBreakdown(billableDays),
    };
  }

  private summarizePackage(pkg: PackageEntity): PackageSummary {
    return {
      id: pkg.id,
      package_code: pkg.package_code,
      locker_id: pkg.locker_id,
      customer_id: pkg.customer_id,
      agent_id: pkg.agent_id,
      customer_name: pkg.customer?.name ?? pkg.customer_name,
      package_size: pkg.package_size,
      pickup_code: pkg.pickup_code,
      delivery_status: pkg.delivery_status,
      assigned_at: pkg.assigned_at,
      stored_at: pkg.stored_at,
      pickup_at: pkg.pickup_at,
      retrieved_at: pkg.retrieved_at,
      storage_price: pkg.storage_price,
      created_at: pkg.created_at,
      locker_label: pkg.locker?.label ?? null,
      station_name: pkg.locker?.station?.name ?? null,
      station_address: pkg.locker?.station
        ? `${pkg.locker.station.address}, ${pkg.locker.station.city}`
        : null,
      locker: pkg.locker
        ? {
            id: pkg.locker.id,
            station_id: pkg.locker.station_id,
            size: pkg.locker.size,
            status: pkg.locker.status,
            label: pkg.locker.label,
            created_at: pkg.locker.created_at,
            station: pkg.locker.station
              ? {
                  id: pkg.locker.station.id,
                  name: pkg.locker.station.name,
                  type: pkg.locker.station.type,
                  city: pkg.locker.station.city,
                  address: pkg.locker.station.address,
                  created_at: pkg.locker.station.created_at,
                }
              : null,
          }
        : null,
      customer: {
        id: pkg.customer.id,
        name: pkg.customer.name,
        email: pkg.customer.email,
        role: pkg.customer.role,
        created_at: pkg.customer.created_at,
      },
      agent: pkg.agent
        ? {
            id: pkg.agent.id,
            name: pkg.agent.name,
            email: pkg.agent.email,
            role: pkg.agent.role,
            created_at: pkg.agent.created_at,
          }
        : null,
    };
  }

  private async handleList(req: Request, res: Response) {
    if (!req.authUser) {
      return res.status(401).json(
        buildApiResponse({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: [],
          errors: ['Unauthorized'],
        })
      );
    }

    const packages = await this.packageService.listByAgent(Number(req.authUser.sub));
    const packageSummaries = packages.map((pkg) => this.summarizePackage(pkg));

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Packages fetched successfully',
        data: packageSummaries,
      })
    );
  }

  private async handleCustomerList(req: Request, res: Response) {
    if (!req.authUser) {
      return res.status(401).json(
        buildApiResponse({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: [],
          errors: ['Unauthorized'],
        })
      );
    }

    const packages = await this.packageRepository.findByCustomerId(Number(req.authUser.sub));
    const packageSummaries = packages.map((pkg) => this.summarizePackage(pkg));

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Packages fetched successfully',
        data: packageSummaries,
      })
    );
  }

  private async handleCustomerBills(req: Request, res: Response) {
    if (!req.authUser) {
      return res.status(401).json(
        buildApiResponse({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: [],
          errors: ['Unauthorized'],
        })
      );
    }

    const packages = await this.packageRepository.findByCustomerId(Number(req.authUser.sub));
    const billItems = packages
      .map((pkg) => this.summarizeCustomerBill(pkg))
      .filter((bill): bill is CustomerBillSummary => Boolean(bill))
      .filter((bill) => (bill.recorded_storage_price ?? 0) > 0 || bill.calculated_storage_price > 0)
      .sort((a, b) => b.retrieved_at.getTime() - a.retrieved_at.getTime());

    const totalRecorded = Number(
      billItems
        .reduce((sum, bill) => sum + Number(bill.recorded_storage_price ?? 0), 0)
        .toFixed(2),
    );

    const totalCalculated = Number(
      billItems.reduce((sum, bill) => sum + bill.calculated_storage_price, 0).toFixed(2),
    );

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Customer bills fetched successfully',
        data: {
          summary: {
            total_items: billItems.length,
            total_recorded_storage_price: totalRecorded,
            total_calculated_storage_price: totalCalculated,
            calculation_window: {
              start_field: 'pickup_at',
              end_field: 'retrieved_at',
            },
            pricing_tiers: [
              {
                tier: 1,
                label: 'Day 1-5',
                from_day: 1,
                to_day: 5,
                rate_per_day: 1,
              },
              {
                tier: 2,
                label: 'Day 6-10',
                from_day: 6,
                to_day: 10,
                rate_per_day: 2,
              },
              {
                tier: 3,
                label: 'Day 11+',
                from_day: 11,
                to_day: null,
                rate_per_day: 3,
              },
            ],
          },
          items: billItems,
        },
      })
    );
  }

  private async handleAssignLocker(req: Request, res: Response) {
    const validation = AssignLockerDto.validate(req.body ?? {});

    if (!validation.isValid) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: validation.message,
          data: [],
          errors: validation.errors,
        })
      );
    }

    if (!req.authUser) {
      return res.status(401).json(
        buildApiResponse({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: [],
          errors: ['Unauthorized'],
        })
      );
    }

    const packageId = Number(validation.value.packageId);
    const stationId = validation.value.stationId ? Number(validation.value.stationId) : null;
    const requestedLockerId = validation.value.lockerId ? Number(validation.value.lockerId) : null;

    const pkg = await this.packageRepository.findById(packageId);

    if (!pkg) {
      return res.status(404).json(
        buildApiResponse({
          success: false,
          statusCode: 404,
          message: 'Package not found',
          data: [],
          errors: ['Package not found'],
        })
      );
    }

    if (pkg.delivery_status !== 'ASSIGNED_TO_AGENT') {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: 'Only ASSIGNED_TO_AGENT packages can reserve lockers',
          data: [],
          errors: ['Only ASSIGNED_TO_AGENT packages can reserve lockers'],
        })
      );
    }

    if (pkg.locker_id) {
      return res.status(409).json(
        buildApiResponse({
          success: false,
          statusCode: 409,
          message: 'Locker already assigned to this package',
          data: [],
          errors: ['Locker already assigned to this package'],
        })
      );
    }

    const sizeRank: Record<'small' | 'medium' | 'large', number> = {
      small: 1,
      medium: 2,
      large: 3,
    };

    const isCompatible = (lockerSize: 'small' | 'medium' | 'large') =>
      sizeRank[lockerSize] >= sizeRank[pkg.package_size];

    let selectedLocker = null as Awaited<ReturnType<typeof this.lockerRepository.findById>>;

    if (requestedLockerId) {
      const locker = await this.lockerRepository.findById(requestedLockerId);

      if (!locker || locker.status !== 'available') {
        return res.status(400).json(
          buildApiResponse({
            success: false,
            statusCode: 400,
            message: 'Selected locker is not available',
            data: [],
            errors: ['Selected locker is not available'],
          })
        );
      }

      if (stationId && locker.station_id !== stationId) {
        return res.status(400).json(
          buildApiResponse({
            success: false,
            statusCode: 400,
            message: 'Selected locker does not belong to the requested station',
            data: [],
            errors: ['Selected locker does not belong to the requested station'],
          })
        );
      }

      if (!isCompatible(locker.size)) {
        return res.status(400).json(
          buildApiResponse({
            success: false,
            statusCode: 400,
            message: 'Selected locker size is not compatible with package size',
            data: [],
            errors: ['Selected locker size is not compatible with package size'],
          })
        );
      }

      selectedLocker = locker;
    } else {
      const baseLockers = stationId
        ? await this.lockerRepository.findByStationId(stationId)
        : await this.lockerRepository.findAvailableLockers();

      const compatibleAvailable = baseLockers
        .filter((locker) => locker.status === 'available' && isCompatible(locker.size))
        .sort((a, b) => {
          const bySize = sizeRank[a.size] - sizeRank[b.size];
          if (bySize !== 0) {
            return bySize;
          }

          return a.id - b.id;
        });

      selectedLocker = compatibleAvailable[0] ?? null;
    }

    if (!selectedLocker) {
      return res.status(404).json(
        buildApiResponse({
          success: false,
          statusCode: 404,
          message: 'No compatible locker available',
          data: [],
          errors: ['No compatible locker available'],
        })
      );
    }

    await this.lockerRepository.updateStatus(selectedLocker.id, 'occupied');
    await this.packageRepository.update(pkg.id, {
      locker_id: selectedLocker.id,
      agent_id: Number(req.authUser.sub),
    } as any);

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Locker reserved successfully',
        data: {
          package_id: String(pkg.id),
          locker_id: String(selectedLocker.id),
          locker_label: selectedLocker.label,
          delivery_status: pkg.delivery_status,
        },
      })
    );
  }

  private async handleStore(req: Request, res: Response) {
    const validation = StorePackageDto.validate(req.body ?? {});

    if (!validation.isValid) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: validation.message,
          data: [],
          errors: validation.errors,
        })
      );
    }

    if (!req.authUser) {
      return res.status(401).json(
        buildApiResponse({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: [],
          errors: ['Unauthorized'],
        })
      );
    }

    const packageId = Number(validation.value.packageId);
    const pkg = await this.packageRepository.findById(packageId);

    if (!pkg) {
      return res.status(404).json(
        buildApiResponse({
          success: false,
          statusCode: 404,
          message: 'Package not found',
          data: [],
          errors: ['Package not found'],
        })
      );
    }

    if (pkg.agent_id !== Number(req.authUser.sub)) {
      return res.status(403).json(
        buildApiResponse({
          success: false,
          statusCode: 403,
          message: 'You can only store your own assigned package',
          data: [],
          errors: ['You can only store your own assigned package'],
        })
      );
    }

    if (pkg.delivery_status !== 'ASSIGNED_TO_AGENT') {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: 'Only ASSIGNED_TO_AGENT packages can be stored',
          data: [],
          errors: ['Only ASSIGNED_TO_AGENT packages can be stored'],
        })
      );
    }

    if (!pkg.locker_id) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: 'Package has no assigned locker',
          data: [],
          errors: ['Package has no assigned locker'],
        })
      );
    }

    const locker = await this.lockerRepository.findById(pkg.locker_id);

    const storedAt = validation.value.storedAt ? new Date(validation.value.storedAt) : new Date();
    const now = new Date();
    const storagePrice = this.storagePriceService.calculateStoragePrice(storedAt, now);
    const pickupCode = pkg.pickup_code ?? await this.generateUniquePickupCode();

    await this.packageRepository.update(pkg.id, {
      delivery_status: 'READY_TO_PICK',
      stored_at: storedAt,
      pickup_at: pkg.pickup_at ?? storedAt,
      pickup_code: pickupCode,
      storage_price: storagePrice,
    } as any);

    await this.notificationRepository.create({
      user_id: pkg.customer_id,
      package_id: pkg.id,
      title: 'Package ready for pickup',
      body: `Your package is ready. Locker ${locker?.label ?? pkg.locker_id} with pickup code ${pickupCode}.`,
      locker_label: locker?.label ?? String(pkg.locker_id),
      pickup_code: pickupCode,
      is_read: false,
    } as any);

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Package stored successfully',
        data: {
          package_id: String(pkg.id),
          locker_id: String(pkg.locker_id),
          locker_label: locker?.label ?? null,
          pickup_code: pickupCode,
          delivery_status: 'READY_TO_PICK',
          stored_at: storedAt.toISOString(),
          storage_price: storagePrice,
        },
      })
    );
  }

  private async handleUnlock(req: Request, res: Response) {
    if (!req.authUser) {
      return res.status(401).json(
        buildApiResponse({
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          data: [],
          errors: ['Unauthorized'],
        })
      );
    }

    const validation = UnlockLockerDto.validate(req.body ?? {});

    if (!validation.isValid) {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: validation.message,
          data: [],
          errors: validation.errors,
        })
      );
    }

    const lockerLabel = validation.value.lockerId;
    const pickupCode = validation.value.pickupCode.toUpperCase();

    const locker = await this.lockerRepository.findByLabel(lockerLabel);

    if (!locker) {
      return res.status(404).json(
        buildApiResponse({
          success: false,
          statusCode: 404,
          message: 'Locker not found',
          data: [],
          errors: ['Locker not found'],
        })
      );
    }

    const pkg = await this.packageRepository.findByPickupCodeAndLockerId(pickupCode, locker.id);

    if (!pkg || pkg.delivery_status !== 'READY_TO_PICK') {
      return res.status(400).json(
        buildApiResponse({
          success: false,
          statusCode: 400,
          message: 'Invalid pickup code. Please check the code and try again.',
          data: [],
          errors: ['Invalid pickup code. Please check the code and try again.'],
        })
      );
    }

    if (pkg.customer_id !== Number(req.authUser.sub)) {
      return res.status(403).json(
        buildApiResponse({
          success: false,
          statusCode: 403,
          message: 'You can only unlock your own package',
          data: [],
          errors: ['You can only unlock your own package'],
        })
      );
    }

    const billingStartAt = pkg.pickup_at ?? pkg.stored_at ?? pkg.assigned_at;
    const retrievedAt = new Date();
    const storagePrice = this.storagePriceService.calculateStoragePrice(billingStartAt, retrievedAt);

    await this.packageRepository.update(pkg.id, {
      delivery_status: 'PICKED',
      pickup_at: billingStartAt,
      retrieved_at: retrievedAt,
      storage_price: storagePrice,
    } as any);

    await this.lockerRepository.updateStatus(locker.id, 'available');

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: `Package retrieved. Locker ${locker.label} is now available.`,
        data: {
          locker_id: String(locker.id),
          locker_label: locker.label,
          package_id: String(pkg.id),
          package_size: pkg.package_size,
          customer_name: pkg.customer_name,
          days_stored: Math.max(1, Math.ceil((retrievedAt.getTime() - billingStartAt.getTime()) / (24 * 60 * 60 * 1000))),
          storage_price: storagePrice,
          storage_charge: storagePrice,
          charge_unit: 'RM',
        },
      })
    );
  }
}
