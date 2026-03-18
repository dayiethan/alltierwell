import type { ComparisonResult, Song, Tier } from "@/lib/types";
import { TIERS, TIER_COLORS, ALBUMS } from "@/lib/constants";

interface ComparisonCardProps {
  result: ComparisonResult;
  user1Name: string;
  user2Name: string;
}

export default function ComparisonCard({
  result,
  user1Name,
  user2Name,
}: ComparisonCardProps) {
  if (result.sharedSongsCount === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-lg font-semibold text-gray-600">
          No shared ranked songs
        </p>
        <p className="mt-2 text-sm text-gray-400">
          These users haven&apos;t ranked any of the same songs yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Headline score */}
      <div className="rounded-xl border border-gray-200 p-6 text-center">
        <p className="text-5xl font-bold">{result.compatibilityScore}%</p>
        <p className="mt-2 text-sm text-gray-500">
          compatible across {result.sharedSongsCount} shared songs
        </p>
      </div>

      {/* Same tier songs */}
      <Section title="Same Tier">
        {TIERS.map((tier) => {
          const songs = result.sameTierSongs[tier];
          if (songs.length === 0) return null;
          return (
            <div key={tier} className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-gray-800"
                  style={{ backgroundColor: TIER_COLORS[tier] }}
                >
                  {tier}
                </span>
                <span className="text-xs text-gray-500">
                  {songs.length} song{songs.length !== 1 && "s"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {songs.map((song) => (
                  <SongTag key={song.id} song={song} tier={tier} />
                ))}
              </div>
            </div>
          );
        })}
      </Section>

      {/* Biggest disagreements */}
      {result.biggestDisagreements.length > 0 && (
        <Section title="Biggest Disagreements">
          <div className="space-y-2">
            {result.biggestDisagreements.map((d) => (
              <div
                key={d.song.id}
                className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2"
              >
                <span className="text-sm font-medium">{d.song.title}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">{user1Name}:</span>
                  <TierBadge tier={d.user1Tier} />
                  <span className="text-gray-300">vs</span>
                  <span className="text-gray-500">{user2Name}:</span>
                  <TierBadge tier={d.user2Tier} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Album alignment */}
      <Section title="Album Alignment">
        <div className="space-y-2">
          {result.albumAlignment.map((a) => (
            <div key={a.album} className="flex items-center gap-3">
              <span className="w-20 text-xs font-medium text-gray-600 truncate">
                {a.album}
              </span>
              <div className="flex-1 h-4 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gray-700 transition-all"
                  style={{ width: `${a.score}%` }}
                />
              </div>
              <span className="w-14 text-right text-xs text-gray-500">
                {a.score}% ({a.sharedCount})
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      {children}
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
  const albumColor = ALBUMS.find((a) => a.name === song.album)?.color ?? "#888";
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-gray-100 px-2 py-0.5 text-xs"
      style={{ backgroundColor: `${TIER_COLORS[tier]}15` }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: albumColor }}
      />
      {song.title}
    </span>
  );
}
