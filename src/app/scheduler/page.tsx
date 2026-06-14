"use client";

import * as React from "react";
import { Plus, Send, Pencil, CheckCircle2, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

import { useDashboard, useScriptComposer } from "@/components/providers";
import { type ScheduledPost } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/types";
import { formatDateTime } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { PlatformBadges } from "@/components/platform-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SchedulerPage() {
  const { accountPosts } = useDashboard();
  const { openScript } = useScriptComposer();
  const [posted, setPosted] = React.useState<Set<string>>(new Set());

  const queue = React.useMemo(
    () =>
      [...accountPosts].sort(
        (a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor),
      ),
    [accountPosts],
  );

  function publish(post: ScheduledPost) {
    setPosted((prev) => new Set(prev).add(post.id));
    toast.success("Posted via Zernio MCP", {
      description: `${post.hook} → ${post.platforms
        .map((p) => PLATFORM_LABELS[p])
        .join(", ")}`,
    });
  }

  return (
    <>
      <PageHeader
        title="Scheduler"
        description="Pick platforms, auto-generate a caption, and let Zernio MCP handle the actual posting."
      >
        <Button onClick={() => openScript()}>
          <Plus />
          New script
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-5 p-5 md:p-8">
        {/* How it works */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-6">
            <span className="text-primary font-medium">One-click publishing</span>
            <span className="text-muted-foreground">
              Claude writes the caption from your hook + angle + CTA, then{" "}
              <span className="text-foreground font-medium">Zernio MCP</span>{" "}
              posts to Instagram, TikTok &amp; YouTube Shorts in one shot.
            </span>
          </CardContent>
        </Card>

        {queue.length === 0 ? (
          <Card className="text-muted-foreground items-center py-16 text-center text-sm">
            Nothing queued. Hit “New script” to draft your first reel.
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {queue.map((post) => {
              const isPosted = posted.has(post.id) || post.status === "posted";
              return (
                <Card key={post.id} className="overflow-hidden p-0">
                  <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div
                      className="hidden h-16 w-12 shrink-0 rounded-md sm:block"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${post.gradient[0]}, ${post.gradient[1]})`,
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <StatusBadge status={isPosted ? "posted" : post.status} />
                        <span className="text-muted-foreground text-xs">
                          {formatDateTime(post.scheduledFor)}
                        </span>
                      </div>
                      <p className="truncate font-medium">{post.hook}</p>
                      <p className="text-muted-foreground line-clamp-1 text-xs">
                        {post.caption
                          ? post.caption.split("\n")[0]
                          : "No caption yet — generate one in /script."}
                      </p>
                      <div className="mt-2">
                        <PlatformBadges platforms={post.platforms} compact />
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openScript({
                            hook: post.hook,
                            angle: post.angle,
                            cta: post.cta,
                          })
                        }
                      >
                        <Pencil />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => publish(post)}
                        disabled={isPosted}
                      >
                        <Send />
                        {isPosted ? "Posted" : "Post now"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function StatusBadge({ status }: { status: ScheduledPost["status"] }) {
  const map = {
    scheduled: { label: "Scheduled", icon: Clock, cls: "" },
    draft: { label: "Draft", icon: FileText, cls: "" },
    posted: { label: "Posted", icon: CheckCircle2, cls: "" },
  } as const;
  const { label, icon: Icon } = map[status];
  return (
    <Badge
      variant={status === "posted" ? "success" : status === "draft" ? "outline" : "secondary"}
      className={cn("gap-1")}
    >
      <Icon className="size-3" />
      {label}
    </Badge>
  );
}
