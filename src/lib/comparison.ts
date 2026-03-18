import type { Song, Tier, TierEntry, ComparisonResult } from "@/lib/types";
import { TIER_ORDER, TIERS, ALBUM_SHORT_NAMES } from "@/lib/constants";

export function computeComparison(
  user1Entries: TierEntry[],
  user2Entries: TierEntry[],
  songs: Song[]
): ComparisonResult {
  const songMap = new Map(songs.map((s) => [s.id, s]));
  const user1Map = new Map(user1Entries.map((e) => [e.song_id, e.tier as Tier]));
  const user2Map = new Map(user2Entries.map((e) => [e.song_id, e.tier as Tier]));

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
      sharedSongsCount: 0,
      sameTierSongs: { S: [], A: [], B: [], C: [], D: [], F: [] },
      biggestDisagreements: [],
      albumAlignment: [],
    };
  }

  // Compute distances and group results
  let totalDistance = 0;
  const sameTierSongs: Record<Tier, Song[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  };

  const disagreements: {
    song: Song;
    user1Tier: Tier;
    user2Tier: Tier;
    distance: number;
  }[] = [];

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
    }

    if (distance >= 2) {
      disagreements.push({ song, user1Tier: tier1, user2Tier: tier2, distance });
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

  // Sort disagreements by distance descending, take top 10
  disagreements.sort((a, b) => b.distance - a.distance);
  const biggestDisagreements = disagreements.slice(0, 10);

  // Album alignment
  const albumAlignment = Object.entries(albumStats)
    .map(([album, { totalDistance: dist, count }]) => ({
      album: ALBUM_SHORT_NAMES[album] ?? album,
      score: Math.round(100 * (1 - dist / count / 5)),
      sharedCount: count,
    }))
    .sort((a, b) => b.sharedCount - a.sharedCount);

  return {
    compatibilityScore,
    sharedSongsCount: sharedSongIds.length,
    sameTierSongs,
    biggestDisagreements,
    albumAlignment,
  };
}
