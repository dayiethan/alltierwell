import type {
  Song,
  Tier,
  TierEntry,
  ComparisonResult,
  UserComparisonStats,
  EraScore,
  EraRadarScore,
  CommunityConsensus,
} from "@/lib/types";
import {
  TIER_ORDER,
  TIERS,
  ALBUMS,
  ALBUM_SHORT_NAMES,
  ERAS,
  getFlavorText,
  getGradingStyle,
} from "@/lib/constants";
import { computeSharedHotTakes } from "@/lib/consensus";

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

/** Bayesian smoothing constant — with fewer ranked songs the score
 *  gravitates toward the user's global average, preventing eras with
 *  only a couple of ranked songs from dominating. */
const ERA_SMOOTHING = 5;

function computeEraIdentity(
  entries: TierEntry[],
  songs: Song[]
): EraScore[] {
  const songMap = new Map(songs.map((s) => [s.id, s]));
  const albumStats: Record<string, { totalTier: number; count: number }> = {};

  // Global average tier across all ranked songs (Bayesian prior)
  let globalTotalTier = 0;
  for (const entry of entries) {
    globalTotalTier += TIER_ORDER[entry.tier as Tier];
    const song = songMap.get(entry.song_id);
    if (!song) continue;
    if (!albumStats[song.album]) {
      albumStats[song.album] = { totalTier: 0, count: 0 };
    }
    albumStats[song.album].totalTier += TIER_ORDER[entry.tier as Tier];
    albumStats[song.album].count++;
  }

  const globalAvg = entries.length > 0 ? globalTotalTier / entries.length : 2.5;

  return Object.entries(albumStats)
    .filter(([album, stats]) => album !== "Non-Album" && stats.count >= 3)
    .map(([album, stats]) => {
      const albumData = ALBUMS.find((a) => a.name === album) as
        | { name: string; color: string; image: string }
        | undefined;
      const rawAvg = stats.totalTier / stats.count;
      // Bayesian average: pulls toward globalAvg when count is low
      const adjustedAvg =
        (stats.count * rawAvg + ERA_SMOOTHING * globalAvg) /
        (stats.count + ERA_SMOOTHING);
      return {
        album,
        shortName: ALBUM_SHORT_NAMES[album] ?? album,
        albumImage: albumData?.image,
        albumColor: albumData?.color ?? "#888",
        avgTier: adjustedAvg,
        count: stats.count,
      };
    })
    .sort((a, b) => a.avgTier - b.avgTier)
    .slice(0, 3);
}

/**
 * Compute per-era average tier for a user across ALL eras.
 * Groups original + TV versions by album_order.
 * Returns one entry per era in chronological order.
 */
function computeAllEraScores(
  entries: TierEntry[],
  songs: Song[]
): EraRadarScore[] {
  const songMap = new Map(songs.map((s) => [s.id, s]));

  // Group by album_order (merges TV versions)
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

  return ERAS.map((era) => {
    const stats = eraStats[era.order];
    return {
      eraOrder: era.order,
      label: era.label,
      color: era.color,
      avgTier: stats ? stats.totalTier / stats.count : -1,
      count: stats?.count ?? 0,
    };
  });
}

export function computeComparison(
  user1Entries: TierEntry[],
  user2Entries: TierEntry[],
  songs: Song[],
  consensus?: Map<string, CommunityConsensus>
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
      user1TopEras: computeEraIdentity(user1Entries, songs),
      user2TopEras: computeEraIdentity(user2Entries, songs),
      user1EraRadar: computeAllEraScores(user1Entries, songs),
      user2EraRadar: computeAllEraScores(user2Entries, songs),
      deepCutSoulmates: [],
      vaultVerdict: {
        user1VaultCount: 0,
        user2VaultCount: 0,
        sharedVaultCount: 0,
        vaultCompatibility: 0,
        sharedVaultSameTier: [],
      },
      onlyUser1Ranked: [],
      onlyUser2Ranked: [],
      sharedHotTakes: [],
    };
  }

  // Weighted agreement band scoring:
  // Same tier: 100, 1 apart: 70, 2 apart: 40, 3 apart: 15, 4+ apart: 0
  const AGREEMENT_POINTS = [100, 70, 40, 15, 0, 0];

  let totalPoints = 0;
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

  const albumStats: Record<string, { totalDistance: number; count: number; user1TierTotal: number; user2TierTotal: number }> = {};

  for (const songId of sharedSongIds) {
    const tier1 = user1Map.get(songId)!;
    const tier2 = user2Map.get(songId)!;
    const song = songMap.get(songId);
    if (!song) continue;

    const distance = Math.abs(TIER_ORDER[tier1] - TIER_ORDER[tier2]);
    totalPoints += AGREEMENT_POINTS[Math.min(distance, 5)];

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
      albumStats[song.album] = { totalDistance: 0, count: 0, user1TierTotal: 0, user2TierTotal: 0 };
    }
    albumStats[song.album].totalDistance += distance;
    albumStats[song.album].count++;
    albumStats[song.album].user1TierTotal += TIER_ORDER[tier1];
    albumStats[song.album].user2TierTotal += TIER_ORDER[tier2];
  }

  // Weighted agreement score with confidence discount
  // Raw score: average points across shared songs (0-100)
  // Confidence: ramps linearly from 0 to 1 over 30 shared songs
  // Final: pulls toward neutral (50) when overlap is small
  const rawScore = totalPoints / sharedSongIds.length;
  const confidence = Math.min(sharedSongIds.length / 30, 1);
  const neutralScore = 50;
  const compatibilityScore = Math.round(
    neutralScore + (rawScore - neutralScore) * confidence
  );

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
    .map(([album, { totalDistance: dist, count, user1TierTotal, user2TierTotal }]) => {
      const albumData = ALBUMS.find((a) => a.name === album);
      return {
        album: ALBUM_SHORT_NAMES[album] ?? album,
        fullName: album,
        albumColor: albumData?.color ?? "#888",
        albumImage: albumData?.image,
        score: Math.round(100 * (1 - dist / count / 5)),
        sharedCount: count,
        user1AvgTier: user1TierTotal / count,
        user2AvgTier: user2TierTotal / count,
      };
    })
    .sort((a, b) => b.score - a.score);

  // Batch 2: Era Identity
  const user1TopEras = computeEraIdentity(user1Entries, songs);
  const user2TopEras = computeEraIdentity(user2Entries, songs);
  const user1EraRadar = computeAllEraScores(user1Entries, songs);
  const user2EraRadar = computeAllEraScores(user2Entries, songs);

  // Batch 2: Deep Cut & Vault Soulmates
  const deepCutSoulmates: { song: Song; tier: Tier }[] = [];
  let vaultTotalDistance = 0;
  let vaultSharedCount = 0;
  const sharedVaultSameTier: { song: Song; tier: Tier }[] = [];

  for (const songId of sharedSongIds) {
    const song = songMap.get(songId);
    if (!song) continue;

    const tier1 = user1Map.get(songId)!;
    const tier2 = user2Map.get(songId)!;
    const distance = Math.abs(TIER_ORDER[tier1] - TIER_ORDER[tier2]);

    // Deep cut: vault track or track_number > 13
    const isDeepCut = song.is_vault || song.track_number > 13;
    if (isDeepCut && distance === 0) {
      deepCutSoulmates.push({ song, tier: tier1 });
    }

    // Vault-specific stats
    if (song.is_vault) {
      vaultSharedCount++;
      vaultTotalDistance += distance;
      if (distance === 0) {
        sharedVaultSameTier.push({ song, tier: tier1 });
      }
    }
  }

  // Sort deep cuts: S-tier agreements first, then by tier
  deepCutSoulmates.sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);

  const user1VaultCount = user1Entries.filter((e) => {
    const song = songMap.get(e.song_id);
    return song?.is_vault;
  }).length;

  const user2VaultCount = user2Entries.filter((e) => {
    const song = songMap.get(e.song_id);
    return song?.is_vault;
  }).length;

  const vaultCompatibility =
    vaultSharedCount > 0
      ? Math.round(100 * (1 - vaultTotalDistance / vaultSharedCount / 5))
      : 0;

  // Batch 3: Songs Only One User Ranked (ranking gaps)
  // Focus on S and F tier songs — the most interesting extremes
  const interestingTiers = new Set<Tier>(["S", "F"]);

  const onlyUser1Ranked: { song: Song; tier: Tier }[] = [];
  for (const entry of user1Entries) {
    if (!user2Map.has(entry.song_id) && interestingTiers.has(entry.tier as Tier)) {
      const song = songMap.get(entry.song_id);
      if (song) onlyUser1Ranked.push({ song, tier: entry.tier as Tier });
    }
  }

  const onlyUser2Ranked: { song: Song; tier: Tier }[] = [];
  for (const entry of user2Entries) {
    if (!user1Map.has(entry.song_id) && interestingTiers.has(entry.tier as Tier)) {
      const song = songMap.get(entry.song_id);
      if (song) onlyUser2Ranked.push({ song, tier: entry.tier as Tier });
    }
  }

  // Sort: S tier first (TIER_ORDER S=0), then F (TIER_ORDER F=5). Limit to 5 each.
  const sortByTier = (a: { tier: Tier }, b: { tier: Tier }) =>
    TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
  onlyUser1Ranked.sort(sortByTier);
  onlyUser2Ranked.sort(sortByTier);

  // Community consensus: shared hot takes
  const sharedHotTakes = consensus
    ? computeSharedHotTakes(user1Entries, user2Entries, consensus, songs)
    : [];

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
    user1TopEras,
    user2TopEras,
    user1EraRadar,
    user2EraRadar,
    deepCutSoulmates,
    vaultVerdict: {
      user1VaultCount,
      user2VaultCount,
      sharedVaultCount: vaultSharedCount,
      vaultCompatibility,
      sharedVaultSameTier,
    },
    onlyUser1Ranked: onlyUser1Ranked.slice(0, 5),
    onlyUser2Ranked: onlyUser2Ranked.slice(0, 5),
    sharedHotTakes,
  };
}
