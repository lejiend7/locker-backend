import { type Request, type Response } from 'express';
import { AppDataSource } from '@/database/data-source.ts';
import { Package } from '@/database/entities/Package.ts';
import { PackageRepository } from '@/database/repositories/PackageRepository.ts';
import { User } from '@/database/entities/User.ts';
import { Locker } from '@/database/entities/Locker.ts';
import { UserRepository } from '@/database/repositories/UserRepository.ts';
import { LockerRepository } from '@/database/repositories/LockerRepository.ts';
import { PackageService } from '@/services/packageService.ts';
import { asyncHandler } from '@/utils/asyncHandler.ts';
import { buildApiResponse } from '@/utils/response.ts';

const packageService = new PackageService(
  new UserRepository(AppDataSource.getRepository(User)),
  new PackageRepository(AppDataSource.getRepository(Package))
);

// Keep locker repository available for future package-related operations without re-wiring controllers.
new LockerRepository(AppDataSource.getRepository(Locker));

export class PackageController {
  list = asyncHandler((req: Request, res: Response) => this.handleList(req, res));

  private async handleList(req: Request, res: Response) {
    if (!req.authUser || req.authUser.role !== 'delivery_agent') {
      return res.status(403).json(
        buildApiResponse({
          success: false,
          statusCode: 403,
          message: 'Delivery agent access required',
          data: [],
          errors: ['Delivery agent access required'],
        })
      );
    }

    const packages = await packageService.listByAgent(Number(req.authUser.sub));
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
      deposited_at: pkg.deposited_at,
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
}

export const packageController = new PackageController();
