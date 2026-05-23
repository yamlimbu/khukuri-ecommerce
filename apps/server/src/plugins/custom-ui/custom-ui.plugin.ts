import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import path from 'path';

@VendurePlugin({
    imports: [PluginCommonModule],
    dashboard: {
        location: './ui/custom-dashboard.tsx',
    },
})
export class CustomAdminUiPlugin {
}
