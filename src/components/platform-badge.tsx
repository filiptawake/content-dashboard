import type { Platform } from "@/lib/types";
import { PLATFORM_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const DOT: Record<Platform, string> = {
  instagram: "#E1306C",
  tiktok: "#22d3ee",
  youtube: "#FF0000",
};

const SHORT: Record<Platform, string> = {
  instagram: "IG",
  tiktok: "TikTok",
  youtube: "YT",
};

export function PlatformBadges({
  platforms,
  compact = false,
  className,
}: {
  platforms: Platform[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {platforms.map((p) => (
        <span
          key={p}
          className="border-border bg-secondary/60 text-secondary-foreground inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
        >
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: DOT[p] }}
          />
          {compact ? SHORT[p] : PLATFORM_LABELS[p]}
        </span>
      ))}
    </div>
  );
}
