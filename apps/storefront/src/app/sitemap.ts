import { MetadataRoute } from 'next';
import { query } from '@/lib/vendure/api';
import { getSiteSettings } from '@/lib/vendure/cached';
import {
    GetAllProductSlugsQuery,
    GetAllCollectionSlugsQuery,
    GetAllPageSlugsQuery,
} from '@/lib/vendure/queries';
import { getBaseUrl } from '@/lib/metadata';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const settings = await getSiteSettings();
    const baseUrl = getBaseUrl(settings);

    // Fetch collections, products, and CMS pages in parallel
    const [collectionsResult, productsResult, pagesResult] = await Promise.all([
        query(GetAllCollectionSlugsQuery).catch(() => ({ data: { collections: { items: [] } } })),
        query(GetAllProductSlugsQuery).catch(() => ({ data: { search: { items: [] } } })),
        query(GetAllPageSlugsQuery).catch(() => ({ data: { pages: { items: [] } } })),
    ]);

    const collectionItems = collectionsResult.data?.collections?.items || [];
    const productItems = productsResult.data?.search?.items || [];
    const pageItems = (pagesResult.data as any)?.pages?.items || [];

    const routes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
    ];

    // Add collections
    collectionItems.forEach((c) => {
        if (c.slug) {
            routes.push({
                url: `${baseUrl}/collection/${c.slug}`,
                lastModified: c.updatedAt ? new Date(c.updatedAt as any) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            });
        }
    });

    // Add products
    productItems.forEach((p) => {
        if (p.slug) {
            const updatedAt = p.productVariantAsset?.updatedAt;
            routes.push({
                url: `${baseUrl}/product/${p.slug}`,
                lastModified: updatedAt ? new Date(updatedAt as any) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            });
        }
    });

    // Add CMS pages
    pageItems.forEach((pg: any) => {
        if (pg.slug) {
            routes.push({
                url: `${baseUrl}/pages/${pg.slug}`,
                lastModified: pg.updatedAt ? new Date(pg.updatedAt as any) : new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            });
        }
    });

    return routes;
}
