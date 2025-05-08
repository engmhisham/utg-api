import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSubscriptions1746712351588 implements MigrationInterface {
    name = 'CreateSubscriptions1746712351588'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "subscribed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f0558bf43d14f66844255e8b7c2" UNIQUE ("email"), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "locations"`);
    }

}
