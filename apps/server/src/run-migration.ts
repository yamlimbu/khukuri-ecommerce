import { bootstrapWorker } from '@vendure/core';
import { config } from './vendure-config';
import { DataSource } from 'typeorm';

async function run() {
    const worker = await bootstrapWorker(config);
    console.log('Worker bootstrapped, migrations should have run.');
    process.exit(0);
}

run();
