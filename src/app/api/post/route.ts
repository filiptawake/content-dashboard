import { isZernioConfigured, postToZernio } from "@/lib/zernio";
import type { Platform } from "@/lib/types";

export const runtime = "nodejs";

interface PostBody {
  caption?: string;
  platforms?: Platform[];
  scheduledFor?: string;
}

export async function POST(req: Request) {
  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.caption?.trim() || !body.platforms?.length) {
    return Response.json(
      { error: "caption and at least one platform are required" },
      { status: 400 },
    );
  }

  // No key configured → demo mode; the Scheduler shows a simulated toast.
  if (!isZernioConfigured()) {
    return Response.json({ source: "demo", status: "simulated" });
  }

  // Key configured → real Zernio call.
  try {
    const result = await postToZernio({
      caption: body.caption,
      platforms: body.platforms,
      scheduledFor: body.scheduledFor,
      accountIds: {
        instagram: process.env.ZERNIO_INSTAGRAM_ACCOUNT_ID,
        tiktok: process.env.ZERNIO_TIKTOK_ACCOUNT_ID,
        youtube: process.env.ZERNIO_YOUTUBE_ACCOUNT_ID,
      },
    });
    return Response.json({ source: "zernio", ...result });
  } catch (err) {
    console.error("Zernio posting failed:", err);
    return Response.json(
      { source: "error", error: err instanceof Error ? err.message : "failed" },
      { status: 502 },
    );
  }
}
