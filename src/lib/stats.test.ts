import { describe, expect, it } from "vitest";
import { computeArchetype, computeStats } from "@/lib/stats";
import type { Song, TierEntry } from "@/lib/types";

const songs: Song[] = [
  {
    id: "f1",
    title: "folklore 1",
    album: "folklore",
    album_order: 8,
    track_number: 1,
    is_vault: false,
    tags: ["heartbreak", "storytelling"],
    image_url: null,
  },
  {
    id: "f2",
    title: "folklore 2",
    album: "folklore",
    album_order: 8,
    track_number: 2,
    is_vault: false,
    tags: ["heartbreak", "storytelling"],
    image_url: null,
  },
  {
    id: "f3",
    title: "folklore 3",
    album: "folklore",
    album_order: 8,
    track_number: 3,
    is_vault: false,
    tags: ["heartbreak"],
    image_url: null,
  },
  {
    id: "f4",
    title: "folklore 4",
    album: "folklore",
    album_order: 8,
    track_number: 4,
    is_vault: false,
    tags: ["storytelling"],
    image_url: null,
  },
  {
    id: "r1",
    title: "red 1",
    album: "Red",
    album_order: 4,
    track_number: 1,
    is_vault: false,
    tags: ["love"],
    image_url: null,
  },
  {
    id: "r2",
    title: "red 2",
    album: "Red",
    album_order: 4,
    track_number: 2,
    is_vault: false,
    tags: ["love"],
    image_url: null,
  },
  {
    id: "r3",
    title: "red 3",
    album: "Red",
    album_order: 4,
    track_number: 3,
    is_vault: false,
    tags: ["love"],
    image_url: null,
  },
  {
    id: "m1",
    title: "midnights 1",
    album: "Midnights",
    album_order: 10,
    track_number: 1,
    is_vault: false,
    tags: ["anxious"],
    image_url: null,
  },
  {
    id: "m2",
    title: "midnights 2",
    album: "Midnights",
    album_order: 10,
    track_number: 2,
    is_vault: false,
    tags: ["anxious"],
    image_url: null,
  },
  {
    id: "m3",
    title: "midnights 3",
    album: "Midnights",
    album_order: 10,
    track_number: 3,
    is_vault: false,
    tags: ["anxious"],
    image_url: null,
  },
  {
    id: "x1",
    title: "extra 1",
    album: "Lover",
    album_order: 7,
    track_number: 1,
    is_vault: false,
    tags: ["upbeat"],
    image_url: null,
  },
  {
    id: "x2",
    title: "extra 2",
    album: "Lover",
    album_order: 7,
    track_number: 2,
    is_vault: false,
    tags: ["upbeat"],
    image_url: null,
  },
];

const rankedEntries: TierEntry[] = [
  { user_id: "user-1", song_id: "f1", tier: "S", updated_at: "2026-01-01T00:00:00.000Z" },
  { user_id: "user-1", song_id: "f2", tier: "S", updated_at: "2026-01-01T00:00:00.000Z" },
  { user_id: "user-1", song_id: "f3", tier: "A", updated_at: "2026-01-01T00:00:00.000Z" },
  { user_id: "user-1", song_id: "f4", tier: "B", updated_at: "2026-01-01T00:00:00.000Z" },
  { user_id: "user-1", song_id: "r1", tier: "A", updated_at: "2026-01-01T00:00:00.000Z" },
  { user_id: "user-1", song_id: "r2", tier: "B", updated_at: "2026-01-01T00:00:00.000Z" },
  { user_id: "user-1", song_id: "r3", tier: "C", updated_at: "2026-01-01T00:00:00.000Z" },
  { user_id: "user-1", song_id: "m1", tier: "C", updated_at: "2026-01-01T00:00:00.000Z" },
  { user_id: "user-1", song_id: "m2", tier: "D", updated_at: "2026-01-01T00:00:00.000Z" },
  { user_id: "user-1", song_id: "m3", tier: "F", updated_at: "2026-01-01T00:00:00.000Z" },
];

describe("stats helpers", () => {
  it("computes favorite era and heartbreak archetype from ranked songs", () => {
    const stats = computeStats(rankedEntries, songs);

    expect(stats.totalRanked).toBe(10);
    expect(stats.favoriteEra).toBe("folklore");
    expect(stats.archetype).toBe("The Heartbreak Poet");
    expect(stats.tierCounts.S).toBe(2);
  });

  it("identifies users who rank every available song as Abigail", () => {
    const allRanked = songs.map((song, index) => ({
      user_id: "user-1",
      song_id: song.id,
      tier: (["S", "A", "B", "C", "D", "F"] as const)[index % 6],
      updated_at: "2026-01-01T00:00:00.000Z",
    }));

    expect(computeArchetype(allRanked, songs)).toBe("The Abigail");
  });
});
