# n8n workflows — the orchestration layer

These are the scheduled jobs that keep the dashboard's data fresh. Each one
**writes into Supabase via the service-role key** (the seam from
`src/lib/supabase.ts` → `getServiceSupabase()`); the app reads from there.

```
n8n (cron)  ──►  Supabase  ──►  Next.js reads
```

| File | Schedule | Does |
|------|----------|------|
| `instagram-metrics-daily.json` | daily 06:00 | Pulls IG insights (Graph API) → upserts `metrics_daily`. |
| `competitor-scrape-weekly.json` | Sundays 08:00 | Scrapes tracked creators' top reels (Apify) → inserts `competitor_reels` (just the **reel link**, no transcription). |
| `trending-poll-daily.json` | daily 05:00 | Reads an AI-news RSS feed → asks Claude to tag each item → inserts `trend_items`. |
| `slack-digest-7am.json` | daily 07:00 | Reads the top-5 hook-worthy `trend_items` → posts the digest to a Slack webhook. |

## Import

In n8n: **Workflows → Import from File** → pick each `.json`. They import
**inactive** — review, wire credentials, test with *Execute Workflow*, then
toggle active.

## Environment variables

Set these in n8n (host env, or **Settings → Variables** on self-hosted; the
expressions read `$env.*`):

| Var | Used by | Notes |
|-----|---------|-------|
| `SUPABASE_URL` | all | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | all | service role — bypasses RLS, server-side only |
| `IG_USER_ID` / `IG_ACCESS_TOKEN` | IG metrics | IG Business account id + long-lived token |
| `IG_ACCOUNT_ID` | IG metrics, competitors | which dashboard account the rows belong to (e.g. `tenfoldmarc`) |
| `APIFY_TOKEN` | competitors | token for the Apify Instagram scraper actor |
| `ANTHROPIC_API_KEY` | trending | Claude tagging (`claude-opus-4-8`) |
| `SLACK_WEBHOOK_URL` | digest | Slack incoming-webhook URL |

## These are scaffolds — expect to adjust

- **Verify node versions** on import (your n8n may differ); re-select the
  credential/expression fields if any show as empty.
- **IG metric names**: Graph API insight names vary by account type — map them
  in the *Shape metrics_daily rows* Code node. `dms` isn't in Graph insights;
  source it separately if needed.
- **Apify actor**: swap `apify~instagram-reel-scraper` for whichever actor /
  field names you use, and set the real list of tracked creators per account.
- **RSS sources**: the trending job reads one feed as an example — duplicate the
  RSS node (or fan out) for the full 12-source set, adjusting `source` in the
  Code node.
