import type {Metadata} from "next";
import {HeroSection} from "@/components/layout/hero-section";
import {TopCategories} from "@/components/commerce/top-categories";
import {Banner} from "@/components/layout/banner";
import {TopViewedProducts} from "@/components/commerce/top-viewed-products";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";
import { query } from "@/lib/vendure/api";
import { GetBannersQuery } from "@/lib/vendure/queries";
import { normalizeAssetUrl } from "@/lib/utils";

export const metadata: Metadata = {
    title: {
        absolute: `${SITE_NAME} - Your One-Stop Shop`,
    },
    description:
        "Discover high-quality products at competitive prices. Shop now for the best deals on electronics, fashion, home goods, and more.",
    alternates: {
        canonical: buildCanonicalUrl("/"),
    },
    openGraph: {
        title: `${SITE_NAME} - Your One-Stop Shop`,
        description:
            "Discover high-quality products at competitive prices. Shop now for the best deals.",
        type: "website",
        url: SITE_URL,
    },
};

export default async function Home(_props: PageProps<'/'>) {
    const bannersResult = await query(GetBannersQuery).catch(() => null);
    
    // Map backend banners to HeroBanner type
    const banners: HeroBanner[] = (bannersResult?.data?.banners as any[] ?? []).map((b: any) => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || undefined,
    primaryButtonLabel: b.primaryButtonLabel || undefined,
    primaryButtonLink: b.primaryButtonLink || undefined,
    secondaryButtonLabel: b.secondaryButtonLabel || undefined,
    secondaryButtonLink: b.secondaryButtonLink || undefined,
    image: b.image ? normalizeAssetUrl(b.image.preview, b.image.updatedAt) : undefined,
}));

    return (
        <div className="min-h-screen">
            {/* <Banner/> */}
            <HeroSection banners={banners} />
            <TopViewedProducts/>
            <TopCategories/>

            {/* You can add more sections here */}
            <section className="py-20 bg-muted/10 text-muted-foreground border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-4">
                            <div
                                className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif font-semibold text-foreground">Master Craftsmanship</h3>
                            <p className="text-muted-foreground">Forged by skilled artisans in Nepal</p>
                        </div>
                        <div className="space-y-4">
                            <div
                                className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif font-semibold text-foreground">Best Prices</h3>
                            <p className="text-muted-foreground">Directly from our factory in Kathmandu to you</p>
                        </div>
                        <div className="space-y-4">
                            <div
                                className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700/50 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif font-semibold text-foreground">Global Delivery</h3>
                            <p className="text-muted-foreground">Fast and secure shipping via standard couriers</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
