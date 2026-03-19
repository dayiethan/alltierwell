"use client";

import type { Song } from "@/lib/types";
import { ALBUMS, ALBUM_SHORT_NAMES } from "@/lib/constants";
import SongChip from "./SongChip";
import { useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";

interface SongPoolProps {
  songs: Song[];
  onSongClick: (song: Song) => void;
}

export default function SongPool({ songs, onSongClick }: SongPoolProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const { themeDef } = useTheme();

  const filteredSongs = selectedAlbum
    ? songs.filter((s) => s.album === selectedAlbum)
    : songs;

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Unranked Songs ({songs.length})
      </h3>

      {/* Album filter tabs */}
      <div
        ref={tabsRef}
        className="mb-3 flex gap-1.5 overflow-x-auto pb-2 scrollbar-none"
      >
        <button
          onClick={() => setSelectedAlbum(null)}
          className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selectedAlbum === null
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-muted-foreground hover:bg-border"
          }`}
        >
          All
        </button>
        {ALBUMS.map((album) => {
          const count = songs.filter((s) => s.album === album.name).length;
          if (count === 0) return null;
          return (
            <button
              key={album.name}
              onClick={() => setSelectedAlbum(album.name)}
              className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedAlbum === album.name
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-border"
              }`}
            >
              {ALBUM_SHORT_NAMES[album.name] ?? album.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Songs */}
      <div className="flex flex-wrap gap-1.5">
        {filteredSongs.map((song) => (
          <SongChip
            key={song.id}
            song={song}
            onClick={() => onSongClick(song)}
          />
        ))}
        {filteredSongs.length === 0 && (
          <p className="py-4 text-sm text-muted-foreground italic">
            {songs.length === 0
              ? themeDef.emptyStates.allRanked
              : "No unranked songs in this album."}
          </p>
        )}
      </div>
    </div>
  );
}
