import { addNavMenuSection, registerRouteComponent } from '@vendure/admin-ui/core';
import { BannerComponent } from './components/banner.component';

export default [
    // Register routes
    registerRouteComponent({
        component: BannerComponent,
        path: 'banners',
        title: 'Banners',
        breadcrumb: 'Banners',
    }),
    
    // Register menu item under the existing Marketing section
    addNavMenuSection(
        {
            id: 'custom-section',
            label: 'Content',
            items: [
                {
                    id: 'banners',
                    label: 'Banner',
                    routerLink: ['/extensions/banners'],
                    icon: 'image',
                },
            ],
        },
        'marketing',
    ),
];
