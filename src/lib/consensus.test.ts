import { describe, expect, it } from "vitest";
import {
  computeCommunityConsensus,
  computeHotTakes,
  computeSharedHotTakes,
} from "@/lib/consensus";
import type { Song, TierEntry } from "@/lib/types";

const songs: Song[] = [
  {
    id: "song-1",
    title: "Consensus Song",
    album: "Red",
    album_order: 4,
    track_number: 1,
    is_vault: false,
    tags: [],
    image_url: null,
  },
  {
    id: "song-2",
    title: "Polarizing Song",
    album: "folklore",
    album_order: 8,
    track_number: 2,
    is_vault: false,
    tags: [],
    image_url: null,
  },
  {
    id: "song-3",
    title: "Shared Rebellion",
    album: "Midnights",
    album_order: 10,
    track_number: 3,
    is_vault: false,
    tags: [],
    image_url: null,
  },
];

describe("consensus helpers", () => {
  it("computes rounded community tiers from average rankings", () => {
    const consensus = computeCommunityConsensus([
      { song_id: "song-1", tier: "S" },
      { song_id: "song-1", tier: "A" },
      { song_id: "song-1", tier: "A" },
      { song_id: "song-2", tier: "F" },
      { song_id: "song-2", tier: "F" },
      { song_id: "song-2", tier: "D" },
    ]);

    expect(consensus.get("song-1")?.consensusTier).toBe("A");
    expect(consensus.get("song-2")?.consensusTier).toBe("F");
  });

  it("finds hot takes and labels whether a user overrates or underrates a song", () => {
    const consensus = computeCommunityConsensus([
      { song_id: "song-1", tier: "A" },
      { song_id: "song-1", tier: "A" },
      { song_id: "song-1", tier: "A" },
      { song_id: "song-2", tier: "C" },
      { song_id: "song-2", tier: "C" },
      { song_id: "song-2", tier: "C" },
    ]);

    const userEntries: TierEntry[] = [
      {
        user_id: "user-1",
        song_id: "song-1",
        tier: "S",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      {
        user_id: "user-1",
        song_id: "song-2",
        tier: "S",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];

    const hotTakes = computeHotTakes(userEntries, consensus, songs);

    expect(hotTakes).toHaveLength(1);
    expect(hotTakes[0]?.song.id).toBe("song-2");
    expect(hotTakes[0]?.direction).toBe("overrates");
    expect(hotTakes[0]?.communityTier).toBe("C");
  });

  it("finds songs both users rank away from the community in the same direction", () => {
    const consensus = computeCommunityConsensus([
      { song_id: "song-3", tier: "C" },
      { song_id: "song-3", tier: "C" },
      { song_id: "song-3", tier: "C" },
      { song_id: "song-1", tier: "A" },
      { song_id: "song-1", tier: "A" },
      { song_id: "song-1", tier: "A" },
    ]);

    const user1Entries: TierEntry[] = [
      {
        user_id: "user-1",
        song_id: "song-3",
        tier: "S",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      {
        user_id: "user-1",
        song_id: "song-1",
        tier: "A",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];
    const user2Entries: TierEntry[] = [
      {
        user_id: "user-2",
        song_id: "song-3",
        tier: "A",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      {
        user_id: "user-2",
        song_id: "song-1",
        tier: "A",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ];

    const shared = computeSharedHotTakes(user1Entries, user2Entries, consensus, songs);

    expect(shared).toHaveLength(1);
    expect(shared[0]?.song.id).toBe("song-3");
    expect(shared[0]?.communityTier).toBe("C");
  });
});
