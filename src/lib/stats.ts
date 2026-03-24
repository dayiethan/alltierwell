import type { Song, Tier, ProfileStats, TierEntry } from "@/lib/types";
import { ALBUM_SHORT_NAMES, TIER_ORDER } from "@/lib/constants";

// ──────────────────────────────────────────────
// Song tags (populate via Supabase on the songs table)
//
// Available tags:
//   heartbreak, love, angry, nostalgic, melancholy,
//   empowerment, storytelling, upbeat, ballad,
//   yearning, anxious, playful, introspective
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
  country: ["nostalgic", "love", "storytelling", "playful"],
  romantic: ["heartbreak", "love", "storytelling", "yearning"],
  pop: ["upbeat", "empowerment", "love", "playful"],
  dark: ["angry", "empowerment", "melancholy", "anxious"],
  indie: ["melancholy", "storytelling", "nostalgic", "introspective"],
  poetry: ["heartbreak", "melancholy", "storytelling", "yearning"],
  showgirl: ["upbeat", "empowerment", "love", "playful"],
};

// ──────────────────────────────────────────────
// Archetype descriptions — one-line reasoning for each archetype
// ──────────────────────────────────────────────
export const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  "The Heartbreak Poet": "Your S-tier reads like a breakup album. You keep coming back to the songs about heartbreak and the stories behind them, the ones that hit like All Too Well on a rainy day.",
  "The Villain Era": "You didn't come here to be nice. Your top tier is stacked with anger and empowerment tracks. If it sounds like it belongs in the reputation stadium tour intro, you're in.",
  "The Sad Girl": "You put on a sad song and feel it in your bones. Melancholy ballads run your whole S-tier. You probably have a playlist called \"crying in the car\" and it's just Taylor.",
  "The Main Character": "Your S-tier is pure main character energy. Empowerment anthems and high-energy tracks that make you feel like you're walking in slow motion through a movie montage.",
  "The Party Starter": "Love songs and upbeat bangers own your top tier. You're the one queueing 22 and Shake It Off at every party and honestly? Nobody's complaining.",
  "The Time Traveler": "Nostalgia hits you different. Your S-tier is full of songs that feel like looking through old photos, the kind that make you miss something you can't quite name.",
  "The Balladeer": "Slow it down. Your S-tier is heartbreak ballads front to back. If a song doesn't build to a devastating bridge, you're not sure you need it.",
  "The Storyteller": "You care about the narrative. Your top songs are the ones that tell a story and take you somewhere, like a three-minute movie you can listen to on repeat.",
  "The Hopeless Romantic": "Love songs and yearning fill your S-tier. You still believe in the Love Story fairy tale and you're not apologizing for it.",
  "The Piner": "You live in the \"what if\" and \"almost\" of it all. Yearning and heartbreak are your thing, the songs about wanting someone you can't quite have.",
  "The Jester": "You're not here to cry. Playful, upbeat, fun tracks fill your top tier. You know every word to Me! and you don't care who knows it.",
  "The Overthinker": "Anxious love songs just get you. The ones about second-guessing everything and reading too much into a text. You feel very seen by Anti-Hero.",
  "The Spiral": "Anxiety and heartbreak at the same time? That's your sweet spot. You're drawn to the songs where everything falls apart at once.",
  "The Philosopher": "You want a song that makes you sit with it for a while. Introspective, melancholy, the kind of track that changes meaning the more you listen.",
  "The Narrator": "You love it when Taylor gets meta. Introspective storytelling with layers you can peel back, the kind of song you catch new details in years later.",
  "The Nostalgic": "Country-era Taylor is home for you. You've been here since Tim McGraw and you still think those early records hold up against anything.",
  "The Romantic": "Speak Now and Red energy runs deep in your rankings. You're here for the grand love stories, the big feelings, and the bridges that take your breath away.",
  "The Pop Girlie": "1989 and Lover are your comfort zones. You love a perfectly crafted pop song and you know that's not something to be embarrassed about.",
  "The Dark Horse": "reputation and Midnights are where you live. You like Taylor best when she's moody, sharp, and a little bit dangerous.",
  "The Folklorian": "folklore and evermore have your whole heart. Cardigan cardigans, autumn leaves, fictional characters you got way too attached to.",
  "The Poet": "The Tortured Poets Department clicked for you in a way it didn't for everyone. You like your lyrics raw, literary, and a little unhinged.",
  "The Showgirl": "The Life of a Showgirl era is your thing. Big production, big energy, the kind of songs that feel like confetti is falling around you.",
  "The Swiftie": "You don't play favorites with the eras. Your rankings are spread across the whole discography, which honestly just means you have good taste across the board.",
  "The Abigail": "You ranked every. single. song. That's dedication. You probably have opinions about deep cuts that most fans don't even know exist. You might just be Abigail.",
  "The Vault Keeper": "While everyone else is ranking the hits, you're over here putting vault tracks in your S-tier. You know where the real gems are hiding.",
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
  ["yearning", "love", "The Hopeless Romantic"],
  ["yearning", "heartbreak", "The Piner"],
  ["playful", "upbeat", "The Jester"],
  ["anxious", "love", "The Overthinker"],
  ["anxious", "heartbreak", "The Spiral"],
  ["introspective", "melancholy", "The Philosopher"],
  ["introspective", "storytelling", "The Narrator"],
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
  yearning: "The Piner",
  playful: "The Jester",
  anxious: "The Overthinker",
  introspective: "The Philosopher",
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

export function computeArchetype(entries: TierEntry[], songs: Song[]): string {
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

/** Bayesian smoothing constant — with fewer ranked songs the score
 *  gravitates toward the user's global average, preventing eras with
 *  only a couple of ranked songs from dominating. */
const ERA_SMOOTHING = 5;

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

  const songMap = new Map(songs.map((s) => [s.id, s]));
  const albumStats: Record<string, { totalTier: number; count: number }> = {};
  let globalTotalTier = 0;

  for (const entry of entries) {
    tierCounts[entry.tier]++;
    globalTotalTier += TIER_ORDER[entry.tier as Tier];

    const song = songMap.get(entry.song_id);
    if (song) {
      if (!albumStats[song.album]) {
        albumStats[song.album] = { totalTier: 0, count: 0 };
      }
      albumStats[song.album].totalTier += TIER_ORDER[entry.tier as Tier];
      albumStats[song.album].count++;
    }
  }

  const globalAvg = entries.length > 0 ? globalTotalTier / entries.length : 2.5;

  // Find favorite era using Bayesian-adjusted average tier (lower = better)
  // Exclude Non-Album since it spans all eras and isn't a meaningful "favorite era"
  let favoriteAlbum: string | null = null;
  let bestAdjusted = Infinity;
  for (const [album, stats] of Object.entries(albumStats)) {
    if (album === "Non-Album") continue;
    if (stats.count < 3) continue;
    const rawAvg = stats.totalTier / stats.count;
    const adjustedAvg =
      (stats.count * rawAvg + ERA_SMOOTHING * globalAvg) /
      (stats.count + ERA_SMOOTHING);
    if (adjustedAvg < bestAdjusted) {
      bestAdjusted = adjustedAvg;
      favoriteAlbum = album;
    }
  }

  const archetype = computeArchetype(entries, songs);

  return {
    totalRanked: entries.length,
    tierCounts,
    favoriteEra: favoriteAlbum
      ? ALBUM_SHORT_NAMES[favoriteAlbum] ?? favoriteAlbum
      : null,
    archetype,
    archetypeDescription: ARCHETYPE_DESCRIPTIONS[archetype] ?? "",
  };
}
