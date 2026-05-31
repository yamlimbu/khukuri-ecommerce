import {MigrationInterface, QueryRunner} from "typeorm";

export class ContentPlugin1779858788646 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "banner" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "subtitle" character varying, "primaryButtonLabel" character varying, "primaryButtonLink" character varying, "secondaryButtonLabel" character varying, "secondaryButtonLink" character varying, "order" integer NOT NULL DEFAULT '0', "id" SERIAL NOT NULL, "imageId" integer, CONSTRAINT "PK_6d9e2570b3d85ba37b681cd4256" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "page" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" character varying NOT NULL, "slug" character varying NOT NULL, "content" text NOT NULL, "isPublished" boolean NOT NULL DEFAULT false, "id" SERIAL NOT NULL, "featuredImageId" integer, CONSTRAINT "PK_742f4117e065c5b6ad21b37ba1f" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "banner" ADD CONSTRAINT "FK_6a6cc2453a0675d3e2cad3070c0" FOREIGN KEY ("imageId") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "page" ADD CONSTRAINT "FK_00c82645ebea5665afb5407fe00" FOREIGN KEY ("featuredImageId") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "page" DROP CONSTRAINT "FK_00c82645ebea5665afb5407fe00"`, undefined);
        await queryRunner.query(`ALTER TABLE "banner" DROP CONSTRAINT "FK_6a6cc2453a0675d3e2cad3070c0"`, undefined);
        await queryRunner.query(`DROP TABLE "page"`, undefined);
        await queryRunner.query(`DROP TABLE "banner"`, undefined);
   }

}
