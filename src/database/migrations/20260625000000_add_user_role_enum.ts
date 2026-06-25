import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserRoleEnum20260625000000 implements MigrationInterface {
  name = 'AddUserRoleEnum20260625000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      ADD COLUMN \`role\` enum ('customer', 'delivery_agent', 'admin') NOT NULL DEFAULT 'customer'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`users\`
      DROP COLUMN \`role\`
    `);
  }
}
