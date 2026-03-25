/* eslint-disable @next/next/no-img-element */

"use client";

import { useState } from "react";
import type { Song, Tier } from "@/lib/types";
import { TIER_COLORS, getHotTakeLabel, getSongImage, getSongAlbumColor } from "@/lib/constants";

interface SharedHotTakesProps {
  sharedHotTakes: {
    song: Song;
    user1Tier: Tier;
    user2Tier: Tier;
    communityTier: Tier;
    avgDistance: number;
  }[];
}

export default function SharedHotTakes({ sharedHotTakes }: SharedHotTakesProps) {
  const [expanded, setExpanded] = useState(false);

  if (sharedHotTakes.length === 0) return null;

  const visible = expanded ? sharedHotTakes : sharedHotTakes.slice(0, 5);

  // Determine if both overrate or underrate (based on first item direction)
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Shared Hot Takes
      </h2>
      <p className="mb-3 text-xs text-muted-foreground/60">
        Songs you both rate differently from the community
      </p>
      <div className="rounded-xl border border-border p-4 space-y-3">
        {visible.map((take) => {
          const songImage = getSongImage(take.song);
          const albumColor = getSongAlbumColor(take.song);
          const label = getHotTakeLabel(take.avgDistance);

          return (
            <div key={take.song.id} className="flex items-center gap-3">
              {songImage ? (
                <img
                  src={songImage}
                  alt=""
                  className="h-8 w-8 rounded object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className="h-8 w-8 rounded flex-shrink-0"
                  style={{ backgroundColor: albumColor + "30" }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{take.song.title}</p>
                <p className="text-xs text-muted-foreground/60">
                  Community says{" "}
                  <span
                    className="font-semibold"
                    style={{ color: TIER_COLORS[take.communityTier] }}
                  >
                    {take.communityTier}
                  </span>
                  {" — you both disagree"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <TierBadge tier={take.user1Tier} />
                <TierBadge tier={take.user2Tier} />
                <span className="text-[10px] text-muted-foreground mx-0.5">vs</span>
                <TierBadge tier={take.communityTier} />
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: take.avgDistance >= 4 ? "#ef444425" : take.avgDistance >= 3 ? "#f9731625" : "#eab30825",
                  color: take.avgDistance >= 4 ? "#ef4444" : take.avgDistance >= 3 ? "#f97316" : "#eab308",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}

        {sharedHotTakes.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
          >
            {expanded ? "Show less" : `Show all ${sharedHotTakes.length} shared hot takes`}
          </button>
        )}
      </div>
    </section>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-gray-800"
      style={{ backgroundColor: TIER_COLORS[tier] }}
    >
      {tier}
    </span>
  );
}
