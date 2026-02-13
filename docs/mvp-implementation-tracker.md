# MVP Implementation Tracker

## Status legend

- `[x]` done
- `[ ]` pending
- `[-]` in progress

## Phase 1: Bootstrap and app shell

- [x] Initialize Next.js TypeScript project structure
- [x] Add Tailwind and global design tokens
- [x] Add baseline ESLint/TS config
- [x] Build home page shell
- [x] Add local progress persistence

## Phase 2: Lesson engine foundation

- [x] Define lesson schema types
- [x] Add initial mission content (Mission 1-2)
- [x] Build mission runner interactions (editable code + checkpoint checks)
- [x] Add checkpoint validation engine
- [x] Add hint unlock rules after failed attempts

## Phase 3: Simulator and editor

- [-] Add code editor with starter template guardrails
- [-] Build simulator core loop and virtual components
- [-] Map lesson checks to simulator events

## Phase 4: Gamification and full lessons

- [x] XP and badge grant model (basic)
- [x] Streak model (daily local logic)
- [-] Add full 12-lesson content path
- [ ] Add badge library and level thresholds

## Phase 5: Optional hardware mode

- [x] Add Web Serial capability checks
- [x] Add connect/disconnect UI
- [x] Add serial monitor panel
- [x] Add simulator fallback flow

## Phase 6: Hardening

- [x] Add unit tests for mission and progress engines
- [ ] Accessibility pass (keyboard + contrast + labels)
- [ ] Performance budget and instrumentation
- [ ] Privacy/safety review checklist
