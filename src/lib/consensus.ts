import type { CommunityConsensus, HotTake, Song, Tier, TierEntry } from "@/lib/types";
import { TIER_ORDER, tierOrderToTier } from "@/lib/constants";

/**
 * Compute community consensus (average tier) for every song
 * from the full set of tier entries across all users.
 */
export function computeCommunityConsensus(
  allEntries: { song_id: string; tier: string }[]
): Map<string, CommunityConsensus> {
  const agg = new Map<string, { totalOrder: number; count: number }>();

  for (const entry of allEntries) {
    const tier = entry.tier as Tier;
    const order = TIER_ORDER[tier];
    if (order === undefined) continue;

    const existing = agg.get(entry.song_id);
    if (existing) {
      existing.totalOrder += order;
      existing.count++;
    } else {
      agg.set(entry.song_id, { totalOrder: order, count: 1 });
    }
  }

  const result = new Map<string, CommunityConsensus>();
  for (const [songId, { totalOrder, count }] of agg) {
    const avgTierOrder = totalOrder / count;
    result.set(songId, {
      songId,
      avgTierOrder,
      consensusTier: tierOrderToTier(avgTierOrder),
      totalVotes: count,
    });
  }

  return result;
}

/**
 * Find a user's "hot takes" — songs where they diverge significantly
 * from the community consensus.
 */
export function computeHotTakes(
  userEntries: TierEntry[],
  consensus: Map<string, CommunityConsensus>,
  songs: Song[],
  minDistance: number = 2,
  minVotes: number = 3
): HotTake[] {
  const songMap = new Map(songs.map((s) => [s.id, s]));
  const hotTakes: HotTake[] = [];

  for (const entry of userEntries) {
    const song = songMap.get(entry.song_id);
    const comm = consensus.get(entry.song_id);
    if (!song || !comm || comm.totalVotes < minVotes) continue;

    const userOrder = TIER_ORDER[entry.tier as Tier];
    const distance = Math.abs(userOrder - comm.avgTierOrder);

    if (distance >= minDistance) {
      hotTakes.push({
        song,
        userTier: entry.tier as Tier,
        communityTier: comm.consensusTier,
        distance,
        direction: userOrder < comm.avgTierOrder ? "overrates" : "underrates",
      });
    }
  }

  return hotTakes.sort((a, b) => b.distance - a.distance);
}

/**
 * Find songs where BOTH users disagree with the community consensus
 * in the same direction (both overrate or both underrate).
 */
export function computeSharedHotTakes(
  user1Entries: TierEntry[],
  user2Entries: TierEntry[],
  consensus: Map<string, CommunityConsensus>,
  songs: Song[],
  minDistance: number = 2,
  minVotes: number = 3
): {
  song: Song;
  user1Tier: Tier;
  user2Tier: Tier;
  communityTier: Tier;
  avgDistance: number;
}[] {
  const songMap = new Map(songs.map((s) => [s.id, s]));
  const user1Map = new Map(user1Entries.map((e) => [e.song_id, e.tier as Tier]));
  const user2Map = new Map(user2Entries.map((e) => [e.song_id, e.tier as Tier]));

  const results: {
    song: Song;
    user1Tier: Tier;
    user2Tier: Tier;
    communityTier: Tier;
    avgDistance: number;
  }[] = [];

  for (const [songId, u1Tier] of user1Map) {
    const u2Tier = user2Map.get(songId);
    const comm = consensus.get(songId);
    const song = songMap.get(songId);
    if (!u2Tier || !comm || !song || comm.totalVotes < minVotes) continue;

    const u1Order = TIER_ORDER[u1Tier];
    const u2Order = TIER_ORDER[u2Tier];
    const u1Diff = u1Order - comm.avgTierOrder;
    const u2Diff = u2Order - comm.avgTierOrder;

    // Both must disagree in the same direction
    if (u1Diff * u2Diff <= 0) continue;

    const u1Distance = Math.abs(u1Diff);
    const u2Distance = Math.abs(u2Diff);

    // Both must meet minimum distance
    if (u1Distance < minDistance || u2Distance < minDistance) continue;

    results.push({
      song,
      user1Tier: u1Tier,
      user2Tier: u2Tier,
      communityTier: comm.consensusTier,
      avgDistance: (u1Distance + u2Distance) / 2,
    });
  }

  return results.sort((a, b) => b.avgDistance - a.avgDistance);
}
