import type { Material } from "@/lib/types";
import { daysAgo, toISO } from "@/lib/dates";

// Thumbnail gradients, colour-coded by material type for quick scanning.
const G = {
  reel: ["#E2725B", "#9A3F2B"] as [string, string], // terracotta
  caption: ["#8E6BD4", "#4E2F8A"] as [string, string], // violet
  carousel: ["#5B8FE2", "#2B4F9A"] as [string, string], // blue
  broll: ["#5BA67A", "#2B6647"] as [string, string], // green
  cover: ["#C9823B", "#7A4A1E"] as [string, string], // amber
};

export const seedMaterials: Material[] = [
  // ---- @tenfoldmarc (AI) ----------------------------------------------------
  {
    id: "m-1",
    accountId: "tenfoldmarc",
    title: "Tool demo — split screen",
    type: "reel-format",
    niche: "ai",
    description:
      "Screen-record the tool on one side, the result on the other. Cut to the output the moment it lands.",
    tags: ["demo", "tutorial", "ai-tools"],
    seed: {
      hook: "[TOOL] just replaced [OLD WAY]",
      angle:
        "Split screen: live tool on the left, finished output on the right. Cut to the result the second it appears.",
      cta: "Follow for the full workflow.",
    },
    usageCount: 23,
    addedAt: toISO(daysAgo(5)),
    gradient: G.reel,
  },
  {
    id: "m-2",
    accountId: "tenfoldmarc",
    title: "3-second problem → fix",
    type: "reel-format",
    niche: "ai",
    description:
      "Open cold on the pain, name it in 3 seconds, then reveal the one-step fix.",
    tags: ["hook", "retention"],
    seed: {
      hook: "You're still doing [X] by hand?",
      angle:
        "0-3s: show the painful manual way. 3-6s: reveal the fix. Rest: prove it.",
      cta: "Save this before you forget.",
    },
    usageCount: 41,
    addedAt: toISO(daysAgo(9)),
    gradient: G.reel,
  },
  {
    id: "m-3",
    accountId: "tenfoldmarc",
    title: "Listicle caption",
    type: "caption-framework",
    niche: "ai",
    description:
      "The caption that carries a '[N] things' reel — punchy opener, numbered payoff, soft CTA.",
    tags: ["caption", "listicle"],
    body: "[HOOK LINE] 🧵\n\n1. [POINT]\n2. [POINT]\n3. [POINT]\n\nThe one nobody does → [#N]\n\nSave this. Follow [HANDLE] for more.",
    seed: {
      angle: "Numbered listicle — 3 to 7 points, fastest cut on the best one.",
    },
    usageCount: 17,
    addedAt: toISO(daysAgo(3)),
    gradient: G.caption,
  },
  {
    id: "m-4",
    accountId: "tenfoldmarc",
    title: "I tried X for 30 days",
    type: "reel-format",
    niche: "ai",
    description:
      "Day 1 vs Day 30 arc. Cold open on the messy start, hard cut to the polished result.",
    tags: ["story", "challenge"],
    seed: {
      hook: "I tried [X] for 30 days so you don't have to",
      angle:
        "Day 1 chaos → Day 30 result. Timestamp captions in the corner the whole way through.",
      cta: "Part 2 if this hits 10k.",
    },
    usageCount: 12,
    addedAt: toISO(daysAgo(14)),
    gradient: G.reel,
  },
  {
    id: "m-5",
    accountId: "tenfoldmarc",
    title: "Cinematic desk b-roll pack",
    type: "b-roll",
    niche: "ai",
    description:
      "12 reusable 4K clips — keyboard, coffee, screen glow. Drop under a talking-head VO.",
    url: "https://drive.google.com/drive/folders/demo-broll-desk",
    tags: ["b-roll", "4k", "overlay"],
    usageCount: 31,
    addedAt: toISO(daysAgo(20)),
    gradient: G.broll,
  },
  {
    id: "m-6",
    accountId: "tenfoldmarc",
    title: "Tool breakdown carousel",
    type: "carousel",
    niche: "ai",
    description:
      "6-slide layout: cover claim → 4 tool slides → CTA. Same grid, swap the screenshots.",
    url: "https://www.canva.com/design/demo-tool-carousel",
    tags: ["carousel", "ig", "saveable"],
    seed: {
      angle: "6-slide carousel: bold claim cover, 4 tool slides, CTA slide.",
    },
    usageCount: 9,
    addedAt: toISO(daysAgo(7)),
    gradient: G.carousel,
  },
  {
    id: "m-7",
    accountId: "tenfoldmarc",
    title: "Bold claim cover",
    type: "cover",
    niche: "ai",
    description:
      "Big condensed type over a high-contrast face. The cover that wins the scroll.",
    tags: ["cover", "thumbnail"],
    usageCount: 26,
    addedAt: toISO(daysAgo(2)),
    gradient: G.cover,
  },

  // ---- @marcbuilds (Business) ----------------------------------------------
  {
    id: "mb-1",
    accountId: "marcbuilds",
    title: "Founder story arc",
    type: "reel-format",
    niche: "business",
    description:
      "Hook on the failure, walk the turning point, land on the lesson. Talking head + captions.",
    tags: ["story", "founder"],
    seed: {
      hook: "This almost killed my company",
      angle:
        "Failure → turning point → lesson. Lower-third captions, one B-roll cut per beat.",
      cta: "Follow for the rest of the build.",
    },
    usageCount: 14,
    addedAt: toISO(daysAgo(6)),
    gradient: G.reel,
  },
  {
    id: "mb-2",
    accountId: "marcbuilds",
    title: "Metric reveal cover",
    type: "cover",
    niche: "business",
    description:
      "One big number, one line of context. Works for revenue, churn, or runway reveals.",
    tags: ["cover", "metrics"],
    usageCount: 8,
    addedAt: toISO(daysAgo(11)),
    gradient: G.cover,
  },
  {
    id: "mb-3",
    accountId: "marcbuilds",
    title: "Lessons-learned caption",
    type: "caption-framework",
    niche: "business",
    description:
      "Short story caption that sells the watch — context, stakes, lesson, CTA.",
    tags: ["caption", "story"],
    body: "[WHAT HAPPENED].\n\nHere's what it cost me: [STAKES].\n\nWhat I'd do differently → [LESSON]\n\nFollow [HANDLE] — I post the real numbers.",
    seed: {
      angle: "Context → stakes → lesson → CTA.",
    },
    usageCount: 6,
    addedAt: toISO(daysAgo(4)),
    gradient: G.caption,
  },

  // ---- @clipsbymarc (Marketing / editing) ----------------------------------
  {
    id: "mc-1",
    accountId: "clipsbymarc",
    title: "Fast-cut hook",
    type: "reel-format",
    niche: "marketing",
    description:
      "3 hard cuts in the first 2 seconds. Pattern-interrupt that holds editing-niche viewers.",
    tags: ["editing", "hook", "fast-cut"],
    seed: {
      hook: "Your first 3 seconds are killing your reach",
      angle:
        "3 cuts in 2 seconds — zoom punch, whip, freeze. Then deliver the payoff.",
      cta: "Comment 'EDIT' for the preset.",
    },
    usageCount: 19,
    addedAt: toISO(daysAgo(3)),
    gradient: G.reel,
  },
  {
    id: "mc-2",
    accountId: "clipsbymarc",
    title: "Desk-setup b-roll pack",
    type: "b-roll",
    niche: "marketing",
    description:
      "8 clips of a creator setup — ideal cutaways for editing tutorials.",
    url: "https://drive.google.com/drive/folders/demo-broll-setup",
    tags: ["b-roll", "setup"],
    usageCount: 11,
    addedAt: toISO(daysAgo(9)),
    gradient: G.broll,
  },
  {
    id: "mc-3",
    accountId: "clipsbymarc",
    title: "Retention caption",
    type: "caption-framework",
    niche: "marketing",
    description:
      "Caption built to push watch-time — open loop up top, payoff withheld to the end.",
    tags: ["caption", "retention"],
    body: "Wait for [PAYOFF] 👀\n\n[SETUP LINE]\n\n…still here? Good. [PAYOFF]\n\nFollow [HANDLE] for more retention tricks.",
    seed: {
      angle: "Open loop in line 1, payoff withheld to the end.",
    },
    usageCount: 22,
    addedAt: toISO(daysAgo(5)),
    gradient: G.caption,
  },
];
