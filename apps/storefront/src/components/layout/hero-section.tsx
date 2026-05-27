"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { HeroCarousel, HeroBanner } from "./hero-carousel";

// No fallback/mock banners - only show banners fetched from the API
const mockBanners: HeroBanner[] = [];

function getBannerApiUrl(): string {
    return (
        process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL ||
        process.env.VENDURE_SHOP_API_URL ||
        process.env.VENDURE_API_URL ||
        '/shop-api'
    );
}

function isAbortError(error: unknown): boolean {
    return (
        error instanceof Error &&
        (error.name === 'AbortError' || (error as any).code === 'ABORT_ERR' || (error as any).code === 20)
    );
}

export function HeroSection() {
    const [banners, setBanners] = useState<HeroBanner[]>(mockBanners);

    useEffect(() => {
        const controller = new AbortController();
        const apiUrl = getBannerApiUrl();

        const fetchBanners = async () => {
            const query = `
                query ShopBanners {
                    banners {
                        id
                        title
                        subtitle
                        image {
                            preview
                        }
                        primaryButtonLabel
                        primaryButtonLink
                        secondaryButtonLabel
                        secondaryButtonLink
                    }
                }
            `;

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`Shop API request failed with status ${response.status}`);
                }

                const json = await response.json();
                if (json.errors) {
                    const errorMessages = json.errors.map((error: any) => error.message).join(', ');
                    throw new Error(`GraphQL error: ${errorMessages}`);
                }

                const fetchedBanners = (json.data?.banners ?? []).map((banner: any) => ({
                    id: banner.id,
                    title: banner.title,
                    subtitle: banner.subtitle ?? '',
                    image: banner.image?.preview ?? undefined,
                    primaryButtonLabel: banner.primaryButtonLabel ?? '',
                    primaryButtonLink: banner.primaryButtonLink ?? '/search',
                    secondaryButtonLabel: banner.secondaryButtonLabel ?? undefined,
                    secondaryButtonLink: banner.secondaryButtonLink ?? undefined,
                })) as HeroBanner[];

                if (fetchedBanners.length > 0) {
                    console.log(`Loaded ${fetchedBanners.length} banners from API`, fetchedBanners);
                    setBanners(fetchedBanners);
                } else {
                    console.warn('No banners returned from API');
                }
            } catch (error) {
                if (isAbortError(error)) {
                    return;
                }
                console.error('Failed to load hero banners:', error);
            }
        };

        fetchBanners();

        return () => controller.abort();
    }, []);

    if (banners.length === 0) {
        return null;
    }

    return (
        <section className="relative bg-background overflow-hidden border-b border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-background dark:from-zinc-900 dark:via-zinc-950 dark:to-black opacity-90" />
            <HeroCarousel banners={banners} />
        </section>
    );
}
