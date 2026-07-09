import type { Metadata } from 'next';
import { query } from '@/lib/vendure/api';
import { GetProductDetailQuery } from '@/lib/vendure/queries';
import { ProductImageCarousel } from '@/components/commerce/product-image-carousel';
import { ProductInfo } from '@/components/commerce/product-info';
import { normalizeAssetUrl } from '@/lib/utils';
import { RelatedProducts } from '@/components/commerce/related-products';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { notFound } from 'next/navigation';
import { cacheLife, cacheTag } from 'next/cache';
import {
    truncateDescription,
    buildCanonicalUrl,
    buildOgImages,
    buildBreadcrumbJsonLd,
    buildProductJsonLd,
} from '@/lib/metadata';
import { getSiteSettings } from '@/lib/vendure/cached';

async function getProductData(slug: string) {
    'use cache';
    cacheLife('hours');
    cacheTag(`product-${slug}`);

    return await query(GetProductDetailQuery, { slug });
}

export async function generateMetadata({
    params,
}: PageProps<'/product/[slug]'>): Promise<Metadata> {
    const { slug } = await params;
    const result = await getProductData(slug);
    const product = result.data?.product;

    if (!product) {
        return { title: 'Product Not Found' };
    }

    // Get site default fallbacks from admin settings
    const settings = await getSiteSettings();
    const siteDefaultTitle = settings?.metaTitle || 'Himalayan Khukuri House - Finest Kukris from Nepal';
    const siteDefaultDescription =
        settings?.metaDescription ||
        'Himalayan Khukuri House Nepal brings you the finest kukris handmade by Nepalese Blacksmiths.';

    const customFields = product.customFields as Record<string, any> | null;

    // Title priority: 1. Product Meta Title → 2. Product Name → 3. Site Meta Title
    const metaTitle =
        (customFields?.metaTitle as string | undefined)?.trim() ||
        product.name ||
        siteDefaultTitle;

    // Description priority: 1. Product Meta Description → 2. Product Description → 3. Site Meta Description
    const metaDescription =
        (customFields?.metaDescription as string | undefined)?.trim() ||
        truncateDescription(product.description) ||
        siteDefaultDescription;

    const ogImage = normalizeAssetUrl(
        product.assets?.[0]?.preview,
        product.assets?.[0]?.updatedAt
    );

    const canonicalUrl = buildCanonicalUrl(`/product/${product.slug}`, settings);

    return {
        title: metaTitle,
        description: metaDescription,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: metaTitle,
            description: metaDescription,
            type: 'website',
            url: canonicalUrl,
            images: buildOgImages(ogImage, product.name),
        },
        twitter: {
            card: 'summary_large_image',
            title: metaTitle,
            description: metaDescription,
            images: ogImage ? [ogImage] : undefined,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

export default async function ProductDetailPage({ params, searchParams }: PageProps<'/product/[slug]'>) {
    const { slug } = await params;
    const searchParamsResolved = await searchParams;

    const [result, settings] = await Promise.all([
        getProductData(slug),
        getSiteSettings(),
    ]);

    const product = result.data?.product;

    if (!product) {
        notFound();
    }

    // Get the primary collection (prefer deepest nested / most specific)
    const primaryCollection = product.collections?.find(c => c.parent?.id) ?? product.collections?.[0];

    // JSON-LD structured data
    const breadcrumbJsonLd = buildBreadcrumbJsonLd(settings, [
        { name: 'Home', path: '/' },
        ...(primaryCollection
            ? [{ name: primaryCollection.name, path: `/collection/${primaryCollection.slug}` }]
            : []),
        { name: product.name, path: `/product/${product.slug}` },
    ]);

    const firstVariant = product.variants?.[0];
    const productJsonLd = buildProductJsonLd(settings, {
        name: product.name,
        slug: product.slug,
        description: product.description,
        imageUrl: product.assets?.[0]?.preview ?? null,
        price: firstVariant?.priceWithTax ?? null,
        currencyCode: null, // currencyCode not in this query; org-level sets currency
        sku: firstVariant?.sku ?? null,
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
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />

            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Image Carousel */}
                    <div className="lg:sticky lg:top-20 lg:self-start">
                        <ProductImageCarousel images={product.assets} />
                    </div>

                    {/* Right Column: Product Info */}
                    <div>
                        <ProductInfo product={product} searchParams={searchParamsResolved} />
                    </div>
                </div>
            </div>

            {/* Product Benefits Section */}
            <section aria-label="Why choose us" className="py-16 bg-muted/30 mt-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl font-bold text-center mb-8">Why Choose {settings.siteName || 'Us'}</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-3">
                            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold">Authentic Quality</h3>
                            <p className="text-muted-foreground">Hand-forged by master Nepalese blacksmiths using traditional techniques</p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold">Lifetime Warranty</h3>
                            <p className="text-muted-foreground">Every blade backed by our lifetime guarantee against manufacturing defects</p>
                        </div>
                        <div className="space-y-3">
                            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold">Global Shipping</h3>
                            <p className="text-muted-foreground">Fast, insured worldwide shipping from Kathmandu, Nepal to your door</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section aria-label="Frequently asked questions" className="py-16 bg-muted/30">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="shipping">
                            <AccordionTrigger>What are your shipping options?</AccordionTrigger>
                            <AccordionContent>
                                We offer standard international shipping (10–18 business days) and express shipping (5–8 business days) to over 80 countries. All shipments are insured and fully tracked from our Kathmandu workshop to your delivery address.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="authenticity">
                            <AccordionTrigger>Are your khukuris genuinely hand-forged in Nepal?</AccordionTrigger>
                            <AccordionContent>
                                Yes — every khukuri is forged in our own workshop in Kathmandu by master blacksmiths (kamis). We do not import from China or any third-party manufacturer. Each blade is individually inspected before dispatch.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="warranty">
                            <AccordionTrigger>What does the lifetime warranty cover?</AccordionTrigger>
                            <AccordionContent>
                                Our lifetime warranty covers any manufacturing defect in the blade or handle. If a defect appears during normal use, we will repair or replace the item at no cost. It does not cover damage from misuse, improper sharpening, or accident.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="returns">
                            <AccordionTrigger>What is your return policy?</AccordionTrigger>
                            <AccordionContent>
                                We accept returns within 30 days of delivery. Items must be unused and in original packaging. Contact our support team to initiate a return. Refunds are processed within 5 business days of receiving the item.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="tracking">
                            <AccordionTrigger>How can I track my order?</AccordionTrigger>
                            <AccordionContent>
                                Once your order ships, you&apos;ll receive an email with a tracking number. You can also log into your account and visit the Order History section to view real-time shipment status.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>

            {primaryCollection && (
                <RelatedProducts
                    collectionSlug={primaryCollection.slug}
                    currentProductId={product.id}
                />
            )}
        </>
    );
}
