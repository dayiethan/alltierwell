"use client";

import { createClient } from "@/lib/supabase/client";
import type { Tier } from "@/lib/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSave(tierMap: Map<string, Tier>, userId: string | null) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const lastSavedRef = useRef<Map<string, Tier>>(new Map());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const supabase = createClient();

  const save = useCallback(async () => {
    if (!userId) return;

    const current = new Map(tierMap);
    const lastSaved = lastSavedRef.current;

    // Find upserts (new or changed)
    const upserts: { user_id: string; song_id: string; tier: Tier }[] = [];
    current.forEach((tier, songId) => {
      if (lastSaved.get(songId) !== tier) {
        upserts.push({ user_id: userId, song_id: songId, tier });
      }
    });

    // Find deletes (was ranked, now unranked)
    const deletes: string[] = [];
    lastSaved.forEach((_tier, songId) => {
      if (!current.has(songId)) {
        deletes.push(songId);
      }
    });

    if (upserts.length === 0 && deletes.length === 0) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");

    try {
      if (upserts.length > 0) {
        const { error } = await supabase
          .from("tier_entries")
          .upsert(upserts, { onConflict: "user_id,song_id" });
        if (error) throw error;
      }

      if (deletes.length > 0) {
        const { error } = await supabase
          .from("tier_entries")
          .delete()
          .eq("user_id", userId)
          .in("song_id", deletes);
        if (error) throw error;
      }

      lastSavedRef.current = new Map(current);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }, [tierMap, userId, supabase]);

  // Debounced auto-save
  useEffect(() => {
    if (!userId) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(save, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tierMap, save, userId]);

  // Initialize lastSaved from initial data
  const initializeLastSaved = useCallback((initial: Map<string, Tier>) => {
    lastSavedRef.current = new Map(initial);
  }, []);

  return { saveStatus, initializeLastSaved };
}
