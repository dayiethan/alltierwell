import type { Song, Tier, TierEntry } from "@/lib/types";
import { TIER_ORDER, ALBUMS, ERAS, tierOrderToScore, ensureReadableColor } from "@/lib/constants";

interface AlbumRanking {
  eraOrder: number;
  shortName: string;
  albumColor: string;
  albumImage?: string;
  avgTier: number;
  score: number;
  rankedCount: number;
  totalInEra: number;
}

export default function ProfileAlbumRankings({
  entries,
  songs,
}: {
  entries: TierEntry[];
  songs: Song[];
}) {
  if (entries.length === 0) return null;

  const songMap = new Map(songs.map((s) => [s.id, s]));

  // Count total songs per era (grouped by album_order)
  const eraSongCounts: Record<number, number> = {};
  for (const song of songs) {
    eraSongCounts[song.album_order] = (eraSongCounts[song.album_order] ?? 0) + 1;
  }

  // Aggregate user's tier values per era
  const eraStats: Record<number, { totalTier: number; count: number }> = {};
  for (const entry of entries) {
    const song = songMap.get(entry.song_id);
    if (!song) continue;
    if (!eraStats[song.album_order]) {
      eraStats[song.album_order] = { totalTier: 0, count: 0 };
    }
    eraStats[song.album_order].totalTier += TIER_ORDER[entry.tier as Tier];
    eraStats[song.album_order].count++;
  }

  const rankings: AlbumRanking[] = Object.entries(eraStats)
    .filter(([, stats]) => stats.count >= 1)
    .map(([eraOrderStr, stats]) => {
      const eraOrder = Number(eraOrderStr);
      const era = ERAS.find((e) => e.order === eraOrder);
      const albumData = ALBUMS.find((a) => a.order === eraOrder);
      const avgTier = stats.totalTier / stats.count;
      return {
        eraOrder,
        shortName: era?.label ?? `Era ${eraOrder}`,
        albumColor: era?.color ?? "#888",
        albumImage: albumData?.image,
        avgTier,
        score: tierOrderToScore(avgTier),
        rankedCount: stats.count,
        totalInEra: eraSongCounts[eraOrder] ?? 0,
      };
    })
    .sort((a, b) => b.score - a.score);

  if (rankings.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Album Rankings
      </h2>
      <div className="rounded-xl border border-border p-4 space-y-3">
        {rankings.map((a, i) => {
          const completionPct = Math.round(
            (a.rankedCount / a.totalInEra) * 100
          );
          return (
            <div key={a.eraOrder} className="flex items-center gap-3">
              <span className="w-5 text-xs font-bold text-muted-foreground/50 text-right">
                {i + 1}
              </span>
              {a.albumImage ? (
                <img
                  src={a.albumImage}
                  alt={a.shortName}
                  className="h-8 w-8 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded flex-shrink-0"
                  style={{ backgroundColor: a.albumColor + "30" }}
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium truncate">
                    {a.shortName}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">
                    {a.rankedCount}/{a.totalInEra} songs
                    {completionPct < 100 && ` (${completionPct}%)`}
                  </span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max((a.score / 10) * 100, 3)}%`,
                      backgroundColor: a.albumColor,
                      opacity: 0.75,
                    }}
                  />
                </div>
              </div>
              <span className="w-12 text-right text-sm font-bold" style={{ color: ensureReadableColor(a.albumColor) }}>
                {a.score.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
