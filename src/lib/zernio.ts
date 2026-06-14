// Zernio multi-platform posting — server-only, optional. Mirrors src/lib/ai.ts:
// imported only by the route handler so the key never reaches the client bundle.
//
//   No ZERNIO_API_KEY -> isZernioConfigured() is false and the Scheduler keeps
//   simulating "Post now".
//   Key set -> postToZernio() publishes via https://zernio.com/api/v1/posts.

import type { Platform } from "./types";

const ZERNIO_API = "https://zernio.com/api/v1";

/** Our platform ids already match Zernio's platform names. */
const ZERNIO_PLATFORM: Record<Platform, string> = {
  instagram: "instagram",
  tiktok: "tiktok",
  youtube: "youtube",
};

export function isZernioConfigured(): boolean {
  return Boolean(process.env.ZERNIO_API_KEY);
}

export interface ZernioPostInput {
  caption: string;
  platforms: Platform[];
  /** ISO timestamp to schedule; omit to publish immediately. */
  scheduledFor?: string;
  /** Connected Zernio account id per platform (zernio.com/dashboard/connections). */
  accountIds?: Partial<Record<Platform, string | undefined>>;
}

export interface ZernioPostResult {
  id?: string;
  status: string;
}

export async function postToZernio(
  input: ZernioPostInput,
): Promise<ZernioPostResult> {
  const key = process.env.ZERNIO_API_KEY;
  if (!key) throw new Error("ZERNIO_API_KEY is not set");

  const platforms = input.platforms.map((p) => ({
    platform: ZERNIO_PLATFORM[p],
    accountId: input.accountIds?.[p],
  }));

  const res = await fetch(`${ZERNIO_API}/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: input.caption,
      platforms,
      ...(input.scheduledFor
        ? { scheduledFor: input.scheduledFor }
        : { publishNow: true }),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Zernio API ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
  };
  return { id: data.id, status: data.status ?? "submitted" };
}
