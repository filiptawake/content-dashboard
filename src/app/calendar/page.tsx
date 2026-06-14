"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useDashboard, useScriptComposer } from "@/components/providers";
import { type ScheduledPost } from "@/lib/types";
import {
  REFERENCE_DATE,
  refDate,
  sameDay,
  formatTime,
  formatDateTime,
} from "@/lib/dates";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { PlatformBadges } from "@/components/platform-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const { accountPosts } = useDashboard();
  const { openScript } = useScriptComposer();

  const [month, setMonth] = React.useState(() => {
    const d = refDate();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selected, setSelected] = React.useState<ScheduledPost | null>(null);

  const year = month.getFullYear();
  const monthIdx = month.getMonth();

  const postsByDay = React.useMemo(() => {
    const map = new Map<number, ScheduledPost[]>();
    for (const post of accountPosts) {
      const d = new Date(post.scheduledFor);
      if (d.getFullYear() === year && d.getMonth() === monthIdx) {
        const arr = map.get(d.getDate()) ?? [];
        arr.push(post);
        map.set(d.getDate(), arr);
      }
    }
    for (const arr of map.values())
      arr.sort((a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor));
    return map;
  }, [accountPosts, year, monthIdx]);

  const startWeekday = new Date(year, monthIdx, 1).getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthCount = accountPosts.filter((p) => {
    const d = new Date(p.scheduledFor);
    return d.getFullYear() === year && d.getMonth() === monthIdx;
  }).length;

  function shift(delta: number) {
    setMonth(new Date(year, monthIdx + delta, 1));
  }

  return (
    <>
      <PageHeader
        title="Content Calendar"
        description="Everything scheduled, by month. Click any slot for the full script and caption."
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => shift(-1)}>
            <ChevronLeft />
          </Button>
          <span className="w-36 text-center text-sm font-medium">
            {MONTH_NAMES[monthIdx]} {year}
          </span>
          <Button variant="outline" size="icon" onClick={() => shift(1)}>
            <ChevronRight />
          </Button>
        </div>
      </PageHeader>

      <div className="p-5 md:p-8">
        <p className="text-muted-foreground mb-3 text-xs">
          {monthCount} {monthCount === 1 ? "post" : "posts"} scheduled this month
        </p>

        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-muted-foreground px-1 pb-2 text-xs font-medium"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-2">
              {cells.map((day, i) => {
                if (day === null)
                  return <div key={i} className="min-h-28 rounded-lg" />;
                const cellDate = new Date(year, monthIdx, day);
                const isToday = sameDay(cellDate, REFERENCE_DATE);
                const posts = postsByDay.get(day) ?? [];
                return (
                  <div
                    key={i}
                    className={cn(
                      "bg-card flex min-h-28 flex-col gap-1 rounded-lg border p-1.5",
                      isToday && "border-primary/60 ring-primary/20 ring-1",
                    )}
                  >
                    <span
                      className={cn(
                        "px-1 text-xs font-medium",
                        isToday ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {day}
                    </span>
                    {posts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => setSelected(post)}
                        className="hover:bg-accent group flex flex-col gap-0.5 rounded-md border-l-2 px-1.5 py-1 text-left transition-colors"
                        style={{ borderLeftColor: post.gradient[0] }}
                      >
                        <span className="text-muted-foreground text-[10px]">
                          {formatTime(post.scheduledFor)}
                        </span>
                        <span className="line-clamp-2 text-[11px] leading-tight font-medium">
                          {post.hook}
                        </span>
                        <PlatformBadges
                          platforms={post.platforms}
                          compact
                          className="gap-1"
                        />
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <Sheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
      >
        <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
          {selected && (
            <>
              <SheetHeader className="border-b">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selected.status === "posted"
                        ? "success"
                        : selected.status === "draft"
                          ? "outline"
                          : "secondary"
                    }
                  >
                    {selected.status}
                  </Badge>
                  <SheetDescription className="m-0">
                    {formatDateTime(selected.scheduledFor)}
                  </SheetDescription>
                </div>
                <SheetTitle className="text-lg leading-snug">
                  {selected.hook}
                </SheetTitle>
                <PlatformBadges platforms={selected.platforms} />
              </SheetHeader>

              <div className="flex flex-col gap-5 p-4">
                <Field label="Angle">{selected.angle || "—"}</Field>
                <Field label="Call to action">{selected.cta || "—"}</Field>
                <div className="grid gap-2">
                  <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Caption
                  </p>
                  <div className="bg-muted/40 rounded-lg border p-3 text-sm whitespace-pre-wrap">
                    {selected.caption || "No caption generated yet."}
                  </div>
                </div>
              </div>

              <SheetFooter className="border-t">
                <Button
                  onClick={() => {
                    openScript({
                      hook: selected.hook,
                      angle: selected.angle,
                      cta: selected.cta,
                    });
                    setSelected(null);
                  }}
                >
                  Open in /script
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <p className="text-sm">{children}</p>
    </div>
  );
}
