import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/vendure/api";
import { GetPageBySlugQuery } from "@/lib/vendure/queries";
import {
    buildPageMetadata,
    buildBreadcrumbJsonLd,
    truncateDescription,
} from "@/lib/metadata";
import { getSiteSettings } from "@/lib/vendure/cached";
import { normalizeAssetUrl } from "@/lib/utils";
import Image from "next/image";

interface CmsPageData {
    id: string;
    title: string;
    content: string;
    featuredImage?: {
        preview: string;
        updatedAt: string;
    };
}

async function getPageData(slug: string): Promise<CmsPageData | null> {
    'use cache';
    cacheLife('hours');
    cacheTag(`page-${slug}`, 'pages');

    const result = await query(GetPageBySlugQuery, { slug }).catch(() => null);
    return (result?.data?.pageBySlug as CmsPageData | null) ?? null;
}

export async function generateMetadata({
    params,
}: PageProps<'/pages/[slug]'>): Promise<Metadata> {
    const { slug } = await params;
    const [page, settings] = await Promise.all([
        getPageData(slug),
        getSiteSettings(),
    ]);

    if (!page) {
        return { title: 'Page Not Found', robots: { index: false, follow: false } };
    }

    const featuredImageUrl = page.featuredImage
        ? normalizeAssetUrl(page.featuredImage.preview, page.featuredImage.updatedAt)
        : null;

    // Generate a plain-text description from the content if none is available
    const contentDescription = truncateDescription(page.content, 155);

    return buildPageMetadata(settings, {
        title: page.title,
        description: contentDescription || `Read about ${page.title} at ${settings.siteName || 'Himalayan Khukuri House'}.`,
        canonicalPath: `/pages/${slug}`,
        ogImageUrl: featuredImageUrl,
        ogImageAlt: page.title,
        ogType: 'article',
    });
}

export default async function DynamicPage({ params }: PageProps<'/pages/[slug]'>) {
    const { slug } = await params;
    const [page, settings] = await Promise.all([
        getPageData(slug),
        getSiteSettings(),
    ]);

    if (!page) {
        notFound();
    }

    const breadcrumbJsonLd = buildBreadcrumbJsonLd(settings, [
        { name: 'Home', path: '/' },
        { name: page.title, path: `/pages/${slug}` },
    ]);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <article className="min-h-screen py-12 md:py-20 bg-background">
                <div className="container mx-auto px-4 max-w-4xl">
                    {page.featuredImage && (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 shadow-sm">
                            <Image
                                src={normalizeAssetUrl(page.featuredImage.preview, page.featuredImage.updatedAt) || ''}
                                alt={page.title}
                                fill
                                sizes="(max-width: 1024px) 100vw, 1024px"
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-8">
                        {page.title}
                    </h1>

                    <div
                        className="prose prose-emerald dark:prose-invert max-w-none text-foreground/90
                        prose-headings:font-serif prose-headings:font-semibold
                        prose-a:text-emerald-600 dark:prose-a:text-emerald-400 hover:prose-a:text-emerald-700
                        prose-img:rounded-lg prose-img:shadow-sm"
                        dangerouslySetInnerHTML={{ __html: page.content }}
                    />
                </div>
            </article>
        </>
    );
}
