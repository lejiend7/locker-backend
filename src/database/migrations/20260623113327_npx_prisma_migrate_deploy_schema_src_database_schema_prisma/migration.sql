/*
  Warnings:

  - You are about to alter the column `title` on the `messages` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `customer_name` on the `packages` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `name` on the `stations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `address` on the `stations` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `messages` MODIFY `title` VARCHAR(191) NOT NULL,
    MODIFY `body` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `packages` MODIFY `customer_name` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `stations` MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `address` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `name` VARCHAR(191) NOT NULL;

-- RenameIndex
ALTER TABLE `lockers` RENAME INDEX `idx_lockers_station_id` TO `lockers_station_id_idx`;

-- RenameIndex
ALTER TABLE `lockers` RENAME INDEX `idx_lockers_status` TO `lockers_status_idx`;

-- RenameIndex
ALTER TABLE `messages` RENAME INDEX `idx_messages_package_id` TO `messages_package_id_idx`;

-- RenameIndex
ALTER TABLE `messages` RENAME INDEX `idx_messages_user_id` TO `messages_user_id_idx`;

-- RenameIndex
ALTER TABLE `packages` RENAME INDEX `idx_packages_delivery_status` TO `packages_delivery_status_idx`;

-- RenameIndex
ALTER TABLE `packages` RENAME INDEX `idx_packages_locker_id` TO `packages_locker_id_idx`;

-- RenameIndex
ALTER TABLE `packages` RENAME INDEX `idx_packages_user_id` TO `packages_user_id_idx`;

-- RenameIndex
ALTER TABLE `stations` RENAME INDEX `idx_stations_city` TO `stations_city_idx`;

-- RenameIndex
ALTER TABLE `stations` RENAME INDEX `idx_stations_type` TO `stations_type_idx`;
