"use client";

import * as React from "react";
import {
  Newspaper,
  AtSign,
  Rss,
  Send,
  Wand2,
  Flame,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useScriptComposer } from "@/components/providers";
import { trendItems, SOURCES } from "@/data/trending";
import {
  TREND_TAG_LABELS,
  type TrendItem,
  type TrendSourceType,
  type TrendTag,
} from "@/lib/types";
import { formatRelative } from "@/lib/dates";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SOURCE_ICON: Record<TrendSourceType, LucideIcon> = {
  blog: Newspaper,
  x: AtSign,
  rss: Rss,
};

function TagBadge({ tag }: { tag: TrendTag }) {
  const variant =
    tag === "hook-potential"
      ? "default"
      : tag === "explainer"
        ? "secondary"
        : "outline";
  return <Badge variant={variant}>{TREND_TAG_LABELS[tag]}</Badge>;
}

export default function TrendingPage() {
  const { openScript } = useScriptComposer();
  const [filter, setFilter] = React.useState<TrendTag | "all">("all");

  const byRecency = React.useMemo(
    () =>
      [...trendItems].sort(
        (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt),
      ),
    [],
  );

  const topHooks = React.useMemo(
    () => byRecency.filter((t) => t.tag === "hook-potential").slice(0, 5),
    [byRecency],
  );

  const filtered = React.useMemo(
    () => (filter === "all" ? byRecency : byRecency.filter((t) => t.tag === filter)),
    [byRecency, filter],
  );

  function sendToSlack() {
    toast.success("Highlights sent to Slack", {
      description: `${topHooks.length} hook-worthy items posted to #content.`,
    });
  }

  return (
    <>
      <PageHeader
        title="What's Trending"
        description={`AI news from ${SOURCES.length} sources, auto-tagged for hook potential.`}
      >
        <Button variant="outline" onClick={sendToSlack}>
          <Send />
          Slack the highlights
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-6 p-5 md:p-8">
        {/* Top hook-worthy feed */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="text-primary size-5" />
              <h2 className="text-lg font-semibold">Top hook-worthy today</h2>
            </div>
            <span className="text-muted-foreground text-xs">
              Auto-sent to Slack daily at 7:00 AM
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {topHooks.map((item) => (
              <Card key={item.id} className="border-primary/20 gap-3">
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <SourceLabel item={item} />
                    <span className="text-muted-foreground text-xs">
                      {formatRelative(item.publishedAt)}
                    </span>
                  </div>
                  <p className="font-medium leading-snug">{item.title}</p>
                  {item.hookAngle && (
                    <div className="bg-primary/5 rounded-lg border-l-2 border-primary/50 px-3 py-2">
                      <p className="text-muted-foreground mb-0.5 text-[10px] font-medium tracking-wide uppercase">
                        Suggested hook
                      </p>
                      <p className="text-sm">{item.hookAngle}</p>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() =>
                        openScript({
                          hook: item.hookAngle ?? item.title,
                        })
                      }
                    >
                      <Wand2 />
                      Use hook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Full feed */}
        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">All sources</h2>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as TrendTag | "all")}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="hook-potential">Hook</TabsTrigger>
                <TabsTrigger value="explainer">Explainer</TabsTrigger>
                <TabsTrigger value="skip">Skip</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col gap-2">
            {filtered.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <SourceLabel item={item} />
                      <span className="text-muted-foreground text-xs">
                        · {formatRelative(item.publishedAt)}
                      </span>
                    </div>
                    <p className="font-medium leading-snug">{item.title}</p>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {item.summary}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <TagBadge tag={item.tag} />
                    {item.tag === "hook-potential" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          openScript({ hook: item.hookAngle ?? item.title })
                        }
                      >
                        <Wand2 />
                        Use
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Source list */}
        <section>
          <h2 className="mb-3 text-sm font-semibold">
            Sources monitored ({SOURCES.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <Badge key={s} variant="outline" className="gap-1.5 font-normal">
                <ExternalLink className="size-3" />
                {s}
              </Badge>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function SourceLabel({ item }: { item: TrendItem }) {
  const Icon = SOURCE_ICON[item.sourceType];
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
      <Icon className="size-3.5" />
      {item.source}
    </span>
  );
}
