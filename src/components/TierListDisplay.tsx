"use client";

import type { Song, Tier, TierEntry } from "@/lib/types";
import { TIERS, TIER_COLORS, ALBUMS } from "@/lib/constants";

interface TierListDisplayProps {
  entries: TierEntry[];
  songs: Song[];
}

export default function TierListDisplay({
  entries,
  songs,
}: TierListDisplayProps) {
  const songMap = new Map(songs.map((s) => [s.id, s]));

  const tierGroups: Record<Tier, Song[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
  };

  for (const entry of entries) {
    const song = songMap.get(entry.song_id);
    if (song) {
      tierGroups[entry.tier].push(song);
    }
  }

  // Sort each tier's songs by album order then track number
  for (const tier of TIERS) {
    tierGroups[tier].sort(
      (a, b) => a.album_order - b.album_order || a.track_number - b.track_number
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {TIERS.map((tier) => (
        <div key={tier} className="flex min-h-[44px] border-b border-border last:border-b-0">
          <div
            className="flex w-12 flex-shrink-0 items-center justify-center text-base font-bold text-gray-800"
            style={{ backgroundColor: TIER_COLORS[tier] }}
          >
            {tier}
          </div>
          <div className="flex flex-1 flex-wrap gap-1 p-1.5">
            {tierGroups[tier].map((song) => {
              const album = ALBUMS.find((a) => a.name === song.album) as
                | { name: string; color: string; image: string }
                | undefined;
              return (
                <span
                  key={song.id}
                  className="inline-flex items-center gap-1 rounded border border-border px-2 py-0.5 text-xs"
                  style={{ backgroundColor: `${TIER_COLORS[tier]}15` }}
                >
                  {album?.image ? (
                    <img
                      src={album.image}
                      alt=""
                      className="h-3.5 w-3.5 flex-shrink-0 rounded-sm object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.style.display = "none";
                        el.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <span
                    className={`h-3.5 w-3.5 flex-shrink-0 rounded-sm ${album?.image ? "hidden" : ""}`}
                    style={{ backgroundColor: (album?.color ?? "#888") + "40" }}
                  />
                  {song.title}
                </span>
              );
            })}
            {tierGroups[tier].length === 0 && (
              <span className="py-1 text-xs text-muted-foreground/50">—</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
