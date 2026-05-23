import * as React from "react";
import { HeroCarousel, HeroBanner } from "./hero-carousel";

// You can fetch these from Vendure or a CMS later.
// If you set this array to empty [], it will show the default Genuine Gurkha Kukri Knives banner.
const mockBanners: HeroBanner[] = [
    {
        id: "1",
        title: "Genuine Gurkha Kukri Knives",
        subtitle: "Hand forged in Nepal by traditional Kamis since 1991. Official Army Kukri maker and exporter.",
        primaryButtonLabel: "Shop Traditional Knives",
        primaryButtonLink: "/search",
        secondaryButtonLabel: "View Modern Selection",
        secondaryButtonLink: "/search?q=modern",
        image: "https://www.thekhukurihouse.com/public/images/upload/product/echo-predator-kukri.jpg"
    },
    {
        id: "2",
        title: "New Arrivals for 2026",
        subtitle: "Discover our latest collection of premium forged blades perfect for outdoor adventures.",
        primaryButtonLabel: "Explore New Arrivals",
        primaryButtonLink: "/search",
        image: "https://www.thekhukurihouse.com/public/images/upload/product/extraimages/echo-the-predator.jpg"
    },
    {
        id: "3",
        title: "Custom Engravings Available",
        subtitle: "Make your Kukri truly unique with our personalized engraving service directly from Kathmandu.",
        primaryButtonLabel: "Learn More",
        primaryButtonLink: "/search",
        image: "https://www.thekhukurihouse.com/public/images/upload/product/extraimages/predator-kukri-sword.jpg"
    }
];
export function HeroSection() {
    return (
        <section className="relative bg-background overflow-hidden border-b border-border">
            {/* Background Pattern/Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-background dark:from-zinc-900 dark:via-zinc-950 dark:to-black opacity-90" />

            <HeroCarousel banners={mockBanners} />
        </section>
    );
}
