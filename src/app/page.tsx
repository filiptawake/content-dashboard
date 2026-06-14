"use client";

import * as React from "react";
import Link from "next/link";
import { Flame, ArrowRight, Wand2, Eye } from "lucide-react";

import { useDashboard, useScriptComposer } from "@/components/providers";
import { getMetricSeries, reelsByAccount, median } from "@/data/analytics";
import { trendItems } from "@/data/trending";
import { METRIC_LABELS, type MetricKey } from "@/lib/types";
import { formatCompact, cn } from "@/lib/utils";
import { daysAgo, REFERENCE_DATE, formatDateTime, formatRelative } from "@/lib/dates";
import { PageHeader } from "@/components/layout/page-header";
import { Sparkline } from "@/components/sparkline";
import { PlatformBadges } from "@/components/platform-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const METRIC_COLOR: Record<MetricKey, string> = {
  views: "text-chart-1",
  saves: "text-chart-2",
  follows: "text-chart-4",
  dms: "text-chart-3",
};

export default function TodayPage() {
  const { activeAccount, accountPosts } = useDashboard();
  const { openScript } = useScriptComposer();

  const series = React.useMemo(
    () => getMetricSeries(activeAccount.id),
    [activeAccount.id],
  );

  const topHeater = React.useMemo(() => {
    const cutoff = daysAgo(30).getTime();
    const reels = (reelsByAccount[activeAccount.id] ?? []).filter(
      (r) => new Date(r.postedAt).getTime() >= cutoff,
    );
    const med = median(reels.map((r) => r.views));
    return reels
      .filter((r) => r.views >= med * 2)
      .sort((a, b) => b.views - a.views)[0];
  }, [activeAccount.id]);

  const upNext = React.useMemo(
    () =>
      accountPosts
        .filter(
          (p) =>
            p.status !== "posted" &&
            new Date(p.scheduledFor).getTime() >= REFERENCE_DATE.getTime(),
        )
        .sort((a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor))
        .slice(0, 4),
    [accountPosts],
  );

  const hookWorthy = React.useMemo(
    () =>
      [...trendItems]
        .filter((t) => t.tag === "hook-potential")
        .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
        .slice(0, 3),
    [],
  );

  return (
    <>
      <PageHeader
        title="Today"
        description={`What's happening across ${activeAccount.handle}.`}
      >
        <Button onClick={() => openScript()}>
          <Wand2 />
          New script
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-6 p-5 md:p-8">
        {/* Stat tiles */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {series.map((s) => {
            const last7 = s.daily.slice(-7);
            const total = last7.reduce((a, b) => a + b, 0);
            return (
              <Card key={s.key} className="gap-2">
                <CardContent className="flex flex-col gap-2">
                  <p className="text-muted-foreground text-sm">
                    {METRIC_LABELS[s.key]}
                    <span className="ml-1 text-xs">· 7d</span>
                  </p>
                  <p className="text-2xl font-semibold tracking-tight">
                    {formatCompact(total)}
                  </p>
                  <Sparkline
                    data={last7}
                    className={cn("h-8 w-full", METRIC_COLOR[s.key])}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top heater */}
          <section className="flex flex-col gap-3">
            <SectionTitle href="/analytics" label="This week's top heater">
              <Flame className="text-primary size-4" />
            </SectionTitle>
            {topHeater ? (
              <Card>
                <CardContent className="flex flex-col gap-2">
                  <p className="font-medium">{topHeater.hook}</p>
                  <p className="text-muted-foreground text-sm">
                    {topHeater.note}
                  </p>
                  <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
                    <span className="text-foreground flex items-center gap-1 font-medium">
                      <Eye className="size-4" />
                      {formatCompact(topHeater.views)}
                    </span>
                    <span>{formatCompact(topHeater.saves)} saves</span>
                    <span>+{formatCompact(topHeater.follows)} follows</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="text-muted-foreground items-center py-8 text-center text-sm">
                No heaters yet this week.
              </Card>
            )}
          </section>

          {/* Up next */}
          <section className="flex flex-col gap-3">
            <SectionTitle href="/calendar" label="Up next" />
            <Card className="gap-0 p-0">
              {upNext.length === 0 ? (
                <p className="text-muted-foreground p-6 text-center text-sm">
                  Nothing scheduled. Draft something →
                </p>
              ) : (
                upNext.map((post, i) => (
                  <div
                    key={post.id}
                    className={cn(
                      "flex items-center gap-3 p-4",
                      i > 0 && "border-t",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{post.hook}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(post.scheduledFor)}
                      </p>
                    </div>
                    <PlatformBadges platforms={post.platforms} compact />
                  </div>
                ))
              )}
            </Card>
          </section>
        </div>

        {/* Hook-worthy from trending */}
        <section className="flex flex-col gap-3">
          <SectionTitle href="/trending" label="Hook-worthy right now" />
          <div className="grid gap-3 md:grid-cols-3">
            {hookWorthy.map((item) => (
              <Card key={item.id} className="gap-3">
                <CardContent className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground truncate text-xs">
                      {item.source}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-xs">
                      {formatRelative(item.publishedAt)}
                    </span>
                  </div>
                  <p className="flex-1 text-sm font-medium">
                    {item.hookAngle ?? item.title}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-fit"
                    onClick={() =>
                      openScript({ hook: item.hookAngle ?? item.title })
                    }
                  >
                    <Wand2 />
                    Use hook
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function SectionTitle({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {children}
        <h2 className="font-semibold">{label}</h2>
      </div>
      <Link
        href={href}
        className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
      >
        View all
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
