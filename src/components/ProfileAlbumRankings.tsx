import type { Song, Tier, TierEntry } from "@/lib/types";
import { TIER_ORDER, ALBUMS, ALBUM_SHORT_NAMES, tierOrderToScore, ensureReadableColor } from "@/lib/constants";

interface AlbumRanking {
  album: string;
  shortName: string;
  albumColor: string;
  albumImage?: string;
  avgTier: number;
  score: number;
  rankedCount: number;
  totalInAlbum: number;
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

  // Count total songs per album
  const albumSongCounts: Record<string, number> = {};
  for (const song of songs) {
    albumSongCounts[song.album] = (albumSongCounts[song.album] ?? 0) + 1;
  }

  // Aggregate user's tier values per album
  const albumStats: Record<string, { totalTier: number; count: number }> = {};
  for (const entry of entries) {
    const song = songMap.get(entry.song_id);
    if (!song) continue;
    if (!albumStats[song.album]) {
      albumStats[song.album] = { totalTier: 0, count: 0 };
    }
    albumStats[song.album].totalTier += TIER_ORDER[entry.tier as Tier];
    albumStats[song.album].count++;
  }

  const rankings: AlbumRanking[] = Object.entries(albumStats)
    .filter(([, stats]) => stats.count >= 1)
    .map(([album, stats]) => {
      const albumData = ALBUMS.find((a) => a.name === album);
      const avgTier = stats.totalTier / stats.count;
      return {
        album,
        shortName: ALBUM_SHORT_NAMES[album] ?? album,
        albumColor: albumData?.color ?? "#888",
        albumImage: albumData?.image,
        avgTier,
        score: tierOrderToScore(avgTier),
        rankedCount: stats.count,
        totalInAlbum: albumSongCounts[album] ?? 0,
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
            (a.rankedCount / a.totalInAlbum) * 100
          );
          return (
            <div key={a.album} className="flex items-center gap-3">
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
                    {a.rankedCount}/{a.totalInAlbum} songs
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
