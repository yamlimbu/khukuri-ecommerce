import {MigrationInterface, QueryRunner} from "typeorm";

export class ContentPlugin1783608530469 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        // Drop from 'product' only if they were ever created there (safe on fresh production DBs)
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "customFieldsMetadescription"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN IF EXISTS "customFieldsMetatitle"`, undefined);
        // Add translatable SEO fields to 'product_translation' (idempotent)
        await queryRunner.query(`ALTER TABLE "product_translation" ADD IF NOT EXISTS "customFieldsMetatitle" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product_translation" ADD IF NOT EXISTS "customFieldsMetadescription" text`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product_translation" DROP COLUMN IF EXISTS "customFieldsMetadescription"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_translation" DROP COLUMN IF EXISTS "customFieldsMetatitle"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD IF NOT EXISTS "customFieldsMetatitle" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD IF NOT EXISTS "customFieldsMetadescription" text`, undefined);
   }

}
