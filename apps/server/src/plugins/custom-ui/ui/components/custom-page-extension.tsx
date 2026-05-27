import React from 'react';
import { Page, PageBlock, PageLayout, PageTitle } from '@vendure/dashboard';

export const CustomPageExtension = () => (
    <Page pageId="custom-page">
        <PageTitle>Custom Dashboard Page</PageTitle>
        <PageLayout>
            <PageBlock column="main" blockId="custom-page-info">
                <p>This is a custom dashboard page integrated with your Vendure admin UI.</p>
            </PageBlock>
        </PageLayout>
    </Page>
);
