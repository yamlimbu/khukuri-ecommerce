import { cacheLife } from 'next/cache';
import { getSiteSettings, getTopCollections } from '@/lib/vendure/cached';
import Link from "next/link";

async function Copyright() {
    'use cache';
    cacheLife('max');   // static env var text — never changes

    const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? 'Himalayan Khukuri House';

    return (
        <div className="text-zinc-500 text-xs md:text-sm">
            © {new Date().getFullYear()} {shopName}. All rights reserved. Made in Nepal.
        </div>
    );
}

export async function Footer() {
    const [collections, settings] = await Promise.all([
        getTopCollections(),
        getSiteSettings(),
    ]);
    const shopName = settings.siteName || 'Himalayan Khukuri House';

    return (
        <footer className="border-t border-border bg-card text-card-foreground mt-auto" aria-label="Main Footer">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                    {/* Brand Info & Socials */}
                    <div className="space-y-4">
                        <p className="text-base font-serif font-semibold uppercase tracking-wider text-foreground">
                            {shopName}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Fine authentic hand-forged Gurkha knives and traditional Nepalese kukris crafted by master artisans with a lifetime guarantee.
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-4 pt-2">
                            {settings.facebookUrl && (
                                <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-emerald-500 transition-colors" aria-label="Facebook">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                                </a>
                            )}
                            {settings.instagramUrl && (
                                <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-emerald-500 transition-colors" aria-label="Instagram">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                </a>
                            )}
                            {settings.tiktokUrl && (
                                <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-emerald-500 transition-colors" aria-label="TikTok">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.72-.01 2.92.01 5.84-.02 8.75-.1 1.65-.68 3.28-1.8 4.49-1.64 1.83-4.22 2.65-6.63 2.19-2.28-.42-4.32-2.01-5.13-4.22-.96-2.58-.29-5.73 1.67-7.65 1.62-1.62 4.04-2.25 6.26-1.67v4.07c-1.22-.38-2.61-.09-3.51.81-.88.88-1.07 2.29-.48 3.37.58 1.09 1.93 1.72 3.14 1.42 1.11-.25 1.87-1.28 1.88-2.43.02-3.67.01-7.34.02-11.01-.02-.85.08-1.71.01-2.56z"/></svg>
                                </a>
                            )}
                            {settings.whatsappUrl && (
                                <a href={settings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-emerald-500 transition-colors" aria-label="WhatsApp">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-3.812c1.62.962 3.41 1.47 5.258 1.471 5.503 0 9.979-4.486 9.982-10.011.002-2.677-1.036-5.193-2.925-7.086-1.889-1.891-4.397-2.934-7.063-2.935-5.506 0-9.983 4.486-9.986 10.012-.001 1.947.509 3.849 1.478 5.519L1.938 21.125l4.709-1.237zm11.232-6.529c-.287-.144-1.699-.838-1.962-.934-.263-.096-.454-.144-.646.144-.192.288-.742.934-.91 1.125-.167.192-.335.216-.622.072-.287-.144-1.21-.447-2.306-1.427-.852-.76-1.428-1.7-1.595-1.988-.167-.288-.018-.444.126-.586.13-.127.287-.335.43-.503.144-.168.192-.288.287-.48.096-.192.048-.36-.024-.503-.072-.144-.646-1.558-.885-2.133-.233-.56-.47-.482-.646-.492-.167-.008-.36-.01-.553-.01-.192 0-.503.072-.767.36-.263.288-1.006.984-1.006 2.399 0 1.416 1.03 2.784 1.173 2.976.144.192 2.027 3.096 4.91 4.34.686.296 1.222.473 1.639.605.69.219 1.319.188 1.815.114.553-.083 1.699-.695 1.938-1.367.239-.672.239-1.248.167-1.368-.072-.12-.263-.192-.55-.336z"/></svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Shop (Categories) */}
                    <div>
                        <p className="text-sm font-semibold mb-4 text-foreground uppercase tracking-wider">Shop Categories</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {collections.slice(0, 5).map((collection) => (
                                <li key={collection.id}>
                                    <Link
                                        href={`/collection/${collection.slug}`}
                                        className="hover:text-emerald-500 transition-colors"
                                    >
                                        {collection.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Support */}
                    <div>
                        <p className="text-sm font-semibold mb-4 text-foreground uppercase tracking-wider">Customer Care</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/pages/faq" className="hover:text-emerald-500 transition-colors">Frequently Asked Questions</Link></li>
                            <li><Link href="/pages/shipping" className="hover:text-emerald-500 transition-colors">Shipping &amp; Delivery</Link></li>
                            <li><Link href="/pages/returns" className="hover:text-emerald-500 transition-colors">Returns &amp; Warranty</Link></li>
                            <li><Link href="/pages/contact" className="hover:text-emerald-500 transition-colors">Contact Support</Link></li>
                        </ul>
                    </div>

                    {/* Policy & Info */}
                    <div>
                        <p className="text-sm font-semibold mb-4 text-foreground uppercase tracking-wider">Company Info</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/pages/about" className="hover:text-emerald-500 transition-colors">About Us</Link></li>
                            <li><Link href="/pages/privacy-policy" className="hover:text-emerald-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/pages/terms-of-service" className="hover:text-emerald-500 transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <Copyright />
                    <div className="flex gap-6 text-xs text-zinc-500">
                        <Link href="/pages/privacy-policy" className="hover:underline">Privacy</Link>
                        <Link href="/pages/terms-of-service" className="hover:underline">Terms</Link>
                        <Link href="/sitemap.xml" className="hover:underline">Sitemap</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}