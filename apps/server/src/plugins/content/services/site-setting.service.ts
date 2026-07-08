import { Injectable } from '@nestjs/common';
import { RequestContext, TransactionalConnection, AssetService, patchEntity } from '@vendure/core';
import { SiteSetting } from '../entities/site-setting.entity';

@Injectable()
export class SiteSettingService {
    constructor(
        private connection: TransactionalConnection,
        private assetService: AssetService,
    ) {}

    async getSettings(ctx: RequestContext): Promise<SiteSetting> {
        let settings = await this.connection.getRepository(ctx, SiteSetting).findOne({
            where: {},
        });

        if (!settings) {
            // Create default settings record if it doesn't exist
            settings = new SiteSetting({
                siteName: 'Himalayan Khukuri House',
                metaTitle: 'Himalayan Khukuri House - Finest Kukris from Nepal',
                metaDescription: 'Himalayan Khukuri House Nepal brings you the finest kukris handmade by Nepalese Blacksmiths. High-quality hand-forged blades with a lifetime warranty.',
                metaKeywords: 'kukri, khukuri, nepal, handmade kukri, gurkha knife, forged blade',
            });
            settings = await this.connection.getRepository(ctx, SiteSetting).save(settings);
        }

        return settings;
    }

    async updateSettings(ctx: RequestContext, input: any): Promise<SiteSetting> {
        const settings = await this.getSettings(ctx);
        const updated = patchEntity(settings, input);

        if (input.logoId) {
            updated.logo = await this.assetService.findOne(ctx, input.logoId) as any;
        } else if (input.hasOwnProperty('logoId') && !input.logoId) {
            updated.logo = null as any;
        }

        if (input.faviconId) {
            updated.favicon = await this.assetService.findOne(ctx, input.faviconId) as any;
        } else if (input.hasOwnProperty('faviconId') && !input.faviconId) {
            updated.favicon = null as any;
        }

        return this.connection.getRepository(ctx, SiteSetting).save(updated);
    }
}
