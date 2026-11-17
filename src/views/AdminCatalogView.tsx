import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, Music2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { Song } from "@/data/Song";
import { useAuth } from "@/context/AuthContext";
import { adminRequest } from "@/lib/mongoCatalog";

type Props = { onClose: () => void };

export function AdminCatalogView({ onClose }: Props) {
  const { user } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [audio, setAudio] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [form, setForm] = useState({ title: "", artist: "", album: "", duration: "", year: "", genre: "", language: "" });

  const load = useCallback(async () => {
    try {
      const result = await adminRequest<{ data: Song[] }>("/api/admin/songs");
      setSongs(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load catalog");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const createSong = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!audio || !cover) return toast.error("Choose an MP3 and a cover image");
    const formElement = event.currentTarget;
    setSaving(true);
    try {
      const uploadBody = new FormData();
      uploadBody.append("audio", audio);
      uploadBody.append("cover", cover);
      const media = await adminRequest<{ data: { audioUrl: string; imageUrl: string } }>("/api/admin/uploads", { method: "POST", body: uploadBody });
      const data = await adminRequest<{ data: Song }>("/api/admin/songs", {
        method: "POST",
        body: JSON.stringify({
          title: form.title, artist: form.artist, album: form.album || undefined,
          duration: Number(form.duration), year: form.year ? Number(form.year) : undefined,
          genre: form.genre || undefined, language: form.language || undefined,
          ...media.data, isPublished: true,
        }),
      });
      setSongs((current) => [data.data, ...current]);
      setForm({ title: "", artist: "", album: "", duration: "", year: "", genre: "", language: "" });
      setAudio(null); setCover(null);
      if (formElement instanceof HTMLFormElement) formElement.reset();
      toast.success("Song uploaded and published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Song upload failed");
    } finally { setSaving(false); }
  };

  const togglePublished = async (song: Song) => {
    if (song.isPublished === undefined) return toast.error("Song publication status is unavailable");
    try {
      const result = await adminRequest<{ data: Song }>(`/api/admin/songs/${encodeURIComponent(song.id)}`, {
        method: "PATCH", body: JSON.stringify({ isPublished: !song.isPublished }),
      });
      setSongs((current) => current.map((item) => item.id === song.id ? result.data : item));
      toast.success(result.data.isPublished ? "Song published" : "Song unpublished");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Update failed"); }
  };

  const removeSong = async (song: Song) => {
    if (!window.confirm(`Delete “${song.title}” from MongoDB?`)) return;
    try {
      await adminRequest(`/api/admin/songs/${encodeURIComponent(song.id)}`, { method: "DELETE" });
      setSongs((current) => current.filter((item) => item.id !== song.id));
      toast.success("Song deleted");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Delete failed"); }
  };

  if (!user) return <main className="min-h-dvh bg-[#08090a] p-8 text-white">Please sign in with an admin account, then reopen Admin catalog.</main>;

  const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-amber-400/60";
  return (
    <main className="fixed inset-0 z-[70] overflow-y-auto bg-[#08090a] px-5 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-4xl pb-12">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <button onClick={onClose} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full border border-white/10"><ArrowLeft size={18} /></button>
            <div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-amber-300">Secure studio</p><h1 className="mt-1 text-xl font-semibold">Music catalog</h1></div>
          </div>
          <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-[11px] text-amber-200">Admin verified by API</span>
        </header>

        <form onSubmit={createSong} className="mt-6 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-7">
          <h2 className="flex items-center gap-2 text-base font-semibold"><Plus size={18} className="text-amber-300" /> Add a song</h2>
          <p className="mt-1 text-xs text-zinc-500">Media is uploaded to server-managed storage credentials; MongoDB stores metadata and media URLs.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input required maxLength={180} className={inputClass} placeholder="Song title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input required maxLength={180} className={inputClass} placeholder="Artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} />
            <input className={inputClass} placeholder="Album" value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} />
            <input required type="number" min="1" step="1" className={inputClass} placeholder="Duration (seconds)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <input type="number" min="1800" max="2200" className={inputClass} placeholder="Release year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            <input className={inputClass} placeholder="Genre" value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
            <input className={inputClass} placeholder="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 px-3 py-2.5 text-xs text-zinc-400"><Upload size={16} className="text-amber-300" /><span className="min-w-0 flex-1 truncate">{audio?.name || "Select MP3 (max 30 MB)"}</span><input required type="file" accept="audio/mpeg,.mp3" className="sr-only" onChange={(e) => setAudio(e.target.files?.[0] || null)} /></label>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 px-3 py-2.5 text-xs text-zinc-400"><Upload size={16} className="text-amber-300" /><span className="min-w-0 flex-1 truncate">{cover?.name || "Select cover image"}</span><input required type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => setCover(e.target.files?.[0] || null)} /></label>
          </div>
          <button disabled={saving} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 py-3 text-sm font-bold text-zinc-950 disabled:opacity-60 sm:w-auto sm:px-6">{saving ? <LoaderCircle className="animate-spin" size={17} /> : <Upload size={16} />} Upload and publish</button>
        </form>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold">Catalog <span className="ml-1 text-xs text-zinc-500">{songs.length}</span></h2><button onClick={() => { setLoading(true); void load(); }} className="text-xs text-amber-300">Refresh</button></div>
          {loading ? <div className="flex justify-center py-10 text-zinc-500"><LoaderCircle className="animate-spin" /></div> : songs.length ? <ul className="divide-y divide-white/[0.07] rounded-2xl border border-white/[0.08] px-4">
            {songs.map((song) => <li key={song.id} className="flex items-center gap-3 py-3"><img src={song.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{song.title}</p><p className="truncate text-xs text-zinc-500">{song.artist} · {song.album || "Single"}</p></div><span className={`hidden rounded-full px-2 py-1 text-[10px] sm:block ${song.isPublished === false ? "bg-white/5 text-zinc-500" : "bg-emerald-400/10 text-emerald-300"}`}>{song.isPublished === false ? "Unpublished" : "Published"}</span><button onClick={() => void togglePublished(song)} className="rounded-lg border border-white/10 px-2.5 py-2 text-[11px] text-zinc-300">{song.isPublished === false ? "Publish" : "Unpublish"}</button><button onClick={() => void removeSong(song)} aria-label={`Delete ${song.title}`} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 hover:bg-red-500/10 hover:text-red-300"><X size={15} /></button></li>)}
          </ul> : <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-zinc-500"><Music2 className="mx-auto mb-2" />No MongoDB songs yet</div>}
        </section>
      </div>
    </main>
  );
}