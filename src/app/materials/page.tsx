"use client";

import * as React from "react";
import {
  Search,
  Wand2,
  ExternalLink,
  Repeat2,
  Film,
  Type,
  GalleryHorizontalEnd,
  Video,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";

import { useDashboard, useScriptComposer } from "@/components/providers";
import { seedMaterials } from "@/data/materials";
import { MATERIAL_TYPE_LABELS, type MaterialType } from "@/lib/types";
import { PageHeader } from "@/components/layout/page-header";
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

const MATERIAL_ICONS: Record<MaterialType, LucideIcon> = {
  "reel-format": Film,
  "caption-framework": Type,
  carousel: GalleryHorizontalEnd,
  "b-roll": Video,
  cover: ImageIcon,
};

type SortKey = "used" | "recent";

export default function MaterialsPage() {
  const { activeAccount } = useDashboard();
  const { openScript } = useScriptComposer();

  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState<MaterialType | "all">("all");
  const [sort, setSort] = React.useState<SortKey>("used");

  const materials = React.useMemo(
    () => seedMaterials.filter((m) => m.accountId === activeAccount.id),
    [activeAccount.id],
  );

  const types = React.useMemo(
    () => Array.from(new Set(materials.map((m) => m.type))),
    [materials],
  );

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials
      .filter((m) => {
        if (type !== "all" && m.type !== type) return false;
        if (
          q &&
          !m.title.toLowerCase().includes(q) &&
          !m.description.toLowerCase().includes(q) &&
          !m.tags.some((t) => t.toLowerCase().includes(q))
        )
          return false;
        return true;
      })
      .sort((a, b) =>
        sort === "used"
          ? b.usageCount - a.usageCount
          : +new Date(b.addedAt) - +new Date(a.addedAt),
      );
  }, [materials, query, type, sort]);

  return (
    <>
      <PageHeader
        title="Materials"
        description="Your reusable library — reel formats, caption frameworks, carousels and b-roll. Pull any into a script."
      >
        <Badge variant="secondary" className="font-normal">
          {materials.length} templates
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
              placeholder="Search materials, descriptions, tags…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={type}
              onValueChange={(v) => setType(v as MaterialType | "all")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {MATERIAL_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="used">Most used</SelectItem>
                <SelectItem value="recent">Recently added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <Card className="text-muted-foreground items-center justify-center py-16 text-center text-sm">
            No materials match your filters yet.
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((m) => {
              const Icon = MATERIAL_ICONS[m.type];
              return (
                <Card
                  key={m.id}
                  className="hover:border-primary/40 group gap-0 overflow-hidden p-0 transition-colors"
                >
                  {/* Thumbnail banner */}
                  <div
                    className="relative flex h-24 items-center justify-center"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${m.gradient[0]}, ${m.gradient[1]})`,
                    }}
                  >
                    <Icon className="size-8 text-white/90" />
                    <span className="absolute bottom-2 left-3 rounded bg-black/25 px-1.5 py-0.5 text-[11px] font-medium text-white">
                      {MATERIAL_TYPE_LABELS[m.type]}
                    </span>
                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-2 right-2 inline-flex items-center gap-1 rounded bg-black/25 px-1.5 py-0.5 text-[11px] font-medium text-white transition-colors hover:bg-black/40"
                      >
                        <ExternalLink className="size-3" />
                        Open
                      </a>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex flex-col gap-1.5">
                      <p className="leading-snug font-medium">{m.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {m.description}
                      </p>
                    </div>

                    {m.body && (
                      <pre className="bg-muted/60 text-muted-foreground overflow-x-auto rounded-md p-3 font-mono text-[11px] whitespace-pre-wrap">
                        {m.body}
                      </pre>
                    )}

                    {m.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {m.tags.map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="font-normal"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between gap-2 border-t pt-4">
                      <span className="text-muted-foreground flex items-center gap-1 text-xs">
                        <Repeat2 className="size-3.5" />
                        Used {m.usageCount}×
                      </span>
                      <Button size="sm" onClick={() => openScript(m.seed ?? {})}>
                        <Wand2 />
                        Use this
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
