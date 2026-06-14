// Server-only Claude/Anthropic integration.
//
// This module is imported exclusively from route handlers (src/app/api/*), so
// the SDK and the API key never reach the client bundle. When no key is set the
// app runs entirely on demo data; set ANTHROPIC_API_KEY to make AI features live.
import Anthropic from "@anthropic-ai/sdk";

import type { CaptionInput } from "./caption";

/** Default to the most capable Opus model; override with ANTHROPIC_MODEL. */
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const CAPTION_SYSTEM = [
  "You are a social-media copywriter for short-form video (Instagram Reels, TikTok, YouTube Shorts).",
  "Write punchy, native-sounding captions in the creator's voice — never corporate.",
  "Open with the hook, layer in the angle, end with the CTA, then a final line of 3-5 relevant hashtags.",
  "Keep it to 2-4 short lines plus the hashtag line. Return ONLY the caption text — no preamble, no quotes, no explanation.",
].join(" ");

/**
 * Generate a caption with Claude. Caption writing is a simple task, so thinking
 * is left off (omitted) for speed; the system prompt enforces final-answer-only
 * output. Throws on API/credential errors — callers fall back to buildDemoCaption.
 */
export async function generateCaptionAI(input: CaptionInput): Promise<string> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the environment

  const user = [
    `Hook: ${input.hook}`,
    input.angle ? `Angle: ${input.angle}` : "",
    input.cta ? `Call to action: ${input.cta}` : "",
    input.niche ? `Niche: ${input.niche}` : "",
    input.handle ? `Account handle: ${input.handle}` : "",
    input.platforms?.length ? `Platforms: ${input.platforms.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: CAPTION_SYSTEM,
    messages: [{ role: "user", content: user }],
  });

  return response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();
}
