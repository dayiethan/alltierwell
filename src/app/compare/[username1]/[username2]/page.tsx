import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { computeComparison } from "@/lib/comparison";
import { computeArchetype } from "@/lib/stats";
import { computeCommunityConsensus } from "@/lib/consensus";
import type { TierEntry, UserProfile } from "@/lib/types";
import { normalizeSongs } from "@/lib/types";
import ComparisonCard from "@/components/ComparisonCard";
import ComparisonShareButton from "@/components/comparison/ComparisonShareButton";
import Link from "next/link";

interface Props {
  params: Promise<{ username1: string; username2: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username1, username2 } = await params;
  return {
    title: `@${username1} vs @${username2} — All Tier Well`,
    description: `Compare Taylor Swift tier lists between @${username1} and @${username2}.`,
    openGraph: {
      images: [
        {
          url: `/api/og/compare?u1=${encodeURIComponent(username1)}&u2=${encodeURIComponent(username2)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { username1, username2 } = await params;
  const supabase = await createClient();

  const [profile1Res, profile2Res, authRes] = await Promise.all([
    supabase.from("users").select("*").eq("username", username1).single(),
    supabase.from("users").select("*").eq("username", username2).single(),
    supabase.auth.getUser(),
  ]);

  if (!profile1Res.data || !profile2Res.data) {
    notFound();
  }

  const user1 = profile1Res.data as UserProfile;
  const user2 = profile2Res.data as UserProfile;
  const currentUser = authRes.data.user;

  const canViewUser1 = user1.is_public || currentUser?.id === user1.id;
  const canViewUser2 = user2.is_public || currentUser?.id === user2.id;

  if (!canViewUser1 || !canViewUser2) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Comparison unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          One or both of these tier lists are private, so this comparison
          can&apos;t be shown.
        </p>
      </div>
    );
  }

  const [songsRes, entries1Res, entries2Res, allEntriesRes] = await Promise.all([
    supabase
      .from("songs")
      .select("*")
      .order("album_order")
      .order("track_number"),
    supabase.from("tier_entries").select("*").eq("user_id", user1.id),
    supabase.from("tier_entries").select("*").eq("user_id", user2.id),
    supabase.from("tier_entries").select("song_id, tier"),
  ]);

  const songs = normalizeSongs(songsRes.data ?? []);
  const entries1 = (entries1Res.data ?? []) as TierEntry[];
  const entries2 = (entries2Res.data ?? []) as TierEntry[];
  const allEntries = (allEntriesRes.data ?? []) as { song_id: string; tier: string }[];

  const consensus = computeCommunityConsensus(allEntries);
  const result = computeComparison(entries1, entries2, songs, consensus);
  const user1Archetype = computeArchetype(entries1, songs);
  const user2Archetype = computeArchetype(entries2, songs);

  // Cache comparison score (don't block render, but log errors)
  // Normalize order: smaller UUID first to match CHECK constraint
  const [logId1, logId2] =
    user1.id < user2.id ? [user1.id, user2.id] : [user2.id, user1.id];
  supabase
    .from("comparison_log")
    .upsert(
      {
        user1_id: logId1,
        user2_id: logId2,
        compatibility_score: result.compatibilityScore,
        compared_at: new Date().toISOString(),
      },
      { onConflict: "user1_id,user2_id" }
    )
    .then(({ error }) => {
      if (error) console.error("comparison_log upsert failed:", error);
    });

  return (
    <div className="py-8">
      {/* User badges header */}
      <div className="mb-8 flex items-center justify-center gap-3 sm:gap-5">
        <UserBadge profile={user1} archetype={user1Archetype} />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <span className="text-sm font-bold text-muted-foreground">vs</span>
        </div>
        <UserBadge profile={user2} archetype={user2Archetype} />
      </div>

      <ComparisonCard
        result={result}
        user1Name={user1.display_name}
        user2Name={user2.display_name}
      />

      {/* Share button */}
      <div className="mt-6 flex justify-center">
        <ComparisonShareButton />
      </div>
    </div>
  );
}

function UserBadge({ profile, archetype }: { profile: UserProfile; archetype: string }) {
  return (
    <Link
      href={`/user/${profile.username}`}
      className="flex items-center gap-2.5 rounded-xl border border-border px-4 py-2.5 hover:bg-muted transition-colors"
    >
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          className="h-9 w-9 rounded-full ring-2 ring-border"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
          {profile.display_name.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold">{profile.display_name}</p>
        <p className="text-xs text-muted-foreground">@{profile.username}</p>
        <p className="text-xs text-accent">{archetype}</p>
      </div>
    </Link>
  );
}
