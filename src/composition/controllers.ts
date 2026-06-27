import { AppDataSource } from '@/database/data-source.ts';
import { User } from '@/database/entities/User.ts';
import { Station } from '@/database/entities/Station.ts';
import { Locker } from '@/database/entities/Locker.ts';
import { Package } from '@/database/entities/Package.ts';
import { UserRepository } from '@/database/repositories/UserRepository.ts';
import { StationRepository } from '@/database/repositories/StationRepository.ts';
import { LockerRepository } from '@/database/repositories/LockerRepository.ts';
import { PackageRepository } from '@/database/repositories/PackageRepository.ts';
import type { UserRepositoryInterface } from '@/database/repositories/interfaces/UserRepositoryInterface.ts';
import type { StationRepositoryInterface } from '@/database/repositories/interfaces/StationRepositoryInterface.ts';
import type { LockerRepositoryInterface } from '@/database/repositories/interfaces/LockerRepositoryInterface.ts';
import type { PackageRepositoryInterface } from '@/database/repositories/interfaces/PackageRepositoryInterface.ts';
import { AuthService } from '@/services/authService.ts';
import { HealthService } from '@/services/healthService.ts';
import { LandingPageService } from '@/services/landingPageService.ts';
import { PackageService } from '@/services/packageService.ts';
import { storagePriceService } from '@/services/storagePriceService.ts';
import type { AuthServiceInterface } from '@/services/interfaces/AuthServiceInterface.ts';
import type { HealthServiceInterface } from '@/services/interfaces/HealthServiceInterface.ts';
import type { LandingPageServiceInterface } from '@/services/interfaces/LandingPageServiceInterface.ts';
import type { PackageServiceInterface } from '@/services/interfaces/PackageServiceInterface.ts';
import { AuthController } from '@/controllers/authController.ts';
import { HealthController } from '@/controllers/healthController.ts';
import { LandingController } from '@/controllers/landingController.ts';
import { StationController } from '@/controllers/stationController.ts';
import { LockerController } from '@/controllers/lockerController.ts';
import { PackageController } from '@/controllers/packageController.ts';

const jwtSecret = process.env.JWT_SECRET || '';

const userRepository: UserRepositoryInterface = new UserRepository(AppDataSource.getRepository(User));
const stationRepository: StationRepositoryInterface = new StationRepository(AppDataSource.getRepository(Station));
const lockerRepository: LockerRepositoryInterface = new LockerRepository(AppDataSource.getRepository(Locker));
const packageRepository: PackageRepositoryInterface = new PackageRepository(AppDataSource.getRepository(Package));

const authService: AuthServiceInterface = new AuthService(userRepository, jwtSecret);
const healthService: HealthServiceInterface = new HealthService();
const landingPageService: LandingPageServiceInterface = new LandingPageService();
const packageService: PackageServiceInterface = new PackageService(
  userRepository,
  packageRepository,
  storagePriceService,
);

export const authController = new AuthController(authService);
export const healthController = new HealthController(healthService);
export const landingController = new LandingController(landingPageService);
export const stationController = new StationController(stationRepository);
export const lockerController = new LockerController(lockerRepository);
export const packageController = new PackageController(
  packageRepository,
  lockerRepository,
  packageService,
  storagePriceService,
);
