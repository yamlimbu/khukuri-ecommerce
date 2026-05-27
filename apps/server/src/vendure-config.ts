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
import fs from 'fs';
import path from 'path';

import { CustomAdminUiPlugin } from './plugins/custom-ui/custom-ui.plugin';

declare const require: any;

// Lazy load ContentPlugin - only load when config is instantiated, not during build
let contentPluginCache: any = null;
function getContentPlugin(): any {
    if (contentPluginCache) {
        return contentPluginCache;
    }

    const contentPluginPath = path.resolve(__dirname, '../dist/plugins/content/content.plugin.js');
    
    if (!fs.existsSync(contentPluginPath)) {
        // During build, the dist might not exist yet - return null to skip
        console.warn(`ContentPlugin dist not found at ${contentPluginPath} - skipping plugin load during build`);
        return null;
    }

    try {
        contentPluginCache = require(contentPluginPath).ContentPlugin;
        return contentPluginCache;
    } catch (err) {
        console.error(`Failed to load ContentPlugin from ${contentPluginPath}:`, err);
        return null;
    }
}

const IS_DEV = process.env.APP_ENV === 'dev' || process.env.NODE_ENV === 'development';
const TRUST_PROXY_ENV = process.env.TRUST_PROXY;
const trustProxy = typeof TRUST_PROXY_ENV === 'string'
    ? TRUST_PROXY_ENV !== 'false' && TRUST_PROXY_ENV !== '0'
    : !IS_DEV;

const serverPort = Number(process.env.PORT) || 3000;

// In this config file, we rely on the `dbConnectionOptions` branch:
// - APP_ENV === 'local' uses DB_* variables
// - otherwise uses DATABASE_URL

const isLocal = process.env.APP_ENV === 'local';

const frontendBaseUrl = isLocal
    ? 'http://localhost:3001'
    : 'https://khukuri1-store.vercel.app';

const backendBaseUrl = isLocal
    ? 'http://localhost:3000'
    : 'https://khukuri-ecommerce.onrender.com';


export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,

        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',

        trustProxy: trustProxy,

        cors: {
            origin: [
                'http://localhost:3000','https://khukuri-ecommerce.onrender.com',
                'http://localhost:3001',
                'https://khukuri1-store.vercel.app',
            ],
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

        migrations: [
            path.join(__dirname, './migrations/*.+(js|ts)'),
        ],

        logging: false,
    },

    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },

    customFields: {},

    plugins: [
        GraphiqlPlugin.init(),

        AssetServerPlugin.init({
            route: 'assets',

            assetUploadDir: path.join(
                __dirname,
                '../static/assets'
            ),

            // In production, make sure Vendure generates asset URLs that point to the Render backend.
            // In dev, leave it undefined so Vendure can derive it correctly.
            assetUrlPrefix: IS_DEV ? undefined : 'https://khukuri-ecommerce.onrender.com/assets/',
        }),

        DefaultSchedulerPlugin.init(),

        DefaultJobQueuePlugin.init({
            useDatabaseForBuffer: true,
        }),


        DefaultSearchPlugin.init({
            bufferUpdates: false,
            indexStockStatus: true,
        }),

        ...(getContentPlugin() ? [getContentPlugin()] : []),

        EmailPlugin.init({
                       devMode: true,

            outputPath: path.join(
                __dirname,
                '../static/email/test-emails'
            ),

            route: 'mailbox',

            handlers: defaultEmailHandlers,

            templateLoader: new FileBasedTemplateLoader(
                path.join(
                    __dirname,
                    '../static/email/templates'
                )
            ),


            ...(isLocal
                ? {
                      globalTemplateVars: {
                          // The following variables will change depending on your storefront implementation.
                          // Here we are assuming a storefront running at http://localhost:3001.
                          fromAddress: '"example" <noreply@example.com>',
                          verifyEmailAddressUrl: `${frontendBaseUrl}/verify`,
                          passwordResetUrl: `${frontendBaseUrl}/password-reset`,
                          changeEmailAddressUrl: `${frontendBaseUrl}/verify-email-address-change`,
                      },
                  }
                : {
                      // Remote env uses DATABASE_URL
                      globalTemplateVars: {
                          fromAddress: '"Khukuri Store" <noreply@khukuri.com>',
                          verifyEmailAddressUrl: `${frontendBaseUrl}/verify`,
                          passwordResetUrl: `${frontendBaseUrl}/password-reset`,
                          changeEmailAddressUrl: `${frontendBaseUrl}/verify-email-address-change`,
                      },
                  }),


            
            
        }),

        DashboardPlugin.init({
            route: 'dashboard',

            // IMPORTANT: render your dashboard extension from the Vite build output.
            // This path must match apps/server/vite.config.mts outDir.
            appDir: path.join(__dirname, '../dist/dashboard'),
        }),

        CustomAdminUiPlugin,
    ],
};

