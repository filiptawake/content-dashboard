import type { Platform } from "./types";
import { NICHE_LABELS, type Niche } from "./types";

export interface CaptionInput {
  hook: string;
  angle?: string;
  cta?: string;
  platforms?: Platform[];
  niche?: Niche;
  handle?: string;
}

const NICHE_TAGS: Record<Niche, string[]> = {
  ai: ["#ai", "#artificialintelligence", "#aitools"],
  marketing: ["#marketing", "#contentstrategy", "#socialmedia"],
  business: ["#startup", "#founders", "#business"],
  fitness: ["#fitness", "#health", "#workout"],
  finance: ["#finance", "#money", "#investing"],
  mindset: ["#mindset", "#motivation", "#growth"],
};

function hashtags(input: CaptionInput): string {
  const base = input.niche ? NICHE_TAGS[input.niche] : ["#contentcreator"];
  return [...base, "#reels", "#creator"].slice(0, 5).join(" ");
}

/**
 * Deterministic caption used when no ANTHROPIC_API_KEY is configured (demo mode)
 * and as the fallback if a live Claude call fails. Pure — safe on client/server.
 */
export function buildDemoCaption(input: CaptionInput): string {
  const { hook, angle, cta, handle } = input;
  const lines: string[] = [hook.trim()];
  if (angle?.trim()) lines.push("", angle.trim());
  if (cta?.trim()) lines.push("", cta.trim());
  if (handle) lines.push("", `Follow ${handle} for more.`);
  lines.push("", hashtags(input));
  return lines.join("\n");
}

export function captionPromptLabel(input: CaptionInput): string {
  const parts = [input.hook];
  if (input.niche) parts.push(`(${NICHE_LABELS[input.niche]})`);
  return parts.join(" ");
}
