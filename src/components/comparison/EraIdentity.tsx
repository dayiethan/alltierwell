/* eslint-disable @next/next/no-img-element */

import type { ComparisonResult, EraScore } from "@/lib/types";

interface EraIdentityProps {
  result: ComparisonResult;
  user1Name: string;
  user2Name: string;
}

function tierLabel(avgTier: number): string {
  if (avgTier < 0.5) return "S";
  if (avgTier < 1.5) return "A";
  if (avgTier < 2.5) return "B";
  if (avgTier < 3.5) return "C";
  if (avgTier < 4.5) return "D";
  return "F";
}

export default function EraIdentity({
  result,
  user1Name,
  user2Name,
}: EraIdentityProps) {
  const { user1TopEras, user2TopEras } = result;

  if (user1TopEras.length === 0 && user2TopEras.length === 0) return null;

  // Find shared top eras (same album in both top 3)
  const sharedEras = user1TopEras.filter((e1) =>
    user2TopEras.some((e2) => e2.album === e1.album)
  );

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Era Identity
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        <EraList name={user1Name} eras={user1TopEras} />
        <EraList name={user2Name} eras={user2TopEras} />
      </div>
      {sharedEras.length > 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          You both love{" "}
          <span className="font-semibold">
            {sharedEras.map((e) => e.shortName).join(" & ")}
          </span>
        </p>
      )}
    </div>
  );
}

function EraList({ name, eras }: { name: string; eras: EraScore[] }) {
  if (eras.length === 0) {
    return (
      <div className="rounded-xl border border-border p-4 text-center">
        <p className="text-xs text-muted-foreground truncate">{name}</p>
        <p className="mt-2 text-xs text-muted-foreground/50">
          Not enough songs ranked
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-xs text-muted-foreground truncate mb-3">{name}</p>
      <div className="space-y-2">
        {eras.map((era, i) => (
          <div key={era.album} className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-muted-foreground/50 w-4">
              {i + 1}.
            </span>
            {era.albumImage ? (
              <img
                src={era.albumImage}
                alt={era.shortName}
                className="h-8 w-8 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="h-8 w-8 rounded flex-shrink-0"
                style={{ backgroundColor: era.albumColor + "30" }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{era.shortName}</p>
              <p className="text-[10px] text-muted-foreground">
                avg {tierLabel(era.avgTier)}-tier ({era.count} songs)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
