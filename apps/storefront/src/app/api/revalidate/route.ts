import {revalidateTag, revalidatePath} from 'next/cache';
import {NextRequest, NextResponse} from 'next/server';

// Supported cache tags that can be revalidated
const VALID_TAGS = [
    'collections',
    'countries',
    'featured-products',
] as const;

// Dynamic tags follow patterns like 'product-{slug}', 'collection-{slug}', 'related-products-{slug}'
const DYNAMIC_TAG_PATTERNS = [
    /^product-.+$/,
    /^collection-.+$/,
    /^related-products-.+$/,
];

function isValidTag(tag: string): boolean {
    if ((VALID_TAGS as readonly string[]).includes(tag)) return true;
    return DYNAMIC_TAG_PATTERNS.some(pattern => pattern.test(tag));
}

export async function POST(request: NextRequest) {
    // Verify the secret token
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.REVALIDATION_SECRET;

    if (!expectedToken) {
        console.error('REVALIDATION_SECRET environment variable not set');
        return NextResponse.json(
            {error: 'Server configuration error'},
            {status: 500}
        );
    }

    if (authHeader !== `Bearer ${expectedToken}`) {
        return NextResponse.json(
            {error: 'Unauthorized'},
            {status: 401}
        );
    }

    try {
        const body = await request.json();
        const {tags} = body;

        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return NextResponse.json(
                {error: 'Missing or invalid "tags" array in request body'},
                {status: 400}
            );
        }

        // Validate and revalidate each tag
        const results: {tag: string; success: boolean; error?: string}[] = [];
        const pathsToRevalidate = new Set<string>();

        // Always revalidate the homepage and search page when catalog changes occur
        pathsToRevalidate.add('/');
        pathsToRevalidate.add('/search');

        for (const tag of tags) {
            if (typeof tag !== 'string') {
                results.push({tag: String(tag), success: false, error: 'Invalid tag type'});
                continue;
            }

            if (!isValidTag(tag)) {
                results.push({tag, success: false, error: 'Unknown tag'});
                continue;
            }

            try {
                // Correct signature for Next.js 16 revalidateTag
                revalidateTag(tag, { expire: 0 });
                results.push({tag, success: true});

                // Deduce path from tag to invalidate page-level HTML caches
                if (tag.startsWith('product-')) {
                    const slug = tag.replace('product-', '');
                    pathsToRevalidate.add(`/product/${slug}`);
                } else if (tag.startsWith('collection-')) {
                    const slug = tag.replace('collection-', '');
                    pathsToRevalidate.add(`/collection/${slug}`);
                } else if (tag.startsWith('related-products-')) {
                    const slug = tag.replace('related-products-', '');
                    pathsToRevalidate.add(`/collection/${slug}`);
                }
            } catch (err: any) {
                results.push({tag, success: false, error: err?.message || 'Revalidation failed'});
            }
        }

        // Revalidate all affected page paths
        for (const path of pathsToRevalidate) {
            try {
                revalidatePath(path);
                console.log(`[Revalidate API] Revalidated path: ${path}`);
            } catch (err) {
                console.error(`[Revalidate API] Failed to revalidate path ${path}:`, err);
            }
        }

        const allSuccessful = results.every(r => r.success);

        return NextResponse.json(
            {
                revalidated: allSuccessful,
                results,
                revalidatedPaths: Array.from(pathsToRevalidate),
                timestamp: Date.now(),
            },
            {status: allSuccessful ? 200 : 207} // 207 = Multi-Status
        );
    } catch {
        return NextResponse.json(
            {error: 'Invalid JSON body'},
            {status: 400}
        );
    }
}
