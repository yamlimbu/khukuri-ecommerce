import { generateMigration } from '@vendure/core';
import { config } from './vendure-config';

generateMigration(config, {
    name: 'ContentPlugin',
    outputDir: './src/migrations',
})
.then(() => {
    console.log('Migration generated successfully');
    process.exit(0);
})
.catch(err => {
    console.error('Error generating migration:', err);
    process.exit(1);
});
