import type { Metadata } from 'next';
import { Suspense } from 'react';
import { query } from '@/lib/vendure/api';
import { SearchProductsQuery, GetCollectionProductsQuery } from '@/lib/vendure/queries';
import { ProductGrid } from '@/components/commerce/product-grid';
import { normalizeAssetUrl } from '@/lib/utils';
import { FacetFilters } from '@/components/commerce/facet-filters';
import { ProductGridSkeleton } from '@/components/shared/product-grid-skeleton';
import { buildSearchInput, getCurrentPage } from '@/lib/search-helpers';
import { cacheLife, cacheTag } from 'next/cache';
import {
    truncateDescription,
    buildPageMetadata,
    buildBreadcrumbJsonLd,
    buildCollectionJsonLd,
} from '@/lib/metadata';
import { getSiteSettings } from '@/lib/vendure/cached';
import { notFound } from 'next/navigation';

async function getCollectionProducts(slug: string, searchParams: { [key: string]: string | string[] | undefined }) {
    'use cache';
    cacheLife('hours');
    cacheTag(`collection-${slug}`, 'collections');

    return query(SearchProductsQuery, {
        input: buildSearchInput({
            searchParams,
            collectionSlug: slug
        })
    });
}

async function getCollectionData(slug: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`collection-${slug}`, 'collections');

    return query(GetCollectionProductsQuery, {
        slug,
        input: { take: 0, collectionSlug: slug, groupByProduct: true },
    });
}

export async function generateMetadata({
    params,
}: PageProps<'/collection/[slug]'>): Promise<Metadata> {
    const { slug } = await params;
    const [result, settings] = await Promise.all([
        getCollectionData(slug),
        getSiteSettings(),
    ]);
    const collection = result.data?.collection;

    if (!collection) {
        return { title: 'Collection Not Found' };
    }

    const description =
        truncateDescription(collection.description) ||
        `Browse our ${collection.name} collection — authentic hand-forged Khukuris from Nepal.`;

    const ogImageUrl = collection.featuredAsset?.preview
        ? normalizeAssetUrl(collection.featuredAsset.preview, collection.featuredAsset.updatedAt)
        : null;

    return buildPageMetadata(settings, {
        title: collection.name,
        description,
        canonicalPath: `/collection/${collection.slug}`,
        ogImageUrl,
        ogImageAlt: collection.name,
    });
}

export default async function CollectionPage({ params, searchParams }: PageProps<'/collection/[slug]'>) {
    const { slug } = await params;
    const searchParamsResolved = await searchParams;
    const page = getCurrentPage(searchParamsResolved);

    const [collectionResult, settings] = await Promise.all([
        getCollectionData(slug),
        getSiteSettings(),
    ]);
    const productDataPromise = getCollectionProducts(slug, searchParamsResolved);

    const collection = collectionResult.data?.collection;
    if (!collection) notFound();

    // JSON-LD schemas
    const breadcrumbJsonLd = buildBreadcrumbJsonLd(settings, [
        { name: 'Home', path: '/' },
        { name: 'Collections', path: '/search' },
        { name: collection.name, path: `/collection/${collection.slug}` },
    ]);

    const collectionJsonLd = buildCollectionJsonLd(settings, {
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
    });

    return (
        <>
            {/* Structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
            />

            <div className="container mx-auto px-4 py-8 mt-16">
                {/* Collection header with H1 */}
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
                        {collection.name}
                    </h1>
                    {collection.description && (
                        <p className="text-muted-foreground max-w-2xl">
                            {truncateDescription(collection.description, 200)}
                        </p>
                    )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1" aria-label="Product filters">
                        <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg" />}>
                            <FacetFilters productDataPromise={productDataPromise} />
                        </Suspense>
                    </aside>

                    {/* Product Grid */}
                    <main className="lg:col-span-3">
                        <Suspense fallback={<ProductGridSkeleton />}>
                            <ProductGrid productDataPromise={productDataPromise} currentPage={page} take={12} />
                        </Suspense>
                    </main>
                </div>
            </div>
        </>
    );
}