import React from 'react';
import { Page, PageBlock, PageLayout, PageTitle } from '@vendure/dashboard';

export const BannerExtension = () => (
    <Page pageId="banner-page">
        <PageTitle>Banners</PageTitle>
        <PageLayout>
            <PageBlock column="main" blockId="banners-info">
                <h2 className="text-xl font-semibold">Dynamic Banners</h2>
                <p className="text-muted-foreground mt-2">
                    Use this page to manage banner content that appears in your storefront hero section.
                </p>
            </PageBlock>
        </PageLayout>
    </Page>
);
