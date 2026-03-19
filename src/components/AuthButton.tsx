"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("username")
          .eq("id", user.id)
          .single();
        if (profile) setUsername(profile.username);
      }

      setLoading(false);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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
