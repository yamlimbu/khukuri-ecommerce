import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SITE_URL } from "@/lib/metadata";
import { getSiteSettings } from "@/lib/vendure/cached";
import Script from "next/script";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const GA_MEASUREMENT_ID = "G-XKKJB152D8";

// Fallback constants
const FALLBACK_SITE_NAME = "Himalayan Khukuri House";
const FALLBACK_META_TITLE = "Himalayan Khukuri House - Finest Kukris from Nepal";
const FALLBACK_META_DESCRIPTION =
    "Himalayan Khukuri House Nepal brings you the finest kukris handmade by Nepalese Blacksmiths. High-quality hand-forged blades with a lifetime warranty.";
const FALLBACK_META_KEYWORDS =
    "kukri, khukuri, nepal, handmade kukri, gurkha knife, forged blade";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();

    const siteName = settings.siteName || FALLBACK_SITE_NAME;
    const metaTitle = settings.metaTitle || FALLBACK_META_TITLE;
    const metaDescription = settings.metaDescription || FALLBACK_META_DESCRIPTION;
    const metaKeywords = settings.metaKeywords || FALLBACK_META_KEYWORDS;
    const logoUrl = settings.logo?.preview ?? null;

    // Build favicon metadata
    const icons: Metadata["icons"] = settings.favicon?.preview
        ? {
              icon: settings.favicon.preview,
              apple: settings.favicon.preview,
          }
        : {
              icon: "/favicon.ico",
          };

    return {
        metadataBase: new URL(SITE_URL),
        title: {
            default: metaTitle,
            template: `%s | ${siteName}`,
        },
        description: metaDescription,
        keywords: metaKeywords,
        icons,
        alternates: {
            canonical: SITE_URL,
        },
        openGraph: {
            type: "website",
            siteName,
            locale: "en_US",
            title: metaTitle,
            description: metaDescription,
            url: SITE_URL,
            ...(logoUrl && {
                images: [
                    {
                        url: logoUrl,
                        alt: siteName,
                    },
                ],
            }),
        },
        twitter: {
            card: "summary_large_image",
            title: metaTitle,
            description: metaDescription,
            ...(logoUrl && { images: [logoUrl] }),
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
    };
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Google Analytics */}
                <Script
                    src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_MEASUREMENT_ID}');
                    `}
                </Script>
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
            >
                <Suspense fallback={<div className="min-h-screen" />}>
                    <ThemeProvider>
                        <Navbar />
                        {children}
                        <Footer />
                        <Toaster />
                    </ThemeProvider>
                </Suspense>
            </body>
        </html>
    );
}
