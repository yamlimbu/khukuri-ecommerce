import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { HeroBanner, HeroCarousel } from "@/components/layout/hero-carousel";
import { HeroSection } from "@/components/layout/hero-section";
import { TopCategories } from "@/components/commerce/top-categories";
import { TopViewedProducts } from "@/components/commerce/top-viewed-products";
import { buildPageMetadata, buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/vendure/cached";
import { query } from "@/lib/vendure/api";
import { GetBannersQuery } from "@/lib/vendure/queries";
import { normalizeAssetUrl } from "@/lib/utils";
import Link from "next/link";
import Script from "next/script";

// ---------------------------------------------------------------------------
// Banners
// ---------------------------------------------------------------------------

async function getBannersCached(): Promise<HeroBanner[]> {
    'use cache';
    cacheLife('hours');
    cacheTag('banners');

    const result = await query(GetBannersQuery).catch(() => null);
    return (result?.data?.banners as any[] ?? []).map((b: any) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle || undefined,
        primaryButtonLabel: b.primaryButtonLabel || undefined,
        primaryButtonLink: b.primaryButtonLink || '/',
        secondaryButtonLabel: b.secondaryButtonLabel || undefined,
        secondaryButtonLink: b.secondaryButtonLink || '/',
        image: b.image ? normalizeAssetUrl(b.image.preview, b.image.updatedAt) : undefined,
    }));
}

// ---------------------------------------------------------------------------
// Dynamic metadata — reads from Vendure Admin site settings
// ---------------------------------------------------------------------------

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();
    return buildPageMetadata(settings, {
        canonicalPath: '/',
    });
}

// ---------------------------------------------------------------------------
// Homepage
// ---------------------------------------------------------------------------

export default async function Home(_props: PageProps<'/'>) {
    const [banners, settings] = await Promise.all([
        getBannersCached(),
        getSiteSettings(),
    ]);

    const siteName = settings.siteName || 'Himalayan Khukuri House';

    // JSON-LD: Organization + WebSite schemas injected inline
    const organizationJsonLd = buildOrganizationJsonLd(settings);
    const websiteJsonLd = buildWebSiteJsonLd(settings);

    return (
        <>
            {/* ── Structured Data ─────────────────────────────────────── */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
            />

            <div className="min-h-screen">

                {/* ── Hero Banner ──────────────────────────────────────── */}
                <HeroSection banners={banners} />

                {/* ── H1: Site Name (visually prominent, semantically correct) ─ */}
                <section className="py-10 bg-background text-center border-b border-border">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                            {siteName}
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            {settings.metaDescription ||
                                'Authentic hand-forged Khukuris crafted by master blacksmiths in Nepal. Gurkha knives built for a lifetime.'}
                        </p>
                    </div>
                </section>

                {/* ── Featured Products ─────────────────────────────────── */}
                <TopViewedProducts />

                {/* ── Top Categories ───────────────────────────────────── */}
                <TopCategories />

                {/* ── Why Choose Us ────────────────────────────────────── */}
                <section
                    aria-label="Our guarantees"
                    className="py-20 bg-muted/10 text-muted-foreground border-t border-border"
                >
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-serif font-bold text-center text-foreground mb-12">
                            Why Choose {siteName}?
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8 text-center">
                            <div className="space-y-4">
                                <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-serif font-semibold text-foreground">Master Craftsmanship</h3>
                                <p className="text-muted-foreground">Every khukuri is forged by skilled Nepalese blacksmiths using centuries-old techniques passed down through generations.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-serif font-semibold text-foreground">Factory-Direct Prices</h3>
                                <p className="text-muted-foreground">We manufacture directly in Kathmandu, Nepal, eliminating middlemen so you receive authentic quality at the fairest price.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-serif font-semibold text-foreground">Global Delivery</h3>
                                <p className="text-muted-foreground">Fast, insured worldwide shipping via trusted carriers. Every order is carefully packaged and tracked from Kathmandu to your door.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SEO Content Section ───────────────────────────────── */}
                <section
                    aria-label="About Himalayan Khukuri House"
                    className="py-20 bg-background border-t border-border"
                >
                    <div className="container mx-auto px-4 max-w-5xl">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                            Authentic Khukuris — Straight from Nepal
                        </h2>
                        <div className="prose prose-emerald dark:prose-invert max-w-none text-foreground/80 prose-headings:font-serif space-y-6">
                            <p>
                                The <strong>khukuri</strong> — also spelled <em>kukri</em> — is Nepal&apos;s most iconic edged tool and the
                                legendary weapon of the <strong>Gurkha soldiers</strong>. For centuries it has been the everyday
                                companion of farmers, soldiers, and craftsmen across the Himalayan foothills. At{' '}
                                <strong>{siteName}</strong>, every blade we sell is hand-forged in our own workshop in Kathmandu
                                by master <em>kamis</em> (blacksmiths) who have inherited this craft from their forefathers.
                            </p>

                            <h3 className="text-2xl font-serif font-semibold text-foreground mt-8">
                                The Art of Hand-Forging a Khukuri
                            </h3>
                            <p>
                                Unlike mass-produced knives, every authentic khukuri begins as a raw billet of high-carbon steel.
                                Our artisans heat, hammer, and shape each blade by hand on a traditional anvil. The distinctive
                                inward-curved spine, the <em>cho</em> notch near the base, and the precisely ground bevel are all
                                formed through days of skilled manual work — not stamped by machine. The handle is then fitted,
                                whether carved from water buffalo horn, rosewood, or composite materials, and the blade is
                                hand-sharpened to a razor edge. The result is a tool that is both a functional instrument and a
                                genuine work of Nepalese heritage.
                            </p>

                            <h3 className="text-2xl font-serif font-semibold text-foreground mt-8">
                                Our Product Range
                            </h3>
                            <p>
                                We offer a wide range of khukuris to suit every purpose and budget. Our catalogue includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-foreground/80">
                                <li><strong>Traditional Gurkha Khukuris</strong> — the classic military-pattern blade used by the British and Indian armies</li>
                                <li><strong>Ceremonial &amp; Decorative Khukuris</strong> — ornate blades inlaid with brass, copper, and bone carvings for display or gifting</li>
                                <li><strong>Functional Hunting &amp; Survival Knives</strong> — heavy-duty blades ideal for outdoor, camping, and bushcraft use</li>
                                <li><strong>Collector&apos;s Limited Editions</strong> — rare designs with antique finishes and museum-grade sheaths</li>
                                <li><strong>Mini Khukuris &amp; Letter Openers</strong> — compact versions perfect as souvenirs and desktop accessories</li>
                            </ul>

                            <h3 className="text-2xl font-serif font-semibold text-foreground mt-8">
                                Quality, Warranty &amp; Authenticity
                            </h3>
                            <p>
                                Every khukuri we sell is genuine — forged in Nepal, not imported from China or elsewhere.
                                Our blades are individually inspected before dispatch. We stand behind our craftsmanship with
                                a <strong>lifetime guarantee against manufacturing defects</strong>. If your blade develops a
                                forging defect, we will repair or replace it at no cost. We include two smaller knives — the
                                <em>karda</em> and <em>chakmak</em> — in the traditional leather scabbard as standard, honouring
                                centuries of Nepalese tradition.
                            </p>

                            <h3 className="text-2xl font-serif font-semibold text-foreground mt-8">
                                Worldwide Shipping from Kathmandu
                            </h3>
                            <p>
                                We ship internationally to over 80 countries. Orders are dispatched from our Kathmandu workshop
                                within 2–3 business days. Standard shipping typically arrives within 10–18 business days; express
                                options deliver in 5–8 business days. All shipments are insured and include a tracking number
                                so you can follow your package from Nepal to your door. Our packaging is discreet, padded, and
                                purpose-built to protect blades in transit.
                            </p>
                        </div>

                        {/* ── Internal Links Hub ──────────────────────────── */}
                        <nav aria-label="Quick links" className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { href: '/search', label: 'Shop All Products' },
                                { href: '/pages/about', label: 'About Us' },
                                { href: '/pages/contact', label: 'Contact' },
                                { href: '/pages/faq', label: 'FAQ' },
                                { href: '/pages/shipping', label: 'Shipping Info' },
                                { href: '/pages/returns', label: 'Returns & Warranty' },
                                { href: '/pages/privacy-policy', label: 'Privacy Policy' },
                                { href: '/pages/terms-of-service', label: 'Terms of Service' },
                            ].map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="text-center py-3 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 transition-all"
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </section>
            </div>
        </>
    );
}
