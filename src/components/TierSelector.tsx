"use client";

import type { Song, Tier } from "@/lib/types";
import { TIERS, TIER_COLORS } from "@/lib/constants";
import { useEffect, useRef } from "react";

interface TierSelectorProps {
  song: Song;
  currentTier?: Tier;
  onSelect: (tier: Tier) => void;
  onUnrank: () => void;
  onClose: () => void;
}

export default function TierSelector({
  song,
  currentTier,
  onSelect,
  onUnrank,
  onClose,
}: TierSelectorProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 md:items-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-t-xl bg-white p-5 shadow-xl md:rounded-xl">
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">Assign tier for</p>
          <p className="mt-1 font-semibold">{song.title}</p>
          <p className="text-xs text-gray-400">{song.album}</p>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => onSelect(tier)}
              className={`flex h-12 items-center justify-center rounded-lg text-lg font-bold text-gray-800 transition-transform hover:scale-105 ${
                currentTier === tier
                  ? "ring-2 ring-gray-800 ring-offset-2"
                  : ""
              }`}
              style={{ backgroundColor: TIER_COLORS[tier] }}
            >
              {tier}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {currentTier && (
            <button
              onClick={onUnrank}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Remove from tier list
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
