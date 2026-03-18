"use client";

import { createClient } from "@/lib/supabase/client";
import type { Song, Tier } from "@/lib/types";
import { TIERS } from "@/lib/constants";
import { useAutoSave } from "@/hooks/useAutoSave";
import TierRow from "@/components/TierRow";
import SongPool from "@/components/SongPool";
import TierSelector from "@/components/TierSelector";
import ProgressBar from "@/components/ProgressBar";
import { useCallback, useEffect, useState } from "react";

export default function RankPage() {
  const supabase = createClient();
  const [songs, setSongs] = useState<Song[]>([]);
  const [tierMap, setTierMap] = useState<Map<string, Tier>>(new Map());
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  const { saveStatus, initializeLastSaved } = useAutoSave(tierMap, userId);

  // Load user, songs, and existing tier entries
  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [songsRes, entriesRes] = await Promise.all([
        supabase
          .from("songs")
          .select("*")
          .order("album_order")
          .order("track_number"),
        supabase.from("tier_entries").select("*").eq("user_id", user.id),
      ]);

      if (songsRes.data) {
        setSongs(songsRes.data as Song[]);
      }

      if (entriesRes.data) {
        const initial = new Map<string, Tier>();
        entriesRes.data.forEach((entry) => {
          initial.set(entry.song_id, entry.tier as Tier);
        });
        setTierMap(initial);
        initializeLastSaved(initial);
      }

      setLoading(false);
    };
    load();
  }, [supabase, initializeLastSaved]);

  const handleAssignTier = useCallback((songId: string, tier: Tier) => {
    setTierMap((prev) => {
      const next = new Map(prev);
      next.set(songId, tier);
      return next;
    });
    setSelectedSong(null);
  }, []);

  const handleUnrank = useCallback((songId: string) => {
    setTierMap((prev) => {
      const next = new Map(prev);
      next.delete(songId);
      return next;
    });
    setSelectedSong(null);
  }, []);

  const getSongsForTier = useCallback(
    (tier: Tier): Song[] => {
      return songs.filter((s) => tierMap.get(s.id) === tier);
    },
    [songs, tierMap]
  );

  const unrankedSongs = songs.filter((s) => !tierMap.has(s.id));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-400">Loading your tier list...</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Tier List</h1>
        <div className="mt-3">
          <ProgressBar
            ranked={tierMap.size}
            total={songs.length}
            saveStatus={saveStatus}
          />
        </div>
      </div>

      {/* Tier rows */}
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {TIERS.map((tier) => (
          <TierRow
            key={tier}
            tier={tier}
            songs={getSongsForTier(tier)}
            onSongClick={setSelectedSong}
          />
        ))}
      </div>

      {/* Unranked song pool */}
      <SongPool songs={unrankedSongs} onSongClick={setSelectedSong} />

      {/* Tier selector modal */}
      {selectedSong && (
        <TierSelector
          song={selectedSong}
          currentTier={tierMap.get(selectedSong.id)}
          onSelect={(tier) => handleAssignTier(selectedSong.id, tier)}
          onUnrank={() => handleUnrank(selectedSong.id)}
          onClose={() => setSelectedSong(null)}
        />
      )}
    </div>
  );
}
