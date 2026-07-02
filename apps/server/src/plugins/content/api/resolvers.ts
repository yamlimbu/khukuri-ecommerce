import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext, Transaction } from '@vendure/core';
import { BannerService } from '../services/banner.service';
import { PageService } from '../services/page.service';

/**
 * Notify the Next.js storefront to invalidate the 'banners' cache tag.
 * Called after any banner create / update / delete mutation.
 *
 * Uses REVALIDATION_ENDPOINT (loopback) when available to avoid going
 * through Nginx/SSL on same-server deployments.
 */
async function triggerBannerRevalidation(): Promise<void> {
    const secret = process.env.REVALIDATION_SECRET;

    if (!secret) {
        console.warn('[ContentPlugin] REVALIDATION_SECRET not set — skipping banner cache revalidation.');
        return;
    }

    const endpoint = (
        process.env.REVALIDATION_ENDPOINT ||
        process.env.FRONTEND_URL ||
        'http://localhost:3001'
    ).replace(/\/$/, '');

    const url = `${endpoint}/api/revalidate`;


    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secret}`,
            },
            body: JSON.stringify({ tags: ['banners'] }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`[ContentPlugin] Banner revalidation failed (${response.status}): ${text}`);
        } else {
            console.log('[ContentPlugin] Banner cache revalidated successfully.');
        }
    } catch (err) {
        console.error('[ContentPlugin] Network error calling banner revalidation endpoint:', err);
    }
}

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
        const result = await this.bannerService.create(ctx, args.input);
        // Fire-and-forget: bust the storefront banner cache
        triggerBannerRevalidation().catch(() => {});
        return result;
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateSettings)
    async updateBanner(@Ctx() ctx: RequestContext, @Args() args: any) {
        const result = await this.bannerService.update(ctx, args.input);
        triggerBannerRevalidation().catch(() => {});
        return result;
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateSettings)
    async deleteBanner(@Ctx() ctx: RequestContext, @Args() args: any) {
        const result = await this.bannerService.delete(ctx, args.id);
        triggerBannerRevalidation().catch(() => {});
        return result;
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
