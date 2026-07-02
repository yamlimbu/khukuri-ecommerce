import { cacheLife } from 'next/cache';
import { getTopCollections } from '@/lib/vendure/cached';
import Link from "next/link";

async function Copyright() {
    'use cache';
    cacheLife('max');   // static env var text — never changes

    const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? 'Khukuri House';

    return (
        <div>
            © {new Date().getFullYear()} {shopName}. All rights reserved.
        </div>
    );
}

export async function Footer() {
    // No 'use cache' here — the component renders fresh every request.
    // Data is cached by getTopCollections() internally (cacheTag 'collections').
    // Removing the outer cache avoids stale empty HTML being served for hours.
    const collections = await getTopCollections();
    const shopName = process.env.NEXT_PUBLIC_SHOP_NAME ?? 'Khukuri House';

    return (
        <footer className="border-t border-border bg-card text-card-foreground mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <p className="text-sm font-semibold mb-4 uppercase tracking-wider">
                            {shopName}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold mb-4">Categories</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            {collections.map((collection) => (
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
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
                    <Copyright />
                </div>
            </div>
        </footer>
    );
}