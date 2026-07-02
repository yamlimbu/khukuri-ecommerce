import { 
    PluginCommonModule, 
    VendurePlugin, 
    EventBus, 
    ProductEvent, 
    CollectionEvent, 
    ProductVariantEvent, 
    TransactionalConnection, 
    Product, 
    ProductVariant 
} from '@vendure/core';

@VendurePlugin({
    imports: [PluginCommonModule],
    compatibility: '^3.0.0',
})
export class RevalidatePlugin {
    constructor(
        private eventBus: EventBus,
        private connection: TransactionalConnection,
    ) {}

    onBootstrap() {
        // Listen for Product updates (creation, update, deletion)
        this.eventBus.ofType(ProductEvent).subscribe(async event => {
            const product = event.entity;
            if (!product || !product.slug) return;

            const tags = [`product-${product.slug}`, 'featured-products'];

            // Fetch the collections associated with this product's variants
            try {
                const productWithVariants = await this.connection.getRepository(event.ctx, Product).findOne({
                    where: { id: product.id },
                    relations: ['variants', 'variants.collections'],
                });
                if (productWithVariants?.variants) {
                    for (const variant of productWithVariants.variants) {
                        if (variant.collections) {
                            for (const collection of variant.collections) {
                                if (collection.slug) {
                                    tags.push(`collection-${collection.slug}`);
                                    tags.push(`related-products-${collection.slug}`);
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('[RevalidatePlugin] Error fetching collections for product:', err);
            }

            await this.triggerRevalidate(tags);
        });

        // Listen for Collection updates (creation, update, deletion)
        this.eventBus.ofType(CollectionEvent).subscribe(async event => {
            const collection = event.entity;
            if (!collection || !collection.slug) return;

            const tags = [
                `collection-${collection.slug}`,
                `related-products-${collection.slug}`,
                'collections',
                'featured-products',
            ];
            await this.triggerRevalidate(tags);
        });

        // Listen for ProductVariant updates (price, stock, etc.)
        this.eventBus.ofType(ProductVariantEvent).subscribe(async event => {
            const productSlugs = new Set<string>();
            const collectionSlugs = new Set<string>();

            try {
                for (const variant of event.entity) {
                    const variantWithProduct = await this.connection.getRepository(event.ctx, ProductVariant).findOne({
                        where: { id: variant.id },
                        relations: ['product', 'collections'],
                    });

                    if (variantWithProduct?.product) {
                        if (variantWithProduct.product.slug) {
                            productSlugs.add(variantWithProduct.product.slug);
                        }
                    }
                    if (variantWithProduct?.collections) {
                        for (const col of variantWithProduct.collections) {
                            if (col.slug) {
                                collectionSlugs.add(col.slug);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('[RevalidatePlugin] Error fetching product for variant:', err);
            }

            const tags: string[] = [];
            productSlugs.forEach(slug => tags.push(`product-${slug}`));
            collectionSlugs.forEach(slug => {
                tags.push(`collection-${slug}`);
                tags.push(`related-products-${slug}`);
            });

            if (tags.length > 0) {
                tags.push('featured-products');
                await this.triggerRevalidate(tags);
            }
        });
    }

    private async triggerRevalidate(tags: string[]) {
        const secret = process.env.REVALIDATION_SECRET;

        if (!secret) {
            console.warn('[RevalidatePlugin] REVALIDATION_SECRET is not set. Skipping cache revalidation.');
            return;
        }

        // Prefer a direct loopback endpoint to avoid going through Nginx/SSL on the same machine.
        // Set REVALIDATION_ENDPOINT=http://127.0.0.1:3001 in server .env for same-server deployments.
        // Falls back to FRONTEND_URL, then localhost:3001.
        const endpoint = (
            process.env.REVALIDATION_ENDPOINT ||
            process.env.FRONTEND_URL ||
            'http://localhost:3001'
        ).replace(/\/$/, '');

        const url = `${endpoint}/api/revalidate`;

        // Deduplicate tags
        const uniqueTags = Array.from(new Set(tags));

        console.log(`[RevalidatePlugin] Scheduling revalidation to: ${url} for tags:`, uniqueTags);

        // Wait 2 seconds for search indexing jobs to finish before notifying Next.js
        setTimeout(async () => {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10_000); // 10s hard timeout

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${secret}`,
                    },
                    body: JSON.stringify({ tags: uniqueTags }),
                    signal: controller.signal,
                });

                clearTimeout(timer);

                if (!response.ok) {
                    const text = await response.text();
                    console.error(`[RevalidatePlugin] Revalidation failed (status ${response.status}): ${text}`);
                } else {
                    const resJson = await response.json();
                    console.log('[RevalidatePlugin] Revalidation response:', resJson);
                }
            } catch (err: any) {
                clearTimeout(timer);
                if (err?.name === 'AbortError') {
                    console.error('[RevalidatePlugin] Revalidation timed out after 10s.');
                } else {
                    console.error('[RevalidatePlugin] Network error calling revalidation endpoint:', err);
                }
            }
        }, 2000);
    }
}
