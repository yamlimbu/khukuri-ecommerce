import { Resolver, Query } from '@nestjs/graphql';
import { RequestContext, Ctx } from '@vendure/core';
import { BannerService } from '../services/banner.service';
import { Banner } from '../entities/banner.entity';

@Resolver('Banner')
export class ShopBannerResolver {
    constructor(private bannerService: BannerService) {}

    @Query()
    async banners(
        @Ctx() ctx: RequestContext
    ): Promise<Banner[]> {
        return this.bannerService.findAllShop(ctx);
    }
}
