import { Metadata } from "next";
import { notFound } from "next/navigation";
import { query } from "@/lib/vendure/api";
import { SITE_NAME } from "@/lib/metadata";
import { GetPageBySlugQuery } from "@/lib/vendure/queries";
import { normalizeAssetUrl } from "@/lib/utils";
import Image from "next/image";

interface PageProps {
    params: { slug: string };
}

interface PageData {
    title: string;
    content: string;
    featuredImage?: {
        preview: string;
        updatedAt: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const result = await query(GetPageBySlugQuery, { slug: params.slug }).catch(() => null);
    const page = result?.data?.pageBySlug as PageData | null;
    if (!page) {
        return {
            title: `Page Not Found - ${SITE_NAME}`,
        };
    }
    const { title } = page;
    return {
        title: `${title} - ${SITE_NAME}`,
        description: `Read about ${title} on Khukuri House.`,
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const result = await query(GetPageBySlugQuery, { slug: params.slug }).catch(() => null);
    const page = result?.data?.pageBySlug as PageData;

    if (!page) {
        notFound();
    }

    return (
        <article className="min-h-screen py-12 md:py-20 bg-background">
            <div className="container mx-auto px-4 max-w-4xl">
                {page.featuredImage && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 shadow-sm">
                        <Image
                            src={normalizeAssetUrl(page.featuredImage.preview, page.featuredImage.updatedAt) || ''}
                            alt={page.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 1024px"
                            className="object-cover"
                            priority
                        />
                    </div>
                )}
                
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-8">
                    {page.title}
                </h1>
                
                <div 
                    className="prose prose-emerald dark:prose-invert max-w-none text-foreground/90
                    prose-headings:font-serif prose-headings:font-semibold
                    prose-a:text-emerald-600 dark:prose-a:text-emerald-400 hover:prose-a:text-emerald-700
                    prose-img:rounded-lg prose-img:shadow-sm"
                    dangerouslySetInnerHTML={{ __html: page.content }}
                />
            </div>
        </article>
    );
}
