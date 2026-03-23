"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

interface AuthButtonProps {
  user: User | null;
  loading: boolean;
  onNavigate?: () => void;
}

export default function AuthButton({ user, loading, onNavigate }: AuthButtonProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setUsername(null);
      setAvatarUrl(null);
      return;
    }

    const fetchProfile = async () => {
      const { data: profile } = await supabase
        .from("users")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single();
      if (profile) {
        setUsername(profile.username);
        setAvatarUrl(profile.avatar_url);
      }
    };
    fetchProfile();
  }, [user, supabase]);

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (loading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center">
        {avatarUrl && username ? (
          <Link href={`/user/${username}`} onClick={onNavigate}>
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-7 w-7 rounded-full object-cover hover:ring-2 hover:ring-gray-300 transition-all"
              referrerPolicy="no-referrer"
            />
          </Link>
        ) : (
          <Link
            href={username ? `/user/${username}` : "/settings"}
            onClick={onNavigate}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground hover:ring-2 hover:ring-gray-300 transition-all"
          >
            {user.email?.charAt(0).toUpperCase() ?? "?"}
          </Link>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground hover:opacity-90"
    >
      Sign in with Google
    </button>
  );
}
