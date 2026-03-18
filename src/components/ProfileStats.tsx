import type { ProfileStats as ProfileStatsType } from "@/lib/types";
import { TIERS, TIER_COLORS } from "@/lib/constants";

interface ProfileStatsProps {
  stats: ProfileStatsType;
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Songs Ranked" value={stats.totalRanked.toString()} />
        <StatCard label="Favorite Album" value={stats.favoriteAlbum ?? "—"} />
        <StatCard label="Favorite Era" value={stats.favoriteEra ?? "—"} />
        <StatCard
          label="S-Tier Songs"
          value={stats.tierCounts.S.toString()}
        />
      </div>

      {/* Tier distribution bar */}
      {stats.totalRanked > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tier Distribution
          </p>
          <div className="flex h-6 overflow-hidden rounded-md">
            {TIERS.map((tier) => {
              const pct = (stats.tierCounts[tier] / stats.totalRanked) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={tier}
                  className="flex items-center justify-center text-[10px] font-bold text-gray-700"
                  style={{
                    backgroundColor: TIER_COLORS[tier],
                    width: `${pct}%`,
                  }}
                  title={`${tier}: ${stats.tierCounts[tier]} songs (${Math.round(pct)}%)`}
                >
                  {pct > 5 && tier}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold">{value}</p>
    </div>
  );
}
