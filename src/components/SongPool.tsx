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
  const [searchQuery, setSearchQuery] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);
  const { themeDef } = useTheme();

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const albumFilteredSongs = selectedAlbum
    ? songs.filter((s) => s.album === selectedAlbum)
    : songs;

  const filteredSongs = normalizedQuery
    ? albumFilteredSongs.filter((song) => {
        const albumLabel = ALBUM_SHORT_NAMES[song.album] ?? song.album;
        return (
          song.title.toLowerCase().includes(normalizedQuery) ||
          song.album.toLowerCase().includes(normalizedQuery) ||
          albumLabel.toLowerCase().includes(normalizedQuery)
        );
      })
    : albumFilteredSongs;

  const showingFilteredResults =
    selectedAlbum !== null || normalizedQuery.length > 0;

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Unranked Songs
      </h3>
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {showingFilteredResults ? (
            <>
              Showing {filteredSongs.length} of {songs.length} unranked songs
            </>
          ) : (
            <>{songs.length} songs available to rank</>
          )}
        </p>

        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search songs or eras..."
            className="w-full rounded-md border border-border bg-card py-2 pl-3 pr-10 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
      </div>

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
              : normalizedQuery
                ? "No unranked songs match this search."
                : "No unranked songs in this album."}
          </p>
        )}
      </div>
    </div>
  );
}
