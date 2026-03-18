"use client";

import type { Song } from "@/lib/types";
import { ALBUMS, ALBUM_SHORT_NAMES } from "@/lib/constants";
import SongChip from "./SongChip";
import { useRef, useState } from "react";

interface SongPoolProps {
  songs: Song[];
  onSongClick: (song: Song) => void;
}

export default function SongPool({ songs, onSongClick }: SongPoolProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const filteredSongs = selectedAlbum
    ? songs.filter((s) => s.album === selectedAlbum)
    : songs;

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">
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
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          <p className="py-4 text-sm text-gray-400">
            {songs.length === 0
              ? "All songs ranked!"
              : "No unranked songs in this album."}
          </p>
        )}
      </div>
    </div>
  );
}
