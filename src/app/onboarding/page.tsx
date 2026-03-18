"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Pre-fill from Google profile
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setDisplayName(user.user_metadata?.full_name ?? "");
        setAvatarUrl(user.user_metadata?.avatar_url ?? null);
      }
    };
    loadProfile();
  }, [supabase.auth]);

  // Debounced availability check
  const checkAvailability = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!USERNAME_REGEX.test(value)) {
        setAvailable(null);
        return;
      }

      setChecking(true);
      debounceRef.current = setTimeout(async () => {
        const { data } = await supabase
          .from("users")
          .select("username")
          .eq("username", value)
          .single();

        setAvailable(!data);
        setChecking(false);
      }, 400);
    },
    [supabase]
  );

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(value);
    setError(null);
    checkAvailability(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!USERNAME_REGEX.test(username) || !available) return;

    setSubmitting(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated. Please sign in again.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("users").insert({
      id: user.id,
      username,
      display_name: displayName || username,
      avatar_url: avatarUrl,
    });

    if (insertError) {
      if (insertError.code === "23505") {
        setError("Username is already taken.");
        setAvailable(false);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setSubmitting(false);
      return;
    }

    router.push("/rank");
  };

  const isValid = USERNAME_REGEX.test(username);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-xl border border-gray-200 bg-white p-8"
      >
        <div className="text-center">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Profile"
              className="mx-auto mb-4 h-16 w-16 rounded-full"
              referrerPolicy="no-referrer"
            />
          )}
          <h1 className="text-2xl font-bold">Choose your username</h1>
          <p className="mt-1 text-sm text-gray-500">
            This will be your public profile URL
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              maxLength={20}
              className="w-full rounded-md border border-gray-300 py-2 pl-8 pr-10 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              placeholder="swiftie_13"
              autoFocus
            />
            {username.length >= 3 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                {checking ? (
                  <span className="text-gray-400">...</span>
                ) : available ? (
                  <span className="text-green-600">Available</span>
                ) : available === false ? (
                  <span className="text-red-500">Taken</span>
                ) : null}
              </span>
            )}
          </div>
          {username.length > 0 && !isValid && (
            <p className="mt-1 text-xs text-gray-500">
              3-20 characters, lowercase letters, numbers, and underscores only
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={!isValid || !available || submitting}
          className="w-full rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Creating profile..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
