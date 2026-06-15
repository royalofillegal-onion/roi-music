import type { Song } from "./Song";
import { uniqueSongs } from "./allSongs";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover: string;
  songIds: string[];
}

// Pick a deterministic sample of songs for the starter playlist.
const sample = uniqueSongs.slice(0, 12);

export const playlists: Playlist[] = [
  {
    id: "starter-vibes",
    name: "Starter Vibes",
    description: "A handpicked sample mix to get you started.",
    cover:
      sample[0]?.imageUrl ||
      "https://res.cloudinary.com/dl8dmkhmv/image/upload/v1764332925/roimusic_efmjo9.png",
    songIds: sample.map((s) => s.id),
  },
];

export function getPlaylistSongs(playlist: Playlist): Song[] {
  const map = new Map(uniqueSongs.map((s) => [s.id, s]));
  return playlist.songIds.map((id) => map.get(id)).filter(Boolean) as Song[];
}
