import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { computeComparison } from "@/lib/comparison";
import type { Song, TierEntry, UserProfile } from "@/lib/types";
import ComparisonCard from "@/components/ComparisonCard";
import Link from "next/link";

interface Props {
  params: Promise<{ username1: string; username2: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username1, username2 } = await params;
  return {
    title: `@${username1} vs @${username2} — All Tier Well`,
    description: `Compare Taylor Swift tier lists between @${username1} and @${username2}.`,
  };
}

export default async function ComparisonPage({ params }: Props) {
  const { username1, username2 } = await params;
  const supabase = await createClient();

  const [profile1Res, profile2Res] = await Promise.all([
    supabase.from("users").select("*").eq("username", username1).single(),
    supabase.from("users").select("*").eq("username", username2).single(),
  ]);

  if (!profile1Res.data || !profile2Res.data) {
    notFound();
  }

  const user1 = profile1Res.data as UserProfile;
  const user2 = profile2Res.data as UserProfile;

  const [songsRes, entries1Res, entries2Res] = await Promise.all([
    supabase
      .from("songs")
      .select("*")
      .order("album_order")
      .order("track_number"),
    supabase.from("tier_entries").select("*").eq("user_id", user1.id),
    supabase.from("tier_entries").select("*").eq("user_id", user2.id),
  ]);

  const songs = (songsRes.data ?? []) as Song[];
  const entries1 = (entries1Res.data ?? []) as TierEntry[];
  const entries2 = (entries2Res.data ?? []) as TierEntry[];

  const result = computeComparison(entries1, entries2, songs);

  return (
    <div className="py-8">
      {/* User badges header */}
      <div className="mb-8 flex items-center justify-center gap-3 sm:gap-5">
        <UserBadge profile={user1} />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
          <span className="text-sm font-bold text-gray-400">vs</span>
        </div>
        <UserBadge profile={user2} />
      </div>

      <ComparisonCard
        result={result}
        user1Name={user1.display_name}
        user2Name={user2.display_name}
      />
    </div>
  );
}

function UserBadge({ profile }: { profile: UserProfile }) {
  return (
    <Link
      href={`/user/${profile.username}`}
      className="flex items-center gap-2.5 rounded-xl border border-gray-200 px-4 py-2.5 hover:bg-gray-50 transition-colors"
    >
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          className="h-9 w-9 rounded-full ring-2 ring-gray-100"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-500">
          {profile.display_name.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <p className="text-sm font-semibold">{profile.display_name}</p>
        <p className="text-xs text-gray-500">@{profile.username}</p>
      </div>
    </Link>
  );
}
