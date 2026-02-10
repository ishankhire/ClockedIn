# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — ESLint

## Architecture

Single-page time-tracking app. Next.js 16 App Router, TypeScript (strict), Tailwind CSS 4, React 19. No backend — all data in localStorage.

**State ownership:** `app/page.tsx` is a `"use client"` component that owns all app state via `useLocalStorage` hooks and passes props down. No context providers or state libraries.

**Data flow:**
- Timer events → `TimerPanel` → `onSessionComplete` callback → `page.tsx` → `useLocalStorage("clockedin-sessions")` → localStorage keyed by `YYYY-MM-DD`
- Task edits → `TaskEditor` → `onChange` callback → `page.tsx` → `useLocalStorage("clockedin-tasks")`

**Hydration pattern:** `useLocalStorage` returns `[value, setter, isLoaded]`. The page renders a skeleton until all `isLoaded` flags are true, preventing SSR/client mismatch.

## Key Implementation Details

**Timer accuracy** (`hooks/useTimer.ts`): Uses `Date.now()` stored in refs + `requestAnimationFrame` loop. Never counts interval ticks. Timer state persists to localStorage so running timers survive page refresh — on mount, elapsed time is recalculated from the stored start timestamp.

**Task editor** (`components/TaskEditor.tsx`): Structured `TaskLine[]` array, not raw HTML. Each line renders a `contentEditable` span. The `/to` + Enter detection reads text from the DOM directly (not React state) to avoid stale state from batched updates. Focus management uses a refs array + `requestAnimationFrame`.

**`useTimer` callback pattern:** The `onComplete` callback receives `elapsedMs` as an argument so the caller doesn't need a reference to the timer object (avoids stale closure issues). The hook stores the callback in a ref (`onCompleteRef`) to always call the latest version.

## localStorage Keys

- `clockedin-sessions` — `Record<YYYY-MM-DD, Session[]>` (daily totals are derived, never stored)
- `clockedin-timer` — Active timer state for page-refresh recovery
- `clockedin-tasks` — `TaskLine[]` (persists indefinitely across days)

## Keyboard Shortcuts

All keyboard shortcuts are documented in `Keybinds.md`. **IMPORTANT:** Whenever you add, modify, or remove a keyboard shortcut, you MUST update `Keybinds.md` to keep the documentation current.
