// Admin-only dashboard: stats, top songs/artists, live activity, broadcast composer.
import { useEffect, useState } from "react";
import { ArrowLeft, Send, RefreshCcw, Users, Activity, PlayCircle, Heart, Megaphone, X } from "lucide-react";
import { getToken, invokeFn, useSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Stats {
  total_users: number; active_24h: number; active_7d: number;
  total_plays: number; total_likes: number;
  top_songs: { song_id: string; title: string; artist: string; plays: number }[];
  top_artists: { artist: string; plays: number }[];
  signups_per_day: { date: string; count: number }[];
  recent_users: { id: string; app_id: string; created_at: string; last_seen_at: string }[];
  now_playing: { user_id: string; song_id: string; title: string; artist: string; played_at: string }[];
}

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const { isAdmin, loading: authLoading } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Broadcast composer
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [sending, setSending] = useState(false);

  const refresh = async () => {
    setLoading(true); setErr(null);
    try {
      const data = await invokeFn<Stats>("admin-stats", { token: getToken() });
      setStats(data);
    } catch (e: any) { setErr(e?.message ?? "Failed to load stats"); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isAdmin) refresh(); }, [isAdmin]);

  // Live "now playing" via Realtime on play_events would require RLS-readable rows;
  // we keep it polled (every 20s) instead since play_events is service-role only.
  useEffect(() => {
    if (!isAdmin) return;
    const i = setInterval(refresh, 20_000);
    return () => clearInterval(i);
  }, [isAdmin]);

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSending(true);
    try {
      await invokeFn("admin-broadcast", {
        token: getToken(), title: title.trim(), body: body.trim(),
        link: link.trim() || undefined,
      });
      toast.success("Broadcast sent to all users");
      setTitle(""); setBody(""); setLink("");
    } catch (e: any) { toast.error(e?.message ?? "Failed to send"); }
    finally { setSending(false); }
  };

  if (authLoading) {
    return <div className="fixed inset-0 grid place-items-center bg-[#0a0418] text-white/60">Loading…</div>;
  }
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0a0418] text-white grid place-items-center px-6">
        <div className="text-center max-w-sm">
          <div className="grid h-14 w-14 place-items-center mx-auto rounded-2xl bg-red-500/15 border border-red-400/30 mb-3">
            <X className="h-7 w-7 text-red-300" />
          </div>
          <h2 className="text-xl font-bold">Admin only</h2>
          <p className="mt-2 text-sm text-white/60">This dashboard is only accessible to the Roi Music admin account.</p>
          <button onClick={onClose} className="mt-5 rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/15">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0418] text-white">
      <header className="sticky top-0 z-10 flex items-center gap-3 px-5 py-4 bg-[#0a0418]/95 backdrop-blur border-b border-white/10">
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></button>
        <h1 className="text-lg font-bold flex-1">Admin Dashboard</h1>
        <button onClick={refresh} disabled={loading} className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10 disabled:opacity-40">
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      <div className="px-5 py-6 max-w-4xl mx-auto space-y-8">
        {err && <p className="rounded-lg bg-red-500/15 border border-red-400/30 px-3 py-2 text-sm text-red-200">{err}</p>}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Users className="h-4 w-4" />} label="Total users" value={stats?.total_users ?? "—"} />
          <StatCard icon={<Activity className="h-4 w-4 text-green-400" />} label="Active 24h" value={stats?.active_24h ?? "—"} />
          <StatCard icon={<Activity className="h-4 w-4 text-fuchsia-300" />} label="Active 7d" value={stats?.active_7d ?? "—"} />
          <StatCard icon={<PlayCircle className="h-4 w-4 text-purple-300" />} label="Total plays" value={stats?.total_plays ?? "—"} />
        </div>

        {/* Broadcast composer */}
        <section className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-4">
          <h2 className="flex items-center gap-2 font-semibold mb-3"><Megaphone className="h-4 w-4" /> Send a broadcast</h2>
          <form onSubmit={sendBroadcast} className="space-y-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (e.g. New update available)" maxLength={120}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-fuchsia-400/60" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" rows={3} maxLength={1000}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-fuchsia-400/60" />
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Optional link (https://…)"
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm outline-none focus:border-fuchsia-400/60" />
            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-white/55">All users will receive this. Auto-expires in 24 hours.</p>
              <button type="submit" disabled={sending || !title || !body}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 px-4 py-2 text-sm font-semibold disabled:opacity-50">
                <Send className="h-4 w-4" /> {sending ? "Sending…" : "Send to all"}
              </button>
            </div>
          </form>
        </section>

        {/* Lists */}
        <div className="grid md:grid-cols-2 gap-4">
          <ListCard title="Top songs (7d)" rows={(stats?.top_songs ?? []).map(s => ({ key: s.song_id, primary: s.title, secondary: s.artist, badge: `${s.plays} plays` }))} />
          <ListCard title="Top artists (7d)" rows={(stats?.top_artists ?? []).map(a => ({ key: a.artist, primary: a.artist, badge: `${a.plays} plays` }))} />
          <ListCard title={`Total likes: ${stats?.total_likes ?? "—"}`} rows={(stats?.recent_users ?? []).slice(0, 10).map(u => ({ key: u.id, primary: u.app_id, secondary: `seen ${new Date(u.last_seen_at).toLocaleString()}` }))} subtitle="Recent users" />
          <ListCard title="Now playing (recent)" rows={(stats?.now_playing ?? []).map(np => ({ key: np.user_id + np.played_at, primary: np.title, secondary: `${np.artist} · ${new Date(np.played_at).toLocaleTimeString()}` }))} />
        </div>

        {/* Signups chart */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold mb-3 text-white/80">Signups · last 14 days</h2>
          <Sparkline data={stats?.signups_per_day ?? []} />
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: any }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-white/55">{icon}{label}</div>
      <div className="mt-1.5 text-2xl font-bold">{value}</div>
    </div>
  );
}

function ListCard({ title, subtitle, rows }: { title: string; subtitle?: string; rows: { key: string; primary: string; secondary?: string; badge?: string }[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-sm font-semibold text-white/80">{subtitle ?? title}</h2>
      {subtitle && <p className="text-[11px] text-white/40 mt-0.5">{title}</p>}
      <ul className="mt-3 space-y-1.5">
        {rows.length === 0 && <li className="text-xs text-white/40">No data yet</li>}
        {rows.map(r => (
          <li key={r.key} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-white/5">
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">{r.primary}</p>
              {r.secondary && <p className="text-[11px] text-white/45 truncate">{r.secondary}</p>}
            </div>
            {r.badge && <span className="shrink-0 text-[11px] text-fuchsia-200">{r.badge}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Sparkline({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) return <p className="text-xs text-white/40">No data</p>;
  const max = Math.max(1, ...data.map(d => d.count));
  return (
    <div className="flex items-end gap-1 h-24">
      {data.map(d => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count}`}>
          <div className="w-full rounded-t bg-gradient-to-t from-fuchsia-500/30 to-fuchsia-400" style={{ height: `${(d.count / max) * 100}%`, minHeight: 2 }} />
          <span className="text-[9px] text-white/40">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
}
