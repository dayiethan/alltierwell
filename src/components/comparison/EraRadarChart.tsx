"use client";

import { ALBUM_SHORT_NAMES } from "@/lib/constants";

interface EraData {
  album: string;
  avgScore: number;
  count: number;
}

interface EraRadarChartProps {
  user1TopEras: EraData[];
  user2TopEras: EraData[];
  user1Name: string;
  user2Name: string;
}

/**
 * Radar / spider chart comparing two users' era scores.
 *
 * Score scale: S=0, A=1, B=2, C=3, D=4, F=5  (lower is better)
 * We invert so higher radius = better score:
 *   chartValue = (5 - avgScore) / 5   →  1 = perfect (all S), 0 = all F
 */
export default function EraRadarChart({
  user1TopEras,
  user2TopEras,
  user1Name,
  user2Name,
}: EraRadarChartProps) {
  // Combine both users' albums into a unified axis set
  const albumSet = new Set<string>();
  for (const e of user1TopEras) albumSet.add(e.album);
  for (const e of user2TopEras) albumSet.add(e.album);

  const albums = Array.from(albumSet);
  const axisCount = albums.length;

  if (axisCount < 3) return null; // need at least 3 axes for a meaningful radar

  const user1Map = new Map(user1TopEras.map((e) => [e.album, e]));
  const user2Map = new Map(user2TopEras.map((e) => [e.album, e]));

  // Chart geometry — wide viewBox to give labels room
  const size = 460;
  const cx = size / 2;
  const cy = size / 2;
  const maxRadius = 120;
  const levels = 5; // concentric rings

  function angleFor(i: number): number {
    // Start from top (-90 deg) and go clockwise
    return (Math.PI * 2 * i) / axisCount - Math.PI / 2;
  }

  function pointAt(i: number, radius: number): [number, number] {
    const angle = angleFor(i);
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
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

  // Invert scores: lower avgScore = better = higher chart value
  function toChartValue(avgScore: number): number {
    return Math.max(0, Math.min(1, (5 - avgScore) / 5));
  }

  const user1Values = albums.map((album) => {
    const entry = user1Map.get(album);
    return entry ? toChartValue(entry.avgScore) : 0;
  });

  const user2Values = albums.map((album) => {
    const entry = user2Map.get(album);
    return entry ? toChartValue(entry.avgScore) : 0;
  });

  // Concentric grid rings
  const gridRings = Array.from({ length: levels }, (_, i) => {
    const r = ((i + 1) / levels) * maxRadius;
    const pts = albums
      .map((_, j) => {
        const [x, y] = pointAt(j, r);
        return `${x},${y}`;
      })
      .join(" ");
    return pts;
  });

  // Axis lines
  const axisLines = albums.map((_, i) => {
    const [x, y] = pointAt(i, maxRadius);
    return { x1: cx, y1: cy, x2: x, y2: y };
  });

  // Labels positioned outside the chart with more room
  const labelOffset = 28;
  const labels = albums.map((album, i) => {
    const angle = angleFor(i);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const shortName = ALBUM_SHORT_NAMES[album] ?? album;

    // Push labels further out horizontally to prevent clipping
    const extraHPad = Math.abs(cos) * 12;
    const r = maxRadius + labelOffset + extraHPad;
    const x = cx + r * cos;
    const y = cy + r * sin;

    let anchor: "start" | "middle" | "end" = "middle";
    if (cos > 0.2) anchor = "start";
    else if (cos < -0.2) anchor = "end";

    return { x, y, text: shortName, anchor };
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        width: "100%",
      }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        style={{ width: "100%", maxWidth: "460px", height: "auto" }}
        role="img"
        aria-label={`Radar chart comparing era scores between ${user1Name} and ${user2Name}`}
      >
        {/* Grid rings */}
        {gridRings.map((pts, i) => (
          <polygon
            key={`ring-${i}`}
            points={pts}
            fill="none"
            stroke="var(--border)"
            strokeWidth={i === levels - 1 ? 1.5 : 0.7}
            opacity={0.5}
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
            opacity={0.4}
          />
        ))}

        {/* User 1 polygon */}
        <polygon
          points={polygonPoints(user1Values)}
          fill="rgba(96, 165, 250, 0.2)"
          stroke="rgb(96, 165, 250)"
          strokeWidth={2}
        />

        {/* User 2 polygon */}
        <polygon
          points={polygonPoints(user2Values)}
          fill="rgba(244, 114, 182, 0.2)"
          stroke="rgb(244, 114, 182)"
          strokeWidth={2}
        />

        {/* Data points - User 1 */}
        {user1Values.map((v, i) => {
          const [x, y] = pointAt(i, v * maxRadius);
          return (
            <circle
              key={`u1-dot-${i}`}
              cx={x}
              cy={y}
              r={3}
              fill="rgb(96, 165, 250)"
            />
          );
        })}

        {/* Data points - User 2 */}
        {user2Values.map((v, i) => {
          const [x, y] = pointAt(i, v * maxRadius);
          return (
            <circle
              key={`u2-dot-${i}`}
              cx={x}
              cy={y}
              r={3}
              fill="rgb(244, 114, 182)"
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
            fill="var(--muted-foreground)"
            fontSize={10}
            fontFamily="sans-serif"
          >
            {label.text}
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "2px",
              backgroundColor: "rgb(96, 165, 250)",
            }}
          />
          <span
            className="text-xs text-muted-foreground"
            style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {user1Name}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "2px",
              backgroundColor: "rgb(244, 114, 182)",
            }}
          />
          <span
            className="text-xs text-muted-foreground"
            style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {user2Name}
          </span>
        </div>
      </div>
    </div>
  );
}
