import { describe, expect, it } from "vitest";
import { computeComparison } from "@/lib/comparison";
import { computeCommunityConsensus } from "@/lib/consensus";
import type { Song, Tier, TierEntry } from "@/lib/types";

function makeSong(index: number, album = "Red", albumOrder = 4): Song {
  return {
    id: `song-${index}`,
    title: `Song ${index}`,
    album,
    album_order: albumOrder,
    track_number: index,
    is_vault: false,
    tags: [],
    image_url: null,
  };
}

function makeEntries(userId: string, songs: Song[], tier: Tier): TierEntry[] {
  return songs.map((song) => ({
    user_id: userId,
    song_id: song.id,
    tier,
    updated_at: "2026-01-01T00:00:00.000Z",
  }));
}

function makePatternEntries(userId: string, songs: Song[], tiers: Tier[]): TierEntry[] {
  return songs.map((song, index) => ({
    user_id: userId,
    song_id: song.id,
    tier: tiers[index % tiers.length],
    updated_at: "2026-01-01T00:00:00.000Z",
  }));
}

describe("computeComparison", () => {
  it("returns an empty comparison when users share no ranked songs", () => {
    const user1Songs = Array.from({ length: 5 }, (_, index) => makeSong(index + 1, "Red", 4));
    const user2Songs = Array.from({ length: 5 }, (_, index) =>
      makeSong(index + 101, "Midnights", 10)
    );

    const result = computeComparison(
      makeEntries("user-1", user1Songs, "S"),
      makeEntries("user-2", user2Songs, "A"),
      [...user1Songs, ...user2Songs]
    );

    expect(result.sharedSongsCount).toBe(0);
    expect(result.compatibilityScore).toBe(0);
    expect(result.sameTierTotal).toBe(0);
    expect(result.biggestDisagreements).toEqual([]);
  });

  it("scores identical rankings as highly compatible", () => {
    const songs = Array.from({ length: 30 }, (_, index) => makeSong(index + 1));
    const tiers: Tier[] = ["S", "A", "B", "C", "D", "F"];
    const user1Entries = makePatternEntries("user-1", songs, tiers);
    const user2Entries = makePatternEntries("user-2", songs, tiers);

    const result = computeComparison(user1Entries, user2Entries, songs);

    expect(result.sharedSongsCount).toBe(30);
    expect(result.sameTierTotal).toBe(30);
    expect(result.compatibilityScore).toBeGreaterThan(95);
    expect(result.biggestDisagreements).toHaveLength(0);
  });

  it("penalizes extreme disagreement while surfacing love-hate splits", () => {
    const songs = Array.from({ length: 30 }, (_, index) => makeSong(index + 1));
    const user1Entries = makeEntries("user-1", songs, "S");
    const user2Entries = makeEntries("user-2", songs, "F");

    const result = computeComparison(user1Entries, user2Entries, songs);

    expect(result.sharedSongsCount).toBe(30);
    expect(result.compatibilityScore).toBeLessThan(25);
    expect(result.biggestDisagreements[0]?.distance).toBe(5);
    expect(result.loveHateSplits.user1Loves).toHaveLength(5);
    expect(result.loveHateSplits.user2Loves).toHaveLength(0);
  });

  it("pulls the score toward neutral when overlap evidence is very weak", () => {
    const sharedSong = makeSong(1, "Red", 4);
    const fillerSongs = Array.from({ length: 10 }, (_, index) =>
      makeSong(index + 100, "Midnights", 10)
    );
    const allSongs = [sharedSong, ...fillerSongs];

    const user1Entries: TierEntry[] = [
      {
        user_id: "user-1",
        song_id: sharedSong.id,
        tier: "S",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      ...makeEntries("user-1", fillerSongs.slice(0, 9), "A"),
    ];
    const user2Entries: TierEntry[] = [
      {
        user_id: "user-2",
        song_id: sharedSong.id,
        tier: "F",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      ...makeEntries("user-2", fillerSongs.slice(9), "A"),
    ];

    const result = computeComparison(user1Entries, user2Entries, allSongs);

    expect(result.sharedSongsCount).toBe(1);
    expect(result.confidence).toBeLessThan(0.25);
    expect(result.compatibilityScore).toBeGreaterThan(35);
    expect(result.compatibilityScore).toBeLessThan(50);
  });

  it("returns vault, deep-cut, ranking-gap, and shared-hot-take details together", () => {
    const songs: Song[] = [
      {
        id: "vault-same",
        title: "Vault Same",
        album: "Red (Taylor's Version)",
        album_order: 4,
        track_number: 21,
        is_vault: true,
        tags: [],
        image_url: null,
      },
      {
        id: "vault-diff",
        title: "Vault Diff",
        album: "Red (Taylor's Version)",
        album_order: 4,
        track_number: 22,
        is_vault: true,
        tags: [],
        image_url: null,
      },
      {
        id: "deepcut-same",
        title: "Deep Cut Same",
        album: "Lover",
        album_order: 7,
        track_number: 14,
        is_vault: false,
        tags: [],
        image_url: null,
      },
      {
        id: "shared-hot",
        title: "Shared Hot",
        album: "Midnights",
        album_order: 10,
        track_number: 3,
        is_vault: false,
        tags: [],
        image_url: null,
      },
      {
        id: "u1-only-s",
        title: "User 1 Only S",
        album: "folklore",
        album_order: 8,
        track_number: 1,
        is_vault: false,
        tags: [],
        image_url: null,
      },
      {
        id: "u2-only-f",
        title: "User 2 Only F",
        album: "evermore",
        album_order: 9,
        track_number: 1,
        is_vault: false,
        tags: [],
        image_url: null,
      },
    ];

    const user1Entries: TierEntry[] = [
      { user_id: "user-1", song_id: "vault-same", tier: "S", updated_at: "2026-01-01T00:00:00.000Z" },
      { user_id: "user-1", song_id: "vault-diff", tier: "S", updated_at: "2026-01-01T00:00:00.000Z" },
      { user_id: "user-1", song_id: "deepcut-same", tier: "A", updated_at: "2026-01-01T00:00:00.000Z" },
      { user_id: "user-1", song_id: "shared-hot", tier: "S", updated_at: "2026-01-01T00:00:00.000Z" },
      { user_id: "user-1", song_id: "u1-only-s", tier: "S", updated_at: "2026-01-01T00:00:00.000Z" },
    ];
    const user2Entries: TierEntry[] = [
      { user_id: "user-2", song_id: "vault-same", tier: "S", updated_at: "2026-01-01T00:00:00.000Z" },
      { user_id: "user-2", song_id: "vault-diff", tier: "F", updated_at: "2026-01-01T00:00:00.000Z" },
      { user_id: "user-2", song_id: "deepcut-same", tier: "A", updated_at: "2026-01-01T00:00:00.000Z" },
      { user_id: "user-2", song_id: "shared-hot", tier: "A", updated_at: "2026-01-01T00:00:00.000Z" },
      { user_id: "user-2", song_id: "u2-only-f", tier: "F", updated_at: "2026-01-01T00:00:00.000Z" },
    ];

    const consensus = computeCommunityConsensus([
      { song_id: "shared-hot", tier: "C" },
      { song_id: "shared-hot", tier: "C" },
      { song_id: "shared-hot", tier: "C" },
      { song_id: "vault-same", tier: "A" },
      { song_id: "vault-same", tier: "A" },
      { song_id: "vault-same", tier: "A" },
    ]);

    const result = computeComparison(user1Entries, user2Entries, songs, consensus);

    expect(result.vaultVerdict.user1VaultCount).toBe(2);
    expect(result.vaultVerdict.user2VaultCount).toBe(2);
    expect(result.vaultVerdict.sharedVaultCount).toBe(2);
    expect(result.vaultVerdict.vaultCompatibility).toBe(50);
    expect(result.vaultVerdict.sharedVaultSameTier.map(({ song }) => song.id)).toEqual([
      "vault-same",
    ]);

    expect(result.deepCutSoulmates.map(({ song }) => song.id)).toEqual([
      "vault-same",
      "deepcut-same",
    ]);

    expect(result.onlyUser1Ranked.map(({ song }) => song.id)).toEqual(["u1-only-s"]);
    expect(result.onlyUser2Ranked.map(({ song }) => song.id)).toEqual(["u2-only-f"]);

    expect(result.sharedHotTakes).toHaveLength(1);
    expect(result.sharedHotTakes[0]?.song.id).toBe("shared-hot");
    expect(result.sharedHotTakes[0]?.communityTier).toBe("C");
  });
});
