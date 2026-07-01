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
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
        const secret = process.env.REVALIDATION_SECRET;
        
        if (!secret) {
            console.warn('[RevalidatePlugin] REVALIDATION_SECRET environment variable is not set. Skipping cache revalidation.');
            return;
        }

        const url = `${frontendUrl.replace(/\/$/, '')}/api/revalidate`;
        console.log(`[RevalidatePlugin] Sending revalidation request to: ${url} for tags:`, tags);

        // Deduplicate tags
        const uniqueTags = Array.from(new Set(tags));

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${secret}`,
                },
                body: JSON.stringify({ tags: uniqueTags }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error(`[RevalidatePlugin] Revalidation failed (status ${response.status}): ${text}`);
            } else {
                const resJson = await response.json();
                console.log('[RevalidatePlugin] Revalidation response:', resJson);
            }
        } catch (err) {
            console.error('[RevalidatePlugin] Network error calling revalidation endpoint:', err);
        }
    }
}
