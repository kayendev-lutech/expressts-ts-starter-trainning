import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoleTable1753342122216 implements MigrationInterface {
  name = 'CreateRoleTable1753342122216';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" text,
                CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "roles"`);
  }
}
