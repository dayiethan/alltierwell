/* eslint-disable @next/next/no-img-element */

"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface ComparisonEntry {
  otherUser: {
    id: string;
    display_name: string;
    username: string;
    avatar_url: string | null;
  };
  compatibilityScore: number;
  comparedAt: string;
}

interface ComparisonLogRow {
  user1_id: string;
  user2_id: string;
  compatibility_score: number;
  compared_at: string;
}

interface ComparisonProfileRow {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
}

export default function ComparisonLeaderboard({
  myUserId,
  myUsername,
}: {
  myUserId: string;
  myUsername: string;
}) {
  const [entries, setEntries] = useState<ComparisonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchComparisons = async () => {
      const { data: comparisons } = await supabase
        .from("comparison_log")
        .select("user1_id, user2_id, compatibility_score, compared_at")
        .or(`user1_id.eq.${myUserId},user2_id.eq.${myUserId}`)
        .order("compatibility_score", { ascending: false });

      if (!comparisons || comparisons.length === 0) {
        setLoading(false);
        return;
      }

      const typedComparisons = comparisons as ComparisonLogRow[];

      const otherIds = typedComparisons.map((c) =>
        c.user1_id === myUserId ? c.user2_id : c.user1_id
      );

      const { data: profiles } = await supabase
        .from("users")
        .select("id, display_name, username, avatar_url")
        .in("id", otherIds);

      const typedProfiles = (profiles ?? []) as ComparisonProfileRow[];
      const profileMap = new Map(typedProfiles.map((p) => [p.id, p]));

      const mapped = typedComparisons
        .map((c) => {
          const otherId =
            c.user1_id === myUserId ? c.user2_id : c.user1_id;
          const otherUser = profileMap.get(otherId);
          if (!otherUser) return null;
          return {
            otherUser,
            compatibilityScore: c.compatibility_score,
            comparedAt: c.compared_at,
          };
        })
        .filter(Boolean) as ComparisonEntry[];

      setEntries(mapped);
      setLoading(false);
    };

    fetchComparisons();
  }, [supabase, myUserId]);

  if (loading) {
    return (
      <div className="mt-10 text-center text-sm text-muted-foreground">
        Loading your comparisons...
      </div>
    );
  }

  if (entries.length === 0) return null;

  const RANK_STYLES: Record<number, string> = {
    0: "text-yellow-500",
    1: "text-zinc-400",
    2: "text-amber-700",
  };

  return (
    <div className="mt-10 w-full max-w-md space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold">Your Comparisons</h2>
        <p className="text-xs text-muted-foreground">
          Ranked by compatibility
        </p>
      </div>

      <div className="space-y-2">
        {entries.map((entry, i) => {
          const scoreHue = Math.round(
            (entry.compatibilityScore / 100) * 120
          );
          return (
            <Link
              key={entry.otherUser.id}
              href={`/compare/${myUsername}/${entry.otherUser.username}`}
              className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted transition-colors"
            >
              <span
                className={`text-sm font-bold w-6 text-right ${RANK_STYLES[i] ?? "text-muted-foreground"}`}
              >
                #{i + 1}
              </span>
              {entry.otherUser.avatar_url ? (
                <img
                  src={entry.otherUser.avatar_url}
                  alt={entry.otherUser.display_name}
                  className="h-8 w-8 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {entry.otherUser.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {entry.otherUser.display_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{entry.otherUser.username}
                </p>
              </div>
              <span
                className="text-lg font-bold"
                style={{ color: `hsl(${scoreHue}, 75%, 45%)` }}
              >
                {entry.compatibilityScore}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
