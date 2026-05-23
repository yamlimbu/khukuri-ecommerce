import React from 'react';
import { defineDashboardExtension } from '@vendure/dashboard';

export default defineDashboardExtension({
    login: {
        logo: {
            component: () => null
        },
        beforeForm: {
            component: () => (
                <div className="flex flex-col items-center text-center gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Welcome to Khukuri House
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Sign in to access the admin dashboard
                    </p>
                </div>
            )
        }
    }
});
