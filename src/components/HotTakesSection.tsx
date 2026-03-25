/* eslint-disable @next/next/no-img-element */

"use client";

import { useState } from "react";
import type { HotTake, Tier } from "@/lib/types";
import { TIER_COLORS, getHotTakeLabel, getSongImage, getSongAlbumColor } from "@/lib/constants";

interface HotTakesSectionProps {
  hotTakes: HotTake[];
  displayName: string;
}

export default function HotTakesSection({ hotTakes, displayName }: HotTakesSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (hotTakes.length === 0) return null;

  const visible = expanded ? hotTakes : hotTakes.slice(0, 5);

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Hot Takes
      </h2>
      <p className="mb-3 text-xs text-muted-foreground/60">
        Songs where {displayName} disagrees with the community
      </p>
      <div className="rounded-xl border border-border p-4 space-y-3">
        {visible.map((take) => {
          const songImage = getSongImage(take.song);
          const albumColor = getSongAlbumColor(take.song);
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
                  {take.direction === "overrates" ? "Rates higher" : "Rates lower"} than community
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <TierBadge tier={take.userTier} />
                <span className="text-xs text-muted-foreground">vs</span>
                <TierBadge tier={take.communityTier} />
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: take.distance >= 4 ? "#ef444425" : take.distance >= 3 ? "#f9731625" : "#eab30825",
                  color: take.distance >= 4 ? "#ef4444" : take.distance >= 3 ? "#f97316" : "#eab308",
                }}
              >
                {getHotTakeLabel(take.distance)}
              </span>
            </div>
          );
        })}

        {hotTakes.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
          >
            {expanded ? "Show less" : `Show all ${hotTakes.length} hot takes`}
          </button>
        )}
      </div>
    </section>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-gray-800"
        style={{ backgroundColor: TIER_COLORS[tier] }}
      >
        {tier}
      </span>
    </div>
  );
}
