import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Compact number formatter: 12_500 -> "12.5K", 2_100_000 -> "2.1M". */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Full thousands-separated number: 12500 -> "12,500". */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
