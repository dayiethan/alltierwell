"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";

interface UserResult {
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export default function SearchPage() {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);

    const searchTerm = trimmed.replace(/^@/, "").toLowerCase();

    const { data } = await supabase
      .from("users")
      .select("username, display_name, avatar_url")
      .or(
        `username.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`
      )
      .order("username")
      .limit(20);

    setResults((data as UserResult[]) ?? []);
    setLoading(false);
  };

  return (
    <div className="py-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Search Users</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Find Swifties by username or display name.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username or name..."
            className="flex-1 rounded-md border border-border bg-card py-2.5 px-4 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
          >
            Search
          </button>
        </form>

        {loading && (
          <p className="text-center text-sm text-muted-foreground">
            Searching...
          </p>
        )}

        {searched && !loading && results.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            No users found.
          </p>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((user) => (
              <Link
                key={user.username}
                href={`/user/${user.username}`}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-muted transition-colors"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.display_name}
                    className="h-9 w-9 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">{user.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
