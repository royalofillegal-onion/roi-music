import type { CustomPlaylist } from "@/data/customPlaylists";

/**
 * Encode/decode a playlist into a URL-safe token so anyone with the link
 * can view it — no backend required. The playlist name, cover, and songId
 * list are packed in; songs are resolved from the local catalog on load.
 */
function toBase64Url(str: string): string {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(hash: string): string {
  const b64 = hash.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  return decodeURIComponent(escape(atob(b64 + pad)));
}

export function encodePlaylist(p: CustomPlaylist): string {
  const payload = {
    i: p.id,
    n: p.name,
    c: p.cover,
    a: p.accent,
    d: p.description,
    s: p.songIds,
  };
  return toBase64Url(JSON.stringify(payload));
}

export function decodePlaylist(hash: string): CustomPlaylist | null {
  try {
    const raw = fromBase64Url(hash);
    const p = JSON.parse(raw);
    if (!p || !Array.isArray(p.s)) return null;
    return {
      id: p.i || "shared",
      name: p.n || "Shared Playlist",
      cover: p.c || "",
      accent: p.a || "from-fuchsia-500/70 to-indigo-900/40",
      description: p.d,
      songIds: p.s,
    };
  } catch {
    return null;
  }
}

export function buildPlaylistShareUrl(p: CustomPlaylist): string {
  return `${window.location.origin}/?pl=${encodePlaylist(p)}`;
}

export function getSharedPlaylistFromUrl(): CustomPlaylist | null {
  try {
    const url = new URL(window.location.href);
    const hash = url.searchParams.get("pl");
    if (!hash) return null;
    return decodePlaylist(hash);
  } catch {
    return null;
  }
}
