# Tenfold Content OS

A content dashboard for managing **multiple Instagram creator accounts** — hooks,
analytics, competitor tracking, multi-platform scheduling, a content calendar,
and an AI trend feed.

Built with **Next.js 16 · React 19 · TypeScript · Tailwind v4 · shadcn/ui**.
Dark mode, terracotta accent, sidebar with `@tenfoldmarc` on top.

> v1 runs on realistic **demo data** so every page is clickable today. Real
> integrations (Instagram Graph API, scraping, Zernio MCP, Slack, RSS) plug into
> the same data layer. See **[CLAUDE.md](./CLAUDE.md)** for the full architecture,
> decisions, and where each integration wires in.

## Pages

- **Today** — overview: 7-day stats, top heater, what's next, hook-worthy trends.
- **Hook Vault** — saved hooks, transcribed + templatized; search by niche, hook
  type, view count; "Use this" drops a hook into `/script`.
- **Analytics** — views / saves / follows / DM volume with 7/30/90-day
  sparklines; flags reels that beat the 30-day median by 2× as "heaters".
- **Competitor Tracker** — top reels from tracked creators, with hook, on-screen
  text, transcript, and "Save to Hook Vault".
- **Scheduler** — pick platforms, auto-generate a caption, post via Zernio MCP.
- **Content Calendar** — monthly grid; click a slot for the full script + caption.
- **What's Trending** — AI news from 12 sources, auto-tagged for hook potential.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

### Optional: live Claude caption generation

The app runs fully without a key (deterministic demo captions). To make caption
generation call Claude:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
# optional: export ANTHROPIC_MODEL=claude-opus-4-8
```

## Scripts

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build
npm start        # serve the production build
npm run lint     # eslint
```
