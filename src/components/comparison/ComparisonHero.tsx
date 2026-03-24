import type { ComparisonResult } from "@/lib/types";

interface ComparisonHeroProps {
  result: ComparisonResult;
  user1Name: string;
  user2Name: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#84cc16";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

export default function ComparisonHero({
  result,
  user1Name,
  user2Name,
}: ComparisonHeroProps) {
  const scoreColor = getScoreColor(result.compatibilityScore);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-8 text-center"
      style={{
        background: `radial-gradient(ellipse at top, ${scoreColor}08 0%, transparent 70%)`,
      }}
    >
      {/* Score ring */}
      <div className="relative mx-auto h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--muted)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(result.compatibilityScore / 100) * 327} 327`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {result.sharedSongsCount === 0 ? (
            <span className="text-sm font-medium text-muted-foreground">
              Not enough
              <br />
              overlap
            </span>
          ) : (
            <span className="text-3xl font-bold">
              {result.compatibilityScore}%
            </span>
          )}
        </div>
      </div>

      <p className="mt-3 text-base italic text-muted-foreground">
        &ldquo;{result.flavorText}&rdquo;
      </p>
      <p className="mt-1 text-sm text-muted-foreground/60">
        across {result.sharedSongsCount} shared songs
      </p>

      {/* Completion comparison */}
      <div className="mx-auto mt-6 max-w-sm">
        <div className="flex gap-6">
          <CompletionBar
            name={user1Name}
            value={result.user1Stats.totalRanked}
            total={result.totalSongs}
          />
          <CompletionBar
            name={user2Name}
            value={result.user2Stats.totalRanked}
            total={result.totalSongs}
          />
        </div>
        <p className="mt-1.5 text-[11px] text-muted-foreground/60">
          songs ranked out of {result.totalSongs}
        </p>
      </div>
    </div>
  );
}

function CompletionBar({
  name,
  value,
  total,
}: {
  name: string;
  value: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
        <span className="font-medium truncate">{name}</span>
        <span className="flex-shrink-0 ml-1">
          {value} ({pct}%)
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
