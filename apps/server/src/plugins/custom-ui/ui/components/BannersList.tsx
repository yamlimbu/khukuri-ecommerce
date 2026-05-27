import React from 'react';
import { ListPage } from '@vendure/dashboard';
import { graphql } from '@/gql';

const GET_BANNERS = graphql(/* GraphQL */`
  query GetBanners($options: BannerListOptions) {
    banners(options: $options) {
      items {
        id
        title
        subtitle
        order
      }
      totalItems
    }
  }
`);

const DELETE_BANNER = graphql(/* GraphQL */`
  mutation DeleteBanner($id: ID!) {
    deleteBanner(id: $id) {
      result
      message
    }
  }
`);

export const BannersList = () => (
  <ListPage
    listQuery={GET_BANNERS}
    deleteMutation={DELETE_BANNER}
    // Optionally customize displayed columns
    customizeColumns={(cols) => cols}
  />
);
