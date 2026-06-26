import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MakePackageLockerNullable20260626010000 implements MigrationInterface {
  name = 'MakePackageLockerNullable20260626010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`packages\`
      ADD COLUMN \`package_code\` varchar(191) NULL AFTER \`id\`
    `);

    await queryRunner.query(`
      UPDATE \`packages\`
      SET \`package_code\` = CONCAT('PKG-', LPAD(\`id\`, 8, '0'))
      WHERE \`package_code\` IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      MODIFY COLUMN \`package_code\` varchar(191) NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      ADD UNIQUE INDEX \`IDX_packages_package_code\` (\`package_code\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      MODIFY COLUMN \`locker_id\` int NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`packages\`
      DROP INDEX \`IDX_packages_package_code\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      DROP COLUMN \`package_code\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      MODIFY COLUMN \`locker_id\` int NOT NULL
    `);
  }
}
