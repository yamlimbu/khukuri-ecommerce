import React from 'react';
import { DetailPage } from '@vendure/dashboard';
import { graphql } from '@/gql';

const GET_BANNER = graphql(/* GraphQL */`
  query GetBanner($id: ID!) {
    banner(id: $id) {
      id
      title
      subtitle
      imageId: image { id }
      primaryButtonLabel
      primaryButtonLink
      secondaryButtonLabel
      secondaryButtonLink
      order
    }
  }
`);

const CREATE_BANNER = graphql(/* GraphQL */`
  mutation CreateBanner($input: CreateBannerInput!) {
    createBanner(input: $input) {
      id
    }
  }
`);

const UPDATE_BANNER = graphql(/* GraphQL */`
  mutation UpdateBanner($input: UpdateBannerInput!) {
    updateBanner(input: $input) {
      id
    }
  }
`);

export const BannerDetail = ({ id }: { id?: string }) => (
  <DetailPage
    queryDocument={GET_BANNER}
    createDocument={CREATE_BANNER}
    updateDocument={UPDATE_BANNER}
    id={id}
  />
);
