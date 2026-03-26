/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

interface DiscoverableUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  last_active_at: string | null;
  rankedCount: number;
}

interface UserRow {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  last_active_at: string | null;
}

function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim().replace(/^@/, "").toLowerCase();
}

function getMatchRank(user: UserRow, query: string): number {
  const username = user.username.toLowerCase();
  const displayName = user.display_name.toLowerCase();

  if (username === query) return 0;
  if (displayName === query) return 1;
  if (username.startsWith(query)) return 2;
  if (displayName.startsWith(query)) return 3;
  if (username.includes(query)) return 4;
  if (displayName.includes(query)) return 5;
  return 6;
}

async function getRankedCounts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userIds: string[]
): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const { data } = await supabase
    .from("tier_entries")
    .select("user_id")
    .in("user_id", userIds);

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as { user_id: string }[]) {
    counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
  }

  return counts;
}

function attachCounts(users: UserRow[], rankedCounts: Map<string, number>): DiscoverableUser[] {
  return users.map((user) => ({
    ...user,
    rankedCount: rankedCounts.get(user.id) ?? 0,
  }));
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = normalizeQuery(q);
  const supabase = await createClient();

  let searchResults: DiscoverableUser[] = [];
  let recentlyActive: DiscoverableUser[] = [];
  let newSwifties: DiscoverableUser[] = [];
  let mostCompleted: DiscoverableUser[] = [];

  if (query) {
    const { data } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url, created_at, last_active_at")
      .eq("is_public", true)
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(40);

    const matchedUsers = (data ?? []) as UserRow[];
    const rankedCounts = await getRankedCounts(
      supabase,
      matchedUsers.map((user) => user.id)
    );

    searchResults = attachCounts(matchedUsers, rankedCounts)
      .sort((a, b) => {
        const rankDiff = getMatchRank(a, query) - getMatchRank(b, query);
        if (rankDiff !== 0) return rankDiff;
        return a.username.localeCompare(b.username);
      })
      .slice(0, 20);
  } else {
    const { data } = await supabase
      .from("users")
      .select("id, username, display_name, avatar_url, created_at, last_active_at")
      .eq("is_public", true);

    const publicUsers = (data ?? []) as UserRow[];
    const rankedCounts = await getRankedCounts(
      supabase,
      publicUsers.map((user) => user.id)
    );

    const usersWithCounts = attachCounts(publicUsers, rankedCounts);

    recentlyActive = usersWithCounts
      .filter((user) => user.last_active_at !== null)
      .sort((a, b) => {
        return (
          new Date(b.last_active_at ?? 0).getTime() -
          new Date(a.last_active_at ?? 0).getTime()
        );
      })
      .slice(0, 6);

    newSwifties = [...usersWithCounts]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 6);

    mostCompleted = [...usersWithCounts]
      .sort((a, b) => b.rankedCount - a.rankedCount || a.username.localeCompare(b.username))
      .slice(0, 6);
  }

  const showingSearch = query.length > 0;

  return (
    <div className="py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {showingSearch ? "Search Swifties" : "Discover Swifties"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search public profiles or browse active and completed tier lists.
          </p>
        </div>

        <form action="/search" method="get" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by username or display name..."
            className="flex-1 rounded-md border border-border bg-card px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            autoFocus
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Search
          </button>
          {showingSearch && (
            <Link
              href="/search"
              className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Clear
            </Link>
          )}
        </form>

        {showingSearch ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Search Results
              </h2>
              <p className="text-sm text-muted-foreground">
                {searchResults.length} public profile{searchResults.length === 1 ? "" : "s"}
              </p>
            </div>

            {searchResults.length === 0 ? (
              <p className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
                No public profiles found for that search.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {searchResults.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="space-y-8">
            <DiscoverySection
              title="Recently Active"
              description="Public profiles that have been active most recently."
              users={recentlyActive}
            />
            <DiscoverySection
              title="New Swifties"
              description="Recently created public profiles."
              users={newSwifties}
            />
            <DiscoverySection
              title="Most Completed"
              description="Public profiles with the most songs ranked."
              users={mostCompleted}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function DiscoverySection({
  title,
  description,
  users,
}: {
  title: string;
  description: string;
  users: DiscoverableUser[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {users.length === 0 ? (
        <p className="rounded-lg border border-border bg-card px-4 py-6 text-center text-sm text-muted-foreground">
          No public profiles to show yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </section>
  );
}

function UserCard({ user }: { user: DiscoverableUser }) {
  return (
    <Link
      href={`/user/${user.username}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted"
    >
      {user.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.display_name}
          className="h-10 w-10 rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
          {user.display_name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{user.display_name}</p>
        <p className="text-xs text-muted-foreground">@{user.username}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{user.rankedCount}</p>
        <p className="text-xs text-muted-foreground">ranked</p>
      </div>
    </Link>
  );
}
