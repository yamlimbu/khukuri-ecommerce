import { bootstrap, runMigrations } from '@vendure/core';
import { config } from './vendure-config';

console.log('Vendure starting with', {
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    TRUST_PROXY: process.env.TRUST_PROXY,
    trustProxy: config.apiOptions?.trustProxy,
    serverPort: config.apiOptions?.port,
    processEnvPort: process.env.PORT,
});

runMigrations(config)
    .then(() => bootstrap(config))
    .catch(err => {
        console.log(err);
    });
