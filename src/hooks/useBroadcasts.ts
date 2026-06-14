// Stores active broadcast notifications locally with a 24h client-side
// expiry, and subscribes to Realtime inserts so new admin messages arrive
// instantly. Each notification disappears 24h after its `created_at`.
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  link: string | null;
  created_at: string;
  expires_at: string;
  read?: boolean;
}

const KEY = "roi_notifications";

function load(): Broadcast[] {
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Broadcast[];
    const now = Date.now();
    return arr.filter(b => new Date(b.expires_at).getTime() > now);
  } catch { return []; }
}
function save(items: Broadcast[]) { localStorage.setItem(KEY, JSON.stringify(items)); }

export function useBroadcasts() {
  const [items, setItems] = useState<Broadcast[]>(() => load());

  const merge = useCallback((incoming: Broadcast[]) => {
    setItems(prev => {
      const map = new Map(prev.map(b => [b.id, b]));
      for (const b of incoming) {
        const existing = map.get(b.id);
        map.set(b.id, { ...b, read: existing?.read ?? false });
      }
      const merged = [...map.values()]
        .filter(b => new Date(b.expires_at).getTime() > Date.now())
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      save(merged);
      return merged;
    });
  }, []);

  // Initial fetch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("broadcasts")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (!cancelled && data) merge(data as Broadcast[]);
    })();
    return () => { cancelled = true; };
  }, [merge]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("broadcasts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "broadcasts" }, (payload) => {
        merge([payload.new as Broadcast]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [merge]);

  // Periodic prune
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const fresh = prev.filter(b => new Date(b.expires_at).getTime() > Date.now());
        if (fresh.length !== prev.length) save(fresh);
        return fresh;
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = useCallback(() => {
    setItems(prev => {
      const next = prev.map(b => ({ ...b, read: true }));
      save(next); return next;
    });
  }, []);
  const dismiss = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(b => b.id !== id);
      save(next); return next;
    });
  }, []);

  const unreadCount = items.filter(b => !b.read).length;
  return { items, unreadCount, markAllRead, dismiss };
}
