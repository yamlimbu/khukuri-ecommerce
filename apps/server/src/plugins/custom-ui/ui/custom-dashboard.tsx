import React, { useEffect } from 'react';
import { defineDashboardExtension } from '@vendure/dashboard';

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

export default defineDashboardExtension({
    login: {
        logo: {
            component: LoginLogo,
        },
        beforeForm: {
            component: LoginPageTitle,
        },
    },
});
