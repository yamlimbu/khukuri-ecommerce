import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { RequestContext, Ctx, Allow, Permission } from '@vendure/core';
import { BannerService } from '../services/banner.service';
import { Banner } from '../entities/banner.entity';

@Resolver()
export class AdminBannerResolver {
    constructor(private bannerService: BannerService) {}

    @Query('banners')
    @Allow(Permission.SuperAdmin)
    async banners(
        @Ctx() ctx: RequestContext,
        @Args('options', { nullable: true }) options?: any
    ): Promise<any> {
        return this.bannerService.findAll(ctx, options);
    }

    @Query('banner')
    @Allow(Permission.SuperAdmin)
    async banner(
        @Ctx() ctx: RequestContext,
        @Args('id') id: string
    ): Promise<Banner | null> {
        return this.bannerService.findOne(ctx, id);
    }

    @Mutation('createBanner')
    @Allow(Permission.SuperAdmin)
    async createBanner(
        @Ctx() ctx: RequestContext,
        @Args('input') input: any
    ): Promise<Banner> {
        return this.bannerService.create(ctx, input);
    }

    @Mutation('updateBanner')
    @Allow(Permission.SuperAdmin)
    async updateBanner(
        @Ctx() ctx: RequestContext,
        @Args('id') id: string,
        @Args('input') input: any
    ): Promise<Banner> {
        return this.bannerService.update(ctx, id, input);
    }

    @Mutation('deleteBanner')
    @Allow(Permission.SuperAdmin)
    async deleteBanner(
        @Ctx() ctx: RequestContext,
        @Args('id') id: string
    ): Promise<boolean> {
        return this.bannerService.delete(ctx, id);
    }
}
