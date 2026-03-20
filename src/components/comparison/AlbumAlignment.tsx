"use client";

import type { ComparisonResult } from "@/lib/types";
import { ALBUMS } from "@/lib/constants";

interface AlbumAlignmentProps {
  result: ComparisonResult;
}

export default function AlbumAlignment({ result }: AlbumAlignmentProps) {
  if (result.albumAlignment.length === 0) return null;

  const best = result.albumAlignment[0];
  const worst = result.albumAlignment[result.albumAlignment.length - 1];
  const showLabels = result.albumAlignment.length > 1 && best.score !== worst.score;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Album Alignment
      </h3>
      <div className="rounded-xl border border-border p-4 space-y-3">
        {result.albumAlignment.map((a) => {
          const isBest = showLabels && a === best;
          const isWorst = showLabels && a === worst;
          const album = ALBUMS.find(
            (al) =>
              al.name === a.album ||
              a.album ===
                ({
                  "Taylor Swift": "Debut",
                  reputation: "reputation",
                  Lover: "Lover",
                  folklore: "folklore",
                  evermore: "evermore",
                  Midnights: "Midnights",
                  "The Tortured Poets Department": "TTPD",
                  "The Life of a Showgirl": "Showgirl",
                } as Record<string, string>)[al.name]
          );
          const albumImage = album?.image;

          return (
            <div key={a.album} className="flex items-center gap-3">
              {albumImage ? (
                <img
                  src={albumImage}
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
                className={`h-7 w-7 rounded flex-shrink-0 ${albumImage ? "hidden" : ""}`}
                style={{ backgroundColor: a.albumColor + "30" }}
              />
              <span className="w-20 text-xs font-medium text-muted-foreground truncate">
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
              <span className="w-20 text-right text-xs text-muted-foreground flex items-center justify-end gap-1.5">
                <span className="font-medium">{a.score}%</span>
                <span className="text-muted-foreground/60">({a.sharedCount})</span>
                {isBest && (
                  <span className="text-[8px] font-bold text-green-600 bg-green-50 px-1 rounded">
                    BEST
                  </span>
                )}
                {isWorst && (
                  <span className="text-[8px] font-bold text-red-400 bg-red-50 px-1 rounded">
                    WORST
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
