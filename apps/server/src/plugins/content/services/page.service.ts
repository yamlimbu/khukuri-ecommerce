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
import { Page } from '../entities/page.entity';

@Injectable()
export class PageService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder,
        private assetService: AssetService,
    ) {}

    findAll(ctx: RequestContext, options?: ListQueryOptions<Page>): Promise<PaginatedList<Page>> {
        return this.listQueryBuilder
            .build(Page, options, { ctx })
            .getManyAndCount()
            .then(([items, totalItems]) => ({
                items,
                totalItems,
            }));
    }

    findOne(ctx: RequestContext, id: string): Promise<Page | null> {
        return this.connection.getRepository(ctx, Page).findOne({ where: { id } });
    }

    findBySlug(ctx: RequestContext, slug: string): Promise<Page | null> {
        return this.connection.getRepository(ctx, Page).findOne({ where: { slug, isPublished: true } });
    }

    async create(ctx: RequestContext, input: any): Promise<Page> {
        const page = new Page(input);
        if (input.featuredImageId) {
            page.featuredImage = await this.assetService.findOne(ctx, input.featuredImageId) as any;
        }
        return this.connection.getRepository(ctx, Page).save(page);
    }

    async update(ctx: RequestContext, input: any): Promise<Page> {
        const page = await this.connection.getEntityOrThrow(ctx, Page, input.id);
        const updatedPage = patchEntity(page, input);
        if (input.featuredImageId) {
            updatedPage.featuredImage = await this.assetService.findOne(ctx, input.featuredImageId) as any;
        }
        return this.connection.getRepository(ctx, Page).save(updatedPage);
    }

    async delete(ctx: RequestContext, id: string): Promise<any> {
        const page = await this.connection.getEntityOrThrow(ctx, Page, id);
        await this.connection.getRepository(ctx, Page).remove(page);
        return {
            result: 'DELETED',
        };
    }
}
