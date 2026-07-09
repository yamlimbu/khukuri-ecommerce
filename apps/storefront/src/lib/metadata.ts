import type { Metadata } from 'next';
import type { SiteSettings } from './vendure/cached';
import { normalizeAssetUrl } from './utils';

// ---------------------------------------------------------------------------
// Static env-var constants — used only when the Vendure admin has no value
// ---------------------------------------------------------------------------

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Himalayan Khukuri House';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://himalayankhukuri.com';

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

/**
 * Truncate text to a maximum length, preserving word boundaries.
 * Strips HTML tags. Ideal for meta descriptions (recommended 150-160 chars).
 */
export function truncateDescription(
    text: string | null | undefined,
    maxLength = 155
): string {
    if (!text) return '';
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (cleanText.length <= maxLength) return cleanText;
    const truncated = cleanText.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return lastSpaceIndex > 0
        ? truncated.substring(0, lastSpaceIndex) + '...'
        : truncated + '...';
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the preferred canonical base URL.
 * Priority: settings.canonicalUrl > NEXT_PUBLIC_SITE_URL > fallback constant.
 */
export function getBaseUrl(settings?: SiteSettings | null): string {
    return (
        settings?.canonicalUrl?.replace(/\/$/, '') ||
        SITE_URL.replace(/\/$/, '')
    );
}

/**
 * Build a full canonical URL for a given path.
 */
export function buildCanonicalUrl(path: string, settings?: SiteSettings | null): string {
    const base = getBaseUrl(settings);
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
}

// ---------------------------------------------------------------------------
// OpenGraph image helper
// ---------------------------------------------------------------------------

export function buildOgImages(
    imageUrl: string | null | undefined,
    alt?: string
): NonNullable<Metadata['openGraph']>['images'] {
    if (!imageUrl) return undefined;
    return [
        {
            url: normalizeAssetUrl(imageUrl),
            width: 1200,
            height: 630,
            alt: alt || SITE_NAME,
        },
    ];
}

// ---------------------------------------------------------------------------
// Robots helpers
// ---------------------------------------------------------------------------

/** Full indexing robots config. */
export function indexRobots(): Metadata['robots'] {
    return {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    };
}

/** noindex/nofollow for protected or low-value pages. */
export function noIndexRobots(): Metadata['robots'] {
    return {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
        },
    };
}

// ---------------------------------------------------------------------------
// Central page metadata factory
// ---------------------------------------------------------------------------

export interface PageMetadataOptions {
    /** Page-specific title. When absent the site metaTitle is used. */
    title?: string;
    /** Page-specific description. Falls back to site metaDescription. */
    description?: string;
    /** Page-specific keywords. Falls back to site metaKeywords. */
    keywords?: string;
    /** Absolute canonical path, e.g. "/product/my-kukri". */
    canonicalPath?: string;
    /** OG image URL. Falls back to settings.ogImage, then settings.logo. */
    ogImageUrl?: string | null;
    /** Alt text for the OG image. */
    ogImageAlt?: string;
    /** Override OG type (default: "website"). */
    ogType?: 'website' | 'article';
    /** Override robots directive. Defaults to indexRobots(). */
    robots?: Metadata['robots'];
}

/**
 * Build a complete Next.js Metadata object for any page.
 *
 * Merges page-level overrides on top of the site settings defaults.
 * Every page.tsx generateMetadata() function should call this instead of
 * constructing metadata objects by hand.
 */
export function buildPageMetadata(
    settings: SiteSettings,
    options: PageMetadataOptions = {}
): Metadata {
    const siteName = settings.siteName || SITE_NAME;
    const siteMetaTitle = settings.metaTitle || `${siteName} — Finest Kukris from Nepal`;
    const siteMetaDescription =
        settings.metaDescription ||
        'Himalayan Khukuri House Nepal brings you the finest kukris handmade by Nepalese Blacksmiths. Lifetime warranty.';
    const siteKeywords = settings.metaKeywords || 'kukri, khukuri, nepal, gurkha knife';

    const title = options.title || siteMetaTitle;
    const description = options.description || siteMetaDescription;
    const keywords = options.keywords || siteKeywords;

    const canonicalUrl = options.canonicalPath
        ? buildCanonicalUrl(options.canonicalPath, settings)
        : getBaseUrl(settings);

    // OG image priority: page-level override → settings.ogImage → settings.logo
    const ogImageSource =
        options.ogImageUrl ?? settings.ogImage?.preview ?? settings.logo?.preview ?? null;
    const ogImages = buildOgImages(ogImageSource, options.ogImageAlt || title);

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: options.ogType || 'website',
            siteName,
            locale: 'en_US',
            title,
            description,
            url: canonicalUrl,
            ...(ogImages && { images: ogImages }),
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            ...(ogImageSource && { images: [normalizeAssetUrl(ogImageSource)] }),
        },
        robots: options.robots ?? indexRobots(),
    };
}

// ---------------------------------------------------------------------------
// JSON-LD structured data builders
// ---------------------------------------------------------------------------

/**
 * Organization schema — placed in root layout so it appears on every page.
 */
export function buildOrganizationJsonLd(settings: SiteSettings): object {
    const siteUrl = getBaseUrl(settings);
    const siteName = settings.siteName || SITE_NAME;
    const logoUrl = settings.logo?.preview ? normalizeAssetUrl(settings.logo.preview) : null;

    const sameAs: string[] = [];
    if (settings.facebookUrl) sameAs.push(settings.facebookUrl);
    if (settings.instagramUrl) sameAs.push(settings.instagramUrl);
    if (settings.tiktokUrl) sameAs.push(settings.tiktokUrl);
    if (settings.whatsappUrl) sameAs.push(settings.whatsappUrl);

    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: siteName,
        url: siteUrl,
        ...(logoUrl && {
            logo: {
                '@type': 'ImageObject',
                url: logoUrl,
            },
        }),
        ...(sameAs.length > 0 && { sameAs }),
    };
}

/**
 * WebSite schema with SearchAction — enables Google Sitelinks Search Box.
 */
export function buildWebSiteJsonLd(settings: SiteSettings): object {
    const siteUrl = getBaseUrl(settings);
    const siteName = settings.siteName || SITE_NAME;

    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: siteName,
        url: siteUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${siteUrl}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };
}

/**
 * BreadcrumbList schema for product and collection pages.
 */
export function buildBreadcrumbJsonLd(
    settings: SiteSettings,
    crumbs: Array<{ name: string; path: string }>
): object {
    const base = getBaseUrl(settings);
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: `${base}${crumb.path}`,
        })),
    };
}

/**
 * Product schema for product detail pages.
 */
export function buildProductJsonLd(
    settings: SiteSettings,
    product: {
        name: string;
        slug: string;
        description?: string | null;
        imageUrl?: string | null;
        price?: number | null;
        currencyCode?: string | null;
        sku?: string | null;
    }
): object {
    const siteUrl = getBaseUrl(settings);
    const siteName = settings.siteName || SITE_NAME;
    const imageUrl = product.imageUrl ? normalizeAssetUrl(product.imageUrl) : undefined;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        ...(product.description && {
            description: truncateDescription(product.description, 500),
        }),
        ...(imageUrl && { image: imageUrl }),
        ...(product.sku && { sku: product.sku }),
        brand: {
            '@type': 'Brand',
            name: siteName,
        },
        offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/InStock',
            priceCurrency: product.currencyCode || 'USD',
            ...(product.price != null && { price: (product.price / 100).toFixed(2) }),
            url: `${siteUrl}/product/${product.slug}`,
            seller: {
                '@type': 'Organization',
                name: siteName,
            },
        },
    };
}

/**
 * ItemList schema for collection pages.
 */
export function buildCollectionJsonLd(
    settings: SiteSettings,
    collection: { name: string; slug: string; description?: string | null }
): object {
    const siteUrl = getBaseUrl(settings);

    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: collection.name,
        ...(collection.description && {
            description: truncateDescription(collection.description, 300),
        }),
        url: `${siteUrl}/collection/${collection.slug}`,
    };
}
