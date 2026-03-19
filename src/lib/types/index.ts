export type Tier = "S" | "A" | "B" | "C" | "D" | "F";

export interface Song {
  id: string;
  title: string;
  album: string;
  album_order: number;
  track_number: number;
  is_vault: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  is_public: boolean;
}

export interface TierEntry {
  user_id: string;
  song_id: string;
  tier: Tier;
  updated_at: string;
}

export type TierListMap = Map<string, Tier>;

export interface ProfileStats {
  totalRanked: number;
  tierCounts: Record<Tier, number>;
  favoriteAlbum: string | null;
  favoriteEra: string | null;
}

export interface UserComparisonStats {
  totalRanked: number;
  tierCounts: Record<Tier, number>;
  avgTier: number;
  gradingStyle: string;
  sTierPercent: number;
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
    albumColor: string;
    score: number;
    sharedCount: number;
  }[];
}
