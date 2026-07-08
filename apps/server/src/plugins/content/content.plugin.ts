import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';
import { Banner } from './entities/banner.entity';
import { Page } from './entities/page.entity';
import { SiteSetting } from './entities/site-setting.entity';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { ContentAdminResolver, ContentShopResolver } from './api/resolvers';
import { BannerService } from './services/banner.service';
import { PageService } from './services/page.service';
import { SiteSettingService } from './services/site-setting.service';
import { SiteSettingController } from './api/site-setting.controller';

@VendurePlugin({
    imports: [PluginCommonModule],
    entities: [Banner, Page, SiteSetting],
    controllers: [SiteSettingController],
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
        SiteSettingService,
    ],
    compatibility: '^3.0.0',
})
export class ContentPlugin {}
