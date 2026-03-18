import { registerRouteComponent } from '@vendure/admin-ui/core';
import { CustomPageComponent } from './components/custom-page.component';

export default [
    registerRouteComponent({
        component: CustomPageComponent,
        path: '',
        title: 'Custom Page',
        breadcrumb: 'Custom Page',
    }),
];
