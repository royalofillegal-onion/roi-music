import type { Song } from "./Song";
import { uniqueSongs } from "./allSongs";

/**
 * Community / "Made for this moment" style playlists — pure JSON.
 * Each playlist holds only songIds; songs are resolved from the catalog.
 * Add / edit freely — unknown IDs are silently ignored.
 */
export interface CustomPlaylist {
  id: string;
  name: string;
  cover: string;
  accent: string; // gradient accent for the header card
  description?: string;
  songIds: string[];
}

const DEFAULT_COVER =
  "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1764332925/roimusic_efmjo9.png";

export const customPlaylists: CustomPlaylist[] = [
  {
    id: "moment-chill",
    name: "Chill Vibes",
    accent: "from-teal-500/70 to-teal-900/40",
    cover:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=60",
    description: "Laid-back tracks for slow moments.",
    songIds: [
      "Ragile Ragile",
      "Monica Telugu",
      "rabbaru-gaajulu",
      "Viral Vayyari",
    ],
  },
  {
    id: "moment-night",
    name: "Night Drive",
    accent: "from-fuchsia-500/70 to-indigo-900/40",
    cover:
      "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=400&q=60",
    description: "Neon-lit anthems for late roads.",
    songIds: [
      "rise-of-dragon",
      "Night Changes",
      "Monica Telugu",
      "Ragile Ragile",
    ],
  },
  {
    id: "moment-morning",
    name: "Morning Energy",
    accent: "from-amber-500/70 to-orange-900/40",
    cover:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=400&q=60",
    description: "Bright, uplifting starts to your day.",
    songIds: [
      "Viral Vayyari",
      "rabbaru-gaajulu",
      "Night Changes",
      "Ragile Ragile",
    ],
  },
];

export function resolveSongIds(ids: string[]): Song[] {
  const map = new Map(uniqueSongs.map((s) => [s.id, s]));
  const lowerMap = new Map(uniqueSongs.map((s) => [s.id.toLowerCase(), s]));
  return ids
    .map((id) => map.get(id) || lowerMap.get(id.toLowerCase()))
    .filter(Boolean) as Song[];
}

export function getCustomPlaylistSongs(p: CustomPlaylist): Song[] {
  return resolveSongIds(p.songIds);
}

export { DEFAULT_COVER as DEFAULT_PLAYLIST_COVER };
