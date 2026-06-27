import { type Request, type Response } from 'express';
import { PackageRepositoryInterface } from '@/database/repositories/interfaces/PackageRepositoryInterface.ts';
import { LockerRepositoryInterface } from '@/database/repositories/interfaces/LockerRepositoryInterface.ts';
import { PackageServiceInterface } from '@/services/interfaces/PackageServiceInterface.ts';
import { StoragePriceServiceInterface } from '@/services/interfaces/StoragePriceServiceInterface.ts';
import { AssignLockerDto } from '@/dtos/assignLockerDto.ts';
import { StorePackageDto } from '@/dtos/storePackageDto.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

function generatePickupCode(packageId: number): string {
  const token = `${packageId}${Date.now()}`.slice(-6);
  return `PK${token}`.toUpperCase();
}

export class PackageController {
  constructor(
    private readonly packageRepository: PackageRepositoryInterface,
    private readonly lockerRepository: LockerRepositoryInterface,
    private readonly packageService: PackageServiceInterface,
    private readonly storagePriceService: StoragePriceServiceInterface,
  ) {}

  list = asyncHandler((req: Request, res: Response) => this.handleList(req, res));
  assignLocker = asyncHandler((req: Request, res: Response) => this.handleAssignLocker(req, res));
  store = asyncHandler((req: Request, res: Response) => this.handleStore(req, res));

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
    const packageSummaries = packages.map((pkg) => ({
      id: pkg.id,
      package_code: pkg.package_code,
      locker_id: pkg.locker_id,
      customer_id: pkg.customer_id,
      agent_id: pkg.agent_id,
      customer_name: pkg.customer_name,
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
    }));

    return res.status(200).json(
      buildApiResponse({
        success: true,
        statusCode: 200,
        message: 'Packages fetched successfully',
        data: packageSummaries,
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
    const pickupCode = pkg.pickup_code ?? generatePickupCode(pkg.id);

    await this.packageRepository.update(pkg.id, {
      delivery_status: 'READY_TO_PICK',
      stored_at: storedAt,
      pickup_code: pickupCode,
      storage_price: storagePrice,
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
}
