import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCanonicalTagToPageSeo1746510564532 implements MigrationInterface {
    name = 'AddCanonicalTagToPageSeo1746510564532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "page_seo" ADD "canonicalTag" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "page_seo" DROP COLUMN "canonicalTag"`);
    }

}
