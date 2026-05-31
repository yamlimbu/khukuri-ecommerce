import { Injectable } from '@nestjs/common';
<<<<<<< HEAD
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestContext } from '@vendure/core';
import { Banner } from '../entities/banner.entity';

export interface CreateBannerInput {
    title: string;
    subtitle?: string;
    imageId?: string;
    primaryButtonLabel?: string;
    primaryButtonLink?: string;
    secondaryButtonLabel?: string;
    secondaryButtonLink?: string;
    order?: number;
}

export interface UpdateBannerInput {
    title?: string;
    subtitle?: string;
    imageId?: string;
    primaryButtonLabel?: string;
    primaryButtonLink?: string;
    secondaryButtonLabel?: string;
    secondaryButtonLink?: string;
    order?: number;
}

@Injectable()
export class BannerService {
    constructor(
        @InjectRepository(Banner) private bannerRepository: Repository<Banner>
    ) {}

    async findAll(ctx: RequestContext, options?: any): Promise<{ items: Banner[]; totalItems: number }> {
        const [items, totalItems] = await this.bannerRepository.findAndCount({
            relations: ['image'],
            skip: options?.skip || 0,
            take: options?.take || 10,
            order: { order: 'ASC' },
        });

        return { items, totalItems };
    }

    async findAllShop(ctx: RequestContext): Promise<Banner[]> {
        return this.bannerRepository.find({
            relations: ['image'],
            order: { order: 'ASC' },
        });
    }

    async findOne(ctx: RequestContext, id: string): Promise<Banner | null> {
        return this.bannerRepository.findOne({
            where: { id },
            relations: ['image'],
        });
    }

    async create(ctx: RequestContext, input: CreateBannerInput): Promise<Banner> {
        return this.bannerRepository.save({
            id: `banner_${Date.now()}`,
            title: input.title,
            subtitle: input.subtitle || null,
            imageId: input.imageId || null,
            primaryButtonLabel: input.primaryButtonLabel || null,
            primaryButtonLink: input.primaryButtonLink || null,
            secondaryButtonLabel: input.secondaryButtonLabel || null,
            secondaryButtonLink: input.secondaryButtonLink || null,
            order: input.order || 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Banner);
    }

    async update(ctx: RequestContext, id: string, input: UpdateBannerInput): Promise<Banner> {
        const banner = await this.bannerRepository.findOne({ where: { id } });
        if (!banner) {
            throw new Error(`Banner with id ${id} not found`);
        }

        if (input.title !== undefined) banner.title = input.title;
        if (input.subtitle !== undefined) banner.subtitle = input.subtitle;
        if (input.imageId !== undefined) banner.imageId = input.imageId;
        if (input.primaryButtonLabel !== undefined) banner.primaryButtonLabel = input.primaryButtonLabel;
        if (input.primaryButtonLink !== undefined) banner.primaryButtonLink = input.primaryButtonLink;
        if (input.secondaryButtonLabel !== undefined) banner.secondaryButtonLabel = input.secondaryButtonLabel;
        if (input.secondaryButtonLink !== undefined) banner.secondaryButtonLink = input.secondaryButtonLink;
        if (input.order !== undefined) banner.order = input.order;

        banner.updatedAt = new Date();
        return this.bannerRepository.save(banner);
    }

    async delete(ctx: RequestContext, id: string): Promise<boolean> {
        const result = await this.bannerRepository.delete(id);
        return result.affected ? result.affected > 0 : false;
=======
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
>>>>>>> 0c296a73ec657a345b2afc59e39fb95977eebabf
    }
}
