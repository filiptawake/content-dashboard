"use client";

import * as React from "react";
import { Search, Eye, Wand2, Quote as QuoteIcon } from "lucide-react";

import { useDashboard, useScriptComposer } from "@/components/providers";
import {
  HOOK_TEMPLATES,
  NICHE_LABELS,
  type HookType,
  type Niche,
} from "@/lib/types";
import { formatCompact } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { GradientAvatar } from "@/components/gradient-avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortKey = "views" | "recent";

export default function HookVaultPage() {
  const { accountHooks } = useDashboard();
  const { openScript } = useScriptComposer();

  const [query, setQuery] = React.useState("");
  const [niche, setNiche] = React.useState<Niche | "all">("all");
  const [hookType, setHookType] = React.useState<HookType | "all">("all");
  const [sort, setSort] = React.useState<SortKey>("views");

  const niches = React.useMemo(
    () => Array.from(new Set(accountHooks.map((h) => h.niche))),
    [accountHooks],
  );
  const types = React.useMemo(
    () => Array.from(new Set(accountHooks.map((h) => h.hookType))),
    [accountHooks],
  );

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return accountHooks
      .filter((h) => {
        if (niche !== "all" && h.niche !== niche) return false;
        if (hookType !== "all" && h.hookType !== hookType) return false;
        if (
          q &&
          !h.text.toLowerCase().includes(q) &&
          !h.originalCreator.toLowerCase().includes(q) &&
          !h.transcript.toLowerCase().includes(q)
        )
          return false;
        return true;
      })
      .sort((a, b) =>
        sort === "views"
          ? b.views - a.views
          : +new Date(b.savedAt) - +new Date(a.savedAt),
      );
  }, [accountHooks, query, niche, hookType, sort]);

  return (
    <>
      <PageHeader
        title="Hook Vault"
        description="Every viral hook you save — transcribed and templatized. Search by niche, hook type, or view count."
      >
        <Badge variant="secondary" className="font-normal">
          {accountHooks.length} saved
        </Badge>
      </PageHeader>

      <div className="flex flex-col gap-5 p-5 md:p-8">
        {/* Filters */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hooks, creators, transcripts…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={niche}
              onValueChange={(v) => setNiche(v as Niche | "all")}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Niche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All niches</SelectItem>
                {niches.map((n) => (
                  <SelectItem key={n} value={n}>
                    {NICHE_LABELS[n]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={hookType}
              onValueChange={(v) => setHookType(v as HookType | "all")}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Hook type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All hook types</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {HOOK_TEMPLATES[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="views">Most viewed</SelectItem>
                <SelectItem value="recent">Recently saved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <Card className="text-muted-foreground items-center justify-center py-16 text-center text-sm">
            No hooks match your filters yet.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((hook) => (
              <Card
                key={hook.id}
                className="hover:border-primary/40 group justify-between gap-4 transition-colors"
              >
                <div className="flex flex-col gap-3 px-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs">
                      <QuoteIcon className="size-3" />
                      {HOOK_TEMPLATES[hook.hookType].template}
                    </span>
                    <Badge variant="outline" className="shrink-0">
                      {NICHE_LABELS[hook.niche]}
                    </Badge>
                  </div>
                  <p className="text-[15px] leading-snug font-medium">
                    {hook.text}
                  </p>
                  <p className="text-muted-foreground line-clamp-2 text-xs">
                    {hook.transcript}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 border-t px-6 pt-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <GradientAvatar
                      seed={hook.originalCreator}
                      className="size-6 text-[9px]"
                    />
                    <div className="min-w-0">
                      <p className="text-muted-foreground truncate text-xs">
                        {hook.originalCreator}
                      </p>
                      <p className="flex items-center gap-1 text-xs font-medium">
                        <Eye className="size-3" />
                        {formatCompact(hook.views)} views
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      openScript({
                        hook: hook.text,
                        sourceCreator: hook.originalCreator,
                      })
                    }
                  >
                    <Wand2 />
                    Use this
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
