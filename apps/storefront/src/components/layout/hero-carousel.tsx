"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface HeroBanner {
    id: string;
    title: string;
    subtitle: string;
    primaryButtonLabel: string;
    primaryButtonLink: string;
    secondaryButtonLabel?: string;
    secondaryButtonLink?: string;
    image?: string;
}

interface HeroCarouselProps {
    banners?: HeroBanner[] | null;
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-advance
    useEffect(() => {
        if (!banners || banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [banners]);

    const nextSlide = () => {
        if (!banners) return;
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        if (!banners) return;
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    if (!banners || banners.length === 0) {
        return null;
    }

    const currentBanner = banners[currentIndex];

    return (
        <div className="relative text-foreground container mx-auto flex flex-col items-center justify-center text-center overflow-hidden h-[70vh] min-h-[450px] max-h-[600px] md:min-h-[500px] md:max-h-[700px] w-full">
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-1000 ${
                        index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                >
                    {banner.image && (
                        <div className="absolute inset-0 z-0">
                            <img 
                                src={banner.image} 
                                alt={banner.title} 
                                className="w-full h-full object-cover object-center"
                            />
                            {/* Dark overlay so text is readable */}
                            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 mix-blend-multiply" />
                        </div>
                    )}
                    
                    <div className="relative z-10 w-full max-w-5xl mx-auto space-y-4 md:space-y-6 px-4 sm:px-6 md:px-8 mt-12 md:mt-0">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-2 md:mb-4 text-emerald-400 drop-shadow-lg uppercase transform transition-transform duration-700">
                            {banner.title}
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-200 max-w-3xl mx-auto drop-shadow-md">
                            {banner.subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center pt-4 md:pt-8 w-full sm:w-auto">
                            <Button asChild size="lg" className="w-full sm:w-auto min-w-[200px] md:min-w-[220px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base md:text-lg border-2 border-emerald-700 shadow-lg">
                                <Link href={banner.primaryButtonLink}>
                                    {banner.primaryButtonLabel}
                                </Link>
                            </Button>
                            {banner.secondaryButtonLabel && banner.secondaryButtonLink && (
                                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px] md:min-w-[220px] bg-background/90 hover:bg-muted text-foreground font-bold text-base md:text-lg border-2 border-emerald-600/50 hover:border-emerald-600 shadow-lg backdrop-blur-sm">
                                    <Link href={banner.secondaryButtonLink}>
                                        {banner.secondaryButtonLabel}
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {banners.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/50 hover:bg-background border border-border text-foreground transition-colors hidden md:block"
                        aria-label="Previous banner"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/50 hover:bg-background border border-border text-foreground transition-colors hidden md:block"
                        aria-label="Next banner"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                    
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-3 h-3 rounded-full transition-colors ${
                                    idx === currentIndex ? "bg-emerald-600" : "bg-emerald-600/30 hover:bg-emerald-600/50"
                                }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
