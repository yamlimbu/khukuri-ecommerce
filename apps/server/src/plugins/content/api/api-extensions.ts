import { gql } from 'graphql-tag';

const commonExtensions = gql`
    type Banner implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        title: String!
        subtitle: String
        image: Asset
        primaryButtonLabel: String
        primaryButtonLink: String
        secondaryButtonLabel: String
        secondaryButtonLink: String
        order: Int!
    }

    type BannerList implements PaginatedList {
        items: [Banner!]!
        totalItems: Int!
    }

    type Page implements Node {
        id: ID!
        createdAt: DateTime!
        updatedAt: DateTime!
        title: String!
        slug: String!
        content: String!
        featuredImage: Asset
        isPublished: Boolean!
    }

    type PageList implements PaginatedList {
        items: [Page!]!
        totalItems: Int!
    }
`;

export const adminApiExtensions = gql`
    ${commonExtensions}

    extend type Query {
        banners: BannerList!
        banner(id: ID!): Banner
        pages: PageList!
        page(id: ID!): Page
    }

    input CreateBannerInput {
        title: String!
        subtitle: String
        imageId: ID
        primaryButtonLabel: String
        primaryButtonLink: String
        secondaryButtonLabel: String
        secondaryButtonLink: String
        order: Int
    }

    input UpdateBannerInput {
        id: ID!
        title: String
        subtitle: String
        imageId: ID
        primaryButtonLabel: String
        primaryButtonLink: String
        secondaryButtonLabel: String
        secondaryButtonLink: String
        order: Int
    }

    input CreatePageInput {
        title: String!
        slug: String!
        content: String!
        featuredImageId: ID
        isPublished: Boolean
    }

    input UpdatePageInput {
        id: ID!
        title: String
        slug: String
        content: String
        featuredImageId: ID
        isPublished: Boolean
    }

    extend type Mutation {
        createBanner(input: CreateBannerInput!): Banner!
        updateBanner(input: UpdateBannerInput!): Banner!
        deleteBanner(id: ID!): DeletionResponse!

        createPage(input: CreatePageInput!): Page!
        updatePage(input: UpdatePageInput!): Page!
        deletePage(id: ID!): DeletionResponse!
    }
`;

export const shopApiExtensions = gql`
    ${commonExtensions}

    extend type Query {
        banners: [Banner!]!
        pages: PageList!
        pageBySlug(slug: String!): Page
    }
`;
