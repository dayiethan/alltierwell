import type { ComparisonResult, UserComparisonStats } from "@/lib/types";
import { TIERS, TIER_COLORS } from "@/lib/constants";

interface PersonalityInsightsProps {
  result: ComparisonResult;
  user1Name: string;
  user2Name: string;
}

function getStyleEmoji(style: string): string {
  switch (style) {
    case "Generous":
      return "\u2728";
    case "Balanced":
      return "\u2696\uFE0F";
    case "Selective":
      return "\uD83E\uDDD0";
    case "Harsh Critic":
      return "\uD83D\uDD25";
    default:
      return "";
  }
}

export default function PersonalityInsights({
  result,
  user1Name,
  user2Name,
}: PersonalityInsightsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Ranking Personality
      </h3>

      {/* Grading style cards */}
      <div className="grid grid-cols-2 gap-3">
        <UserCard name={user1Name} stats={result.user1Stats} />
        <UserCard name={user2Name} stats={result.user2Stats} />
      </div>

      {/* Side-by-side tier distributions */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Tier Distribution
        </p>
        <TierDistBar
          name={user1Name}
          counts={result.user1Stats.tierCounts}
          total={result.user1Stats.totalRanked}
        />
        <TierDistBar
          name={user2Name}
          counts={result.user2Stats.tierCounts}
          total={result.user2Stats.totalRanked}
        />
      </div>
    </div>
  );
}

function UserCard({
  name,
  stats,
}: {
  name: string;
  stats: UserComparisonStats;
}) {
  return (
    <div className="rounded-xl border border-border p-4 text-center">
      <p className="text-xs text-muted-foreground truncate">{name}</p>
      <p className="mt-1 text-2xl">
        {getStyleEmoji(stats.gradingStyle)}
      </p>
      <p className="mt-1 text-sm font-semibold">{stats.gradingStyle}</p>
      <div className="mt-2 flex items-center justify-center gap-1">
        <span
          className="inline-flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-gray-800"
          style={{ backgroundColor: TIER_COLORS.S }}
        >
          S
        </span>
        <span className="text-xs text-muted-foreground/60">{stats.sTierPercent}%</span>
      </div>
    </div>
  );
}

function TierDistBar({
  name,
  counts,
  total,
}: {
  name: string;
  counts: Record<string, number>;
  total: number;
}) {
  if (total === 0) return null;
  return (
    <div>
      <p className="text-[11px] text-muted-foreground/60 mb-1 truncate">{name}</p>
      <div className="flex h-6 overflow-hidden rounded-md">
        {TIERS.map((tier) => {
          const pct = (counts[tier] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={tier}
              className="flex items-center justify-center text-[10px] font-bold text-gray-700 transition-all"
              style={{
                backgroundColor: TIER_COLORS[tier],
                width: `${pct}%`,
              }}
              title={`${tier}: ${counts[tier]} (${Math.round(pct)}%)`}
            >
              {pct > 6 && tier}
            </div>
          );
        })}
      </div>
    </div>
  );
}
