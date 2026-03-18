import Image from 'next/image';
import {FragmentOf, readFragment} from '@/graphql';
import {ProductCardFragment} from '@/lib/vendure/fragments';
import {Price} from '@/components/commerce/price';
import {Suspense} from "react";
import Link from "next/link";

interface ProductCardProps {
    product: FragmentOf<typeof ProductCardFragment>;
}

export function ProductCard({product: productProp}: ProductCardProps) {
    const product = readFragment(ProductCardFragment, productProp);

    return (
        <Link
            href={`/product/${product.slug}`}
            className="group block bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-emerald-700/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all"
        >
            <div className="aspect-square relative bg-zinc-950">
                {product.productAsset ? (
                    <Image
                        src={product.productAsset.preview}
                        alt={product.productName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        No image
                    </div>
                )}
            </div>
            <div className="p-4 space-y-2">
                <h3 className="font-serif font-semibold text-zinc-100 line-clamp-2 group-hover:text-emerald-500 transition-colors">
                    {product.productName}
                </h3>
                <Suspense fallback={<div className="h-8 w-36 rounded bg-zinc-800"></div>}>
                    <p className="text-xl font-bold text-emerald-500">
                        {product.priceWithTax.__typename === 'PriceRange' ? (
                            product.priceWithTax.min !== product.priceWithTax.max ? (
                                <>
                                    from <Price value={product.priceWithTax.min}/>
                                </>
                            ) : (
                                <Price value={product.priceWithTax.min}/>
                            )
                        ) : product.priceWithTax.__typename === 'SinglePrice' ? (
                            <Price value={product.priceWithTax.value}/>
                        ) : null}
                    </p>
                </Suspense>
            </div>
        </Link>
    );
}
