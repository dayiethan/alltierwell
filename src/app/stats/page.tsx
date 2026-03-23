import { createClient } from "@/lib/supabase/server";
import type { Song, Tier } from "@/lib/types";
import { normalizeSongs } from "@/lib/types";
import {
  TIERS,
  TIER_COLORS,
  TIER_ORDER,
  ALBUMS,
  ALBUM_SHORT_NAMES,
  getSongImage,
  getSongAlbumColor,
  tierOrderToScore,
  ensureReadableColor,
} from "@/lib/constants";

export const metadata = {
  title: "Global Stats — All Tier Well",
  description:
    "See how the Swiftie community ranks Taylor Swift's discography.",
};

interface SongStat {
  tierCounts: Record<Tier, number>;
  total: number;
}

export default async function StatsPage() {
  const supabase = await createClient();

  const [songsRes, entriesRes, usersRes] = await Promise.all([
    supabase
      .from("songs")
      .select("*")
      .order("album_order")
      .order("track_number"),
    supabase.from("tier_entries").select("song_id, tier"),
    supabase.from("users").select("id", { count: "exact", head: true }),
  ]);

  const songs = normalizeSongs(songsRes.data ?? []);
  const entries = (entriesRes.data ?? []) as { song_id: string; tier: string }[];
  const totalUsers = usersRes.count ?? 0;

  const songMap = new Map(songs.map((s) => [s.id, s]));

  // Aggregate per-song stats
  const songStats = new Map<string, SongStat>();
  const globalTierCounts: Record<Tier, number> = {
    S: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  for (const entry of entries) {
    const tier = entry.tier as Tier;
    globalTierCounts[tier]++;

    if (!songStats.has(entry.song_id)) {
      songStats.set(entry.song_id, {
        tierCounts: { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 },
        total: 0,
      });
    }
    const stats = songStats.get(entry.song_id)!;
    stats.tierCounts[tier]++;
    stats.total++;
  }

  const totalRankings = entries.length;

  // Most S-tiered songs
  const mostSTiered = [...songStats.entries()]
    .map(([songId, stats]) => ({
      song: songMap.get(songId)!,
      sCount: stats.tierCounts.S,
      total: stats.total,
      pct: stats.total > 0 ? Math.round((stats.tierCounts.S / stats.total) * 100) : 0,
    }))
    .filter((s) => s.song && s.sCount > 0)
    .sort((a, b) => b.sCount - a.sCount || b.pct - a.pct)
    .slice(0, 10);

  // Most F-tiered songs
  const mostFTiered = [...songStats.entries()]
    .map(([songId, stats]) => ({
      song: songMap.get(songId)!,
      fCount: stats.tierCounts.F,
      total: stats.total,
      pct: stats.total > 0 ? Math.round((stats.tierCounts.F / stats.total) * 100) : 0,
    }))
    .filter((s) => s.song && s.fCount > 0)
    .sort((a, b) => b.fCount - a.fCount || b.pct - a.pct)
    .slice(0, 10);

  // Most controversial (highest std dev)
  const controversial = [...songStats.entries()]
    .map(([songId, stats]) => {
      if (stats.total < 3) return null;

      let sum = 0;
      for (const tier of TIERS) {
        sum += stats.tierCounts[tier] * TIER_ORDER[tier];
      }
      const mean = sum / stats.total;

      let variance = 0;
      for (const tier of TIERS) {
        variance +=
          stats.tierCounts[tier] * Math.pow(TIER_ORDER[tier] - mean, 2);
      }
      variance /= stats.total;

      return {
        song: songMap.get(songId)!,
        stdDev: Math.sqrt(variance),
        total: stats.total,
        tierCounts: stats.tierCounts,
      };
    })
    .filter(
      (s): s is NonNullable<typeof s> => s !== null && s.song !== undefined
    )
    .sort((a, b) => b.stdDev - a.stdDev)
    .slice(0, 10);

  // Average tier per album
  const albumAgg: Record<string, { totalTier: number; count: number }> = {};
  for (const [songId, stats] of songStats) {
    const song = songMap.get(songId);
    if (!song) continue;
    if (!albumAgg[song.album]) {
      albumAgg[song.album] = { totalTier: 0, count: 0 };
    }
    for (const tier of TIERS) {
      albumAgg[song.album].totalTier +=
        stats.tierCounts[tier] * TIER_ORDER[tier];
      albumAgg[song.album].count += stats.tierCounts[tier];
    }
  }

  const albumRankings = Object.entries(albumAgg)
    .map(([album, { totalTier, count }]) => {
      const albumData = ALBUMS.find((a) => a.name === album) as
        | { name: string; color: string; image: string }
        | undefined;
      const avgTier = count > 0 ? totalTier / count : 3;
      return {
        album,
        shortName: ALBUM_SHORT_NAMES[album] ?? album,
        albumColor: albumData?.color ?? "#888",
        albumImage: albumData?.image,
        avgTier,
        score: tierOrderToScore(avgTier),
        count,
      };
    })
    .sort((a, b) => b.score - a.score);

  const globalTotal = Object.values(globalTierCounts).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="py-8 space-y-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Community Stats</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          How the Swiftie community ranks Taylor&apos;s discography
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Swifties" value={totalUsers.toLocaleString()} />
        <StatCard label="Rankings" value={totalRankings.toLocaleString()} />
        <StatCard label="Songs" value={songs.length.toLocaleString()} />
      </div>

      {/* Global tier distribution */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Global Tier Distribution
        </h2>
        <div className="rounded-xl border border-border p-4">
          <div className="flex h-8 overflow-hidden rounded-lg">
            {TIERS.map((tier) => {
              const pct =
                globalTotal > 0
                  ? (globalTierCounts[tier] / globalTotal) * 100
                  : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={tier}
                  className="flex items-center justify-center text-xs font-bold text-gray-800 transition-all"
                  style={{
                    backgroundColor: TIER_COLORS[tier],
                    width: `${pct}%`,
                  }}
                  title={`${tier}: ${globalTierCounts[tier].toLocaleString()} (${Math.round(pct)}%)`}
                >
                  {pct > 5 && `${tier} ${Math.round(pct)}%`}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {TIERS.map((tier) => (
              <div key={tier} className="flex items-center gap-1.5 text-xs">
                <span
                  className="inline-flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold text-gray-800"
                  style={{ backgroundColor: TIER_COLORS[tier] }}
                >
                  {tier}
                </span>
                <span className="text-muted-foreground">
                  {globalTierCounts[tier].toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Album rankings */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Album Rankings
        </h2>
        <div className="rounded-xl border border-border p-4 space-y-3">
          {albumRankings.map((a, i) => (
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
              <span className="w-24 text-sm font-medium truncate">
                {a.shortName}
              </span>
              <div className="flex-1 h-3.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max((a.score / 10) * 100, 3)}%`,
                    backgroundColor: a.albumColor,
                    opacity: 0.75,
                  }}
                />
              </div>
              <span className="w-12 text-right text-sm font-bold" style={{ color: ensureReadableColor(a.albumColor) }}>
                {a.score.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Most S-tiered and Most F-tiered side by side */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Fan Favorites
          </h2>
          <div className="rounded-xl border border-border p-4 space-y-2">
            {mostSTiered.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 text-center py-4">
                No rankings yet
              </p>
            ) : (
              mostSTiered.map((item, i) => (
                <SongRow
                  key={item.song.id}
                  rank={i + 1}
                  song={item.song}
                  stat={`${item.sCount} S-tier`}
                  pct={item.pct}
                  color={TIER_COLORS.S}
                />
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Community Skips
          </h2>
          <div className="rounded-xl border border-border p-4 space-y-2">
            {mostFTiered.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 text-center py-4">
                No rankings yet
              </p>
            ) : (
              mostFTiered.map((item, i) => (
                <SongRow
                  key={item.song.id}
                  rank={i + 1}
                  song={item.song}
                  stat={`${item.fCount} F-tier`}
                  pct={item.pct}
                  color={TIER_COLORS.F}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* Most controversial */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Most Controversial
        </h2>
        <p className="mb-3 text-xs text-muted-foreground/60">
          Songs where the community can&apos;t agree
        </p>
        <div className="rounded-xl border border-border p-4 space-y-3">
          {controversial.length === 0 ? (
            <p className="text-sm text-muted-foreground/60 text-center py-4">
              Need more rankings to determine controversy
            </p>
          ) : (
            controversial.map((item, i) => {
              const album = ALBUMS.find(
                (a) => a.name === item.song.album
              ) as
                | { name: string; color: string; image: string }
                | undefined;
              return (
                <div key={item.song.id} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-bold text-muted-foreground/50 text-right">
                    {i + 1}
                  </span>
                  {album?.image ? (
                    <img
                      src={album.image}
                      alt=""
                      className="h-7 w-7 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="h-7 w-7 rounded flex-shrink-0"
                      style={{
                        backgroundColor: (album?.color ?? "#888") + "30",
                      }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {item.song.title}
                    </p>
                    <div className="flex h-2 overflow-hidden rounded-full mt-1">
                      {TIERS.map((tier) => {
                        const pct =
                          (item.tierCounts[tier] / item.total) * 100;
                        if (pct === 0) return null;
                        return (
                          <div
                            key={tier}
                            style={{
                              backgroundColor: TIER_COLORS[tier],
                              width: `${pct}%`,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 w-10 text-right">
                    {item.total} votes
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4 text-center">
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SongRow({
  rank,
  song,
  stat,
  pct,
  color,
}: {
  rank: number;
  song: Song;
  stat: string;
  pct: number;
  color: string;
}) {
  const songImage = getSongImage(song);
  const albumColor = getSongAlbumColor(song);

  return (
    <div className="flex items-center gap-2.5">
      <span className="w-5 text-xs font-bold text-muted-foreground/50 text-right">
        {rank}
      </span>
      {songImage ? (
        <img
          src={songImage}
          alt=""
          className="h-7 w-7 rounded object-cover flex-shrink-0"
        />
      ) : (
        <div
          className="h-7 w-7 rounded flex-shrink-0"
          style={{ backgroundColor: albumColor + "30" }}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{song.title}</p>
      </div>
      <span
        className="text-[11px] font-medium px-2 py-0.5 rounded-full"
        style={{ backgroundColor: color + "25", color }}
      >
        {stat} ({pct}%)
      </span>
    </div>
  );
}

