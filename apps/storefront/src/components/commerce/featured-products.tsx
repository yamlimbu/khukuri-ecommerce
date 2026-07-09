import {ProductCarousel} from "@/components/commerce/product-carousel";
import {cacheLife, cacheTag} from "next/cache";
import {query} from "@/lib/vendure/api";
import {GetCollectionProductsQuery} from "@/lib/vendure/queries";

async function getFeaturedCollectionProducts() {
    'use cache'
    cacheLife('hours')  // 'days' → 'hours': product updates appear within 1h max
    cacheTag('featured-products', 'products')

    // TODO: replace 'electronics' with your actual featured collection slug
    // e.g. 'khukuri', 'featured', or whichever collection you want on the homepage
    const result = await query(GetCollectionProductsQuery, {
        slug: "electronics",
        input: {
            collectionSlug: "electronics",
            take: 12,
            skip: 0,
            groupByProduct: true
        }
    });

    return result.data?.search?.items ?? [];
}


export async function FeaturedProducts() {
    const products = await getFeaturedCollectionProducts();

    return (
        <ProductCarousel
            title="Featured Products"
            products={products}
        />
    )
}