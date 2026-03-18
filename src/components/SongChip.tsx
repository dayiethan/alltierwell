"use client";

import type { Song, Tier } from "@/lib/types";
import { ALBUMS, TIER_COLORS } from "@/lib/constants";

interface SongChipProps {
  song: Song;
  tier?: Tier;
  onClick: () => void;
  compact?: boolean;
}

export default function SongChip({
  song,
  tier,
  onClick,
  compact = false,
}: SongChipProps) {
  const albumColor =
    ALBUMS.find((a) => a.name === song.album)?.color ?? "#888";

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 text-left text-sm transition-colors hover:border-gray-400 ${
        compact ? "py-1" : "py-1.5"
      }`}
      style={
        tier
          ? { backgroundColor: `${TIER_COLORS[tier]}20` }
          : undefined
      }
    >
      <span
        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
        style={{ backgroundColor: albumColor }}
      />
      <span className="truncate">{song.title}</span>
      {song.is_vault && (
        <span className="text-[10px] text-gray-400">(V)</span>
      )}
    </button>
  );
}
