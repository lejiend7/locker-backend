import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSmartLockerErd1687516800000 implements MigrationInterface {
  name = 'InitSmartLockerErd1687516800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`stations\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`type\` enum ('mall', 'office', 'residential') NOT NULL,
        \`city\` varchar(191) NOT NULL,
        \`address\` varchar(255) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    await queryRunner.query(
      `CREATE TABLE \`lockers\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`station_id\` int NOT NULL,
        \`size\` enum ('small', 'medium', 'large') NOT NULL,
        \`status\` enum ('available', 'occupied') NOT NULL DEFAULT 'available',
        \`label\` varchar(191) NOT NULL,
        \`version\` int NOT NULL DEFAULT 1,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`idx_lockers_station_id\` (\`station_id\`),
        INDEX \`idx_lockers_status\` (\`status\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_lockers_station_id\` FOREIGN KEY (\`station_id\`) REFERENCES \`stations\`(\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    await queryRunner.query(
      `CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(191) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_users_email\` (\`email\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    await queryRunner.query(
      `CREATE TABLE \`packages\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`locker_id\` int NOT NULL,
        \`user_id\` int NOT NULL,
        \`package_size\` enum ('small', 'medium', 'large') NOT NULL,
        \`delivery_status\` enum ('ASSIGNED_TO_AGENT', 'READY_TO_PICK', 'PICKED') NOT NULL,
        \`pickup_code\` varchar(191) NULL,
        \`customer_name\` varchar(255) NOT NULL,
        \`assigned_at\` datetime(3) NOT NULL,
        \`deposited_at\` datetime(3) NULL,
        \`pickup_at\` datetime(3) NULL,
        \`retrieved_at\` datetime(3) NULL,
        \`storage_price\` decimal(6, 2) NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX \`IDX_packages_pickup_code\` (\`pickup_code\`),
        INDEX \`idx_packages_locker_id\` (\`locker_id\`),
        INDEX \`idx_packages_user_id\` (\`user_id\`),
        INDEX \`idx_packages_delivery_status\` (\`delivery_status\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_packages_locker_id\` FOREIGN KEY (\`locker_id\`) REFERENCES \`lockers\`(\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT,
        CONSTRAINT \`FK_packages_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );

    await queryRunner.query(
      `CREATE TABLE \`messages\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`user_id\` int NOT NULL,
        \`package_id\` int NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`body\` text NOT NULL,
        \`locker_label\` varchar(191) NOT NULL,
        \`pickup_code\` varchar(191) NOT NULL,
        \`is_read\` boolean NOT NULL DEFAULT 0,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`idx_messages_user_id\` (\`user_id\`),
        INDEX \`idx_messages_package_id\` (\`package_id\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_messages_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT,
        CONSTRAINT \`FK_messages_package_id\` FOREIGN KEY (\`package_id\`) REFERENCES \`packages\`(\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`messages\``);
    await queryRunner.query(`DROP TABLE \`packages\``);
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`lockers\``);
    await queryRunner.query(`DROP TABLE \`stations\``);
  }
}
