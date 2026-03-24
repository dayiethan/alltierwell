"use client";

import type { EraRadarScore } from "@/lib/types";

interface EraRadarChartProps {
  user1EraRadar: EraRadarScore[];
  user2EraRadar: EraRadarScore[];
  user1Name: string;
  user2Name: string;
}

/**
 * Full era radar / spider chart comparing two users' scores across ALL eras.
 *
 * Score scale: S=0, A=1, B=2, C=3, D=4, F=5  (lower is better)
 * We invert so higher radius = better score:
 *   chartValue = (5 - avgTier) / 5   →  1 = all S, 0 = all F
 * Eras with no ranked songs (avgTier === -1) collapse to center (0).
 */
export default function EraRadarChart({
  user1EraRadar,
  user2EraRadar,
  user1Name,
  user2Name,
}: EraRadarChartProps) {
  const axisCount = user1EraRadar.length;
  if (axisCount < 3) return null;

  // Check if at least one user has ranked songs in at least 3 eras
  const user1Active = user1EraRadar.filter((e) => e.avgTier >= 0).length;
  const user2Active = user2EraRadar.filter((e) => e.avgTier >= 0).length;
  if (user1Active < 3 && user2Active < 3) return null;

  // Chart geometry
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 130;
  const levels = 5;

  function angleFor(i: number): number {
    return (Math.PI * 2 * i) / axisCount - Math.PI / 2;
  }

  function pointAt(i: number, radius: number): [number, number] {
    const angle = angleFor(i);
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  function toChartValue(avgTier: number): number {
    if (avgTier < 0) return 0; // no data → center
    return Math.max(0, Math.min(1, (5 - avgTier) / 5));
  }

  function polygonPoints(values: number[]): string {
    return values
      .map((v, i) => {
        const r = v * maxRadius;
        const [x, y] = pointAt(i, r);
        return `${x},${y}`;
      })
      .join(" ");
  }

  const user1Values = user1EraRadar.map((e) => toChartValue(e.avgTier));
  const user2Values = user2EraRadar.map((e) => toChartValue(e.avgTier));

  // Concentric grid rings
  const gridRings = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * maxRadius;
    return user1EraRadar
      .map((_, j) => {
        const [x, y] = pointAt(j, r);
        return `${x},${y}`;
      })
      .join(" ");
  });

  // Axis lines
  const axisLines = user1EraRadar.map((_, i) => {
    const [x, y] = pointAt(i, maxRadius);
    return { x1: cx, y1: cy, x2: x, y2: y };
  });

  // Labels positioned outside the chart
  const labelOffset = 20;
  const labels = user1EraRadar.map((era, i) => {
    const angle = angleFor(i);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const extraHPad = Math.abs(cos) * 10;
    const r = maxRadius + labelOffset + extraHPad;
    const x = cx + r * cos;
    const y = cy + r * sin;

    let anchor: "start" | "middle" | "end" = "middle";
    if (cos > 0.15) anchor = "start";
    else if (cos < -0.15) anchor = "end";

    // Dim label if neither user has ranked songs in this era
    const u1Active = user1EraRadar[i].avgTier >= 0;
    const u2Active = user2EraRadar[i].avgTier >= 0;
    const dimmed = !u1Active && !u2Active;

    return { x, y, text: era.label, anchor, color: era.color, dimmed };
  });

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[480px] h-auto"
        role="img"
        aria-label={`Era radar chart comparing ${user1Name} and ${user2Name}`}
      >
        {/* Grid rings */}
        {gridRings.map((pts, i) => (
          <polygon
            key={`ring-${i}`}
            points={pts}
            fill="none"
            stroke="var(--border)"
            strokeWidth={i === levels - 1 ? 1.5 : 0.7}
            opacity={0.4}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((line, i) => (
          <line
            key={`axis-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="var(--border)"
            strokeWidth={0.7}
            opacity={0.3}
          />
        ))}

        {/* User 1 polygon */}
        <polygon
          points={polygonPoints(user1Values)}
          fill="rgba(96, 165, 250, 0.15)"
          stroke="rgb(96, 165, 250)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* User 2 polygon */}
        <polygon
          points={polygonPoints(user2Values)}
          fill="rgba(244, 114, 182, 0.15)"
          stroke="rgb(244, 114, 182)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Data points - User 1 */}
        {user1Values.map((v, i) => {
          if (user1EraRadar[i].avgTier < 0) return null;
          const [x, y] = pointAt(i, v * maxRadius);
          return (
            <circle
              key={`u1-dot-${i}`}
              cx={x}
              cy={y}
              r={3.5}
              fill="rgb(96, 165, 250)"
              stroke="white"
              strokeWidth={1}
            />
          );
        })}

        {/* Data points - User 2 */}
        {user2Values.map((v, i) => {
          if (user2EraRadar[i].avgTier < 0) return null;
          const [x, y] = pointAt(i, v * maxRadius);
          return (
            <circle
              key={`u2-dot-${i}`}
              cx={x}
              cy={y}
              r={3.5}
              fill="rgb(244, 114, 182)"
              stroke="white"
              strokeWidth={1}
            />
          );
        })}

        {/* Era-colored dots on the outer ring */}
        {user1EraRadar.map((era, i) => {
          const [x, y] = pointAt(i, maxRadius);
          return (
            <circle
              key={`era-dot-${i}`}
              cx={x}
              cy={y}
              r={4}
              fill={era.color}
              stroke="var(--border)"
              strokeWidth={0.5}
              opacity={0.6}
            />
          );
        })}

        {/* Axis labels */}
        {labels.map((label, i) => (
          <text
            key={`label-${i}`}
            x={label.x}
            y={label.y}
            textAnchor={label.anchor}
            dominantBaseline="central"
            fill={label.dimmed ? "var(--muted-foreground)" : "var(--foreground)"}
            fontSize={9.5}
            fontFamily="system-ui, sans-serif"
            fontWeight={label.dimmed ? 400 : 500}
            opacity={label.dimmed ? 0.35 : 0.85}
          >
            {label.text}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex gap-5 justify-center flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgb(96, 165, 250)" }} />
          <span className="text-xs text-muted-foreground max-w-[120px] truncate">
            {user1Name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgb(244, 114, 182)" }} />
          <span className="text-xs text-muted-foreground max-w-[120px] truncate">
            {user2Name}
          </span>
        </div>
      </div>
    </div>
  );
}
