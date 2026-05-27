import React from 'react';
import { Page, PageBlock, PageLayout, PageTitle } from '@vendure/dashboard';

export const PagesExtension = () => (
    <Page pageId="pages-page">
        <PageTitle>Pages</PageTitle>
        <PageLayout>
            <PageBlock column="main" blockId="pages-info">
                <h2 className="text-xl font-semibold">Dynamic Pages</h2>
                <p className="text-muted-foreground mt-2">
                    Use this page to manage dynamic storefront pages and their content.
                </p>
            </PageBlock>
        </PageLayout>
    </Page>
);
