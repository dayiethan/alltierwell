"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ComparisonLeaderboard from "@/components/comparison/ComparisonLeaderboard";

export default function ComparePage() {
  const supabase = createClient();
  const router = useRouter();
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [otherUsername, setOtherUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

      if (profile) {
        setMyUserId(user.id);
        setMyUsername(profile.username);
      }
      setLoading(false);
    };
    load();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Allow pasting profile URLs
    let target = otherUsername.trim().toLowerCase();
    const urlMatch = target.match(/\/user\/([a-z0-9_]+)/);
    if (urlMatch) target = urlMatch[1];
    target = target.replace(/^@/, "");

    if (!target) return;

    if (target === myUsername) {
      setError("That's your own profile!");
      return;
    }

    // Check if user exists
    const { data } = await supabase
      .from("users")
      .select("username")
      .eq("username", target)
      .single();

    if (!data) {
      setError("User not found.");
      return;
    }

    router.push(`/compare/${myUsername}/${target}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-start pt-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Compare Tier Lists</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a username or paste a profile URL to see how your taste
            compares.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              @
            </span>
            <input
              type="text"
              value={otherUsername}
              onChange={(e) => {
                setOtherUsername(e.target.value);
                setError(null);
              }}
              placeholder="username or profile URL"
              className="w-full rounded-md border border-border bg-card py-2.5 pl-8 pr-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Compare
          </button>
        </form>

        {myUserId && myUsername && (
          <ComparisonLeaderboard myUserId={myUserId} myUsername={myUsername} />
        )}
      </div>
    </div>
  );
}
