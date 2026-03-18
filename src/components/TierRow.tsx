"use client";

import type { Song, Tier } from "@/lib/types";
import { TIER_COLORS } from "@/lib/constants";
import SongChip from "./SongChip";

interface TierRowProps {
  tier: Tier;
  songs: Song[];
  onSongClick: (song: Song) => void;
}

export default function TierRow({ tier, songs, onSongClick }: TierRowProps) {
  return (
    <div className="flex min-h-[52px] border-b border-gray-200">
      <div
        className="flex w-14 flex-shrink-0 items-center justify-center text-lg font-bold text-gray-800"
        style={{ backgroundColor: TIER_COLORS[tier] }}
      >
        {tier}
      </div>
      <div className="flex flex-1 flex-wrap gap-1.5 p-2">
        {songs.map((song) => (
          <SongChip
            key={song.id}
            song={song}
            tier={tier}
            onClick={() => onSongClick(song)}
            compact
          />
        ))}
        {songs.length === 0 && (
          <span className="py-1 text-xs text-gray-300">
            Click songs below to add them here
          </span>
        )}
      </div>
    </div>
  );
}
