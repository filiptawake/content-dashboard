"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, Flame, Eye } from "lucide-react";

import { useDashboard } from "@/components/providers";
import { getMetricSeries, reelsByAccount, median } from "@/data/analytics";
import {
  METRIC_LABELS,
  type MetricKey,
  type Reel,
} from "@/lib/types";
import { formatCompact, formatNumber, cn } from "@/lib/utils";
import { daysAgo } from "@/lib/dates";
import { PageHeader } from "@/components/layout/page-header";
import { Sparkline } from "@/components/sparkline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const WINDOWS = [7, 30, 90] as const;
type Window = (typeof WINDOWS)[number];

const METRIC_COLOR: Record<MetricKey, string> = {
  views: "text-chart-1",
  saves: "text-chart-2",
  follows: "text-chart-4",
  dms: "text-chart-3",
};

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

export default function AnalyticsPage() {
  const { activeAccount } = useDashboard();
  const [windowDays, setWindowDays] = React.useState<Window>(30);

  const series = React.useMemo(
    () => getMetricSeries(activeAccount.id),
    [activeAccount.id],
  );

  // --- Heater detection: reels that beat the 30-day median views by 2x. ------
  const { heaters, medianViews } = React.useMemo(() => {
    const cutoff = daysAgo(30).getTime();
    const reels = (reelsByAccount[activeAccount.id] ?? []).filter(
      (r) => new Date(r.postedAt).getTime() >= cutoff,
    );
    const med = median(reels.map((r) => r.views));
    const heaters = reels
      .filter((r) => r.views >= med * 2)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    return { heaters, medianViews: med };
  }, [activeAccount.id]);

  return (
    <>
      <PageHeader
        title="Analytics"
        description={`Performance for ${activeAccount.handle} — views, saves, follows, and DM volume.`}
      >
        <Tabs value={String(windowDays)} onValueChange={(v) => setWindowDays(Number(v) as Window)}>
          <TabsList>
            {WINDOWS.map((w) => (
              <TabsTrigger key={w} value={String(w)}>
                {w}d
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </PageHeader>

      <div className="flex flex-col gap-6 p-5 md:p-8">
        {/* Metric cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {series.map((s) => {
            const windowData = s.daily.slice(-windowDays);
            const prevData = s.daily.slice(-windowDays * 2, -windowDays);
            const total = sum(windowData);
            const prevTotal = sum(prevData);
            const delta =
              prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;
            const up = delta >= 0;
            return (
              <Card key={s.key} className="gap-3">
                <CardHeader>
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    {METRIC_LABELS[s.key]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-end justify-between gap-2">
                    <span className="text-2xl font-semibold tracking-tight">
                      {formatCompact(total)}
                    </span>
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        up ? "text-success" : "text-destructive",
                      )}
                    >
                      {up ? (
                        <TrendingUp className="size-3" />
                      ) : (
                        <TrendingDown className="size-3" />
                      )}
                      {Math.abs(delta).toFixed(0)}%
                    </span>
                  </div>
                  <Sparkline
                    data={windowData}
                    className={cn("h-10 w-full", METRIC_COLOR[s.key])}
                  />
                  <p className="text-muted-foreground text-xs">
                    last {windowDays} days · vs prior {windowDays}d
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Heaters */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flame className="text-primary size-5" />
              <h2 className="text-lg font-semibold">Heaters of the week</h2>
            </div>
            <p className="text-muted-foreground text-xs">
              30-day median: {formatCompact(medianViews)} views · heater = 2× that
            </p>
          </div>

          {heaters.length === 0 ? (
            <Card className="text-muted-foreground items-center py-12 text-center text-sm">
              No heaters in the last 30 days. Keep posting.
            </Card>
          ) : (
            <div className="flex flex-col gap-3">
              {heaters.map((reel, i) => (
                <HeaterRow
                  key={reel.id}
                  reel={reel}
                  rank={i + 1}
                  multiple={medianViews > 0 ? reel.views / medianViews : 0}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function HeaterRow({
  reel,
  rank,
  multiple,
}: {
  reel: Reel;
  rank: number;
  multiple: number;
}) {
  return (
    <Card className="flex-row items-center gap-4 p-4">
      <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{reel.hook}</p>
        <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
          {reel.note}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="flex items-center justify-end gap-1 font-semibold">
          <Eye className="size-3.5" />
          {formatCompact(reel.views)}
        </p>
        <p className="text-muted-foreground text-xs">
          {formatNumber(reel.saves)} saves
        </p>
      </div>
      <Badge className="shrink-0">{multiple.toFixed(1)}× median</Badge>
    </Card>
  );
}
