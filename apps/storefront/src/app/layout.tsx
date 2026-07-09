import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SITE_URL, buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/metadata";
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

// Fallback constants — only used when Vendure admin has no values set
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

    // Preferred canonical base URL: admin > env var
    const siteUrl = settings.canonicalUrl?.replace(/\/$/, '') || SITE_URL.replace(/\/$/, '');

    // OG image: admin ogImage → admin logo → none
    const ogImageUrl = settings.ogImage?.preview ?? settings.logo?.preview ?? null;

    // Favicon: admin favicon → local /favicon.ico
    const icons: Metadata["icons"] = settings.favicon?.preview
        ? {
              icon: settings.favicon.preview,
              apple: settings.favicon.preview,
          }
        : {
              icon: "/favicon.ico",
          };

    return {
        metadataBase: new URL(siteUrl),
        title: {
            default: metaTitle,
            template: `%s | ${siteName}`,
        },
        description: metaDescription,
        keywords: metaKeywords,
        icons,
        alternates: {
            canonical: siteUrl,
        },
        openGraph: {
            type: "website",
            siteName,
            locale: "en_US",
            title: metaTitle,
            description: metaDescription,
            url: siteUrl,
            ...(ogImageUrl && {
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200,
                        height: 630,
                        alt: siteName,
                    },
                ],
            }),
        },
        twitter: {
            card: "summary_large_image",
            title: metaTitle,
            description: metaDescription,
            ...(ogImageUrl && { images: [ogImageUrl] }),
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
        // Google Search Console & Bing verification (set via env vars)
        ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
            verification: {
                google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
                ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && {
                    other: { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION },
                }),
            },
        }),
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
    // Fetch settings once; used for global JSON-LD
    const settings = await getSiteSettings();
    const orgJsonLd = buildOrganizationJsonLd(settings);
    const websiteJsonLd = buildWebSiteJsonLd(settings);

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Global structured data — Organization + WebSite */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
                />

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
