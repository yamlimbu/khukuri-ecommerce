import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext, Transaction } from '@vendure/core';
import { BannerService } from '../services/banner.service';
import { PageService } from '../services/page.service';

@Resolver()
export class ContentAdminResolver {
    constructor(
        private bannerService: BannerService,
        private pageService: PageService
    ) {}

    @Query()
    @Allow(Permission.ReadSettings)
    async banners(@Ctx() ctx: RequestContext) {
        return this.bannerService.findAll(ctx);
    }

    @Query()
    @Allow(Permission.ReadSettings)
    async banner(@Ctx() ctx: RequestContext, @Args() args: any) {
        return this.bannerService.findOne(ctx, args.id);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateSettings)
    async createBanner(@Ctx() ctx: RequestContext, @Args() args: any) {
        return this.bannerService.create(ctx, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateSettings)
    async updateBanner(@Ctx() ctx: RequestContext, @Args() args: any) {
        return this.bannerService.update(ctx, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateSettings)
    async deleteBanner(@Ctx() ctx: RequestContext, @Args() args: any) {
        return this.bannerService.delete(ctx, args.id);
    }

    @Query()
    @Allow(Permission.ReadSettings)
    async pages(@Ctx() ctx: RequestContext) {
        return this.pageService.findAll(ctx);
    }

    @Query()
    @Allow(Permission.ReadSettings)
    async page(@Ctx() ctx: RequestContext, @Args() args: any) {
        return this.pageService.findOne(ctx, args.id);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateSettings)
    async createPage(@Ctx() ctx: RequestContext, @Args() args: any) {
        return this.pageService.create(ctx, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateSettings)
    async updatePage(@Ctx() ctx: RequestContext, @Args() args: any) {
        return this.pageService.update(ctx, args.input);
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateSettings)
    async deletePage(@Ctx() ctx: RequestContext, @Args() args: any) {
        return this.pageService.delete(ctx, args.id);
    }
}

@Resolver()
export class ContentShopResolver {
    constructor(
        private bannerService: BannerService,
        private pageService: PageService
    ) {}

    @Query()
    async banners(@Ctx() ctx: RequestContext) {
        return this.bannerService.findAllShop(ctx);
    }

    @Query()
    async pages(@Ctx() ctx: RequestContext) {
        return this.pageService.findAll(ctx);
    }

    @Query()
    async pageBySlug(@Ctx() ctx: RequestContext, @Args() args: any) {
        return this.pageService.findBySlug(ctx, args.slug);
    }
}
