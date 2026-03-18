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

export interface ComparisonResult {
  compatibilityScore: number;
  sharedSongsCount: number;
  sameTierSongs: Record<Tier, Song[]>;
  biggestDisagreements: {
    song: Song;
    user1Tier: Tier;
    user2Tier: Tier;
    distance: number;
  }[];
  albumAlignment: {
    album: string;
    score: number;
    sharedCount: number;
  }[];
}
