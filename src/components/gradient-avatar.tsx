import { cn } from "@/lib/utils";

const PALETTE: [string, string][] = [
  ["#E2725B", "#9A3F2B"],
  ["#C9823B", "#7A4A1E"],
  ["#5B8FE2", "#2B4F9A"],
  ["#5BA67A", "#2B6647"],
  ["#8E6BD4", "#4E2F8A"],
  ["#D45B8E", "#8A2F5A"],
];

function gradientFor(seed: string): [string, string] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initials(seed: string): string {
  const clean = seed.replace(/^@/, "");
  return clean.slice(0, 2).toUpperCase();
}

export function GradientAvatar({
  seed,
  gradient,
  className,
}: {
  seed: string;
  gradient?: [string, string];
  className?: string;
}) {
  const [from, to] = gradient ?? gradientFor(seed);
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white",
        className,
      )}
      style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initials(seed)}
    </span>
  );
}
