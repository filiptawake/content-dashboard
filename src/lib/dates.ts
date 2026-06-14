// Deterministic date helpers.
//
// The whole demo is anchored to a fixed REFERENCE_DATE so that seed data is
// stable across server/client renders (no hydration mismatches) and the
// Content Calendar always opens on a fully-populated month. Swap REFERENCE_DATE
// for `new Date()` once real data is wired in.

export const REFERENCE_DATE = new Date(2026, 5, 13, 9, 0, 0); // 13 Jun 2026, 09:00

export function refDate(): Date {
  return new Date(REFERENCE_DATE);
}

/** N days before the reference date (N can be negative for the future). */
export function daysAgo(n: number): Date {
  const d = refDate();
  d.setDate(d.getDate() - n);
  return d;
}

/** N days after the reference date. */
export function daysAhead(n: number): Date {
  return daysAgo(-n);
}

export function toISO(d: Date): string {
  return d.toISOString();
}

export function atTime(d: Date, hours: number, minutes = 0): Date {
  const copy = new Date(d);
  copy.setHours(hours, minutes, 0, 0);
  return copy;
}

/** Most recent past Sunday relative to the reference date (the weekly scrape). */
export function lastSunday(): Date {
  const d = refDate();
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(8, 0, 0, 0);
  return d;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export function formatTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function formatDateTime(input: string | Date): string {
  return `${formatDate(input)}, ${formatTime(input)}`;
}

/** "just now", "3h ago", "2d ago" relative to REFERENCE_DATE. */
export function formatRelative(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const diffMs = REFERENCE_DATE.getTime() - d.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
