import type { Song, Tier, ProfileStats, TierEntry } from "@/lib/types";
import { TIERS, ALBUM_SHORT_NAMES } from "@/lib/constants";

export function computeStats(
  entries: TierEntry[],
  songs: Song[]
): ProfileStats {
  const tierCounts: Record<Tier, number> = { S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 };

  const albumHighTierCounts: Record<string, number> = {};

  const songMap = new Map(songs.map((s) => [s.id, s]));

  for (const entry of entries) {
    tierCounts[entry.tier]++;

    const song = songMap.get(entry.song_id);
    if (song && (entry.tier === "S" || entry.tier === "A")) {
      albumHighTierCounts[song.album] =
        (albumHighTierCounts[song.album] ?? 0) + 1;
    }
  }

  let favoriteAlbum: string | null = null;
  let maxCount = 0;
  for (const [album, count] of Object.entries(albumHighTierCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteAlbum = album;
    }
  }

  return {
    totalRanked: entries.length,
    tierCounts,
    favoriteAlbum: favoriteAlbum
      ? ALBUM_SHORT_NAMES[favoriteAlbum] ?? favoriteAlbum
      : null,
    favoriteEra: favoriteAlbum
      ? ALBUM_SHORT_NAMES[favoriteAlbum] ?? favoriteAlbum
      : null,
  };
}
