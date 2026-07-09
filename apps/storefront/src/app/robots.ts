import { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/vendure/cached';
import { getBaseUrl } from '@/lib/metadata';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const settings = await getSiteSettings();
    const baseUrl = getBaseUrl(settings);

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/account/',
                '/cart/',
                '/checkout/',
                '/order-confirmation/',
                '/verify/',
                '/verify-pending/',
                '/sign-in/',
                '/register/',
                '/forgot-password/',
                '/reset-password/',
                '/search', // Block search results indexing to avoid thin content and query parameter bloat
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
