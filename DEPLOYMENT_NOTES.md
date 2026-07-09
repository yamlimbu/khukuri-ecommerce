# Deployment Notes — himalayankhukuri.com

> **Production URL**: https://himalayankhukuri.com
> **CI/CD**: GitHub Actions → SSH deploy on push to `main`
> **Workflow file**: `.github/workflows/webpack.yml`

---

## How CI/CD Works (webpack.yml)

Every push to the `main` branch automatically:

1. SSHs into the production server (`DEV_HOSTNAME`)
2. `git pull origin main` — pulls latest code
3. `npm install` — installs any new dependencies
4. Builds Vendure backend: `NODE_ENV=production npm run build -w server`
5. Restarts `vendure-backend` and `vendure-worker` via PM2
6. Waits 8s for backend to bind on port **3002**
7. Builds Next.js storefront: `npm run build -w storefront`
8. Restarts `khukuri-storefront` on port **3001** via PM2
9. Waits 15s, then busts Next.js cache tags (`featured-products`, `collections`, `banners`, `products`)

---

## Migration Behaviour — Does It Run Automatically?

**YES — migrations run automatically on every deploy.** No manual step needed.

### Why it is automatic:

**`apps/server/src/index.ts`** (server entry point):
```ts
runMigrations(config)
  .then(() => bootstrap(config))
```

**`apps/server/src/vendure-config.ts`**:
```ts
synchronize: false,
migrationsRun: true,
migrations: [
  path.join(__dirname, './migrations/*.+(js|ts)')
]
```

### What this means for the `site_setting` table migration:

Migration `1783526928440-ContentPlugin.ts` creates the `site_setting` table (SEO/meta/social settings).

When your SEO branch is **merged into `main`** and pushed:
1. CI pulls the new migration file via `git pull`
2. Backend build compiles it into `dist/migrations/`
3. `runMigrations()` runs **before** `bootstrap()` on PM2 restart
4. TypeORM checks its internal `migrations` table — if this migration hasn't run yet on production DB, it executes `up()` automatically

✅ **You do NOT need to run the migration separately.**

> TypeORM tracks which migrations have already run. It will never re-run a migration that already succeeded.

---

## Steps to Deploy SEO Changes to Production

### 1. Make sure your SEO branch builds cleanly

```bash
npm run build -w server
npm run build -w storefront
```

### 2. Merge into main and push

```bash
git checkout main
git merge your-seo-branch
git push origin main
```

### 3. CI/CD triggers automatically

Monitor at: **GitHub → Repository → Actions tab**

Full pipeline time: ~3–5 minutes

### 4. Verify on production after deploy

- https://himalayankhukuri.com — site loads correctly
- `GET https://himalayankhukuri.com/api/settings` — returns JSON with site settings (confirms `site_setting` table was created and Nginx routes this to the backend)
- Admin dashboard → Settings tab — loads without error

> **Nginx requirement**: The Nginx config must have an **exact-match** `location = /api/settings` block that proxies to port 3002 (Vendure backend) **before** the storefront catch-all `location /` block. The CI/CD script patches this automatically on deploy. If the Settings page shows a 400/404 error, manually add this to your Nginx site config:
> ```nginx
>     # Route Vendure custom REST settings API to backend
>     location = /api/settings {
>         proxy_pass http://127.0.0.1:3002;
>         proxy_http_version 1.1;
>         proxy_set_header Host $host;
>         proxy_set_header X-Real-IP $remote_addr;
>         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
>         proxy_set_header X-Forwarded-Proto $scheme;
>     }
> ```
> Then run `sudo nginx -t && sudo nginx -s reload`.

---

## PM2 Process Map

| Process              | Port | Description             |
|----------------------|------|-------------------------|
| `vendure-backend`    | 3002 | Vendure GraphQL + Admin |
| `vendure-worker`     | —    | Background job queue    |
| `khukuri-storefront` | 3001 | Next.js storefront      |

Public traffic → Nginx → ports 3001 / 3002

---

## Cache Tags Auto-Busted After Every Deploy

```json
["featured-products", "collections", "banners", "products"]
```

> The `settings` cache tag is revalidated separately when site settings are saved from the admin dashboard.

---

## If Something Goes Wrong

**Check PM2 logs on the server:**
```bash
npx pm2 logs vendure-backend --lines 100
npx pm2 logs khukuri-storefront --lines 100
```

**Check migration status:**
```bash
# In the DB, inspect the migrations table
SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 10;
```

**Emergency rollback:**
```bash
git revert <commit-hash>
git push origin main
# CI/CD redeploys automatically
```

For database migration rollback, SSH into server and run the `down()` migration manually.


