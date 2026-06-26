import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPackageAgentId20260626000000 implements MigrationInterface {
  name = 'AddPackageAgentId20260626000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`packages\`
      DROP FOREIGN KEY \`FK_packages_user_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      DROP INDEX \`idx_packages_user_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      CHANGE COLUMN \`user_id\` \`customer_id\` int NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      ADD INDEX \`idx_packages_customer_id\` (\`customer_id\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      ADD CONSTRAINT \`FK_packages_customer_id\` FOREIGN KEY (\`customer_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      ADD COLUMN \`agent_id\` int NULL AFTER \`customer_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      ADD INDEX \`idx_packages_agent_id\` (\`agent_id\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      ADD CONSTRAINT \`FK_packages_agent_id\` FOREIGN KEY (\`agent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`packages\`
      DROP FOREIGN KEY \`FK_packages_agent_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      DROP INDEX \`idx_packages_agent_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      DROP COLUMN \`agent_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      DROP FOREIGN KEY \`FK_packages_customer_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      DROP INDEX \`idx_packages_customer_id\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      CHANGE COLUMN \`customer_id\` \`user_id\` int NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      ADD INDEX \`idx_packages_user_id\` (\`user_id\`)
    `);

    await queryRunner.query(`
      ALTER TABLE \`packages\`
      ADD CONSTRAINT \`FK_packages_user_id\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE CASCADE ON DELETE RESTRICT
    `);
  }
}
