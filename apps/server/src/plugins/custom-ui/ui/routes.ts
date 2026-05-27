import { registerRouteComponent } from '@vendure/admin-ui/core';
import { CustomPageComponent } from './components/custom-page.component';
import { BannerComponent } from './components/banner.component';
import { PageComponent } from './components/page.component';

export default [
    registerRouteComponent({
        component: CustomPageComponent,
        path: '',
        title: 'Custom Page',
        breadcrumb: 'Custom Page',
    }),
    registerRouteComponent({
        component: BannerComponent,
        path: 'banners',
        title: 'Banners',
        breadcrumb: 'Banners',
    }),
    registerRouteComponent({
        component: PageComponent,
        path: 'pages',
        title: 'Pages',
        breadcrumb: 'Pages',
    }),
];
