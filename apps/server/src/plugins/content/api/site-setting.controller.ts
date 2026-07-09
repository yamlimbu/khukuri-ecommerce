import { Controller, Get, Put, Body, Req, ForbiddenException, BadRequestException, UseGuards } from '@nestjs/common';
import { RequestContextService, Permission, RequestContext, Ctx, Allow, AuthGuard } from '@vendure/core';
import { Request } from 'express';
import { SiteSettingService } from '../services/site-setting.service';

function isValidUrl(url: string | null | undefined): boolean {
    if (!url) return true;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

@Controller('admin-api/settings')
export class SiteSettingController {
    constructor(
        private siteSettingService: SiteSettingService,
        private requestContextService: RequestContextService,
    ) {}

    private serializeAsset(asset: any, req: Request): any {
        if (!asset) return null;

        let prefix = process.env.VENDURE_ASSET_URL_PREFIX;
        if (!prefix) {
            const host = req.get('host') || 'localhost:3000';
            const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
            prefix = `${protocol}://${host}/assets/`;
        }

        if (!prefix.endsWith('/')) {
            prefix += '/';
        }

        const normalizePath = (p: string) => {
            if (!p) return '';
            const cleanPath = p.replace(/\\/g, '/');
            return cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
        };

        return {
            ...asset,
            preview: asset.preview ? `${prefix}${normalizePath(asset.preview)}` : '',
            source: asset.source ? `${prefix}${normalizePath(asset.source)}` : '',
        };
    }

    @Get()
    async getSettings(@Req() req: Request) {
        const ctx = await this.requestContextService.fromRequest(req);
        // Expose settings publicly (no auth required for GET as storefront needs it)
        const settings = await this.siteSettingService.getSettings(ctx);
        
        // Return both camelCase and snake_case for compatibility
        return {
            id: settings.id,
            siteName: settings.siteName,
            site_name: settings.siteName,
            metaTitle: settings.metaTitle,
            meta_title: settings.metaTitle,
            metaDescription: settings.metaDescription,
            meta_description: settings.metaDescription,
            metaKeywords: settings.metaKeywords,
            meta_keywords: settings.metaKeywords,
            logo: this.serializeAsset(settings.logo, req),
            favicon: this.serializeAsset(settings.favicon, req),
            facebookUrl: settings.facebookUrl,
            facebook_url: settings.facebookUrl,
            instagramUrl: settings.instagramUrl,
            instagram_url: settings.instagramUrl,
            tiktokUrl: settings.tiktokUrl,
            tiktok_url: settings.tiktokUrl,
            whatsappUrl: settings.whatsappUrl,
            whatsapp_url: settings.whatsappUrl,
        };
    }

    @Put()
    @UseGuards(AuthGuard)
    @Allow(Permission.UpdateSettings)
    async updateSettings(@Ctx() ctx: RequestContext, @Req() req: Request, @Body() body: any) {
        // Map snake_case to camelCase
        const input = {
            siteName: body.siteName !== undefined ? body.siteName : body.site_name,
            metaTitle: body.metaTitle !== undefined ? body.metaTitle : body.meta_title,
            metaDescription: body.metaDescription !== undefined ? body.metaDescription : body.meta_description,
            metaKeywords: body.metaKeywords !== undefined ? body.metaKeywords : body.meta_keywords,
            logoId: body.logoId !== undefined ? body.logoId : body.logo_id,
            faviconId: body.faviconId !== undefined ? body.faviconId : body.favicon_id,
            facebookUrl: body.facebookUrl !== undefined ? body.facebookUrl : body.facebook_url,
            instagramUrl: body.instagramUrl !== undefined ? body.instagramUrl : body.instagram_url,
            tiktokUrl: body.tiktokUrl !== undefined ? body.tiktokUrl : body.tiktok_url,
            whatsappUrl: body.whatsappUrl !== undefined ? body.whatsappUrl : body.whatsapp_url,
        };

        // Validate URLs
        const urlsToValidate = [
            { label: 'Facebook URL', url: input.facebookUrl },
            { label: 'Instagram URL', url: input.instagramUrl },
            { label: 'TikTok URL', url: input.tiktokUrl },
            { label: 'WhatsApp URL', url: input.whatsappUrl },
        ];

        for (const item of urlsToValidate) {
            if (item.url && !isValidUrl(item.url)) {
                throw new BadRequestException(`Invalid URL format for ${item.label}`);
            }
        }

        const settings = await this.siteSettingService.updateSettings(ctx, input);

        // Invalidate Next.js storefront cache tag 'settings'
        this.triggerRevalidation().catch(err => {
            console.error('[SiteSettingController] Failed to trigger storefront cache revalidation:', err);
        });

        return {
            success: true,
            settings: {
                ...settings,
                logo: this.serializeAsset(settings.logo, req),
                favicon: this.serializeAsset(settings.favicon, req),
            },
        };
    }

    private async triggerRevalidation() {
        const secret = process.env.REVALIDATION_SECRET;
        if (!secret) return;

        const endpoint = (
            process.env.REVALIDATION_ENDPOINT ||
            process.env.FRONTEND_URL ||
            'http://localhost:3001'
        ).replace(/\/$/, '');

        const url = `${endpoint}/api/revalidate`;

        try {
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${secret}`,
                },
                body: JSON.stringify({ tags: ['settings'] }),
            });
        } catch (err) {
            console.error('[SiteSettingController] Network error calling revalidation endpoint:', err);
        }
    }
}
