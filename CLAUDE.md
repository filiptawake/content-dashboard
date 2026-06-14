# Tenfold Content OS — CLAUDE.md

A content dashboard for managing **multiple Instagram creator accounts**. Six
working pages plus a "Today" overview, built as a clickable v1 on demo data with
a clean seam for wiring real integrations later.

This file documents the stack, the decisions, and where the real integrations
plug in. Read it before making changes.

---

## Stack

| Layer        | Choice                                   | Notes |
|--------------|------------------------------------------|-------|
| Framework    | **Next.js 16** (App Router, Turbopack)   | `next-env.d.ts` warns this is a newer Next than training data — see `AGENTS.md`. |
| Runtime      | **React 19**                             | Function components, no `forwardRef` in UI primitives. |
| Language     | **TypeScript 5** (strict)                | Shared domain types in `src/lib/types.ts`. |
| Styling      | **Tailwind CSS v4**                      | CSS-first config — theme lives in `src/app/globals.css`, not a JS config. |
| Components   | **shadcn/ui** (New York style, Radix)    | Hand-vendored under `src/components/ui` (registry was network-blocked). |
| Icons        | **lucide-react**                         | |
| Toasts       | **sonner**                               | Mounted once in `Providers`. |
| AI           | **Anthropic SDK** (`@anthropic-ai/sdk`)  | Optional — see [AI layer](#ai-layer-claude). |

### Why these

- **Dark-first, terracotta accent.** App ships dark (`<html className="dark">`).
  The palette is warm **stone** neutrals + a **terracotta** primary
  (`oklch(0.68 0.15 40)`), defined as CSS variables in `globals.css`. Terracotta
  is used for the primary action, active nav, sparklines, and chart-1.
- **shadcn vendored by hand.** The shadcn registry (`ui.shadcn.com`) is blocked
  by the environment network policy, so the CLI (`init` / `add`) can't run. The
  primitives in `src/components/ui` are the standard MIT New York components,
  written directly. `components.json` is kept for reference/future CLI use.
- **Demo data, not mocks scattered in components.** All seed data lives in
  `src/data/*` behind the types in `src/lib/types.ts`. Swapping in a real API
  means changing the data layer, not the pages.

---

## Architecture

```
src/
  app/
    layout.tsx              # dark <html>, fonts, <Providers>, <AppShell>
    page.tsx                # "Today" overview
    globals.css             # Tailwind v4 + terracotta theme tokens
    hook-vault/page.tsx
    analytics/page.tsx
    competitors/page.tsx
    scheduler/page.tsx
    calendar/page.tsx
    trending/page.tsx
    api/caption/route.ts    # caption generation (Claude or demo)
  components/
    providers/              # client React context (see below)
    layout/                 # sidebar, account switcher, app shell, page header
    ui/                     # shadcn primitives
    sparkline.tsx, gradient-avatar.tsx, platform-badge.tsx
  data/                     # demo seed data (accounts, hooks, analytics, …)
  lib/
    types.ts                # all domain types + label maps
    dates.ts                # deterministic date helpers (REFERENCE_DATE)
    caption.ts              # pure demo-caption builder (client/server safe)
    ai.ts                   # server-only Claude calls
    utils.ts                # cn(), number formatters
```

### State — two client contexts (`src/components/providers`)

The pages are **client components** (they read shared state and avoid Next 16's
async request APIs). State is two contexts, composed in `Providers`:

1. **`DashboardProvider`** — the active account, plus the `hooks` and
   `scheduledPosts` collections held in `useState` (seeded from `src/data`).
   Exposes `activeAccount`, `setActiveAccountId`, `addHook`,
   `addScheduledPost`, and account-scoped `accountHooks` / `accountPosts`.
2. **`ScriptComposerProvider`** — the `/script` surface. A right-side `Sheet`
   that any page opens via `openScript(seed)`. It generates a caption (calls
   `/api/caption`), then writes a `ScheduledPost` via `addScheduledPost` — which
   is why a hook used in Hook Vault shows up on the Scheduler and Calendar.

This wiring realizes the intended flow:
**Hook Vault → "Use this" → `/script` → generate caption → Schedule → Content Calendar.**

### Multi-account model

Three seed accounts (`src/data/accounts.ts`), `@tenfoldmarc` first (the brand at
the top of the sidebar) and richest. Every account-specific surface filters by
`activeAccount.id`. The switcher lives at the top of the sidebar. "What's
Trending" is global (AI news isn't per-account).

### Dates are deterministic

Everything is anchored to `REFERENCE_DATE` (13 Jun 2026) in `src/lib/dates.ts`
rather than `new Date()`. This keeps server/client renders identical (no
hydration mismatches) and keeps the Content Calendar opening on a fully
populated month. Swap `REFERENCE_DATE` for `new Date()` when real data lands.

---

## AI layer (Claude)

AI features run on **Claude / Anthropic** (model `claude-opus-4-8`, override with
`ANTHROPIC_MODEL`). They are **optional**:

- **No `ANTHROPIC_API_KEY`** → the app runs fully on demo data. Caption
  generation returns a deterministic caption from `buildDemoCaption`.
- **`ANTHROPIC_API_KEY` set** → `POST /api/caption` calls Claude
  (`src/lib/ai.ts`, server-only) and falls back to the demo caption on any error.

The SDK and key never reach the client bundle — `src/lib/ai.ts` is imported only
by the route handler. To go live: `export ANTHROPIC_API_KEY=sk-ant-…`.

---

## The six pages

| Page | Route | What it does |
|------|-------|--------------|
| **Hook Vault** | `/hook-vault` | Saved hooks, transcribed + templatized (`[X] just killed [Y]`, `Stop doing [X]`, `[NUMBER] things…`). Search by niche, hook type, view count. "Use this" drops the hook into `/script`. |
| **Analytics** | `/analytics` | Views / saves / follows / DM volume with a sparkline per metric over 7/30/90 days. Flags any reel beating the **30-day median views by 2×** as a "heater"; shows the top 5 by views with a one-line note. |
| **Competitor Tracker** | `/competitors` | Top reels from tracked creators (weekly Sunday scrape), sorted by views, with handle, follower count, hook, on-screen text, transcript, and a "Save to Hook Vault" button. |
| **Scheduler** | `/scheduler` | The publish queue. Pick platforms (IG / TikTok / YouTube Shorts), auto-generate a caption, and "Post now" simulates posting via **Zernio MCP**. |
| **Content Calendar** | `/calendar` | Monthly grid; each slot shows date + time, platform, and hook. Click a slot for the full script + caption in a side panel. |
| **What's Trending** | `/trending` | AI news from 12 sources, auto-tagged `hook potential` / `explainer` / `skip`. Top 5 hook-worthy items by recency; "Slack the highlights" simulates the 7am digest. |

---

## Integrations: demo today, real later

Each "live" requirement is represented in the UI and backed by demo data. Where
real wiring would go:

| Requirement | Status | Where it plugs in |
|-------------|--------|-------------------|
| IG views / saves / follows / DMs | demo series | `src/data/analytics.ts` → Instagram Graph API + a metrics store |
| Competitor weekly scrape + transcription | demo reels | `src/data/competitors.ts` → a Sunday 8am cron + scraper + audio transcription |
| Caption generation | **live-capable** | `src/app/api/caption/route.ts` (Claude) |
| Multi-platform posting | simulated toast | `src/app/scheduler/page.tsx` → **Zernio MCP** posting tool |
| 12-source trend feed | demo items | `src/data/trending.ts` → RSS/X pollers + a daily tagging job (Claude) |
| 7am Slack digest | simulated toast | a scheduled job → Slack webhook |

None of these are stubbed inside the page components — they're all isolated to
the data layer or a single handler, so each can be swapped independently.

---

## Commands

```bash
npm run dev     # dev server (Turbopack)
npm run build   # production build (type-checks + compiles)
npm start       # serve the production build
npm run lint    # eslint (note: `next lint` was removed in Next 16)
```

`npx tsc --noEmit` for a standalone type check.

---

## Conventions

- **Pages are client components** and read state via `useDashboard()` /
  `useScriptComposer()` from `@/components/providers`.
- **Add domain data** to `src/data/*` and a type to `src/lib/types.ts` — never
  inline mock data in a component.
- **Theme via tokens.** Use semantic classes (`bg-primary`, `text-muted-foreground`,
  `border`) — don't hardcode hex. Terracotta = `primary`.
- **Numbers**: `formatCompact` (12.5K) and `formatNumber` from `src/lib/utils.ts`.
- **Dates**: helpers in `src/lib/dates.ts`, anchored to `REFERENCE_DATE`.

See `AGENTS.md` for the Next.js 16 note.

@AGENTS.md
