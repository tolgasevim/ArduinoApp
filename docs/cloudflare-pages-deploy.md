# Cloudflare Pages Deploy Runbook

## Prerequisites

- GitHub repository with `main` and protected release branch.
- Cloudflare account.
- Custom domain configured in DNS.

## Build settings

- Framework preset: `Next.js`
- Build command: `pnpm build`
- Output directory: `.next`

## Environment variables

Set these in both `Preview` and `Production`:

- `NEXT_PUBLIC_ANALYTICS_MODE=off`
- `NEXT_PUBLIC_HARDWARE_MODE_ENABLED=true`
- `NEXT_PUBLIC_REGION_NOTICE=us_eu_child`

## Deployment steps

1. Connect GitHub repo to Cloudflare Pages.
2. Configure Preview deploys for pull requests.
3. Configure Production deploys for `main`.
4. Add custom domain and verify HTTPS.
5. Run smoke checks:
   - open homepage
   - run mission checkpoint
   - verify policy pages
   - verify hardware support warning in unsupported browser

## Optional Worker health endpoint

1. Install Wrangler: `npm i -D wrangler` (or use global install).
2. Deploy worker:
   - `npx wrangler deploy`
3. Verify:
   - `GET /health` returns `{"status":"ok", ...}`.

## Rollback

1. Open Cloudflare Pages deployment history.
2. Promote previous healthy deployment.
3. Re-run smoke checks.
