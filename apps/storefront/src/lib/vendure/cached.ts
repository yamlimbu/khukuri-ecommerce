import {cacheLife, cacheTag} from 'next/cache';
import {query} from './api';
import {GetActiveChannelQuery, GetAvailableCountriesQuery, GetTopCollectionsQuery} from './queries';

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

