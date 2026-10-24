import type { Song } from "@/data/Song";
import { supabase } from "@/integrations/supabase/client";

const API_URL = (import.meta.env.VITE_MUSIC_API_URL || "").replace(/\/$/, "");

export async function fetchMongoSongs(): Promise<Song[]> {
  if (!API_URL && !import.meta.env.DEV) return [];
  const response = await fetch(`${API_URL}/api/songs?limit=100`);
  if (!response.ok) throw new Error("MongoDB music catalog is unavailable");
  const result = await response.json() as { data?: Song[] };
  return Array.isArray(result.data) ? result.data : [];
}

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sign in with an administrator account first");
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...init.headers, Authorization: `Bearer ${token}` },
  });
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || "Admin request failed");
  return body as T;
}
