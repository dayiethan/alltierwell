"use client";

import type { SaveStatus } from "@/hooks/useAutoSave";

interface ProgressBarProps {
  ranked: number;
  total: number;
  saveStatus: SaveStatus;
}

export default function ProgressBar({
  ranked,
  total,
  saveStatus,
}: ProgressBarProps) {
  const pct = total > 0 ? Math.round((ranked / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {ranked} / {total} songs ranked
          </span>
          <span className="text-gray-400">{pct}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gray-800 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className="flex-shrink-0 text-xs text-gray-400">
        {saveStatus === "saving" && "Saving..."}
        {saveStatus === "saved" && "Saved"}
        {saveStatus === "error" && "Save failed"}
      </span>
    </div>
  );
}
