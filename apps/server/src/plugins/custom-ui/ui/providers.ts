import { addNavMenuSection } from '@vendure/admin-ui/core';

export default [
    addNavMenuSection({
        id: 'custom-section',
        label: 'My Custom Extension',
        items: [{
            id: 'custom-page',
            label: 'Custom Dashboard Page',
            routerLink: ['/extensions/custom'],
            icon: 'star',
        }],
    },
    'settings'),
];
