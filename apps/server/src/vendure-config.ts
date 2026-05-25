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

const IS_DEV = process.env.APP_ENV === 'dev';

const serverPort = Number(process.env.PORT) || 3000;

export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,

        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',

        trustProxy: IS_DEV ? false : 1,

        cors: {
            origin: [
                'http://localhost:3000',
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

        cookieOptions: IS_DEV
            ? {
                  secret: process.env.COOKIE_SECRET!,
                  sameSite: 'lax',
              }
            : {
                  secret: process.env.COOKIE_SECRET!,
                  sameSite: 'none',
                  secure: true,
              },
    },

    dbConnectionOptions: {
        type: 'postgres',

        url: process.env.DATABASE_URL,

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

            assetUrlPrefix: IS_DEV
                ? undefined
                : 'https://khukuri-ecommerce.onrender.com/assets/',
        }),

        DefaultSchedulerPlugin.init(),

        DefaultJobQueuePlugin.init({
            useDatabaseForBuffer: true,
        }),

        DefaultSearchPlugin.init({
            bufferUpdates: false,
            indexStockStatus: true,
        }),

        EmailPlugin.init({
            devMode: IS_DEV,

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

            globalTemplateVars: {
                fromAddress:
                    '"Khukuri Store" <noreply@khukuri.com>',

                verifyEmailAddressUrl:
                    'https://khukuri1-store.vercel.app/verify',

                passwordResetUrl:
                    'https://khukuri1-store.vercel.app/password-reset',

                changeEmailAddressUrl:
                    'https://khukuri1-store.vercel.app/verify-email-address-change',
            },
        }),

        DashboardPlugin.init({
            route: 'dashboard',

            appDir: path.join(
                __dirname,
                '../dist/dashboard'
            ),
        }),

        CustomAdminUiPlugin,
    ],
};