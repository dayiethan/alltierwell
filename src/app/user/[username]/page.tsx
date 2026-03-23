import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { computeStats } from "@/lib/stats";
import type { TierEntry, UserProfile } from "@/lib/types";
import { normalizeSongs } from "@/lib/types";
import ProfileStats from "@/components/ProfileStats";
import TierListDisplay from "@/components/TierListDisplay";
import ProfileAlbumRankings from "@/components/ProfileAlbumRankings";
import ProfileActions from "./ProfileActions";
import ProfileTheme from "./ProfileTheme";
import Link from "next/link";

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
  const isPrivate = !typedProfile.is_public && !isOwner;

  const stats = computeStats(entries, songs);

  // Log profile view (fire-and-forget, authenticated users only)
  if (currentUser && currentUser.id !== typedProfile.id) {
    supabase.from("user_events").insert({
      event_type: "profile_view",
      actor_id: currentUser.id,
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
        {!isPrivate && (
          <ProfileActions
            username={typedProfile.username}
            isOwner={isOwner}
            currentUserId={currentUser?.id}
            targetUserId={typedProfile.id}
          />
        )}
      </div>

      {isPrivate ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold">This profile is private</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {typedProfile.display_name} has chosen to keep their tier list private.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="mt-6">
            <ProfileStats stats={stats} />
          </div>

          {/* Album rankings */}
          <div className="mt-6">
            <ProfileAlbumRankings entries={entries} songs={songs} />
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
        </>
      )}
    </div>
  );
}
