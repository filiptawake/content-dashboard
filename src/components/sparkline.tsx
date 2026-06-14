import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Lightweight SVG sparkline. Color follows `currentColor`, so set a text color
 * on the element (e.g. `text-primary`). Renders a smooth line + faint area fill.
 */
export function Sparkline({
  data,
  className,
  strokeWidth = 1.75,
}: {
  data: number[];
  className?: string;
  strokeWidth?: number;
}) {
  const id = React.useId();
  const width = 100;
  const height = 32;

  if (data.length < 2) {
    return <svg viewBox={`0 0 ${width} ${height}`} className={className} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / span) * (height - 4) - 2;
    return [x, y] as const;
  });

  const line = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} ${width},${height} 0,${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
          <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${id})`} stroke="none" />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
