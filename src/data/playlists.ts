import type { Song } from "./Song";
import { uniqueSongs } from "./allSongs";
import { newReleaseSongIds, getNewReleaseSongs } from "./NewReleaseSongs";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cover: string;
  covers: string[]; // up to 4 cover images for mosaic
  songIds: string[];
}

const DEFAULT_COVER =
  "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1764332925/roimusic_efmjo9.png";

/* -----------------------------------------------------------
 *  CURATED PLAYLISTS — explicit songIds (add/remove freely).
 *  IDs that don't exist in the catalog are silently ignored.
 * ----------------------------------------------------------- */
const CURATED: Array<Omit<Playlist, "cover" | "covers">> = [
  {
    id: "starter-vibes",
    name: "Starter Vibes",
    description: "A handpicked mix to get you started.",
    emoji: "✨",
    songIds: [
      "Ragile Ragile",
      "Monica Telugu",
      "Viral Vayyari",
      "rabbaru-gaajulu",
      "Night Changes",
      "rise-of-dragon",
    ],
  },
  {
    id: "new-releases",
    name: "New Releases",
    description: "The freshest drops, updated regularly.",
    emoji: "🆕",
    songIds: newReleaseSongIds,
  },
];

/* -----------------------------------------------------------
 *  AUTO PLAYLISTS — generated from tags on the catalog.
 * ----------------------------------------------------------- */
const LANGUAGE_PLAYLISTS: Array<{
  key: string;
  name: string;
  emoji: string;
  description: string;
}> = [
  { key: "telugu", name: "Telugu Hits", emoji: "🎬", description: "Top Telugu tracks." },
  { key: "hindi", name: "Hindi Hits", emoji: "🎶", description: "Bollywood on repeat." },
  { key: "tamil", name: "Tamil Hits", emoji: "🥁", description: "Kollywood favourites." },
  { key: "english", name: "English Hits", emoji: "🎤", description: "Global pop & more." },
  { key: "malayalam", name: "Malayalam Hits", emoji: "🌴", description: "Best of Mollywood." },
];

const MOOD_PLAYLISTS: Array<{
  key: string;
  name: string;
  emoji: string;
  description: string;
}> = [
  { key: "mass", name: "Mass Anthems", emoji: "🔥", description: "Full-volume energy." },
  { key: "romantic", name: "Romantic Moods", emoji: "❤️", description: "Slow it down." },
  { key: "sad", name: "Late Night Feels", emoji: "🌙", description: "For quiet hours." },
  { key: "flok", name: "Chill Flow", emoji: "🍃", description: "Easy listens." },
  { key: "rap", name: "Rap & Hype", emoji: "🎧", description: "Bars & beats." },
];

function pickCovers(songs: Song[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of songs) {
    if (s.imageUrl && !seen.has(s.imageUrl)) {
      seen.add(s.imageUrl);
      out.push(s.imageUrl);
      if (out.length === 4) break;
    }
  }
  return out;
}

function buildFromSongs(
  meta: { id: string; name: string; emoji: string; description: string },
  songs: Song[]
): Playlist {
  const covers = pickCovers(songs);
  return {
    id: meta.id,
    name: meta.name,
    emoji: meta.emoji,
    description: meta.description,
    cover: covers[0] || DEFAULT_COVER,
    covers,
    songIds: songs.map((s) => s.id),
  };
}

function buildCurated(): Playlist[] {
  const map = new Map(uniqueSongs.map((s) => [s.id, s]));
  return CURATED.map((p) => {
    const songs = p.songIds.map((id) => map.get(id)).filter(Boolean) as Song[];
    const covers = pickCovers(songs);
    return {
      ...p,
      cover: covers[0] || DEFAULT_COVER,
      covers,
    };
  }).filter((p) => p.songIds.length > 0);
}

function buildLanguagePlaylists(): Playlist[] {
  return LANGUAGE_PLAYLISTS.map((meta) => {
    const songs = (uniqueSongs as any[]).filter(
      (s) => (s.language || "").toLowerCase() === meta.key
    ) as Song[];
    return buildFromSongs({ id: `lang-${meta.key}`, ...meta }, songs);
  }).filter((p) => p.songIds.length >= 3);
}

function buildMoodPlaylists(): Playlist[] {
  return MOOD_PLAYLISTS.map((meta) => {
    const songs = (uniqueSongs as any[]).filter(
      (s) => (s.sync || "").toLowerCase() === meta.key
    ) as Song[];
    return buildFromSongs({ id: `mood-${meta.key}`, ...meta }, songs);
  }).filter((p) => p.songIds.length >= 3);
}

export const playlists: Playlist[] = [
  ...buildCurated(),
  ...buildLanguagePlaylists(),
  ...buildMoodPlaylists(),
];

export function getPlaylistSongs(playlist: Playlist): Song[] {
  const map = new Map(uniqueSongs.map((s) => [s.id, s]));
  return playlist.songIds.map((id) => map.get(id)).filter(Boolean) as Song[];
}
