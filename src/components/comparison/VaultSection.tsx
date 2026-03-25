/* eslint-disable @next/next/no-img-element */

"use client";

import type { ComparisonResult, Tier } from "@/lib/types";
import { TIER_COLORS, getSongImage, getSongAlbumColor } from "@/lib/constants";
import { useState } from "react";

interface VaultSectionProps {
  result: ComparisonResult;
  user1Name: string;
  user2Name: string;
}

export default function VaultSection({
  result,
  user1Name,
  user2Name,
}: VaultSectionProps) {
  const [showDeepCuts, setShowDeepCuts] = useState(false);
  const { vaultVerdict, deepCutSoulmates } = result;

  const hasVaultData =
    vaultVerdict.user1VaultCount > 0 || vaultVerdict.user2VaultCount > 0;
  const hasDeepCuts = deepCutSoulmates.length > 0;

  if (!hasVaultData && !hasDeepCuts) return null;

  return (
    <div className="space-y-5">
      {/* Vault Track Verdict */}
      {hasVaultData && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Vault Track Verdict
          </h3>
          <div className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-center gap-8">
              <VaultStat
                name={user1Name}
                count={vaultVerdict.user1VaultCount}
              />
              {vaultVerdict.sharedVaultCount > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {vaultVerdict.vaultCompatibility}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    vault compatibility
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {vaultVerdict.sharedVaultCount} shared
                  </p>
                </div>
              )}
              <VaultStat
                name={user2Name}
                count={vaultVerdict.user2VaultCount}
              />
            </div>

            {vaultVerdict.sharedVaultSameTier.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-[11px] font-medium text-muted-foreground mb-2">
                  Vault tracks you agree on
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {vaultVerdict.sharedVaultSameTier.map(({ song, tier }) => {
                    const songImage = getSongImage(song);
                    const albumColor = getSongAlbumColor(song);
                    return (
                      <span
                        key={song.id}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs"
                        style={{
                          backgroundColor: `${TIER_COLORS[tier]}15`,
                        }}
                      >
                        {songImage ? (
                          <img
                            src={songImage}
                            alt=""
                            className="h-3.5 w-3.5 rounded-sm object-cover"
                          />
                        ) : (
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: albumColor,
                            }}
                          />
                        )}
                        {song.title}
                        <TierBadge tier={tier} />
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deep Cut Soulmates */}
      {hasDeepCuts && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Deep Cut Soulmates
          </h3>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground mb-3">
              You agree on {deepCutSoulmates.length} deep cut
              {deepCutSoulmates.length !== 1 && "s"} & vault track
              {deepCutSoulmates.length !== 1 && "s"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {deepCutSoulmates
                .slice(0, showDeepCuts ? undefined : 8)
                .map(({ song, tier }) => {
                  const songImage = getSongImage(song);
                  const albumColor = getSongAlbumColor(song);
                  return (
                    <span
                      key={song.id}
                      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs"
                      style={{
                        backgroundColor: `${TIER_COLORS[tier]}15`,
                      }}
                    >
                      {songImage ? (
                        <img
                          src={songImage}
                          alt=""
                          className="h-3.5 w-3.5 rounded-sm object-cover"
                        />
                      ) : (
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: albumColor,
                          }}
                        />
                      )}
                      {song.title}
                      <TierBadge tier={tier} />
                    </span>
                  );
                })}
            </div>
            {deepCutSoulmates.length > 8 && (
              <button
                onClick={() => setShowDeepCuts(!showDeepCuts)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                <svg
                  className={`h-3 w-3 transition-transform ${showDeepCuts ? "rotate-90" : ""}`}
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
                {showDeepCuts
                  ? "Show less"
                  : `${deepCutSoulmates.length - 8} more`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function VaultStat({ name, count }: { name: string; count: number }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground truncate max-w-[100px]">
        {name}
      </p>
      <p className="text-lg font-bold mt-0.5">{count}</p>
      <p className="text-[10px] text-muted-foreground/60">vault tracks</p>
    </div>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded text-[8px] font-bold text-gray-800 ml-0.5"
      style={{ backgroundColor: TIER_COLORS[tier] }}
    >
      {tier}
    </span>
  );
}
