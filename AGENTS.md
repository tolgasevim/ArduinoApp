# Repository Guidelines

## Project Structure & Module Organization
- Root Next.js + TypeScript app; entry pages live in `pages/index.tsx` with app wrappers in `_app.tsx` and `_document.tsx`.
- Reusable UI blocks are in `components/` (icons in `components/icons/`); global styles sit in `styles/globals.css`; static assets live in `public/`.
- Build artifacts in `.next/` are generated; keep code colocated with its section and prefer small, focused components.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies (pnpm 9.x is the expected manager).
- `pnpm dev` starts Next.js with Turbopack HMR - use this for day-to-day work.
- `pnpm lint` runs Next/ESLint with type-aware rules; run before every PR.
- `pnpm build` performs the production compile and type-check; `pnpm start` serves the built app for a local smoke test.

## Coding Style & Naming Conventions
- TypeScript-first; functional React components with PascalCase filenames, camelCase utilities, and descriptive prop names.
- 2-space indentation; group imports as external, aliases (`@/...`), then relatives.
- Styling is inline via Tailwind classes; keep semantic HTML and accessible labels/alt text.
- Store copy or shared assets in `public/`; avoid duplicating literals across files.

## Testing Guidelines
- No automated tests exist yet; add targeted ones when changing behavior or layout.
- Prefer React Testing Library + Vitest (or Playwright for UI flows); name files `*.test.ts(x)` near the code they cover.
- Until tests are added, use `pnpm lint` and `pnpm build` as the minimum pre-PR safety net.

## Commit & Pull Request Guidelines
- History favors short, imperative subjects (e.g., "Upgrade Next.js and React"); keep scope focused and skip trailing periods.
- PRs should include a summary, linked issue, screenshots for UI changes (desktop + mobile when relevant), and commands run (`pnpm lint`, `pnpm build`, plus any tests).
- Call out any follow-up TODOs or known gaps in the PR description to keep backlog visible.

## Security & Configuration Tips
- Do not commit secrets; use `.env.local` for anything sensitive and keep it out of version control.
- After dependency changes, re-run `pnpm install` and restart the dev server to refresh Turbopack caches and ensure consistent output.


