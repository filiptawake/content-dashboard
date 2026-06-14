"use client";

import * as React from "react";
import { Eye, Music, Bookmark, BookmarkCheck, Type } from "lucide-react";
import { toast } from "sonner";

import { useDashboard } from "@/components/providers";
import { competitorReels } from "@/data/competitors";
import {
  HOOK_TEMPLATES,
  NICHE_LABELS,
  type CompetitorReel,
  type Hook,
} from "@/lib/types";
import { formatCompact } from "@/lib/utils";
import { formatDate, formatRelative, lastSunday } from "@/lib/dates";
import { PageHeader } from "@/components/layout/page-header";
import { GradientAvatar } from "@/components/gradient-avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CompetitorsPage() {
  const { activeAccount, addHook } = useDashboard();
  const [saved, setSaved] = React.useState<Set<string>>(new Set());

  const reels = React.useMemo(
    () =>
      competitorReels
        .filter((r) => r.trackedByAccountId === activeAccount.id)
        .sort((a, b) => b.views - a.views),
    [activeAccount.id],
  );

  const creatorCount = React.useMemo(
    () => new Set(reels.map((r) => r.creatorHandle)).size,
    [reels],
  );

  function saveToVault(reel: CompetitorReel) {
    if (saved.has(reel.id)) return;
    const hook: Hook = {
      id: `vault-${reel.id}`,
      accountId: activeAccount.id,
      text: reel.hook,
      hookType: reel.hookType,
      niche: reel.niche,
      originalCreator: reel.creatorHandle,
      views: reel.views,
      transcript: reel.transcript,
      savedAt: new Date().toISOString(),
      source: "competitor",
    };
    addHook(hook);
    setSaved((prev) => new Set(prev).add(reel.id));
    toast.success(`Saved to Hook Vault`, {
      description: `"${reel.hook}" from ${reel.creatorHandle}`,
    });
  }

  return (
    <>
      <PageHeader
        title="Competitor Tracker"
        description={`Top reels from the creators ${activeAccount.handle} tracks — scraped weekly, transcribed, with hooks pulled.`}
      >
        <Badge variant="secondary" className="font-normal">
          {creatorCount} creators · scraped {formatDate(lastSunday())}
        </Badge>
      </PageHeader>

      <div className="flex flex-col gap-4 p-5 md:p-8">
        {reels.length === 0 ? (
          <Card className="text-muted-foreground items-center py-16 text-center text-sm">
            No tracked creators for this account yet.
          </Card>
        ) : (
          reels.map((reel) => {
            const isSaved = saved.has(reel.id);
            return (
              <Card key={reel.id} className="gap-4 p-5">
                {/* Creator row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <GradientAvatar seed={reel.creatorHandle} className="size-10" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{reel.creatorHandle}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatCompact(reel.creatorFollowers)} followers ·{" "}
                        {NICHE_LABELS[reel.niche]}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="flex items-center justify-end gap-1 font-semibold">
                      <Eye className="size-4" />
                      {formatCompact(reel.views)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      posted {formatRelative(reel.postedAt)}
                    </p>
                  </div>
                </div>

                {/* Hook + template */}
                <div className="flex flex-col gap-2">
                  <span className="bg-primary/10 text-primary inline-flex w-fit items-center rounded-md px-2 py-1 font-mono text-xs">
                    {HOOK_TEMPLATES[reel.hookType].template}
                  </span>
                  <p className="font-medium">{reel.hook}</p>
                </div>

                {/* On-screen text + audio */}
                <div className="flex flex-wrap gap-2">
                  <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
                    <Type className="size-3" />
                    {reel.onScreenText}
                  </span>
                  <span className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
                    <Music className="size-3" />
                    {reel.audioTitle}
                  </span>
                </div>

                <p className="text-muted-foreground border-l-2 pl-3 text-sm italic">
                  {reel.transcript}
                </p>

                <div className="flex justify-end border-t pt-4">
                  <Button
                    variant={isSaved ? "secondary" : "default"}
                    size="sm"
                    onClick={() => saveToVault(reel)}
                    disabled={isSaved}
                  >
                    {isSaved ? <BookmarkCheck /> : <Bookmark />}
                    {isSaved ? "Saved to Vault" : "Save to Hook Vault"}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
