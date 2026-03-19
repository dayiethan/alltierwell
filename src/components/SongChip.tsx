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
  const album = ALBUMS.find((a) => a.name === song.album);
  const albumColor = album?.color ?? "#888";
  const albumImage = album?.image;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border border-border px-2 text-left text-sm transition-colors hover:border-muted-foreground ${
        compact ? "py-0.5" : "py-1"
      }`}
      style={
        tier
          ? { backgroundColor: `${TIER_COLORS[tier]}20` }
          : undefined
      }
    >
      {albumImage ? (
        <img
          src={albumImage}
          alt=""
          className="h-4 w-4 flex-shrink-0 rounded-sm object-cover"
          onError={(e) => {
            const el = e.target as HTMLImageElement;
            el.style.display = "none";
            el.nextElementSibling?.classList.remove("hidden");
          }}
        />
      ) : null}
      <span
        className={`h-4 w-4 flex-shrink-0 rounded-sm ${albumImage ? "hidden" : ""}`}
        style={{ backgroundColor: albumColor + "40" }}
      />
      <span className="truncate">{song.title}</span>
      {song.is_vault && (
        <span className="text-[10px] text-muted-foreground">(V)</span>
      )}
    </button>
  );
}
