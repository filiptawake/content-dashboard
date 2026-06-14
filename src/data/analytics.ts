import type { MetricKey, MetricSeries, Reel } from "@/lib/types";
import { daysAgo, toISO } from "@/lib/dates";

// --- deterministic series generator ----------------------------------------

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildSeries(
  seedKey: string,
  base: number,
  growth: number,
  noise: number,
): number[] {
  const rng = mulberry32(hashSeed(seedKey));
  const out: number[] = [];
  for (let i = 0; i < 90; i++) {
    const trend = base * (1 + (growth * i) / 90);
    const wobble = 1 + (rng() - 0.5) * noise;
    let v = trend * wobble;
    if (rng() > 0.93) v *= 1.6 + rng(); // occasional spike
    out.push(Math.max(0, Math.round(v)));
  }
  return out;
}

// base daily values per account, scaled loosely to follower count
const METRIC_BASES: Record<
  string,
  Record<MetricKey, { base: number; growth: number; noise: number }>
> = {
  tenfoldmarc: {
    views: { base: 92000, growth: 0.6, noise: 0.5 },
    saves: { base: 3100, growth: 0.7, noise: 0.6 },
    follows: { base: 540, growth: 0.5, noise: 0.7 },
    dms: { base: 74, growth: 0.4, noise: 0.8 },
  },
  marcbuilds: {
    views: { base: 21000, growth: 0.4, noise: 0.6 },
    saves: { base: 680, growth: 0.5, noise: 0.7 },
    follows: { base: 130, growth: 0.45, noise: 0.8 },
    dms: { base: 22, growth: 0.3, noise: 0.9 },
  },
  clipsbymarc: {
    views: { base: 7600, growth: 0.8, noise: 0.7 },
    saves: { base: 240, growth: 0.9, noise: 0.8 },
    follows: { base: 58, growth: 0.7, noise: 0.9 },
    dms: { base: 9, growth: 0.5, noise: 1.0 },
  },
};

const METRIC_KEYS: MetricKey[] = ["views", "saves", "follows", "dms"];

export function getMetricSeries(accountId: string): MetricSeries[] {
  const cfg = METRIC_BASES[accountId] ?? METRIC_BASES.tenfoldmarc;
  return METRIC_KEYS.map((key) => ({
    key,
    daily: buildSeries(`${accountId}:${key}`, cfg[key].base, cfg[key].growth, cfg[key].noise),
  }));
}

// --- reels (for heater detection) ------------------------------------------

export const reelsByAccount: Record<string, Reel[]> = {
  tenfoldmarc: [
    {
      id: "r-1",
      accountId: "tenfoldmarc",
      hook: "Claude just killed prompt engineering",
      caption: "The model is smarter than your instructions now. Here's the new playbook ↓",
      postedAt: toISO(daysAgo(3)),
      views: 2_410_000,
      saves: 61_000,
      likes: 148_000,
      comments: 4_200,
      shares: 38_000,
      follows: 9_400,
      note: "Named a specific tool + a bold 'killed' claim in the first 2 words — instant pattern interrupt.",
    },
    {
      id: "r-2",
      accountId: "tenfoldmarc",
      hook: "I ran my business on agents for 30 days",
      caption: "Day 1 was chaos. Day 30 changed how I work. Full breakdown in comments.",
      postedAt: toISO(daysAgo(9)),
      views: 1_870_000,
      saves: 52_000,
      likes: 121_000,
      comments: 5_600,
      shares: 27_000,
      follows: 7_100,
      note: "First-person 30-day challenge format — high completion rate drove the algorithm.",
    },
    {
      id: "r-3",
      accountId: "tenfoldmarc",
      hook: "7 AI tools I wish I knew a year ago",
      caption: "Number 4 replaced my entire editing stack. Save this one.",
      postedAt: toISO(daysAgo(14)),
      views: 1_240_000,
      saves: 88_000,
      likes: 94_000,
      comments: 3_100,
      shares: 21_000,
      follows: 5_300,
      note: "Listicle + 'save this' CTA pushed saves through the roof — saves are the strongest signal.",
    },
    {
      id: "r-4",
      accountId: "tenfoldmarc",
      hook: "You're using ChatGPT wrong",
      caption: "95% of people type one line and give up. Do this instead.",
      postedAt: toISO(daysAgo(6)),
      views: 980_000,
      saves: 33_000,
      likes: 71_000,
      comments: 2_400,
      shares: 14_000,
      follows: 3_900,
      note: "Accusatory 'you're doing it wrong' hook triggered defensive watch-to-the-end behavior.",
    },
    {
      id: "r-5",
      accountId: "tenfoldmarc",
      hook: "Veo just killed stock footage",
      caption: "Recreated a $4,000 shoot in 11 minutes. Wild.",
      postedAt: toISO(daysAgo(20)),
      views: 760_000,
      saves: 24_000,
      likes: 58_000,
      comments: 1_900,
      shares: 12_000,
      follows: 3_100,
      note: "Concrete before/after dollar figure made the payoff impossible to scroll past.",
    },
    // --- non-heaters (around the median) ---
    { id: "r-6", accountId: "tenfoldmarc", hook: "My 3-tab AI workflow", caption: "The setup I use every morning.", postedAt: toISO(daysAgo(2)), views: 312_000, saves: 9_800, likes: 22_000, comments: 640, shares: 3_200, follows: 980, note: "" },
    { id: "r-7", accountId: "tenfoldmarc", hook: "Cheapest model that's actually good", caption: "Price-to-quality winner right now.", postedAt: toISO(daysAgo(5)), views: 286_000, saves: 8_100, likes: 19_500, comments: 520, shares: 2_700, follows: 870, note: "" },
    { id: "r-8", accountId: "tenfoldmarc", hook: "How I batch a month of content", caption: "One Sunday, 30 reels.", postedAt: toISO(daysAgo(11)), views: 254_000, saves: 11_200, likes: 17_800, comments: 410, shares: 2_300, follows: 760, note: "" },
    { id: "r-9", accountId: "tenfoldmarc", hook: "The prompt I never share", caption: "Okay, fine, here it is.", postedAt: toISO(daysAgo(16)), views: 341_000, saves: 13_400, likes: 24_000, comments: 720, shares: 3_900, follows: 1_050, note: "" },
    { id: "r-10", accountId: "tenfoldmarc", hook: "Agents vs automations", caption: "When to use which.", postedAt: toISO(daysAgo(23)), views: 198_000, saves: 6_400, likes: 13_900, comments: 350, shares: 1_800, follows: 590, note: "" },
    { id: "r-11", accountId: "tenfoldmarc", hook: "Reading this week's AI news so you don't", caption: "The 3 that matter.", postedAt: toISO(daysAgo(27)), views: 223_000, saves: 7_200, likes: 15_100, comments: 380, shares: 2_000, follows: 640, note: "" },
    { id: "r-12", accountId: "tenfoldmarc", hook: "My honest take on the hype", caption: "Hot takes inside.", postedAt: toISO(daysAgo(29)), views: 176_000, saves: 5_100, likes: 11_800, comments: 300, shares: 1_500, follows: 470, note: "" },
  ],
  marcbuilds: [
    {
      id: "rb-1",
      accountId: "marcbuilds",
      hook: "Stop raising money you don't need",
      caption: "The most expensive habit in startups. Thread below.",
      postedAt: toISO(daysAgo(4)),
      views: 430_000,
      saves: 14_000,
      likes: 31_000,
      comments: 1_200,
      shares: 6_400,
      follows: 2_100,
      note: "Contrarian money take in a sea of 'raise more' advice — controversy drove shares.",
    },
    {
      id: "rb-2",
      accountId: "marcbuilds",
      hook: "Notion just killed your PM SaaS",
      caption: "Here's the exact build. Steal it.",
      postedAt: toISO(daysAgo(12)),
      views: 360_000,
      saves: 19_000,
      likes: 24_000,
      comments: 900,
      shares: 5_100,
      follows: 1_700,
      note: "'Steal it' + a copyable build pushed saves way above median.",
    },
    { id: "rb-3", accountId: "marcbuilds", hook: "My first hire mistake", caption: "It cost me a year.", postedAt: toISO(daysAgo(7)), views: 96_000, saves: 3_100, likes: 7_400, comments: 220, shares: 980, follows: 410, note: "" },
    { id: "rb-4", accountId: "marcbuilds", hook: "Runway math nobody teaches", caption: "The simple version.", postedAt: toISO(daysAgo(15)), views: 78_000, saves: 2_700, likes: 6_100, comments: 180, shares: 760, follows: 330, note: "" },
    { id: "rb-5", accountId: "marcbuilds", hook: "Bootstrapping in 2026", caption: "What changed.", postedAt: toISO(daysAgo(21)), views: 64_000, saves: 2_100, likes: 5_200, comments: 140, shares: 610, follows: 270, note: "" },
    { id: "rb-6", accountId: "marcbuilds", hook: "Hiring slow, firing fast", caption: "The cliché is right.", postedAt: toISO(daysAgo(26)), views: 71_000, saves: 2_400, likes: 5_700, comments: 160, shares: 690, follows: 300, note: "" },
  ],
  clipsbymarc: [
    {
      id: "rc-1",
      accountId: "clipsbymarc",
      hook: "You're editing your reels wrong",
      caption: "The first cut should land before the first word.",
      postedAt: toISO(daysAgo(2)),
      views: 188_000,
      saves: 9_200,
      likes: 14_000,
      comments: 480,
      shares: 3_400,
      follows: 1_400,
      note: "Editing call-out to other creators — niche relevance gave it a tight, sharable audience.",
    },
    { id: "rc-2", accountId: "clipsbymarc", hook: "Captions = retention", caption: "Doubled my watch time.", postedAt: toISO(daysAgo(9)), views: 42_000, saves: 1_900, likes: 3_600, comments: 120, shares: 540, follows: 320, note: "" },
    { id: "rc-3", accountId: "clipsbymarc", hook: "My b-roll trick", caption: "Three clips, one story.", postedAt: toISO(daysAgo(13)), views: 31_000, saves: 1_400, likes: 2_700, comments: 90, shares: 380, follows: 210, note: "" },
    { id: "rc-4", accountId: "clipsbymarc", hook: "Sound design for reels", caption: "The 2-layer method.", postedAt: toISO(daysAgo(18)), views: 27_000, saves: 1_100, likes: 2_300, comments: 70, shares: 300, follows: 170, note: "" },
    { id: "rc-5", accountId: "clipsbymarc", hook: "Free transitions pack", caption: "Link in bio.", postedAt: toISO(daysAgo(24)), views: 38_000, saves: 2_200, likes: 3_100, comments: 110, shares: 470, follows: 260, note: "" },
  ],
};

/** Median reel views over the last 30 days, used for the 2x heater rule. */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}
