# Arduino Quest

Arduino Quest is a simulator-first web app that teaches Arduino through short, reward-based missions for beginners.

## Prime-time baseline implemented

- 12 lesson missions with typed schema, prerequisites, safety notes, and validator versions.
- Evidence-based checkpoint validator with deterministic profiles.
- Simulator snapshots with normalized event output.
- Optional Web Serial hardware mode with connection-state model and simulator fallback.
- Runtime flags:
  - `NEXT_PUBLIC_ANALYTICS_MODE` (launch default `off`)
  - `NEXT_PUBLIC_HARDWARE_MODE_ENABLED`
  - `NEXT_PUBLIC_REGION_NOTICE`
- Policy pages: `Privacy`, `Parents`, `Terms`, `Safety`.
- CI workflow (`lint`, `test`, `build`) for PR and main.
- Deployment and operations docs for Cloudflare Pages.

## Development

```bash
pnpm install
pnpm dev
```

## Validation

```bash
pnpm lint
pnpm test
pnpm build
```

## Runtime config

Copy `.env.example` values into `.env.local` when needed.

## Deployment docs

- `docs/cloudflare-pages-deploy.md`
- `docs/pilot-launch-checklist.md`
- `docs/incident-response-runbook.md`
- `docs/legal-gate-checklist.md`

