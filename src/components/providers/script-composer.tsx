"use client";

import * as React from "react";
import { Loader2, Sparkles, CalendarPlus } from "lucide-react";
import { toast } from "sonner";

import type { Platform, ScheduledPost } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/types";
import { useDashboard } from "./dashboard-provider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export interface ScriptSeed {
  hook?: string;
  angle?: string;
  cta?: string;
  sourceCreator?: string;
}

interface ScriptComposerContextValue {
  openScript: (seed?: ScriptSeed) => void;
}

const ScriptComposerContext =
  React.createContext<ScriptComposerContextValue | null>(null);

const ALL_PLATFORMS: Platform[] = ["instagram", "tiktok", "youtube"];

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function defaultSlot(): string {
  // Default to ~tomorrow 9:00 AM relative to "now".
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return toLocalInputValue(d);
}

export function ScriptComposerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeAccount, addScheduledPost } = useDashboard();

  const [open, setOpen] = React.useState(false);
  const [hook, setHook] = React.useState("");
  const [angle, setAngle] = React.useState("");
  const [cta, setCta] = React.useState("");
  const [platforms, setPlatforms] = React.useState<Platform[]>(["instagram"]);
  const [when, setWhen] = React.useState(defaultSlot);
  const [caption, setCaption] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [captionSource, setCaptionSource] = React.useState<
    "claude" | "demo" | null
  >(null);

  const openScript = React.useCallback((seed?: ScriptSeed) => {
    setHook(seed?.hook ?? "");
    setAngle(seed?.angle ?? "");
    setCta(seed?.cta ?? "");
    setPlatforms(["instagram"]);
    setWhen(defaultSlot());
    setCaption("");
    setCaptionSource(null);
    setOpen(true);
  }, []);

  function togglePlatform(p: Platform, on: boolean) {
    setPlatforms((prev) =>
      on ? [...new Set([...prev, p])] : prev.filter((x) => x !== p),
    );
  }

  async function generateCaption() {
    if (!hook.trim()) {
      toast.error("Add a hook first.");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hook,
          angle,
          cta,
          platforms,
          niche: activeAccount.niche,
          handle: activeAccount.handle,
        }),
      });
      const data = (await res.json()) as {
        caption?: string;
        source?: "claude" | "demo";
      };
      if (data.caption) {
        setCaption(data.caption);
        setCaptionSource(data.source ?? "demo");
      } else {
        toast.error("Could not generate a caption.");
      }
    } catch {
      toast.error("Caption request failed.");
    } finally {
      setGenerating(false);
    }
  }

  function schedule(status: ScheduledPost["status"]) {
    if (!hook.trim()) {
      toast.error("Add a hook first.");
      return;
    }
    if (platforms.length === 0) {
      toast.error("Pick at least one platform.");
      return;
    }
    const post: ScheduledPost = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s-${Date.now()}`,
      accountId: activeAccount.id,
      title: hook.trim().slice(0, 40),
      hook: hook.trim(),
      angle: angle.trim(),
      cta: cta.trim(),
      caption,
      platforms,
      scheduledFor: new Date(when).toISOString(),
      status,
      gradient: ["#E2725B", "#9A3F2B"],
    };
    addScheduledPost(post);
    setOpen(false);
    toast.success(
      status === "scheduled"
        ? "Scheduled — added to your Content Calendar."
        : "Saved as a draft on your Content Calendar.",
    );
  }

  return (
    <ScriptComposerContext.Provider value={{ openScript }}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full gap-0 overflow-y-auto p-0 sm:max-w-lg">
          <SheetHeader className="border-b p-5">
            <div className="flex items-center gap-2">
              <span className="bg-primary/15 text-primary inline-flex size-7 items-center justify-center rounded-md font-mono text-xs">
                /
              </span>
              <SheetTitle className="text-base">script</SheetTitle>
            </div>
            <SheetDescription>
              Draft a reel for {activeAccount.handle}. Generate a caption, then
              drop it onto your calendar.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 p-5">
            <div className="grid gap-2">
              <Label htmlFor="sc-hook">Hook</Label>
              <Textarea
                id="sc-hook"
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                placeholder="e.g. Claude just killed prompt engineering"
                className="min-h-16"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sc-angle">Angle</Label>
              <Textarea
                id="sc-angle"
                value={angle}
                onChange={(e) => setAngle(e.target.value)}
                placeholder="The take / what you show on screen"
                className="min-h-16"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sc-cta">Call to action</Label>
              <Input
                id="sc-cta"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                placeholder="e.g. Follow for the full playbook"
              />
            </div>

            <div className="grid gap-2">
              <Label>Platforms</Label>
              <div className="flex flex-col gap-2 rounded-lg border p-3">
                {ALL_PLATFORMS.map((p) => (
                  <div key={p} className="flex items-center justify-between">
                    <span className="text-sm">{PLATFORM_LABELS[p]}</span>
                    <Switch
                      checked={platforms.includes(p)}
                      onCheckedChange={(v) => togglePlatform(p, v)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="sc-when">Date &amp; time</Label>
              <Input
                id="sc-when"
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>

            <Separator />

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="sc-caption">Caption</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={generateCaption}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Sparkles />
                  )}
                  {generating ? "Generating…" : "Generate with Claude"}
                </Button>
              </div>
              <Textarea
                id="sc-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Auto-generated from your hook + angle + CTA"
                className="min-h-32"
              />
              {captionSource && (
                <p className="text-muted-foreground text-xs">
                  {captionSource === "claude"
                    ? "Generated by Claude."
                    : "Demo caption — set ANTHROPIC_API_KEY for live Claude generation."}
                </p>
              )}
            </div>
          </div>

          <SheetFooter className="flex-row gap-2 border-t p-5">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => schedule("draft")}
            >
              Save draft
            </Button>
            <Button className="flex-1" onClick={() => schedule("scheduled")}>
              <CalendarPlus />
              Schedule
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </ScriptComposerContext.Provider>
  );
}

export function useScriptComposer(): ScriptComposerContextValue {
  const ctx = React.useContext(ScriptComposerContext);
  if (!ctx) {
    throw new Error(
      "useScriptComposer must be used within a ScriptComposerProvider",
    );
  }
  return ctx;
}
