import {Suspense} from "react";
import {FacetFilters} from "@/components/commerce/facet-filters";
import {ProductGridSkeleton} from "@/components/shared/product-grid-skeleton";
import {ProductGrid} from "@/components/commerce/product-grid";
import {buildSearchInput, getCurrentPage} from "@/lib/search-helpers";
import {query} from "@/lib/vendure/api";
import {SearchProductsQuery} from "@/lib/vendure/queries";
import {cacheLife, cacheTag} from "next/cache";

interface SearchResultsProps {
    searchParams: Promise<{
        page?: string
    }>
}

async function getSearchProducts(searchParams: { [key: string]: string | string[] | undefined }) {
    'use cache';
    cacheLife('minutes'); // short TTL — search results should be near-live
    cacheTag('products', 'featured-products');

    return query(SearchProductsQuery, {
        input: buildSearchInput({ searchParams })
    });
}

export async function SearchResults({searchParams}: SearchResultsProps) {
    const searchParamsResolved = await searchParams;
    const page = getCurrentPage(searchParamsResolved);

    const productDataPromise = getSearchProducts(searchParamsResolved);


    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
                <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded-lg"/>}>
                    <FacetFilters productDataPromise={productDataPromise}/>
                </Suspense>
            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-3">
                <Suspense fallback={<ProductGridSkeleton/>}>
                    <ProductGrid productDataPromise={productDataPromise} currentPage={page} take={12}/>
                </Suspense>
            </div>
        </div>
    )
}