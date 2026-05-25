import { cacheLife } from "next/cache";
import { query } from "@/lib/vendure/api";
import { GetTopCollectionsQuery } from "@/lib/vendure/queries";
import Link from "next/link";
import Image from "next/image";

async function getTopCategories() {
    'use cache'
    cacheLife('days')

    const result = await query(GetTopCollectionsQuery);
    return result.data.collections.items.slice(0, 5);
}

export async function TopCategories() {
    const categories = await getTopCategories();

    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <section className="py-20 bg-background border-t border-border">
            <div className="sr-only" aria-live="polite">Top Categories</div>

            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-serif text-foreground">Top Categories</h2>
                        <p className="text-muted-foreground mt-2">Explore our most popular collections</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {categories.map((category) => (
                        <Link 
                            key={category.id} 
                            href={`/search?collection=${category.slug}`}
                            className="group relative flex flex-col items-center p-4 bg-card border border-border rounded-lg hover:border-emerald-500/50 transition-all shadow-sm hover:shadow-md"
                        >
                            <div className="w-full aspect-square mb-4 relative rounded-md overflow-hidden bg-muted">
                                {category.featuredAsset ? (
                                    <Image
                                        src={category.featuredAsset.preview}
                                        alt={category.name}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 20vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-muted/50">
                                        <span className="text-muted-foreground text-sm">No Image</span>
                                    </div>
                                )}
                            </div>
                            <h3 className="text-card-foreground font-medium text-center w-full truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">{category.name}</h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
