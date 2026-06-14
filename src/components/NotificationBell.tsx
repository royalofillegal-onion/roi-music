import { useState } from "react";
import { Bell, X, ExternalLink } from "lucide-react";
import { useBroadcasts } from "@/hooks/useBroadcasts";
import { cn } from "@/lib/utils";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - +new Date(iso)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export function NotificationBell() {
  const { items, unreadCount, markAllRead, dismiss } = useBroadcasts();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen(o => {
      const nv = !o;
      if (nv) markAllRead();
      return nv;
    });
  };

  return (
    <>
      <button
        aria-label="Notifications"
        onClick={toggle}
        className="relative grid h-11 w-11 place-items-center rounded-full bg-white/8 backdrop-blur border border-white/10 hover:bg-white/15 transition"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 grid place-items-center rounded-full bg-fuchsia-500 text-[10px] font-bold text-white border-2 border-[#0a0418]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute right-4 top-20 w-[min(380px,calc(100vw-32px))] max-h-[70vh] overflow-hidden rounded-2xl border border-white/10 bg-[#1a0d33] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h3 className="font-semibold">Notifications</h3>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-2">
              {items.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-white/55">No notifications</p>
              ) : (
                <ul className="space-y-1.5">
                  {items.map(b => (
                    <li key={b.id} className={cn(
                      "group relative rounded-xl p-3 border transition",
                      b.read ? "bg-white/5 border-white/5" : "bg-fuchsia-500/10 border-fuchsia-400/30"
                    )}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold truncate">{b.title}</h4>
                          <p className="mt-1 text-xs text-white/75 whitespace-pre-wrap break-words">{b.body}</p>
                          {b.link && (
                            <a href={b.link} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-fuchsia-300 hover:text-fuchsia-200">
                              Open <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          <p className="mt-1.5 text-[10px] text-white/40">{timeAgo(b.created_at)} · expires in {Math.max(0, Math.ceil((+new Date(b.expires_at) - Date.now()) / 3600000))}h</p>
                        </div>
                        <button onClick={() => dismiss(b.id)} className="opacity-50 hover:opacity-100 transition grid h-6 w-6 place-items-center rounded-full hover:bg-white/10 shrink-0" aria-label="Dismiss">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
