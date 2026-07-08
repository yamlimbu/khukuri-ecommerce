import Link from "next/link";
import { NavbarCollections } from '@/components/layout/navbar/navbar-collections';
import { NavbarCart } from '@/components/layout/navbar/navbar-cart';
import { NavbarUser } from '@/components/layout/navbar/navbar-user';
import { ThemeSwitcher } from '@/components/layout/navbar/theme-switcher';
import { Suspense } from "react";
import { SearchInput } from '@/components/layout/search-input';
import { NavbarUserSkeleton } from '@/components/shared/skeletons/navbar-user-skeleton';
import { SearchInputSkeleton } from '@/components/shared/skeletons/search-input-skeleton';
import { getSiteSettings } from '@/lib/vendure/cached';

export async function Navbar() {
    const settings = await getSiteSettings();

    const logoSrc = settings.logo?.preview ?? '/khukuri-house-khhi-logo-low.jpg';
    const siteName = settings.siteName ?? 'Khukuri House';

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background text-foreground border-border shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="block">
                            <img
                                src={logoSrc}
                                alt={siteName}
                                width={120}
                                height={40}
                                style={{ objectFit: 'contain', height: 40 }}
                            />
                        </Link>
                        <nav className="hidden md:flex items-center gap-6">
                            <Suspense>
                                <NavbarCollections />
                            </Suspense>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex">
                            <Suspense fallback={<SearchInputSkeleton />}>
                                <SearchInput />
                            </Suspense>
                        </div>
                        <ThemeSwitcher />
                        <Suspense>
                            <NavbarCart />
                        </Suspense>
                        <Suspense fallback={<NavbarUserSkeleton />}>
                            <NavbarUser />
                        </Suspense>
                    </div>
                </div>
            </div>
        </header>
    );
}