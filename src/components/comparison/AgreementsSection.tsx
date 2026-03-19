"use client";

import type { ComparisonResult, Song, Tier } from "@/lib/types";
import { TIERS, TIER_COLORS, ALBUMS } from "@/lib/constants";
import { useState } from "react";

interface AgreementsSectionProps {
  result: ComparisonResult;
}

export default function AgreementsSection({ result }: AgreementsSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const sharedSTier = result.sameTierSongs.S;

  if (result.sameTierTotal === 0) return null;

  return (
    <div className="space-y-5">
      {/* Shared S-Tier spotlight */}
      {sharedSTier.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Shared Masterpieces
          </h3>
          <div
            className="rounded-xl border border-gray-200 p-5"
            style={{
              background: `linear-gradient(135deg, ${TIER_COLORS.S}10 0%, ${TIER_COLORS.A}08 100%)`,
            }}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {sharedSTier.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Same-tier summary */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Same Tier
        </h3>
        <div className="rounded-xl border border-gray-200 p-4">
          {/* Visual pill summary */}
          <div className="flex flex-wrap gap-2">
            {TIERS.filter((t) => result.sameTierSongs[t].length > 0).map(
              (tier) => (
                <span
                  key={tier}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-gray-700"
                  style={{ backgroundColor: `${TIER_COLORS[tier]}30` }}
                >
                  <span
                    className="inline-flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold"
                    style={{ backgroundColor: TIER_COLORS[tier] }}
                  >
                    {tier}
                  </span>
                  {result.sameTierSongs[tier].length}
                </span>
              )
            )}
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs text-gray-500 bg-gray-100">
              {result.sameTierTotal} total
            </span>
          </div>

          {/* Expandable detail */}
          {result.sameTierTotal > sharedSTier.length && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
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
                {expanded ? "Hide details" : "Show all songs"}
              </button>
              {expanded && (
                <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
                  {TIERS.filter(
                    (t) => t !== "S" && result.sameTierSongs[t].length > 0
                  ).map((tier) => (
                    <div key={tier}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <TierBadge tier={tier} />
                        <span className="text-xs text-gray-500">
                          {result.sameTierSongs[tier].length} song
                          {result.sameTierSongs[tier].length !== 1 && "s"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {result.sameTierSongs[tier].map((song) => (
                          <SongTag key={song.id} song={song} tier={tier} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SongCard({ song }: { song: Song }) {
  const album = ALBUMS.find((a) => a.name === song.album);
  const albumColor = album?.color ?? "#888";
  const albumImage = album?.image;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/60 px-3 py-2.5 border border-gray-100">
      {albumImage ? (
        <img
          src={albumImage}
          alt={song.album}
          className="h-9 w-9 rounded-md object-cover flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
          }}
        />
      ) : null}
      <div
        className={`h-9 w-9 rounded-md flex-shrink-0 ${albumImage ? "hidden" : ""}`}
        style={{ backgroundColor: albumColor + "40" }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{song.title}</p>
        <p className="text-[11px] text-gray-400 truncate">{song.album}</p>
      </div>
      <span
        className="inline-flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold text-gray-800 flex-shrink-0"
        style={{ backgroundColor: TIER_COLORS.S }}
      >
        S
      </span>
    </div>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-gray-800"
      style={{ backgroundColor: TIER_COLORS[tier] }}
    >
      {tier}
    </span>
  );
}

function SongTag({ song, tier }: { song: Song; tier: Tier }) {
  const albumColor =
    ALBUMS.find((a) => a.name === song.album)?.color ?? "#888";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md border border-gray-100 px-2 py-0.5 text-xs"
      style={{ backgroundColor: `${TIER_COLORS[tier]}15` }}
    >
      <span
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{ backgroundColor: albumColor }}
      />
      {song.title}
    </span>
  );
}
