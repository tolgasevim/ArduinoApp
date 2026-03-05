# CLAUDE.md — Arduino Quest

Arduino Quest is a **simulator-first web app** that teaches Arduino programming through short, reward-based missions aimed at beginners (including children). This file documents the codebase structure, development workflows, and conventions AI assistants must follow.

---

## Project Overview

- **Stack**: Next.js 15 (Pages Router) + React 19 + TypeScript 5, styled with Tailwind CSS 3
- **Package manager**: pnpm 9.x (always use `pnpm`, never `npm` or `yarn`)
- **Test runner**: Vitest 3 (`pnpm test`)
- **Deployment target**: Cloudflare Pages (frontend) + Cloudflare Workers (health endpoint)
- **Path alias**: `@/` maps to the repo root (configured in `tsconfig.json` and `vitest.config.ts`)

---

## Directory Structure

```
ArduinoApp/
├── pages/                  # Next.js Pages Router — one file per route
│   ├── index.tsx           # Main app shell + all mission state logic
│   ├── _app.tsx            # Global layout wrapper
│   ├── _document.tsx       # Custom HTML document
│   ├── parents.tsx         # Parents info page
│   ├── terms.tsx           # Terms of service
│   ├── privacy.tsx         # Privacy policy
│   └── safety.tsx          # Safety information
│
├── components/             # Reusable React UI components (PascalCase filenames)
│   ├── AppShell.tsx        # Top-level layout wrapper with header/footer slots
│   ├── MissionCard.tsx     # Main mission display: code editor, hints, validation UI
│   ├── OnboardingCard.tsx  # Nickname entry card shown on first visit
│   ├── ProgressSummary.tsx # XP / level / badge / streak display bar
│   ├── HardwareModePanel.tsx # Toggle between simulator and hardware (Web Serial) modes
│   ├── SimulatorPanel.tsx  # Visual simulator output panel
│   ├── PolicyLayout.tsx    # Shared layout for policy pages
│   └── SiteFooter.tsx      # Global footer
│
├── features/               # Domain logic — pure TypeScript, no React
│   ├── lessons/
│   │   ├── types.ts        # Core types: Mission, MissionCheckpoint, CheckpointRule, etc.
│   │   ├── data/
│   │   │   └── missions.ts # All 12 mission definitions (source of truth)
│   │   └── engine/
│   │       ├── validator.ts      # validateMissionCode() — deterministic checkpoint engine
│   │       └── coachFeedback.ts  # getCoachFeedback() — feedback messages per attempt
│   ├── simulator/
│   │   └── evaluate.ts     # evaluateSimulation() — produces SimulationSnapshot per mission
│   ├── progress/
│   │   ├── types.ts        # LearnerProgress, LearnerProfile types
│   │   ├── defaults.ts     # Default progress state
│   │   └── engine.ts       # completeMission(), withProfile(), getDefaultProgress()
│   ├── gamification/
│   │   └── levels.ts       # LEVEL_BANDS + getLevelForXp() — 6-level XP progression
│   └── hardware/
│       └── webSerial.ts    # Web Serial API abstraction: capability check, connect, send
│
├── lib/
│   ├── config/
│   │   └── runtime.ts      # runtimeConfig — reads NEXT_PUBLIC_* env vars at startup
│   └── storage/
│       └── progressStorage.ts  # localStorage read/write for LearnerProgress (key: arduino-quest-progress-v1)
│
├── styles/
│   └── globals.css         # Global Tailwind directives + base styles
│
├── workers/
│   └── health.ts           # Cloudflare Worker: GET /health → JSON status response
│
├── docs/                   # Operational documentation (read-only reference)
│   ├── cloudflare-pages-deploy.md
│   ├── pilot-launch-checklist.md
│   ├── incident-response-runbook.md
│   ├── legal-gate-checklist.md
│   └── mvp-implementation-tracker.md
│
├── .github/workflows/ci.yml  # CI: lint → test → build on push/PR to main
├── .env.example              # All supported NEXT_PUBLIC_* variables with defaults
├── next.config.ts            # Next.js config (reactStrictMode, distDir override)
├── tailwind.config.ts        # Tailwind config
├── vitest.config.ts          # Vitest config with `@/` alias
├── wrangler.toml             # Cloudflare Workers config (name: arduinoapp)
└── tsconfig.json             # TypeScript config with @/ path alias
```

---

## Development Commands

```bash
pnpm install          # Install dependencies (use --frozen-lockfile=false in CI)
pnpm dev              # Start Next.js dev server with Turbopack HMR
pnpm lint             # ESLint with Next.js type-aware rules
pnpm test             # Run Vitest test suite (node environment)
pnpm build            # Production TypeScript compile + Next.js build
pnpm start            # Serve production build locally
```

**Minimum pre-PR gate**: `pnpm lint && pnpm test && pnpm build` — all three must pass.

---

## Key Architectural Patterns

### State management (pages/index.tsx)
All mission state lives in `index.tsx` using React `useState`/`useEffect` — no external state library. The pattern:
1. `loadProgress()` is called once on mount via `useEffect`
2. `saveProgress()` is called automatically whenever `progress` state changes
3. `missionRuns` tracks per-mission code, attempt count, and last validation result
4. `nextMission` is derived via `useMemo` — first incomplete mission in order

### Mission validation (features/lessons/engine/validator.ts)
`validateMissionCode(mission, code)` is a **deterministic, pure function** — no side effects, no async. It:
1. Normalizes code (whitespace collapse, lowercase)
2. Parses function calls via regex into `ParsedCall[]`
3. Evaluates each `CheckpointRule` against the normalized code and parsed calls
4. Returns `MissionValidationResult` with pass/fail, evidence strings, and a `profileId` = `mission.validatorVersion`

**CheckpointRule types**:
- `"call"` — checks for a function call, optional args, match mode (`exact` | `startsWith`), min count
- `"numericArgRange"` — checks a numeric argument falls within `[min, max]`
- `"contains"` — substring match (case-insensitive, whitespace-normalized)
- `"regex"` — full regex test on normalized code
- `"anyOf"` — at least one nested rule must pass

### Simulator (features/simulator/evaluate.ts)
`evaluateSimulation(mission, code)` returns a `SimulationSnapshot` — used for visual feedback only, not for pass/fail grading. Each mission has a hand-written branch keyed on `mission.id`. Returns `mode: "idle"` for unrecognized missions.

### Progress engine (features/progress/engine.ts)
`completeMission(progress, mission, today?)` is a **pure function** — returns a new `LearnerProgress` object. It:
- Guards against double-completion (`completedMissionIds.includes`)
- Updates `xp`, `badges`, `streakDays`, `lastActiveDate`
- Streak logic: +1 if `dayDelta === 1`, reset to 1 if gap > 1, unchanged if same day

### Gamification (features/gamification/levels.ts)
Six XP level bands: Spark Rookie → Wire Wrangler → Signal Scout → Circuit Crafter → Prototype Prodigy → Arduino Ace. `getLevelForXp(xp)` scans all bands and returns the highest qualifying one.

### Runtime config (lib/config/runtime.ts)
`runtimeConfig` is a module-level constant parsed once at startup from `NEXT_PUBLIC_*` env vars:
- `analyticsMode`: `"off"` (default) | `"privacy"`
- `hardwareModeEnabled`: boolean, default `true`
- `regionNotice`: string, default `"us_eu_child"`

### Web Serial hardware mode (features/hardware/webSerial.ts)
Hardware mode is opt-in and guarded by `getWebSerialCapability()`. Requires Chrome/Edge and HTTPS. The app always falls back to simulator mode if Web Serial is unavailable or `hardwareModeEnabled` is false.

---

## Mission Data (features/lessons/data/missions.ts)

12 missions in order:

| ID | Title | Key API |
|----|-------|---------|
| `mission-blink` | Blink | `digitalWrite`, `delay` |
| `mission-pwm` | PWM LED | `analogWrite` |
| `mission-button` | Button Input | `digitalRead` |
| `mission-potentiometer` | Potentiometer | `analogRead`, `map` |
| `mission-serial` | Serial Monitor | `Serial.begin`, `Serial.println` |
| `mission-temperature` | Temperature Sensor | `analogRead`, `Serial.println` |
| `mission-buzzer` | Buzzer | `tone`, `noTone` |
| `mission-servo` | Servo Motor | `Servo.attach`, `Servo.write` |
| `mission-night-light` | Night Light | `analogRead`, `analogWrite` |
| `mission-distance-alarm` | Distance Alarm | `pulseIn`, `tone` |
| `mission-ultrasonic` | Ultrasonic | `pulseIn` |
| `mission-reaction-timer` | Reaction Timer | `millis` |

Each mission has: `prerequisiteMissionIds`, `validatorVersion`, `starterCode`, `hints` (revealed progressively after 2+ failed attempts), `checkpoints[]`, and `reward` (XP + badge).

---

## Testing

Test files use `*.test.ts` naming, colocated next to the code they cover:

- `features/lessons/data/missions.test.ts` — mission schema integrity
- `features/lessons/engine/validator.test.ts` — checkpoint rule evaluation
- `features/lessons/engine/coachFeedback.test.ts` — feedback message logic
- `features/progress/engine.test.ts` — progress mutations
- `features/hardware/webSerial.test.ts` — capability detection and port helpers

Vitest runs in `node` environment. When adding or changing feature logic, add or update the corresponding test file. The `@/` alias is available in tests via `vitest.config.ts`.

---

## Coding Conventions

- **TypeScript-first**: all new code must be typed; avoid `any`
- **Functional components**: PascalCase filenames, `export default function ComponentName()`
- **Pure functions for domain logic**: `features/` contains no React, no side effects
- **2-space indentation** throughout
- **Import order**: external packages → `@/` aliases → relative imports
- **Tailwind for all styling**: no CSS modules, no styled-components; keep semantic HTML with accessible labels and alt text
- **No secrets in source**: use `.env.local` (gitignored); never commit credentials
- **Commit style**: short imperative subject, no trailing period (e.g., `Add servo mission validator`)

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development:

```
NEXT_PUBLIC_ANALYTICS_MODE=off            # "off" | "privacy"
NEXT_PUBLIC_HARDWARE_MODE_ENABLED=true    # enable/disable Web Serial hardware mode
NEXT_PUBLIC_REGION_NOTICE=us_eu_child     # controls region-specific legal notice display
```

`NEXT_DIST_DIR` (optional) overrides the Next.js output directory (used by Cloudflare Pages deployment).

---

## CI / Deployment

- **CI** (`.github/workflows/ci.yml`): triggers on push/PR to `main`; runs lint → test → build on Node 22 + pnpm 9
- **Frontend**: Cloudflare Pages — see `docs/cloudflare-pages-deploy.md`
- **Worker**: Cloudflare Workers (`wrangler.toml`, name: `arduinoapp`) — only exposes `GET /health`
- **Observability**: enabled in `wrangler.toml`

---

## Child Safety & Privacy Notes

This app is designed for children. Keep these constraints when making changes:
- No third-party analytics SDKs in the default build (`analyticsMode: "off"`)
- All policy pages (`/parents`, `/privacy`, `/terms`, `/safety`) must remain accurate and accessible
- `regionNotice: "us_eu_child"` drives legal compliance messaging — do not remove
- Do not introduce external data fetching or third-party tracking without explicit approval
