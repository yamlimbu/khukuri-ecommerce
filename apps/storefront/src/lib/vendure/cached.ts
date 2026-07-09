import { cacheLife, cacheTag } from 'next/cache';
import { query } from './api';
import { GetActiveChannelQuery, GetAvailableCountriesQuery, GetTopCollectionsQuery } from './queries';

/**
 * Get the active channel with caching enabled.
 * Channel configuration rarely changes, so we cache it for 1 hour.
 */
export async function getActiveChannelCached() {
    'use cache';
    cacheLife('hours');

    const result = await query(GetActiveChannelQuery);
    return result.data?.activeChannel;
}

/**
 * Get available countries with caching enabled.
 * Countries list never changes, so we cache it with max duration.
 */
export async function getAvailableCountriesCached() {
    'use cache';
    cacheLife('max');
    cacheTag('countries');

    const result = await query(GetAvailableCountriesQuery);
    return result.data?.availableCountries || [];
}

/**
 * Get collections that have products — used by navbar, footer, and homepage.
 * Filters client-side to any collection with ≥1 product variant, regardless
 * of whether it is top-level or nested. This means the admin just needs to
 * assign products to a collection for it to appear in the storefront nav.
 *
 * Cache TTL: 60s fallback. In production, revalidateTag('collections') fires
 * instantly (~3s) when admin makes any collection change — no waiting needed.
 */
export async function getTopCollections() {
    'use cache';
    // Custom 60-second TTL — fallback only when revalidation pipeline is down.
    // When Vendure fires CollectionEvent → revalidateTag('collections') → instant.
    cacheLife({ stale: 0, revalidate: 60, expire: 60 });
    cacheTag('collections');

    const result = await query(GetTopCollectionsQuery);
    const allItems = result.data?.collections?.items || [];

    // Show any collection that has at least one product, excluding root
    return allItems
        .filter(c => c.slug !== '__root_collection__' && (c.productVariants?.totalItems ?? 0) > 0)
        .slice(0, 8);
}

// ---------------------------------------------------------------------------
// Site Settings
// ---------------------------------------------------------------------------

export interface SiteSettings {
    id: string;
    siteName: string;
    metaTitle: string | null;
    metaDescription: string | null;
    metaKeywords: string | null;
    logo: { id: string; preview: string; source: string } | null;
    favicon: { id: string; preview: string; source: string } | null;
    facebookUrl: string | null;
    instagramUrl: string | null;
    tiktokUrl: string | null;
    whatsappUrl: string | null;
}

const SITE_SETTINGS_FALLBACK: SiteSettings = {
    id: '',
    siteName: 'Himalayan Khukuri House',
    metaTitle: 'Himalayan Khukuri House - Finest Kukris from Nepal',
    metaDescription:
        'Himalayan Khukuri House Nepal brings you the finest kukris handmade by Nepalese Blacksmiths. High-quality hand-forged blades with a lifetime warranty.',
    metaKeywords: 'kukri, khukuri, nepal, handmade kukri, gurkha knife, forged blade',
    logo: null,
    favicon: null,
    facebookUrl: null,
    instagramUrl: null,
    tiktokUrl: null,
    whatsappUrl: null,
};

/**
 * Fetch site-wide settings (logo, favicon, meta, social links) and cache them
 * under the 'settings' tag. The Vendure server calls revalidateTag('settings')
 * automatically whenever the admin saves new settings, so this cache stays fresh.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
    'use cache';
    cacheLife({ stale: 0, revalidate: 300, expire: 3600 });
    cacheTag('settings');

    const apiUrl =
        process.env.VENDURE_INTERNAL_API_URL ||
        process.env.VENDURE_SHOP_API_URL?.replace('/shop-api', '') ||
        process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL?.replace('/shop-api', '') ||
        'http://localhost:3000';

    try {
        const res = await fetch(`${apiUrl}/api/settings`, {
            headers: { 'Content-Type': 'application/json' },
            next: { tags: ['settings'] },
        });

        if (!res.ok) {
            console.warn('[getSiteSettings] API returned', res.status, '— using fallback');
            return SITE_SETTINGS_FALLBACK;
        }

        const data = await res.json();
        return {
            id: data.id ?? '',
            siteName: data.siteName || SITE_SETTINGS_FALLBACK.siteName,
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            metaKeywords: data.metaKeywords || null,
            logo: data.logo ?? null,
            favicon: data.favicon ?? null,
            facebookUrl: data.facebookUrl ?? null,
            instagramUrl: data.instagramUrl ?? null,
            tiktokUrl: data.tiktokUrl ?? null,
            whatsappUrl: data.whatsappUrl ?? null,
        };
    } catch (err) {
        console.warn('[getSiteSettings] Fetch error — using fallback:', err);
        return SITE_SETTINGS_FALLBACK;
    }
}

