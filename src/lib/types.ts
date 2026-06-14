// ---------------------------------------------------------------------------
// Domain types shared across every page of the dashboard.
// All data in this app is demo/seed data (see src/data/*). Real integrations
// (IG Graph API, scraping, Zernio MCP, Slack, RSS) plug into the same shapes.
// ---------------------------------------------------------------------------

export type Platform = "instagram" | "tiktok" | "youtube";

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube Shorts",
};

export type Niche =
  | "ai"
  | "marketing"
  | "business"
  | "fitness"
  | "finance"
  | "mindset";

export const NICHE_LABELS: Record<Niche, string> = {
  ai: "AI",
  marketing: "Marketing",
  business: "Business",
  fitness: "Fitness",
  finance: "Finance",
  mindset: "Mindset",
};

/** Reusable hook structures, each with a fill-in-the-blank template. */
export type HookType =
  | "x-killed-y"
  | "stop-doing-x"
  | "n-things"
  | "nobody-talks"
  | "i-tried-x"
  | "doing-x-wrong";

export const HOOK_TEMPLATES: Record<HookType, { label: string; template: string }> = {
  "x-killed-y": { label: "X killed Y", template: "[X] just killed [Y]" },
  "stop-doing-x": { label: "Stop doing X", template: "Stop doing [X]" },
  "n-things": { label: "N things", template: "[NUMBER] things I wish I knew" },
  "nobody-talks": { label: "Nobody talks about X", template: "Nobody is talking about [X]" },
  "i-tried-x": { label: "I tried X", template: "I tried [X] so you don't have to" },
  "doing-x-wrong": { label: "You're doing X wrong", template: "You're using [X] wrong" },
};

export interface Account {
  id: string;
  handle: string; // includes leading @
  name: string;
  niche: Niche;
  followers: number;
  /** Two tailwind color stops for the avatar gradient fallback. */
  gradient: [string, string];
}

export interface Hook {
  id: string;
  accountId: string;
  text: string; // the actual spoken/written hook
  hookType: HookType;
  niche: Niche;
  originalCreator: string; // @handle the hook was lifted from
  views: number; // views on the source reel
  /** Manually-typed opening line(s). Optional — competitor saves link the reel instead of transcribing. */
  transcript?: string;
  /** Permalink to the source reel (stored instead of paying to transcribe). */
  sourceUrl?: string;
  savedAt: string; // ISO date
  source: "manual" | "competitor";
}

export interface Reel {
  id: string;
  accountId: string;
  hook: string;
  caption: string;
  postedAt: string; // ISO date
  views: number;
  saves: number;
  likes: number;
  comments: number;
  shares: number;
  follows: number; // follows attributed to this reel
  /** One-line note on what made it pop (shown for heaters). */
  note: string;
}

export type MetricKey = "views" | "saves" | "follows" | "dms";

export const METRIC_LABELS: Record<MetricKey, string> = {
  views: "Views",
  saves: "Saves",
  follows: "Follows",
  dms: "DM volume",
};

export interface MetricSeries {
  key: MetricKey;
  /** 90 daily values, oldest -> newest. Slice the tail for 7/30 windows. */
  daily: number[];
}

export interface CompetitorReel {
  id: string;
  trackedByAccountId: string;
  creatorHandle: string;
  creatorFollowers: number;
  niche: Niche;
  scrapedAt: string; // ISO - the Sunday scrape
  postedAt: string; // ISO
  views: number;
  hook: string;
  onScreenText: string;
  /** Permalink to the reel — we store the video link instead of transcribing (no Whisper cost). */
  videoUrl: string;
  audioTitle: string;
  hookType: HookType;
}

export type ScheduleStatus = "scheduled" | "draft" | "posted";

export interface ScheduledPost {
  id: string;
  accountId: string;
  title: string;
  hook: string;
  angle: string;
  cta: string;
  caption: string;
  platforms: Platform[];
  scheduledFor: string; // ISO date + time
  status: ScheduleStatus;
  /** Two tailwind color stops for the thumbnail gradient. */
  gradient: [string, string];
}

export type TrendTag = "hook-potential" | "explainer" | "skip";

export const TREND_TAG_LABELS: Record<TrendTag, string> = {
  "hook-potential": "Hook potential",
  explainer: "Explainer",
  skip: "Skip",
};

export type TrendSourceType = "blog" | "x" | "rss";

export interface TrendItem {
  id: string;
  title: string;
  source: string; // e.g. "Anthropic Blog"
  sourceType: TrendSourceType;
  url: string;
  summary: string;
  publishedAt: string; // ISO
  tag: TrendTag;
  niche: Niche;
  /** Suggested hook angle when tag === "hook-potential". */
  hookAngle?: string;
}

// ---------------------------------------------------------------------------
// Materials — a reusable library of formats, frameworks and assets the creator
// pulls into a script. Each material can seed /script via "Use this".
// ---------------------------------------------------------------------------

export type MaterialType =
  | "reel-format"
  | "caption-framework"
  | "carousel"
  | "b-roll"
  | "cover";

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  "reel-format": "Reel format",
  "caption-framework": "Caption framework",
  carousel: "Carousel",
  "b-roll": "B-roll",
  cover: "Cover",
};

export interface Material {
  id: string;
  accountId: string;
  title: string;
  type: MaterialType;
  niche: Niche;
  /** When and why to reach for this template. */
  description: string;
  /** Optional link to the asset (CapCut/Drive/reel). We store the link, not a transcription. */
  url?: string;
  tags: string[];
  /** For caption frameworks: the fill-in-the-blank body shown on the card. */
  body?: string;
  /** Seed values dropped into /script when "Use this" is clicked. */
  seed?: {
    hook?: string;
    angle?: string;
    cta?: string;
  };
  /** Times this template has been pulled into a script. */
  usageCount: number;
  addedAt: string; // ISO
  /** Two color stops for the thumbnail gradient. */
  gradient: [string, string];
}
