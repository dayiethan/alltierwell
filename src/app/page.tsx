"use client";

import { createClient } from "@/lib/supabase/client";
import { TIERS, TIER_COLORS } from "@/lib/constants";

export default function Home() {
  const supabase = createClient();

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="flex flex-col items-center py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        All Tier Well
      </h1>
      <p className="mt-4 max-w-md text-lg text-gray-600">
        Rank every Taylor Swift song. Share your taste. See how you compare.
      </p>

      <div className="mt-8 flex gap-2">
        {TIERS.map((tier) => (
          <span
            key={tier}
            className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-bold text-gray-800"
            style={{ backgroundColor: TIER_COLORS[tier] }}
          >
            {tier}
          </span>
        ))}
      </div>

      <button
        onClick={handleSignIn}
        className="mt-10 rounded-lg bg-foreground px-6 py-3 text-base font-semibold text-background hover:opacity-90"
      >
        Sign in with Google
      </button>

      <p className="mt-4 text-sm text-gray-400">
        Free to use. No spam. Just vibes.
      </p>
    </div>
  );
}
