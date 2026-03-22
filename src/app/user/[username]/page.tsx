import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { computeStats } from "@/lib/stats";
import type { TierEntry, UserProfile } from "@/lib/types";
import { normalizeSongs } from "@/lib/types";
import ProfileStats from "@/components/ProfileStats";
import TierListDisplay from "@/components/TierListDisplay";
import ProfileActions from "./ProfileActions";
import ProfileTheme from "./ProfileTheme";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("display_name, username")
    .eq("username", username)
    .single();

  if (!profile) {
    return { title: "User not found — All Tier Well" };
  }

  return {
    title: `${profile.display_name} (@${profile.username}) — All Tier Well`,
    description: `Check out ${profile.display_name}'s Taylor Swift tier list on All Tier Well.`,
    openGraph: {
      images: [
        {
          url: `/api/og/profile?username=${encodeURIComponent(profile.username)}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const typedProfile = profile as UserProfile;

  const [songsRes, entriesRes, authRes] = await Promise.all([
    supabase
      .from("songs")
      .select("*")
      .order("album_order")
      .order("track_number"),
    supabase.from("tier_entries").select("*").eq("user_id", typedProfile.id),
    supabase.auth.getUser(),
  ]);

  const songs = normalizeSongs(songsRes.data ?? []);
  const entries = (entriesRes.data ?? []) as TierEntry[];
  const currentUser = authRes.data.user;
  const isOwner = currentUser?.id === typedProfile.id;

  const stats = computeStats(entries, songs);

  // Log profile view (fire-and-forget)
  if (currentUser?.id !== typedProfile.id) {
    supabase.from("user_events").insert({
      event_type: "profile_view",
      actor_id: currentUser?.id ?? null,
      target_user_id: typedProfile.id,
    });
  }

  return (
    <div className="py-8">
      <ProfileTheme themeEra={typedProfile.theme_era} />
      {/* Profile header */}
      <div className="flex items-start gap-4">
        {typedProfile.avatar_url && (
          <img
            src={typedProfile.avatar_url}
            alt={typedProfile.display_name}
            className="h-16 w-16 rounded-full"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{typedProfile.display_name}</h1>
          <p className="text-sm text-muted-foreground">@{typedProfile.username}</p>
        </div>
        <ProfileActions
          username={typedProfile.username}
          isOwner={isOwner}
          currentUserId={currentUser?.id}
          targetUserId={typedProfile.id}
        />
      </div>

      {/* Stats */}
      <div className="mt-6">
        <ProfileStats stats={stats} />
      </div>

      {/* Tier list */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Tier List
        </h2>
        {entries.length > 0 ? (
          <TierListDisplay entries={entries} songs={songs} />
        ) : (
          <p className="py-8 text-center text-muted-foreground/60">
            No songs ranked yet.
          </p>
        )}
      </div>
    </div>
  );
}
