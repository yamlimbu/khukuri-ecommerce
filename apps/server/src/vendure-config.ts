import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSchedulerPlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';

import {
    defaultEmailHandlers,
    EmailPlugin,
    FileBasedTemplateLoader,
} from '@vendure/email-plugin';

import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { DashboardPlugin } from '@vendure/dashboard/plugin';
import { GraphiqlPlugin } from '@vendure/graphiql-plugin';

import 'dotenv/config';
import path from 'path';




import { CustomAdminUiPlugin } from './plugins/custom-ui/custom-ui.plugin';
import { ContentPlugin } from './plugins/content/content.plugin';
import { RevalidatePlugin } from './plugins/revalidate/revalidate.plugin';



const IS_DEV = process.env.NODE_ENV === 'development';
const TRUST_PROXY_ENV = process.env.TRUST_PROXY;

// Resolve a safe `trustProxy` value for Express/express-rate-limit.
// - If TRUST_PROXY is set, honor: '0'/'false' => 0, '1'/'true' => 1, otherwise pass through string (e.g. '127.0.0.1')
// - If not set, default to trusting exactly one proxy in production (1), and no proxy in development (0).
let trustProxy: number | string;
if (typeof TRUST_PROXY_ENV === 'string') {
    if (TRUST_PROXY_ENV === 'false' || TRUST_PROXY_ENV === '0') {
        trustProxy = 0;
    } else if (TRUST_PROXY_ENV === 'true' || TRUST_PROXY_ENV === '1') {
        trustProxy = 1;
    } else {
        trustProxy = TRUST_PROXY_ENV;
    }
} else {
    trustProxy = process.env.NODE_ENV === 'production' ? 1 : 0;
}

const serverPort = Number(process.env.VENDURE_PORT) || 3000;

// APP_ENV drives environment branching throughout this file:
//   APP_ENV=local     → uses DB_* env vars, localhost URLs, devMode email
//   APP_ENV=production → uses DATABASE_URL, FRONTEND_URL / BACKEND_URL, real email

const isLocal = process.env.APP_ENV === 'local';

// Single source of truth for environment-specific URLs.
// Local:      frontend = http://localhost:3001, backend = http://localhost:3000
// Production: both read from env vars (e.g. https://himalayankhukuri.com)
const frontendBaseUrl = isLocal
    ? 'http://localhost:3001'
    : process.env.FRONTEND_URL!;

const backendBaseUrl = isLocal
    ? 'http://localhost:3000'
    : process.env.BACKEND_URL!;



export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,

        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',

        trustProxy: trustProxy,

        cors: {
            origin: [
                // Local dev origins
                'http://localhost:3000',
                'http://localhost:3001',
                'http://127.0.0.1:3001',

                // Dynamic origins from resolved base URLs
                frontendBaseUrl,
                backendBaseUrl,
            ].filter(Boolean),
            credentials: true,
        },

        ...(IS_DEV
            ? {
                adminApiDebug: true,
                shopApiDebug: true,
            }
            : {}),
    },

    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        requireVerification: false,

        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME!,
            password: process.env.SUPERADMIN_PASSWORD!,
        },

        cookieOptions: {
            secret: process.env.COOKIE_SECRET,
        },
    },

    dbConnectionOptions: {
        type: 'postgres',

        ...(isLocal
            ? {
                database: process.env.DB_NAME,
                schema: process.env.DB_SCHEMA,
                host: process.env.DB_HOST,
                port: +process.env.DB_PORT!,
                username: process.env.DB_USERNAME,
                password: process.env.DB_PASSWORD,
            }
            : {
                // Remote env uses DATABASE_URL
                url: process.env.DATABASE_URL!,
            }),

        synchronize: false,
        migrationsRun: true,

        migrations: [
            path.join(__dirname, './migrations/*.+(js|ts)'),
        ],

        logging: false,
    },

    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },

    customFields: {
        Product: [
            {
                name: 'metaTitle',
                type: 'localeString',
                public: true,
                ui: { hide: true } as any,
            },
            {
                name: 'metaDescription',
                type: 'localeText',
                public: true,
                ui: { hide: true } as any,
            },
        ],
    },

    plugins: [
        GraphiqlPlugin.init(),

        AssetServerPlugin.init({
            route: 'assets',

            assetUploadDir: path.join(
                __dirname,
                '../static/assets'
            ),
            // Use the configured public asset URL prefix in production (even when queried internally via localhost)
            // or let Vendure derive it dynamically in development.
            assetUrlPrefix: process.env.VENDURE_ASSET_URL_PREFIX || undefined,
        }),

        DefaultSchedulerPlugin.init(),

        DefaultJobQueuePlugin.init({
            useDatabaseForBuffer: true,
        }),


        DefaultSearchPlugin.init({
            bufferUpdates: false,
            indexStockStatus: true,
        }),


        ...(isLocal
            // LOCAL: devMode writes emails to disk, never sends
            ? [EmailPlugin.init({
                devMode: true,
                outputPath: path.join(__dirname, '../static/email/test-emails'),
                route: 'mailbox',
                handlers: defaultEmailHandlers,
                templateLoader: new FileBasedTemplateLoader(
                    path.join(__dirname, '../static/email/templates')
                ),
                globalTemplateVars: {
                    fromAddress: '"example" <noreply@example.com>',
                    verifyEmailAddressUrl: `${frontendBaseUrl}/verify`,
                    passwordResetUrl: `${frontendBaseUrl}/password-reset`,
                    changeEmailAddressUrl: `${frontendBaseUrl}/verify-email-address-change`,
                },
            })]
            // PRODUCTION: devMode: false — real emails delivered via SMTP transport
            // Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server .env to enable.
            : [EmailPlugin.init({
                transport: process.env.SMTP_HOST
                    ? {
                        type: 'smtp',
                        host: process.env.SMTP_HOST,
                        port: Number(process.env.SMTP_PORT) || 587,
                        auth: {
                            user: process.env.SMTP_USER!,
                            pass: process.env.SMTP_PASS!,
                        },
                    }
                    : { type: 'none' as const }, // no-op until SMTP vars are set
                handlers: defaultEmailHandlers,
                templateLoader: new FileBasedTemplateLoader(
                    path.join(__dirname, '../static/email/templates')
                ),
                globalTemplateVars: {
                    fromAddress: '"Khukuri Store" <noreply@khukuri.com>',
                    verifyEmailAddressUrl: `${frontendBaseUrl}/verify`,
                    passwordResetUrl: `${frontendBaseUrl}/password-reset`,
                    changeEmailAddressUrl: `${frontendBaseUrl}/verify-email-address-change`,
                },
            })]),

        DashboardPlugin.init({
            route: 'dashboard',

            // IMPORTANT: render your dashboard extension from the Vite build output.
            // This path must match apps/server/vite.config.mts outDir.
            appDir: path.join(__dirname, '../dist/dashboard'),
        }),

        CustomAdminUiPlugin,
        ContentPlugin,
        RevalidatePlugin,
    ],
};

