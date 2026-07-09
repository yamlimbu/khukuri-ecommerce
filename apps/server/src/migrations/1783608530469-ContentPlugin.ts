import {MigrationInterface, QueryRunner} from "typeorm";

export class ContentPlugin1783608530469 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsMetadescription"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsMetatitle"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_translation" ADD "customFieldsMetatitle" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product_translation" ADD "customFieldsMetadescription" text`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "product_translation" DROP COLUMN "customFieldsMetadescription"`, undefined);
        await queryRunner.query(`ALTER TABLE "product_translation" DROP COLUMN "customFieldsMetatitle"`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsMetatitle" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsMetadescription" text`, undefined);
   }

}
