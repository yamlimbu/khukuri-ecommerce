import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateBannerAndPageTables1705555500000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Banner table
        await queryRunner.createTable(
            new Table({
                name: 'banner',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        isPrimary: true,
                        length: '255',
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'subtitle',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'imageId',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'primaryButtonLabel',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'primaryButtonLink',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'secondaryButtonLabel',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'secondaryButtonLink',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'order',
                        type: 'int',
                        default: 0,
                    },
                ],
            }),
            true
        );

        // Add foreign key for Banner.imageId -> Asset.id
        await queryRunner.createForeignKey(
            'banner',
            new TableForeignKey({
                columnNames: ['imageId'],
                referencedTableName: 'asset',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            })
        );

        // Create Page table
        await queryRunner.createTable(
            new Table({
                name: 'page',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        isPrimary: true,
                        length: '255',
                    },
                    {
                        name: 'createdAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'updatedAt',
                        type: 'datetime',
                        default: 'CURRENT_TIMESTAMP',
                        onUpdate: 'CURRENT_TIMESTAMP',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                    },
                    {
                        name: 'slug',
                        type: 'varchar',
                        length: '255',
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: 'content',
                        type: 'longtext',
                        isNullable: false,
                    },
                    {
                        name: 'featuredImageId',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                    {
                        name: 'isPublished',
                        type: 'boolean',
                        default: false,
                    },
                ],
            }),
            true
        );

        // Add foreign key for Page.featuredImageId -> Asset.id
        await queryRunner.createForeignKey(
            'page',
            new TableForeignKey({
                columnNames: ['featuredImageId'],
                referencedTableName: 'asset',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        const pageTable = await queryRunner.getTable('page');
        if (pageTable) {
            const pageForeignKey = pageTable.foreignKeys.find(
                (fk) => fk.columnNames.indexOf('featuredImageId') !== -1
            );
            if (pageForeignKey) {
                await queryRunner.dropForeignKey('page', pageForeignKey);
            }
            await queryRunner.dropTable('page');
        }

        const bannerTable = await queryRunner.getTable('banner');
        if (bannerTable) {
            const bannerForeignKey = bannerTable.foreignKeys.find(
                (fk) => fk.columnNames.indexOf('imageId') !== -1
            );
            if (bannerForeignKey) {
                await queryRunner.dropForeignKey('banner', bannerForeignKey);
            }
            await queryRunner.dropTable('banner');
        }
    }
}
