import type {Metadata} from "next";
import {HeroSection} from "@/components/layout/hero-section";
import {FeaturedProducts} from "@/components/commerce/featured-products";
import {SITE_NAME, SITE_URL, buildCanonicalUrl} from "@/lib/metadata";

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
    return (
        <div className="min-h-screen">
            <HeroSection/>
            <FeaturedProducts/>

            {/* You can add more sections here */}
            <section className="py-20 bg-zinc-950 text-zinc-300 border-t border-zinc-800">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-4">
                            <div
                                className="w-16 h-16 mx-auto bg-emerald-900/20 border border-emerald-700/50 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M5 13l4 4L19 7"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif font-semibold text-zinc-100">Master Craftsmanship</h3>
                            <p className="text-zinc-400">Forged by skilled artisans in Nepal</p>
                        </div>
                        <div className="space-y-4">
                            <div
                                className="w-16 h-16 mx-auto bg-emerald-900/20 border border-emerald-700/50 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif font-semibold text-zinc-100">Best Prices</h3>
                            <p className="text-zinc-400">Directly from our factory in Kathmandu to you</p>
                        </div>
                        <div className="space-y-4">
                            <div
                                className="w-16 h-16 mx-auto bg-emerald-900/20 border border-emerald-700/50 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <h3 className="text-xl font-serif font-semibold text-zinc-100">Global Delivery</h3>
                            <p className="text-zinc-400">Fast and secure shipping via standard couriers</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
