import { Injectable } from '@nestjs/common';
import {
    ListQueryBuilder,
    RequestContext,
    TransactionalConnection,
    AssetService,
    ListQueryOptions,
    PaginatedList,
    patchEntity
} from '@vendure/core';
import { Banner } from '../entities/banner.entity';

@Injectable()
export class BannerService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private assetService: AssetService,
    ) {}

    findAll(ctx: RequestContext, options?: ListQueryOptions<Banner>): Promise<PaginatedList<Banner>> {
        return this.listQueryBuilder
            .build(Banner, options, { ctx })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
                items,
                totalItems,
            }));
    }

    findAllShop(ctx: RequestContext): Promise<Banner[]> {
        return this.connection.getRepository(ctx, Banner).find({
            order: { order: 'ASC' }
        });
    }

    findOne(ctx: RequestContext, id: string): Promise<Banner | null> {
        return this.connection.getRepository(ctx, Banner).findOne({ where: { id } });
    }

    async create(ctx: RequestContext, input: any): Promise<Banner> {
        const banner = new Banner(input);
        if (input.imageId) {
            banner.image = await this.assetService.findOne(ctx, input.imageId) as any;
        }
        return this.connection.getRepository(ctx, Banner).save(banner);
    }

    async update(ctx: RequestContext, input: any): Promise<Banner> {
        const banner = await this.connection.getEntityOrThrow(ctx, Banner, input.id);
        const updatedBanner = patchEntity(banner, input);
        if (input.imageId) {
            updatedBanner.image = await this.assetService.findOne(ctx, input.imageId) as any;
        }
        return this.connection.getRepository(ctx, Banner).save(updatedBanner);
    }

    async delete(ctx: RequestContext, id: string): Promise<any> {
        const banner = await this.connection.getEntityOrThrow(ctx, Banner, id);
        await this.connection.getRepository(ctx, Banner).remove(banner);
        return {
            result: 'DELETED',
        };
    }
}
