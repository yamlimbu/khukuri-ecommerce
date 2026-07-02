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
 * Get top-level collections with caching enabled.
 * 'minutes' TTL so stale empty results expire quickly in dev/after query changes.
 * revalidateTag('collections') still provides instant invalidation in production.
 */
export async function getTopCollections() {
    'use cache';
    cacheLife('minutes');
    cacheTag('collections');

    const result = await query(GetTopCollectionsQuery);
    return result.data?.collections?.items || [];
}
