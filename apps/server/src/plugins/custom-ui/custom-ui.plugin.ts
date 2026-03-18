import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import path from 'path';

@VendurePlugin({
    imports: [PluginCommonModule],
})
export class CustomAdminUiPlugin {
    static ui = {
        id: 'custom-ui-extension',
        extensionPath: path.join(__dirname, 'ui'),
        routes: [{ route: 'custom', filePath: 'routes.ts' }],
        providers: ['providers.ts'],
    };
}
