/* eslint-disable @next/next/no-img-element */

"use client";

import type { ComparisonResult, Tier } from "@/lib/types";
import { TIER_COLORS, ALBUMS, getDisagreementLabel, getSongImage, getSongAlbumColor } from "@/lib/constants";
import { useState } from "react";

interface DisagreementsSectionProps {
  result: ComparisonResult;
  user1Name: string;
  user2Name: string;
}

export default function DisagreementsSection({
  result,
  user1Name,
  user2Name,
}: DisagreementsSectionProps) {
  const [showMore, setShowMore] = useState(false);
  const topDisagreement = result.biggestDisagreements[0];
  const remainingDisagreements = result.biggestDisagreements.slice(1);
  const { user1Loves, user2Loves } = result.loveHateSplits;
  const hasLoveHate = user1Loves.length > 0 || user2Loves.length > 0;

  if (!topDisagreement && !hasLoveHate) return null;

  return (
    <div className="space-y-5">
      {/* Biggest disagreement spotlight + remaining disagreements */}
      {topDisagreement && (() => {
        const albumColor = getSongAlbumColor(topDisagreement.song);
        const albumImage = getSongImage(topDisagreement.song);
        const label = getDisagreementLabel(topDisagreement.distance);

        return (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Biggest Disagreement
            </h3>
            <div
              className="relative overflow-hidden rounded-xl border border-border p-5"
              style={{
                background: `linear-gradient(135deg, ${albumColor}12 0%, transparent 70%)`,
              }}
            >
              {/* Spotlight */}
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-400">
                  {label}
                </p>

                <div className="mt-3 flex items-center justify-center gap-3">
                  {albumImage ? (
                    <img
                      src={albumImage}
                      alt={topDisagreement.song.album}
                      className="h-14 w-14 rounded-lg object-cover shadow-sm"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="h-14 w-14 rounded-lg shadow-sm"
                      style={{ backgroundColor: albumColor + "30" }}
                    />
                  )}
                  <div className="text-left">
                    <p className="text-lg font-bold leading-tight">
                      {topDisagreement.song.title}
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                      {topDisagreement.song.album}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-[11px] text-muted-foreground mb-1">{user1Name}</p>
                    <TierBadgeLarge tier={topDisagreement.user1Tier} />
                  </div>
                  <div className="flex flex-col items-center">
                    <svg
                      className="h-5 w-5 text-muted-foreground/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
                      />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] text-muted-foreground mb-1">{user2Name}</p>
                    <TierBadgeLarge tier={topDisagreement.user2Tier} />
                  </div>
                </div>
              </div>

              {/* Remaining disagreements (collapsed, inside the same card) */}
              {remainingDisagreements.length > 0 && (
                <div className="mt-5 border-t border-border/50 pt-4">
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex items-center gap-1 text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    <svg
                      className={`h-3 w-3 transition-transform ${showMore ? "rotate-90" : ""}`}
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
                    {showMore
                      ? "Hide other disagreements"
                      : `${remainingDisagreements.length} more disagreement${remainingDisagreements.length !== 1 ? "s" : ""}`}
                  </button>
                  {showMore && (
                    <div className="mt-2 space-y-1.5">
                      {remainingDisagreements.map((d) => (
                        <div
                          key={d.song.id}
                          className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                        >
                          <div className="min-w-0 mr-2">
                            <span className="text-sm font-medium">{d.song.title}</span>
                            <span className="ml-1.5 text-[10px] text-muted-foreground/60">
                              {d.song.album}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <TierBadge tier={d.user1Tier} />
                            <span className="text-[10px] text-muted-foreground/40">vs</span>
                            <TierBadge tier={d.user2Tier} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Love/hate splits */}
      {hasLoveHate && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            One Person&apos;s Treasure...
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {user1Loves.length > 0 && (
              <LoveHateList
                title={`${user1Name} loves, ${user2Name} doesn\u2019t`}
                items={user1Loves.map((l) => ({
                  title: l.song.title,
                  album: l.song.album,
                  loveTier: l.user1Tier,
                  hateTier: l.user2Tier,
                }))}
              />
            )}
            {user2Loves.length > 0 && (
              <LoveHateList
                title={`${user2Name} loves, ${user1Name} doesn\u2019t`}
                items={user2Loves.map((l) => ({
                  title: l.song.title,
                  album: l.song.album,
                  loveTier: l.user2Tier,
                  hateTier: l.user1Tier,
                }))}
              />
            )}
          </div>
        </div>
      )}
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

function TierBadgeLarge({ tier }: { tier: Tier }) {
  return (
    <span
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-gray-800 shadow-sm"
      style={{ backgroundColor: TIER_COLORS[tier] }}
    >
      {tier}
    </span>
  );
}

function LoveHateList({
  title,
  items,
}: {
  title: string;
  items: { title: string; album: string; loveTier: Tier; hateTier: Tier }[];
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs font-medium text-muted-foreground mb-3">{title}</p>
      <div className="space-y-2">
        {items.map((item) => {
          const albumColor =
            ALBUMS.find((a) => a.name === item.album)?.color ?? "#888";
          return (
            <div key={item.title} className="flex items-center gap-2">
              <span
                className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: albumColor }}
              />
              <span className="text-xs truncate flex-1">{item.title}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                <TierBadge tier={item.loveTier} />
                <span className="text-[10px] text-muted-foreground/40">/</span>
                <TierBadge tier={item.hateTier} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
