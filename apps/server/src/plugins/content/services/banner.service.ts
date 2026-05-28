import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestContext } from '@vendure/core';
import { Banner } from '../entities/banner.entity';

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
        const banner = new Banner();
        banner.id = `${Date.now()}`;
        banner.title = input.title;
        banner.subtitle = input.subtitle;
        banner.imageId = input.imageId;
        banner.primaryButtonLabel = input.primaryButtonLabel;
        banner.primaryButtonLink = input.primaryButtonLink;
        banner.secondaryButtonLabel = input.secondaryButtonLabel;
        banner.secondaryButtonLink = input.secondaryButtonLink;
        banner.order = input.order ?? 0;
        banner.createdAt = new Date();
        banner.updatedAt = new Date();

        return this.bannerRepository.save(banner);
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
    }
}

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
