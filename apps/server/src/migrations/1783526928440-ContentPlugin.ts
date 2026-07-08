import {MigrationInterface, QueryRunner} from "typeorm";

export class ContentPlugin1783526928440 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "site_setting" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "siteName" character varying NOT NULL DEFAULT 'Himalayan Khukuri House', "metaTitle" character varying, "metaDescription" text, "metaKeywords" character varying, "facebookUrl" character varying, "instagramUrl" character varying, "tiktokUrl" character varying, "whatsappUrl" character varying, "id" SERIAL NOT NULL, "logoId" integer, "faviconId" integer, CONSTRAINT "PK_543f4809a6cf8b4f253a24f55d8" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "site_setting" ADD CONSTRAINT "FK_6c9f40250c679b3ffddec6ce50d" FOREIGN KEY ("logoId") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "site_setting" ADD CONSTRAINT "FK_52734d5c4daa61ae0880f82855c" FOREIGN KEY ("faviconId") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "site_setting" DROP CONSTRAINT "FK_52734d5c4daa61ae0880f82855c"`, undefined);
        await queryRunner.query(`ALTER TABLE "site_setting" DROP CONSTRAINT "FK_6c9f40250c679b3ffddec6ce50d"`, undefined);
        await queryRunner.query(`DROP TABLE "site_setting"`, undefined);
   }

}
