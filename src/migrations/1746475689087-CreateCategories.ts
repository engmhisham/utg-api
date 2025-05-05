import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCategories1746475689087 implements MigrationInterface {
    name = 'CreateCategories1746475689087'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "faqs" RENAME COLUMN "category" TO "categoryId"`);
        await queryRunner.query(`ALTER TYPE "public"."faqs_category_enum" RENAME TO "faqs_categoryid_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."categories_type_enum" AS ENUM('blog', 'faq')`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" "public"."categories_type_enum" NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD "categoryId" uuid`);
        await queryRunner.query(`ALTER TABLE "faqs" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "faqs" ADD "categoryId" uuid`);
        await queryRunner.query(`ALTER TABLE "blogs" ADD CONSTRAINT "FK_8c937e1b5e2c1269689bcf1138e" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "faqs" ADD CONSTRAINT "FK_fe8c81969cde9cf981451478b0e" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "faqs" DROP CONSTRAINT "FK_fe8c81969cde9cf981451478b0e"`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP CONSTRAINT "FK_8c937e1b5e2c1269689bcf1138e"`);
        await queryRunner.query(`ALTER TABLE "faqs" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "faqs" ADD "categoryId" "public"."faqs_categoryid_enum" NOT NULL DEFAULT 'general'`);
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "categoryId"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TYPE "public"."categories_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."faqs_categoryid_enum" RENAME TO "faqs_category_enum"`);
        await queryRunner.query(`ALTER TABLE "faqs" RENAME COLUMN "categoryId" TO "category"`);
    }

}
