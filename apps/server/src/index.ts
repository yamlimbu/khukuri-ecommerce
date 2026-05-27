import { bootstrap, runMigrations } from '@vendure/core';
import { config } from './vendure-config';
import fs from 'fs';
import path from 'path';

console.log('Vendure starting with', {
    APP_ENV: process.env.APP_ENV,
    NODE_ENV: process.env.NODE_ENV,
    TRUST_PROXY: process.env.TRUST_PROXY,
    trustProxy: config.apiOptions?.trustProxy,
    serverPort: config.apiOptions?.port,
    processEnvPort: process.env.PORT,
});

// Diagnostic: check that the built dashboard assets are present on disk
try {
    const dashboardIndex = path.join(__dirname, '../dist/dashboard/index.html');
    const dashboardAssetsDir = path.join(__dirname, '../dist/dashboard/assets');
    const indexExists = fs.existsSync(dashboardIndex);
    const assetsExist = fs.existsSync(dashboardAssetsDir) && fs.readdirSync(dashboardAssetsDir).length > 0;
    console.log('Dashboard build presence:', { indexExists, assetsExist, dashboardIndex, dashboardAssetsDir });
    if (assetsExist) {
        const files = fs.readdirSync(dashboardAssetsDir).filter(f => f.startsWith('index-') && f.endsWith('.js'));
        console.log('Dashboard main JS candidates:', files.slice(0, 5));
    }
} catch (err) {
    console.error('Error checking dashboard assets:', err);
}

runMigrations(config)
    .then(() => bootstrap(config))
    .catch(err => {
        console.log(err);
    });
