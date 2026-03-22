"use client";

import type { Song, Tier } from "@/lib/types";
import { TIER_COLORS, ALBUMS, ALBUM_SHORT_NAMES } from "@/lib/constants";
import { useState } from "react";

interface RankingGapsProps {
  onlyUser1Ranked: { song: Song; tier: Tier }[];
  onlyUser2Ranked: { song: Song; tier: Tier }[];
  user1Name: string;
  user2Name: string;
}

export default function RankingGaps({
  onlyUser1Ranked,
  onlyUser2Ranked,
  user1Name,
  user2Name,
}: RankingGapsProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
      >
        <svg
          className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        Songs Only One of You Ranked
      </button>

      {expanded && (
        <div className="grid gap-3 sm:grid-cols-2">
          <GapList
            title={`${user1Name} ranked, ${user2Name} hasn\u2019t`}
            items={onlyUser1Ranked}
            perspective={user2Name}
          />
          <GapList
            title={`${user2Name} ranked, ${user1Name} hasn\u2019t`}
            items={onlyUser2Ranked}
            perspective={user1Name}
          />
        </div>
      )}
    </div>
  );
}

function GapList({
  title,
  items,
  perspective,
}: {
  title: string;
  items: { song: Song; tier: Tier }[];
  perspective: string;
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      {items.length > 0 ? (
        <p className="text-[10px] text-muted-foreground/50 mb-3">
          {perspective}, check these out!
        </p>
      ) : (
        <p className="text-[10px] text-muted-foreground/50 mb-1">
          {perspective} has covered all the ground already
        </p>
      )}
      {items.length === 0 ? (
        <p className="py-4 text-center text-sm italic text-muted-foreground/40">
          &ldquo;There&rsquo;s nothing new to discover&rdquo;
        </p>
      ) : (
      <div className="space-y-2">
        {items.map(({ song, tier }) => {
          const album = ALBUMS.find((a) => a.name === song.album);
          const albumColor = album?.color ?? "#888";
          const shortAlbum = ALBUM_SHORT_NAMES[song.album] ?? song.album;

          return (
            <div key={song.id} className="flex items-center gap-2">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: albumColor }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs truncate block">{song.title}</span>
                <span className="text-[10px] text-muted-foreground/60">
                  {shortAlbum}
                </span>
              </div>
              <TierBadge tier={tier} />
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-gray-800 flex-shrink-0"
      style={{ backgroundColor: TIER_COLORS[tier] }}
    >
      {tier}
    </span>
  );
}
