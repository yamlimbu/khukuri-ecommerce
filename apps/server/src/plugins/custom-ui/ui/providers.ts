import { addNavMenuSection, registerTranslation } from '@vendure/admin-ui/core';

export default [
    addNavMenuSection(
        {
            id: 'custom-section',
            label: 'My Custom Extension',
            items: [
                {
                    id: 'custom-page',
                    label: 'Custom Dashboard Page',
                    routerLink: ['/extensions/custom'],
                    icon: 'star',
                },
            ],
        },
        'settings',
    ),

    registerTranslation('en', {
        login: {
            welcome: 'Welcome to My Custom Admin',
            signIn: 'Sign in to access your dashboard',
        },
    }),
];