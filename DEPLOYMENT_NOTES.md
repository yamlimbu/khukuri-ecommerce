# Render Deployment Fix Summary

## Problem
**Error on Render**: `Cannot query field "banners" on type "Query". Did you mean "channels"?`

This occurred because the `banners` GraphQL query was not exposed on the shop API, even though:
1. The Banner table existed in the database
2. Locally the query worked fine
3. The migration was successful

## Root Cause
The **ContentPlugin** that exposes the `banners` query through GraphQL schema extensions was completely missing from the codebase. Without the plugin, Vendure had no knowledge of the Banner entity or queries.

## Solution Implemented

### New Files Created (apps/server/src/plugins/content/):
```
├── content.plugin.ts              # Main plugin with GraphQL extensions
├── entities/
│   └── banner.entity.ts          # TypeORM entity definition
├── services/
│   └── banner.service.ts         # Business logic for CRUD
└── resolvers/
    ├── admin-banner.resolver.ts  # Admin API queries/mutations
    └── shop-banner.resolver.ts   # Shop API queries (public)
```

### Changes to Existing Files:
- **vendure-config.ts**: Added `import { ContentPlugin }` and registered it in the plugins array
- **tsconfig.json**: No changes needed

### GraphQL Schema Extensions:

**Shop API** (Public):
```graphql
extend type Query {
  banners: [Banner!]!
}
```

**Admin API** (SuperAdmin):
```graphql
extend type Query {
  banners(options: BannerListOptions): BannerList!
  banner(id: ID!): Banner
}

extend type Mutation {
  createBanner(input: CreateBannerInput!): Banner!
  updateBanner(id: ID!, input: UpdateBannerInput!): Banner!
  deleteBanner(id: ID!): Boolean!
}
```

## Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add apps/server/src/plugins/content/
   git add apps/server/src/vendure-config.ts
   git commit -m "feat: add ContentPlugin for banner management

   - Create ContentPlugin with GraphQL schema extensions
   - Expose banners query on shop API
   - Add admin CRUD mutations for banner management
   - Fix 'Cannot query field banners' error on Render deployment"
   git push origin main
   ```

2. **Render Auto-Deployment**:
   - Render will detect the push and automatically trigger a build
   - The new ContentPlugin will be compiled during `npm run build:server`
   - Monitor the deployment logs for success

3. **Verification** (after deployment):
   - Dashboard: https://khukuri-ecommerce.onrender.com/dashboard/
   - GraphQL Playground: https://khukuri-ecommerce.onrender.com/shop-api
   - Query:
     ```graphql
     query {
       banners {
         id
         title
         image { preview }
       }
     }
     ```

## Expected Results After Deployment

✅ Shop API will have `banners` query available  
✅ Frontend hero section will fetch and display banners  
✅ Admin dashboard can manage banners (create/update/delete)  
✅ Image associations properly loaded with Asset relations  

## Rollback (if needed)
If there are issues after deployment, revert the commit:
```bash
git revert <commit-hash>
git push origin main
```

## Testing Checklist
- [ ] Local build succeeds: `npm run build:server`
- [ ] Local server starts: `npm run dev:server`
- [ ] Shop API query works: `{ banners { id title } }`
- [ ] Admin can create banner
- [ ] Frontend displays banners
- [ ] Render deployment completes
- [ ] Render shop API query returns banners
- [ ] Frontend on Vercel displays banners
