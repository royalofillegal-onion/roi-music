import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, Music2, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteCloudSong,
  fetchAdminCloudSongs,
  parseSongEditorForm,
  saveCloudSong,
  setCloudSongPublished,
  type CatalogSong,
  type SongEditorForm,
} from "@/lib/cloudSongCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = { onClose: () => void };

const emptyForm: SongEditorForm = {
  title: "", artist: "", album: "", duration: "", releaseDate: "", genre: "", language: "",
  audioUrl: "", imageUrl: "", lyrics: "", tags: "",
};

function formForSong(song: CatalogSong): SongEditorForm {
  return {
    title: song.title,
    artist: song.artist,
    album: song.album ?? "",
    duration: String(song.duration || ""),
    releaseDate: song.releaseDate ?? "",
    genre: song.genre ?? "",
    language: song.language ?? "",
    audioUrl: song.audioUrl,
    imageUrl: song.imageUrl,
    lyrics: song.lyrics ?? "",
    tags: song.tags?.join(", ") ?? "",
  };
}

const inputClass = "border-border bg-background text-foreground placeholder:text-muted-foreground";

export function AdminCatalogView({ onClose }: Props) {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [songs, setSongs] = useState<CatalogSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SongEditorForm>(emptyForm);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAdminCloudSongs();
      setSongs(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load the catalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    void supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setAuthorized(false);
        setLoading(false);
        toast.error("Unable to verify administrator access");
        return;
      }
      setAuthorized(data === true);
    });
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (authorized === true) void load();
  }, [authorized, load]);

  const filteredSongs = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return songs;
    return songs.filter((song) => `${song.title} ${song.artist} ${song.album ?? ""}`.toLowerCase().includes(term));
  }, [query, songs]);

  const resetEditor = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveSong = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return toast.error("Sign in with an administrator account first");
    const parsed = parseSongEditorForm(form);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      toast.error(issue?.message ?? "Check the song details");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveCloudSong(editingId, parsed.data, user.id, editingId ? songs.find((song) => song.id === editingId)?.isPublished ?? false : true);
      setSongs((current) => editingId ? current.map((song) => song.id === saved.id ? saved : song) : [saved, ...current]);
      resetEditor();
      toast.success(editingId ? "Song details updated" : "Song added to the catalog");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the song");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (song: CatalogSong) => {
    try {
      await setCloudSongPublished(song.id, !song.isPublished);
      setSongs((current) => current.map((item) => item.id === song.id ? { ...item, isPublished: !song.isPublished } : item));
      toast.success(song.isPublished ? "Song unpublished" : "Song published" );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update song visibility");
    }
  };

  const removeSong = async (song: CatalogSong) => {
    if (!window.confirm(`Delete “${song.title}” from the catalog? This cannot be undone.`)) return;
    try {
      await deleteCloudSong(song.id);
      setSongs((current) => current.filter((item) => item.id !== song.id));
      if (editingId === song.id) resetEditor();
      toast.success("Song deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the song");
    }
  };

  if (!user || authorized === false) {
    return (
      <main className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-background px-5 py-10 text-foreground">
        <section className="w-full max-w-md border-y border-border py-8 text-center">
          <Button variant="ghost" size="icon" aria-label="Close catalog" onClick={onClose} className="absolute right-5 top-5"><X /></Button>
          <Music2 className="mx-auto h-9 w-9 text-primary" />
          <h1 className="mt-4 text-xl font-bold">Administrator access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">{user ? "This account is not assigned the administrator role." : "Sign in with an administrator account to manage music."}</p>
          <Button variant="outline" className="mt-6" onClick={onClose}>Back to music</Button>
        </section>
      </main>
    );
  }

  if (authorized === null) {
    return <main className="fixed inset-0 z-[70] grid place-items-center bg-background text-foreground"><LoaderCircle className="h-7 w-7 animate-spin text-primary" aria-label="Verifying access" /></main>;
  }

  const setField = (field: keyof SongEditorForm, value: string) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <main className="fixed inset-0 z-[70] overflow-y-auto bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-5 pb-16 pt-5 sm:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="outline" size="icon" aria-label="Back" onClick={onClose}><ArrowLeft /></Button>
            <div className="min-w-0"><p className="text-xs font-semibold uppercase text-primary">ROI Music · Studio</p><h1 className="truncate text-xl font-bold">Music catalog</h1></div>
          </div>
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><Check className="h-4 w-4 text-primary" /> Administrator verified</span>
        </header>

        <form onSubmit={saveSong} className="mt-6 border-b border-border pb-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div><h2 className="flex items-center gap-2 text-base font-bold"><Plus className="h-4 w-4 text-primary" />{editingId ? "Edit song" : "Add a song"}</h2><p className="mt-1 text-xs text-muted-foreground">Add valid HTTPS links for MP3 audio and artwork.</p></div>
            {editingId && <Button type="button" variant="ghost" size="icon" aria-label="Cancel editing" onClick={resetEditor}><X /></Button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input required maxLength={180} className={inputClass} placeholder="Song title" value={form.title} onChange={(event) => setField("title", event.target.value)} />
            <Input required maxLength={180} className={inputClass} placeholder="Artist" value={form.artist} onChange={(event) => setField("artist", event.target.value)} />
            <Input maxLength={180} className={inputClass} placeholder="Album (optional)" value={form.album} onChange={(event) => setField("album", event.target.value)} />
            <Input required type="number" min="1" max="86400" step="1" className={inputClass} placeholder="Duration in seconds" value={form.duration} onChange={(event) => setField("duration", event.target.value)} />
            <Input type="date" className={inputClass} aria-label="Release date" value={form.releaseDate} onChange={(event) => setField("releaseDate", event.target.value)} />
            <Input maxLength={80} className={inputClass} placeholder="Genre" value={form.genre} onChange={(event) => setField("genre", event.target.value)} />
            <Input maxLength={80} className={inputClass} placeholder="Language" value={form.language} onChange={(event) => setField("language", event.target.value)} />
            <Input required type="url" className={inputClass} placeholder="Audio URL (HTTPS .mp3)" value={form.audioUrl} onChange={(event) => setField("audioUrl", event.target.value)} />
            <Input required type="url" className={inputClass} placeholder="Artwork URL (HTTPS)" value={form.imageUrl} onChange={(event) => setField("imageUrl", event.target.value)} />
            <Input maxLength={500} className={`${inputClass} sm:col-span-2`} placeholder="Tags, separated by commas" value={form.tags} onChange={(event) => setField("tags", event.target.value)} />
            <Textarea maxLength={20000} className={`${inputClass} sm:col-span-2`} placeholder="Lyrics (optional)" value={form.lyrics} onChange={(event) => setField("lyrics", event.target.value)} />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? <LoaderCircle className="animate-spin" /> : editingId ? <Check /> : <Upload />}
              {saving ? "Saving…" : editingId ? "Save changes" : "Add song"}
            </Button>
            <p className="text-xs text-muted-foreground">New songs are published immediately.</p>
          </div>
        </form>

        <section className="mt-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-base font-bold">Catalog <span className="ml-1 text-xs font-normal text-muted-foreground">{songs.length}</span></h2><p className="mt-1 text-xs text-muted-foreground">Manage songs, visibility, and details.</p></div>
            <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={loading}><LoaderCircle className={loading ? "animate-spin" : "hidden"} /> Refresh</Button>
          </div>
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-2"><Search className="h-4 w-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a song or artist" aria-label="Find a song or artist" className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0" /></div>
          {loading ? <div className="flex justify-center py-12 text-muted-foreground"><LoaderCircle className="h-5 w-5 animate-spin" /></div> : filteredSongs.length ? (
            <ul className="divide-y divide-border">
              {filteredSongs.map((song) => (
                <li key={song.id} className="flex min-w-0 flex-wrap items-center gap-3 py-3">
                  <img src={song.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-md bg-muted object-cover" />
                  <div className="min-w-0 flex-1 basis-[140px]"><p className="truncate text-sm font-semibold">{song.title}</p><p className="truncate text-xs text-muted-foreground">{song.artist} · {song.album || "Single"}</p></div>
                  <span className="text-xs text-muted-foreground">{song.isPublished ? "Published" : "Unpublished"}</span>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => void togglePublished(song)}>{song.isPublished ? "Unpublish" : "Publish"}</Button>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${song.title}`} onClick={() => { setEditingId(song.id); setForm(formForSong(song)); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil /></Button>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Delete ${song.title}`} onClick={() => void removeSong(song)}><Trash2 /></Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <div className="py-12 text-center text-sm text-muted-foreground"><Music2 className="mx-auto mb-2 h-6 w-6" />{songs.length ? "No matching songs." : "No songs yet. Add the first song above."}</div>}
        </section>
      </div>
    </main>
  );
}