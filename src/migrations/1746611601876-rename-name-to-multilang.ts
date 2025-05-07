import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameNameToMultilang1746611601876 implements MigrationInterface {
    name = 'RenameNameToMultilang1746611601876'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "name_en" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "name_ar" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name_ar"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "name_en"`);
        await queryRunner.query(`ALTER TABLE "categories" ADD "name" character varying NOT NULL`);
    }

}
