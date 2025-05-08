import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLocations1746689426557 implements MigrationInterface {
    name = 'CreateLocations1746689426557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."locations_status_enum" AS ENUM('published', 'draft', 'archived')`);
        await queryRunner.query(`CREATE TABLE "locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "status" "public"."locations_status_enum" NOT NULL DEFAULT 'draft', "displayOrder" integer NOT NULL DEFAULT '0', "title_en" character varying NOT NULL, "title_ar" character varying NOT NULL, "description_en" text, "description_ar" text, "cover" character varying, "city_en" character varying, "city_ar" character varying, "phone_en" character varying, "phone_ar" character varying, "map_url" character varying, "working_hours_en" text, "working_hours_ar" text, "content_en" text, "content_ar" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3540a4df2635b9aab5c8538088c" UNIQUE ("slug"), CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "locations"`);
        await queryRunner.query(`DROP TYPE "public"."locations_status_enum"`);
    }

}
