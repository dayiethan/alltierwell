import type { Song, Tier, ProfileStats, TierEntry } from "@/lib/types";
import { ALBUM_SHORT_NAMES } from "@/lib/constants";

// ──────────────────────────────────────────────
// Song tags (populate via Supabase on the songs table)
//
// Available tags:
//   heartbreak, love, angry, nostalgic, melancholy,
//   empowerment, storytelling, upbeat, ballad
// ──────────────────────────────────────────────

// Album era groups for fallback classification
const ERA_GROUPS: Record<string, string[]> = {
  country: ["Taylor Swift", "Fearless", "Fearless (Taylor's Version)"],
  romantic: [
    "Speak Now",
    "Speak Now (Taylor's Version)",
    "Red",
    "Red (Taylor's Version)",
  ],
  pop: ["1989", "1989 (Taylor's Version)", "Lover"],
  dark: ["reputation", "Midnights"],
  indie: ["folklore", "evermore"],
  poetry: ["The Tortured Poets Department"],
  showgirl: ["The Life of a Showgirl"],
};

const ALBUM_ARCHETYPE_MAP: Record<string, string> = {
  country: "The Nostalgic",
  romantic: "The Romantic",
  pop: "The Pop Girlie",
  dark: "The Dark Horse",
  indie: "The Folklorian",
  poetry: "The Poet",
  showgirl: "The Showgirl",
};

// Tags that are "boosted" by each album group — used as tiebreaker
const ERA_TAG_AFFINITY: Record<string, string[]> = {
  country: ["nostalgic", "love", "storytelling"],
  romantic: ["heartbreak", "love", "storytelling"],
  pop: ["upbeat", "empowerment", "love"],
  dark: ["angry", "empowerment", "melancholy"],
  indie: ["melancholy", "storytelling", "nostalgic"],
  poetry: ["heartbreak", "melancholy", "storytelling"],
  showgirl: ["upbeat", "empowerment", "love"],
};

// ──────────────────────────────────────────────
// Combo archetype rules — checked in order.
// Each rule: [tag1, tag2, archetype name]
// Both tags must appear 2+ times in S-tier songs.
// ──────────────────────────────────────────────
const COMBO_RULES: [string, string, string][] = [
  ["heartbreak", "storytelling", "The Heartbreak Poet"],
  ["angry", "empowerment", "The Villain Era"],
  ["melancholy", "ballad", "The Sad Girl"],
  ["empowerment", "upbeat", "The Main Character"],
  ["love", "upbeat", "The Party Starter"],
  ["nostalgic", "melancholy", "The Time Traveler"],
  ["heartbreak", "ballad", "The Balladeer"],
  ["storytelling", "nostalgic", "The Storyteller"],
];

// ──────────────────────────────────────────────
// Single-tag archetype map — used when no combo matches.
// Maps the dominant tag to an archetype name.
// ──────────────────────────────────────────────
const TAG_ARCHETYPE_MAP: Record<string, string> = {
  heartbreak: "The Heartbreak Poet",
  love: "The Hopeless Romantic",
  angry: "The Villain Era",
  nostalgic: "The Time Traveler",
  melancholy: "The Sad Girl",
  empowerment: "The Main Character",
  storytelling: "The Storyteller",
  upbeat: "The Party Starter",
  ballad: "The Balladeer",
};

function getAlbumGroup(entries: TierEntry[], songMap: Map<string, Song>): string | null {
  const groupScores: Record<string, number> = {};

  for (const entry of entries) {
    const song = songMap.get(entry.song_id);
    if (!song) continue;
    if (entry.tier !== "S" && entry.tier !== "A") continue;

    for (const [group, albums] of Object.entries(ERA_GROUPS)) {
      if (albums.includes(song.album)) {
        groupScores[group] = (groupScores[group] ?? 0) + 1;
      }
    }
  }

  let topGroup: string | null = null;
  let topScore = 0;
  for (const [group, score] of Object.entries(groupScores)) {
    if (score > topScore) {
      topScore = score;
      topGroup = group;
    }
  }
  return topGroup;
}

function computeArchetype(entries: TierEntry[], songs: Song[]): string {
  if (entries.length < 10) return "The Swiftie";

  const songMap = new Map(songs.map((s) => [s.id, s]));

  // The Abigail: ranked every single song
  if (entries.length >= songs.length) return "The Abigail";

  // The Vault Keeper: majority of ALL vault songs in DB are in user's S-tier
  const totalVaultSongs = songs.filter((s) => s.is_vault).length;
  if (totalVaultSongs > 0) {
    let userSVault = 0;
    for (const entry of entries) {
      const song = songMap.get(entry.song_id);
      if (song?.is_vault && entry.tier === "S") userSVault++;
    }
    if (userSVault > totalVaultSongs / 2) return "The Vault Keeper";
  }

  // Collect tags from S-tier songs
  const tagCounts: Record<string, number> = {};
  let totalTags = 0;
  for (const entry of entries) {
    if (entry.tier !== "S") continue;
    const song = songMap.get(entry.song_id);
    if (!song || !song.tags) continue;
    for (const tag of song.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      totalTags++;
    }
  }

  // Tag-based classification (need at least 3 tag instances from S-tier)
  if (totalTags >= 3) {
    const albumGroup = getAlbumGroup(entries, songMap);

    // Check combo rules first
    for (const [tag1, tag2, archetype] of COMBO_RULES) {
      if ((tagCounts[tag1] ?? 0) >= 2 && (tagCounts[tag2] ?? 0) >= 2) {
        return archetype;
      }
    }

    // Single dominant tag — find the top tag
    const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
    if (sortedTags.length >= 2) {
      const [topTag, topCount] = sortedTags[0];
      const [secondTag, secondCount] = sortedTags[1];

      // Clear winner
      if (topCount > secondCount) {
        return TAG_ARCHETYPE_MAP[topTag] ?? "The Swiftie";
      }

      // Tie — use album affinity as tiebreaker
      if (topCount === secondCount && albumGroup) {
        const affinities = ERA_TAG_AFFINITY[albumGroup] ?? [];
        const topAffinity = affinities.indexOf(topTag);
        const secondAffinity = affinities.indexOf(secondTag);
        // Lower index = stronger affinity; -1 means no affinity
        const topScore = topAffinity === -1 ? 999 : topAffinity;
        const secondScore = secondAffinity === -1 ? 999 : secondAffinity;
        const winner = topScore <= secondScore ? topTag : secondTag;
        return TAG_ARCHETYPE_MAP[winner] ?? "The Swiftie";
      }
    }

    // Only one tag type present
    if (sortedTags.length === 1) {
      return TAG_ARCHETYPE_MAP[sortedTags[0][0]] ?? "The Swiftie";
    }
  }

  // Album-based fallback (no tags populated)
  const albumGroup = getAlbumGroup(entries, songMap);
  if (albumGroup) {
    return ALBUM_ARCHETYPE_MAP[albumGroup] ?? "The Swiftie";
  }

  return "The Swiftie";
}

export function computeStats(
  entries: TierEntry[],
  songs: Song[]
): ProfileStats {
  const tierCounts: Record<Tier, number> = {
    S: 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

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
    favoriteEra: favoriteAlbum
      ? ALBUM_SHORT_NAMES[favoriteAlbum] ?? favoriteAlbum
      : null,
    archetype: computeArchetype(entries, songs),
  };
}
