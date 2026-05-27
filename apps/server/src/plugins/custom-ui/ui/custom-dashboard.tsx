import React, { useEffect } from 'react';
import { defineDashboardExtension } from '@vendure/dashboard';
import { BannersList } from './components/BannersList';
import { BannerDetail } from './components/BannerDetail';
import { PagesList } from './components/PagesList';
import { PageDetail } from './components/PageDetail';

const LoginPageTitle = () => {
    useEffect(() => {
        document.title = 'Khukuri House';
    }, []);

    return (
        <div className="flex flex-col items-center text-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
                Welcome to Khukuri House
            </h1>
            <p className="text-sm text-muted-foreground">
                Sign in to access the admin dashboard
            </p>
        </div>
    );
};

const LoginLogo = () => {
    return null;
};

// Wrapper removed; BannerDetail will receive id via route params

// Wrapper removed; PageDetail will receive id via route params

export default defineDashboardExtension({
    login: {
        logo: {
            component: LoginLogo,
        },
        beforeForm: {
            component: LoginPageTitle,
        },
    },
    navSections: [
        {
            id: 'content-management',
            title: 'Content',
            placement: 'top',
            icon: FileText,
        },
    ],
    routes: [
        {
            path: '/banners',
            component: BannersList,
            navMenuItem: {
                sectionId: 'content-management',
                id: 'banners',
                title: 'Banners',
            },
        },
        {
            path: '/banners/:id',
            component: BannerDetail,
        },
        {
            path: '/pages',
            component: PagesList,
            navMenuItem: {
                sectionId: 'content-management',
                id: 'pages',
                title: 'Pages',
            },
        },
        {
            path: '/pages/:id',
            component: PageDetail,
        },
    ],
});

