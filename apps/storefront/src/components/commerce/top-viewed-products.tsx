import { cacheLife } from "next/cache";
import { query } from "@/lib/vendure/api";
import { SearchProductsQuery } from "@/lib/vendure/queries";
import { ProductCard } from "./product-card";
import { ProductCardFragment } from "@/lib/vendure/fragments";
import { FragmentOf, readFragment } from "@/graphql";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export async function TopViewedProducts() {
    'use cache';
    cacheLife('days');

    const result = await query(SearchProductsQuery, {
        input: { take: 10, groupByProduct: true }
    });

    const products = result.data.search.items as Array<FragmentOf<typeof ProductCardFragment>>;

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="py-16 bg-muted/20 border-t border-border">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-serif text-foreground">Top Viewed Products</h2>
                        <p className="text-muted-foreground mt-2">Discover what everyone is looking at</p>
                    </div>
                    <Link href="/search" className="hidden sm:flex items-center text-primary hover:underline font-medium">
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>

                <div className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {products.map((product) => {
                        const productFragment = readFragment(ProductCardFragment, product);
                        return (
                            <div key={productFragment.productId} className="flex-none w-64 md:w-72 snap-start">
                                <ProductCard product={product} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
