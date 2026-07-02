# TODO

## Vendure config fixes (APP_ENV local vs production)

- [x] Inspect `apps/server/src/vendure-config.ts` and `apps/server/src/Local_vendure-config.ts` for current URL/email and dbConnectionOptions behavior.
- [x] Build a single source of truth for Frontend/Backend base URLs depending on `APP_ENV === 'local'`.
  - [x] Local: frontend `http://localhost:3001/`, backend `http://localhost:3000/`
  - [x] Else: frontend `https://khukuri1-store.vercel.app/`, backend `https://khukuri-ecommerce.onrender.com/`
- [x] Update EmailPlugin `globalTemplateVars` URLs:
  - [x] verify: `${frontendBase}verify`
  - [x] password-reset: `${frontendBase}password-reset`
  - [x] verify-email-address-change: `${frontendBase}verify-email-address-change`
- [x] Ensure DB connect condition in local uses `DB_*` and applies user/password from env (pg user/pwd).
  - [x] For local: use `database/host/port/username/password` from `DB_*`.
  - [x] For non-local: use `DATABASE_URL`.
- [x] Fix any formatting/type issues (e.g. duplicated/odd `assetUrlPrefix`, `devMode`, `useDatabaseForBuffer` line).
- [x] Run TypeScript build / lint (if available) to validate.
- [x] Run smoke test: start server config compilation.
- [x] Fix storefront `.env.local`: remove inline comments and duplicate `REVALIDATION_SECRET`.
