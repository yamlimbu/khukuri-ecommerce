import { VendurePlugin, PluginCommonModule, VendureConfig } from '@vendure/core';
import { gql } from 'graphql-tag';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerService } from './services/banner.service';
import { Banner } from './entities/banner.entity';
import { AdminBannerResolver } from './resolvers/admin-banner.resolver';
import { ShopBannerResolver } from './resolvers/shop-banner.resolver';

/**
 * Defines the admin API schema extensions for Banner management
 */
const adminApiExtensions = gql`
    type Banner {
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

    type BannerList {
        items: [Banner!]!
        totalItems: Int!
    }

    input BannerFilterParameter {
        id: IDOperators
        createdAt: DateOperators
        updatedAt: DateOperators
        title: StringOperators
        subtitle: StringOperators
        primaryButtonLabel: StringOperators
        primaryButtonLink: StringOperators
        secondaryButtonLabel: StringOperators
        secondaryButtonLink: StringOperators
        order: NumberOperators
        _and: [BannerFilterParameter!]
        _or: [BannerFilterParameter!]
    }

    input BannerSortParameter {
        id: SortOrder
        createdAt: SortOrder
        updatedAt: SortOrder
        title: SortOrder
        subtitle: SortOrder
        primaryButtonLabel: SortOrder
        primaryButtonLink: SortOrder
        secondaryButtonLabel: SortOrder
        secondaryButtonLink: SortOrder
        order: SortOrder
    }

    input BannerListOptions {
        skip: Int
        take: Int
        sort: BannerSortParameter
        filter: BannerFilterParameter
        filterOperator: LogicalOperator
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
        title: String
        subtitle: String
        imageId: ID
        primaryButtonLabel: String
        primaryButtonLink: String
        secondaryButtonLabel: String
        secondaryButtonLink: String
        order: Int
    }

    extend type Query {
        banners(options: BannerListOptions): BannerList!
        banner(id: ID!): Banner
    }

    extend type Mutation {
        createBanner(input: CreateBannerInput!): Banner!
        updateBanner(id: ID!, input: UpdateBannerInput!): Banner!
        deleteBanner(id: ID!): Boolean!
    }
`;

/**
 * Defines the shop API schema extensions for Banner queries
 */
const shopApiExtensions = gql`
    type Banner {
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

    extend type Query {
        banners: [Banner!]!
    }
`;

/**
 * Content Plugin Module - Provides Banner and Page management
 */
@Module({
    imports: [PluginCommonModule, TypeOrmModule.forFeature([Banner])],
    providers: [BannerService],
    exports: [BannerService],
})
export class ContentPluginModule {}

/**
 * Vendure Content Plugin for managing banners and pages
 * Exposes GraphQL queries and mutations for both Admin and Shop APIs
 */
@VendurePlugin({
    imports: [ContentPluginModule],
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [AdminBannerResolver],
    },
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [ShopBannerResolver],
    },
})
export class ContentPlugin {}

