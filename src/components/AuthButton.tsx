"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

interface AuthButtonProps {
  user: User | null;
  loading: boolean;
}

export default function AuthButton({ user, loading }: AuthButtonProps) {
  const [username, setUsername] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setUsername(null);
      return;
    }

    const fetchUsername = async () => {
      const { data: profile } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();
      if (profile) setUsername(profile.username);
    };
    fetchUsername();
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
        {user.user_metadata?.avatar_url && username ? (
          <Link href={`/user/${username}`}>
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="h-7 w-7 rounded-full hover:ring-2 hover:ring-gray-300 transition-all"
              referrerPolicy="no-referrer"
            />
          </Link>
        ) : (
          <Link
            href={username ? `/user/${username}` : "/settings"}
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
