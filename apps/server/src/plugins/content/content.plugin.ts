import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';
import { Banner } from './entities/banner.entity';
import { Page } from './entities/page.entity';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { ContentAdminResolver, ContentShopResolver } from './api/resolvers';
import { BannerService } from './services/banner.service';
import { PageService } from './services/page.service';

@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [Banner, Page],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [ContentAdminResolver],
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [ContentShopResolver],
    },
    providers: [
        BannerService,
        PageService,
    ],
    compatibility: '^3.0.0',
})
export class ContentPlugin {}
