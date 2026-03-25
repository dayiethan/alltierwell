/* eslint-disable @next/next/no-img-element */

"use client";

import type { ComparisonResult, Tier } from "@/lib/types";
import { TIER_COLORS } from "@/lib/constants";

interface AlbumAlignmentProps {
  result: ComparisonResult;
  user1Name: string;
  user2Name: string;
}

function tierGrade(avg: number): Tier {
  if (avg < 0.5) return "S";
  if (avg < 1.5) return "A";
  if (avg < 2.5) return "B";
  if (avg < 3.5) return "C";
  if (avg < 4.5) return "D";
  return "F";
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

function SpotlightCard({
  entry,
  user1Name,
  user2Name,
  type,
}: {
  entry: ComparisonResult["albumAlignment"][number];
  user1Name: string;
  user2Name: string;
  type: "best" | "worst";
}) {
  const user1Grade = tierGrade(entry.user1AvgTier);
  const user2Grade = tierGrade(entry.user2AvgTier);
  const gap = Math.abs(entry.user1AvgTier - entry.user2AvgTier);
  const sameGrade = user1Grade === user2Grade;

  let subtitle: string;
  if (sameGrade) {
    subtitle = `You both average ${user1Grade}-tier`;
  } else {
    const higher =
      entry.user1AvgTier < entry.user2AvgTier ? user1Name : user2Name;
    const tierDiff = Math.round(gap);
    subtitle = `${higher} rates it ${tierDiff} tier${tierDiff !== 1 ? "s" : ""} higher`;
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border p-4"
      style={{
        background: `linear-gradient(135deg, ${entry.albumColor}12 0%, transparent 70%)`,
      }}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-widest ${
          type === "best" ? "text-green-600" : "text-red-400"
        }`}
      >
        {type === "best" ? "Most Aligned" : "Most Divided"}
      </p>

      <div className="mt-2 flex items-center gap-3">
        {entry.albumImage && (
          <img
            src={entry.albumImage}
            alt={entry.album}
            className="h-12 w-12 rounded-lg object-cover shadow-sm"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        )}
        <div>
          <p className="text-sm font-bold">{entry.album}</p>
          <p className="text-xl font-bold">{entry.score}%</p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
            {user1Name}
          </span>
          <TierBadge tier={user1Grade} />
        </div>
        <span className="text-muted-foreground/30 text-xs">vs</span>
        <div className="flex items-center gap-1">
          <TierBadge tier={user2Grade} />
          <span className="text-[10px] text-muted-foreground truncate max-w-[70px]">
            {user2Name}
          </span>
        </div>
      </div>

      <p className="mt-1 text-[10px] text-muted-foreground/60">
        {subtitle} &middot; {entry.sharedCount} shared song
        {entry.sharedCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default function AlbumAlignment({
  result,
  user1Name,
  user2Name,
}: AlbumAlignmentProps) {
  if (result.albumAlignment.length === 0) return null;

  const sorted = result.albumAlignment;
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const showSpotlights = sorted.length > 1 && best.score !== worst.score;

  const perfectCount = sorted.filter((a) => a.score === 100).length;
  const battleCount = sorted.filter((a) => a.score < 50).length;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Album Alignment
      </h3>

      <div className="space-y-4">
        {/* Spotlight cards */}
        {showSpotlights && (
          <div className="grid gap-3 sm:grid-cols-2">
            <SpotlightCard
              entry={best}
              user1Name={user1Name}
              user2Name={user2Name}
              type="best"
            />
            <SpotlightCard
              entry={worst}
              user1Name={user1Name}
              user2Name={user2Name}
              type="worst"
            />
          </div>
        )}

        {/* Summary stats */}
        {(perfectCount > 0 || battleCount > 0) && (
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {perfectCount > 0 && (
              <span>
                <span className="font-semibold text-green-600">
                  {perfectCount}
                </span>{" "}
                perfect alignment{perfectCount !== 1 ? "s" : ""}
              </span>
            )}
            {battleCount > 0 && (
              <span>
                <span className="font-semibold text-red-400">
                  {battleCount}
                </span>{" "}
                battleground{battleCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* All albums bar chart */}
        <div className="rounded-xl border border-border p-4 space-y-2.5">
          {sorted.map((a) => (
            <div key={a.album} className="flex items-center gap-2.5">
              {a.albumImage ? (
                <img
                  src={a.albumImage}
                  alt={a.album}
                  className="h-7 w-7 rounded object-cover flex-shrink-0"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    el.nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}
              <span
                className={`h-7 w-7 rounded flex-shrink-0 ${a.albumImage ? "hidden" : ""}`}
                style={{ backgroundColor: a.albumColor + "30" }}
              />
              <span className="w-20 text-xs font-medium text-muted-foreground truncate flex-shrink-0">
                {a.album}
              </span>
              <div className="flex-1 h-3.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max(a.score, 2)}%`,
                    backgroundColor: a.albumColor,
                    opacity: 0.75,
                  }}
                />
              </div>
              <span className="w-9 text-right text-xs font-medium text-muted-foreground flex-shrink-0">
                {a.score}%
              </span>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <TierBadge tier={tierGrade(a.user1AvgTier)} />
                <span className="text-[10px] text-muted-foreground/30">
                  /
                </span>
                <TierBadge tier={tierGrade(a.user2AvgTier)} />
              </div>
            </div>
          ))}

          {/* Legend for tier badges */}
          <div className="flex items-center justify-end pt-1 text-[10px] text-muted-foreground/40">
            avg tier: {user1Name} / {user2Name}
          </div>
        </div>
      </div>
    </div>
  );
}
