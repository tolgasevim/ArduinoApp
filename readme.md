# Arduino Quest

Arduino Quest is a web app that helps beginners learn Arduino through short, game-like missions.

## Current status

Phase 1 implementation has started with:

- Next.js + TypeScript + Tailwind scaffold
- App shell and homepage mission flow stub
- Lesson schema and missions 1-6 content
- Local progress storage utilities
- Optional Web Serial hardware mode panel (capability checks + connect/disconnect + serial monitor)
- Unit tests for mission validator and progress engine

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

