import type { TadaDocumentNode } from 'gql.tada';
import { print } from 'graphql';
import { getAuthToken } from '@/lib/auth';

const VENDURE_API_URL = process.env.VENDURE_SHOP_API_URL || process.env.NEXT_PUBLIC_VENDURE_SHOP_API_URL;
const VENDURE_CHANNEL_TOKEN = process.env.VENDURE_CHANNEL_TOKEN || process.env.NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN || '__default_channel__';
const VENDURE_AUTH_TOKEN_HEADER = process.env.VENDURE_AUTH_TOKEN_HEADER || 'vendure-auth-token';
const VENDURE_CHANNEL_TOKEN_HEADER = process.env.VENDURE_CHANNEL_TOKEN_HEADER || 'vendure-token';

console.log('VENDURE_API_URL=', VENDURE_API_URL);

if (!VENDURE_API_URL) {
    throw new Error('VENDURE_SHOP_API_URL or NEXT_PUBLIC_VENDURE_SHOP_API_URL environment variable is not set');
}

if (process.env.VERCEL === '1' && VENDURE_API_URL.startsWith('http://localhost')) {
    throw new Error('VENDURE_SHOP_API_URL is set to localhost in Vercel. Use a publicly reachable Vendure API URL instead of http://localhost:3000/shop-api');
}

interface VendureRequestOptions {
    token?: string;
    useAuthToken?: boolean;
    channelToken?: string;
    fetch?: RequestInit;
    tags?: string[];
}

interface VendureResponse<T> {
    data?: T;
    errors?: Array<{ message: string;[key: string]: unknown }>;
}

/**
 * Extract the Vendure auth token from response headers
 */
function extractAuthToken(headers: Headers): string | null {
    return headers.get(VENDURE_AUTH_TOKEN_HEADER);
}


/**
 * Execute a GraphQL query against the Vendure API
 */
export async function query<TResult, TVariables>(
    document: TadaDocumentNode<TResult, TVariables>,
    ...[variables, options]: TVariables extends Record<string, never>
        ? [variables?: TVariables, options?: VendureRequestOptions]
        : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
    const {
        token,
        useAuthToken,
        channelToken,
        fetch: fetchOptions,
        tags,
    } = options || {};

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions?.headers as Record<string, string>),
    };

    // Use the explicitly provided token, or fetch from cookies if useAuthToken is true
    let authToken = token;
    if (useAuthToken && !authToken) {
        authToken = await getAuthToken();
    }

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Set the channel token header (use provided channelToken or default)
    headers[VENDURE_CHANNEL_TOKEN_HEADER] = channelToken || VENDURE_CHANNEL_TOKEN;

    let response: Response;
    try {
        response = await fetch(VENDURE_API_URL!, {
            ...fetchOptions,
            method: 'POST',
            headers,
            body: JSON.stringify({
                query: print(document),
                variables: variables || {},
            }),
            ...(tags && { next: { tags } }),
        });
    } catch (error) {
        console.warn(`[Vendure API Warning] Fetch failed for query: ${print(document).split('\n')[0].trim()}. Error:`, error);
        return {
            data: {} as TResult,
        };
    }

    if (!response.ok) {
        console.warn(
            `[Vendure API Warning] HTTP ${response.status} for query: ${print(document).split('\n')[0].trim()}`
        );
        return {
            data: {} as TResult,
        };
    }

    const result: VendureResponse<TResult> = await response.json();

    if (result.errors) {
        console.warn(
            `[Vendure API Warning] GraphQL errors for query: ${print(document).split('\n')[0].trim()}:`,
            result.errors.map(e => e.message).join(', ')
        );
        return {
            data: {} as TResult,
        };
    }

    if (!result.data) {
        console.warn(`[Vendure API Warning] No data returned for query: ${print(document).split('\n')[0].trim()}`);
        return {
            data: {} as TResult,
        };
    }

    const newToken = extractAuthToken(response.headers);

    return {
        data: result.data,
        ...(newToken && { token: newToken }),
    };
}

/**
 * Execute a GraphQL mutation against the Vendure API
 */
export async function mutate<TResult, TVariables>(
    document: TadaDocumentNode<TResult, TVariables>,
    ...[variables, options]: TVariables extends Record<string, never>
        ? [variables?: TVariables, options?: VendureRequestOptions]
        : [variables: TVariables, options?: VendureRequestOptions]
): Promise<{ data: TResult; token?: string }> {
    // Mutations use the same underlying implementation as queries in GraphQL
    // @ts-expect-error - Complex conditional type inference, runtime behavior is correct
    return query(document, variables, options);
}
