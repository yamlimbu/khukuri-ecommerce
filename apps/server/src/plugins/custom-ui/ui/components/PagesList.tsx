import React from 'react';
import { ListPage } from '@vendure/dashboard';
import { graphql } from '@/gql';

const GET_PAGES = graphql(/* GraphQL */`
  query GetPages($options: PageListOptions) {
    pages(options: $options) {
      items {
        id
        title
        slug
        isPublished
      }
      totalItems
    }
  }
`);

const DELETE_PAGE = graphql(/* GraphQL */`
  mutation DeletePage($id: ID!) {
    deletePage(id: $id) {
      result
      message
    }
  }
`);

export const PagesList = () => (
  <ListPage
    listQuery={GET_PAGES}
    deleteMutation={DELETE_PAGE}
    // optional column customization
    customizeColumns={(cols) => cols}
  />
);
