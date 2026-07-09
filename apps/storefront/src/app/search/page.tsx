import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from "@/app/search/search-results";
import { SearchTerm, SearchTermSkeleton } from "@/app/search/search-term";
import { SearchResultsSkeleton } from "@/components/shared/skeletons/search-results-skeleton";
import { noIndexRobots } from '@/lib/metadata';
import { getSiteSettings } from '@/lib/vendure/cached';

export async function generateMetadata({
    searchParams,
}: PageProps<'/search'>): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const searchQuery = resolvedParams.q as string | undefined;

    const settings = await getSiteSettings();
    const siteName = settings.siteName || 'Himalayan Khukuri House';

    const title = searchQuery
        ? `Search results for "${searchQuery}"`
        : 'Search Products';

    return {
        title,
        description: searchQuery
            ? `Find khukuris and products matching "${searchQuery}" at ${siteName}`
            : `Search our full catalogue of authentic Nepalese khukuris at ${siteName}`,
        robots: noIndexRobots(),
    };
}

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
    return (
        <div className="container mx-auto px-4 py-8 mt-16">
            <Suspense fallback={<SearchTermSkeleton />}>
                <SearchTerm searchParams={searchParams} />
            </Suspense>
            <Suspense fallback={<SearchResultsSkeleton />}>
                <SearchResults searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
