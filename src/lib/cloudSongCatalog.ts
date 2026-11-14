import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { Song } from "@/data/Song";

const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

const isMp3Url = (value: string) => {
  try {
    return new URL(value).pathname.toLowerCase().endsWith(".mp3");
  } catch {
    return false;
  }
};

const validDate = (value: string) => {
  if (!value) return true;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};

export const songEditorSchema = z.object({
  title: z.string().trim().min(1, "Enter a song title").max(180),
  artist: z.string().trim().min(1, "Enter an artist").max(180),
  album: z.string().trim().max(180),
  duration: z.string().trim().refine((value) => /^\d+$/.test(value) && Number(value) > 0 && Number(value) <= 86400, "Duration must be between 1 and 86,400 seconds").transform(Number),
  releaseDate: z.string().trim().refine(validDate, "Enter a valid release date"),
  genre: z.string().trim().max(80),
  language: z.string().trim().max(80),
  audioUrl: z.string().trim().url("Enter a valid audio link").refine(isHttpsUrl, "Audio links must use HTTPS").refine(isMp3Url, "Audio links must point to an MP3"),
  imageUrl: z.string().trim().url("Enter a valid artwork link").refine(isHttpsUrl, "Artwork links must use HTTPS"),
  lyrics: z.string().max(20000, "Lyrics must be 20,000 characters or fewer"),
  tags: z.string().max(500, "Tags must be 500 characters or fewer"),
});

export type SongEditorForm = {
  title: string;
  artist: string;
  album: string;
  duration: string;
  releaseDate: string;
  genre: string;
  language: string;
  audioUrl: string;
  imageUrl: string;
  lyrics: string;
  tags: string;
};

export type SongEditorInput = {
  title: string;
  artist: string;
  album: string;
  duration: number;
  releaseDate: string | null;
  genre: string;
  language: string;
  audioUrl: string;
  imageUrl: string;
  lyrics: string | null;
  tags: string[];
};

export function parseSongEditorForm(value: SongEditorForm) {
  const result = songEditorSchema.safeParse(value);
  if (!result.success) return result;
  return {
    success: true as const,
    data: {
      ...result.data,
      album: result.data.album || "",
      releaseDate: result.data.releaseDate || null,
      genre: result.data.genre || "",
      language: result.data.language || "",
      lyrics: result.data.lyrics.trim() || null,
      tags: result.data.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    } satisfies SongEditorInput,
  };
}

type CatalogRow = {
  id: string;
  title: string;
  audio_url: string;
  cover_url: string | null;
  duration_seconds: number | null;
  genre: string | null;
  language: string | null;
  lyrics?: string | null;
  tags?: string[] | null;
  release_date: string | null;
  is_published: boolean;
  artists: { name: string } | null;
  albums: { title: string } | null;
};

export type CatalogSong = Song & {
  releaseDate?: string;
  lyrics?: string;
  tags?: string[];
};

function mapCatalogRow(row: CatalogRow): CatalogSong {
  return {
    id: row.id,
    title: row.title,
    artist: row.artists?.name || "Unknown artist",
    imageUrl: row.cover_url || "/roi-assets/default-song-cover.png",
    audioUrl: row.audio_url,
    duration: row.duration_seconds ?? 0,
    album: row.albums?.title || undefined,
    year: row.release_date ? Number(row.release_date.slice(0, 4)) : undefined,
    releaseDate: row.release_date || undefined,
    genre: row.genre || undefined,
    language: row.language || undefined,
    lyrics: row.lyrics || undefined,
    tags: row.tags || undefined,
    isPublished: row.is_published,
  };
}

const catalogSelect = "id,title,audio_url,cover_url,duration_seconds,genre,language,lyrics,tags,release_date,is_published,artists(name),albums(title)";

export async function fetchPublishedCloudSongs(): Promise<CatalogSong[]> {
  const { data, error } = await supabase
    .from("songs")
    .select(catalogSelect)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data || []) as unknown as CatalogRow[]).map(mapCatalogRow);
}

export async function fetchAdminCloudSongs(): Promise<CatalogSong[]> {
  const { data, error } = await supabase
    .from("songs")
    .select(catalogSelect)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data || []) as unknown as CatalogRow[]).map(mapCatalogRow);
}

async function findOrCreateArtist(name: string, genre: string, language: string, userId: string) {
  const { data: existing, error: findError } = await supabase
    .from("artists")
    .select("id")
    .eq("name", name)
    .limit(1)
    .maybeSingle();
  if (findError) throw new Error(findError.message);
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("artists")
    .insert({ name, genre: genre || null, language: language || null, created_by: userId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

async function findOrCreateAlbum(title: string, artistId: string, releaseDate: string | null) {
  if (!title) return null;
  const { data: existing, error: findError } = await supabase
    .from("albums")
    .select("id")
    .eq("title", title)
    .eq("artist_id", artistId)
    .limit(1)
    .maybeSingle();
  if (findError) throw new Error(findError.message);
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("albums")
    .insert({ title, artist_id: artistId, release_date: releaseDate })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function saveCloudSong(songId: string | null, input: SongEditorInput, userId: string, isPublished: boolean) {
  const artistId = await findOrCreateArtist(input.artist, input.genre, input.language, userId);
  const albumId = await findOrCreateAlbum(input.album, artistId, input.releaseDate);
  const values = {
    title: input.title,
    artist_id: artistId,
    album_id: albumId,
    audio_url: input.audioUrl,
    cover_url: input.imageUrl,
    duration_seconds: input.duration,
    genre: input.genre || null,
    language: input.language || null,
    lyrics: input.lyrics,
    tags: input.tags,
    release_date: input.releaseDate,
    is_published: isPublished,
    created_by: userId,
  };

  const query = songId
    ? supabase.from("songs").update(values).eq("id", songId)
    : supabase.from("songs").insert(values);
  const { data, error } = await query.select(catalogSelect).single();
  if (error) throw new Error(error.message);
  return mapCatalogRow(data as unknown as CatalogRow);
}

export async function setCloudSongPublished(songId: string, isPublished: boolean) {
  const { error } = await supabase.from("songs").update({ is_published: isPublished }).eq("id", songId);
  if (error) throw new Error(error.message);
}

export async function deleteCloudSong(songId: string) {
  const { error } = await supabase.from("songs").delete().eq("id", songId);
  if (error) throw new Error(error.message);
}