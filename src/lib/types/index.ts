export type Tier = "S" | "A" | "B" | "C" | "D" | "F";

export interface Song {
  id: string;
  title: string;
  album: string;
  album_order: number;
  track_number: number;
  is_vault: boolean;
  tags: string[];
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  is_public: boolean;
  theme_era: string | null;
}

export interface TierEntry {
  user_id: string;
  song_id: string;
  tier: Tier;
  updated_at: string;
}

export type TierListMap = Map<string, Tier>;

/** Normalize songs from DB — ensures tags is always an array */
export function normalizeSongs(raw: unknown[]): Song[] {
  return (raw as Record<string, unknown>[]).map((s) => ({
    ...s,
    tags: Array.isArray(s.tags) ? s.tags : [],
  })) as Song[];
}

export interface ProfileStats {
  totalRanked: number;
  tierCounts: Record<Tier, number>;
  favoriteEra: string | null;
  archetype: string;
}

export interface UserComparisonStats {
  totalRanked: number;
  tierCounts: Record<Tier, number>;
  avgTier: number;
  gradingStyle: string;
  sTierPercent: number;
}

export interface EraScore {
  album: string;
  shortName: string;
  albumImage?: string;
  albumColor: string;
  avgTier: number;
  count: number;
}

export interface ComparisonResult {
  compatibilityScore: number;
  flavorText: string;
  sharedSongsCount: number;
  totalSongs: number;
  user1Stats: UserComparisonStats;
  user2Stats: UserComparisonStats;
  sameTierSongs: Record<Tier, Song[]>;
  sameTierTotal: number;
  biggestDisagreements: {
    song: Song;
    user1Tier: Tier;
    user2Tier: Tier;
    distance: number;
  }[];
  loveHateSplits: {
    user1Loves: { song: Song; user1Tier: Tier; user2Tier: Tier }[];
    user2Loves: { song: Song; user1Tier: Tier; user2Tier: Tier }[];
  };
  albumAlignment: {
    album: string;
    fullName: string;
    albumColor: string;
    albumImage?: string;
    score: number;
    sharedCount: number;
    user1AvgTier: number;
    user2AvgTier: number;
  }[];
  // Batch 2: Era Identity
  user1TopEras: EraScore[];
  user2TopEras: EraScore[];
  // Batch 2: Deep Cut & Vault Soulmates
  deepCutSoulmates: { song: Song; tier: Tier }[];
  // Batch 2: Vault Track Verdict
  vaultVerdict: {
    user1VaultCount: number;
    user2VaultCount: number;
    sharedVaultCount: number;
    vaultCompatibility: number;
    sharedVaultSameTier: { song: Song; tier: Tier }[];
  };
  // Batch 3: Songs Only You Ranked (ranking gaps / implicit recommendations)
  onlyUser1Ranked: { song: Song; tier: Tier }[];
  onlyUser2Ranked: { song: Song; tier: Tier }[];
}
