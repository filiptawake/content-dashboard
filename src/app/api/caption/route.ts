import { buildDemoCaption, type CaptionInput } from "@/lib/caption";
import { generateCaptionAI, isAiConfigured } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: CaptionInput;
  try {
    body = (await req.json()) as CaptionInput;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.hook?.trim()) {
    return Response.json({ error: "A hook is required" }, { status: 400 });
  }

  // No key configured → deterministic demo caption.
  if (!isAiConfigured()) {
    return Response.json({ caption: buildDemoCaption(body), source: "demo" });
  }

  // Key configured → real Claude call, with a graceful fallback on failure.
  try {
    const caption = await generateCaptionAI(body);
    return Response.json({
      caption: caption || buildDemoCaption(body),
      source: caption ? "claude" : "demo",
    });
  } catch (err) {
    console.error("Caption generation failed, falling back to demo:", err);
    return Response.json({ caption: buildDemoCaption(body), source: "demo" });
  }
}
