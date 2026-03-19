import type {
  Song,
  Tier,
  TierEntry,
  ComparisonResult,
  UserComparisonStats,
} from "@/lib/types";
import {
  TIER_ORDER,
  TIERS,
  ALBUMS,
  ALBUM_SHORT_NAMES,
  getFlavorText,
  getGradingStyle,
} from "@/lib/constants";

function computeUserStats(entries: TierEntry[]): UserComparisonStats {
  const tierCounts: Record<Tier, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
  let totalTierValue = 0;

  for (const entry of entries) {
    tierCounts[entry.tier as Tier]++;
    totalTierValue += TIER_ORDER[entry.tier as Tier];
  }

  const totalRanked = entries.length;
  const avgTier = totalRanked > 0 ? totalTierValue / totalRanked : 0;
  const sTierPercent =
    totalRanked > 0 ? Math.round((tierCounts.S / totalRanked) * 100) : 0;

  return {
    totalRanked,
    tierCounts,
    avgTier,
    gradingStyle: getGradingStyle(avgTier),
    sTierPercent,
  };
}

export function computeComparison(
  user1Entries: TierEntry[],
  user2Entries: TierEntry[],
  songs: Song[]
): ComparisonResult {
  const songMap = new Map(songs.map((s) => [s.id, s]));
  const user1Map = new Map(user1Entries.map((e) => [e.song_id, e.tier as Tier]));
  const user2Map = new Map(user2Entries.map((e) => [e.song_id, e.tier as Tier]));

  const user1Stats = computeUserStats(user1Entries);
  const user2Stats = computeUserStats(user2Entries);

  // Find shared songs (both ranked)
  const sharedSongIds: string[] = [];
  user1Map.forEach((_, songId) => {
    if (user2Map.has(songId)) {
      sharedSongIds.push(songId);
    }
  });

  if (sharedSongIds.length === 0) {
    return {
      compatibilityScore: 0,
      flavorText: getFlavorText(0),
      sharedSongsCount: 0,
      totalSongs: songs.length,
      user1Stats,
      user2Stats,
      sameTierSongs: { S: [], A: [], B: [], C: [], D: [], F: [] },
      sameTierTotal: 0,
      biggestDisagreements: [],
      loveHateSplits: { user1Loves: [], user2Loves: [] },
      albumAlignment: [],
    };
  }

  let totalDistance = 0;
  const sameTierSongs: Record<Tier, Song[]> = {
    S: [], A: [], B: [], C: [], D: [], F: [],
  };
  let sameTierTotal = 0;

  const disagreements: {
    song: Song;
    user1Tier: Tier;
    user2Tier: Tier;
    distance: number;
  }[] = [];

  const user1Loves: { song: Song; user1Tier: Tier; user2Tier: Tier }[] = [];
  const user2Loves: { song: Song; user1Tier: Tier; user2Tier: Tier }[] = [];

  const albumStats: Record<string, { totalDistance: number; count: number }> = {};

  for (const songId of sharedSongIds) {
    const tier1 = user1Map.get(songId)!;
    const tier2 = user2Map.get(songId)!;
    const song = songMap.get(songId);
    if (!song) continue;

    const distance = Math.abs(TIER_ORDER[tier1] - TIER_ORDER[tier2]);
    totalDistance += distance;

    if (distance === 0) {
      sameTierSongs[tier1].push(song);
      sameTierTotal++;
    }

    if (distance >= 2) {
      disagreements.push({ song, user1Tier: tier1, user2Tier: tier2, distance });
    }

    // Love/hate: one in S/A, other in D/F
    const highTiers = new Set<Tier>(["S", "A"]);
    const lowTiers = new Set<Tier>(["D", "F"]);
    if (highTiers.has(tier1) && lowTiers.has(tier2)) {
      user1Loves.push({ song, user1Tier: tier1, user2Tier: tier2 });
    }
    if (highTiers.has(tier2) && lowTiers.has(tier1)) {
      user2Loves.push({ song, user1Tier: tier1, user2Tier: tier2 });
    }

    // Album alignment
    if (!albumStats[song.album]) {
      albumStats[song.album] = { totalDistance: 0, count: 0 };
    }
    albumStats[song.album].totalDistance += distance;
    albumStats[song.album].count++;
  }

  const avgDistance = totalDistance / sharedSongIds.length;
  const compatibilityScore = Math.round(100 * (1 - avgDistance / 5));

  disagreements.sort((a, b) => b.distance - a.distance);
  const biggestDisagreements = disagreements.slice(0, 10);

  // Sort love/hate by distance descending, limit to 5
  user1Loves.sort(
    (a, b) =>
      Math.abs(TIER_ORDER[b.user1Tier] - TIER_ORDER[b.user2Tier]) -
      Math.abs(TIER_ORDER[a.user1Tier] - TIER_ORDER[a.user2Tier])
  );
  user2Loves.sort(
    (a, b) =>
      Math.abs(TIER_ORDER[b.user1Tier] - TIER_ORDER[b.user2Tier]) -
      Math.abs(TIER_ORDER[a.user1Tier] - TIER_ORDER[a.user2Tier])
  );

  const albumAlignment = Object.entries(albumStats)
    .map(([album, { totalDistance: dist, count }]) => {
      const albumData = ALBUMS.find((a) => a.name === album);
      return {
        album: ALBUM_SHORT_NAMES[album] ?? album,
        albumColor: albumData?.color ?? "#888",
        score: Math.round(100 * (1 - dist / count / 5)),
        sharedCount: count,
      };
    })
    .sort((a, b) => b.score - a.score);

  return {
    compatibilityScore,
    flavorText: getFlavorText(compatibilityScore),
    sharedSongsCount: sharedSongIds.length,
    totalSongs: songs.length,
    user1Stats,
    user2Stats,
    sameTierSongs,
    sameTierTotal,
    biggestDisagreements,
    loveHateSplits: {
      user1Loves: user1Loves.slice(0, 5),
      user2Loves: user2Loves.slice(0, 5),
    },
    albumAlignment,
  };
}
