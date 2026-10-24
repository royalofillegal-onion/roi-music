import { Home, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabKey = "home" | "search";

const TABS: { key: TabKey; label: string; Icon: typeof Home }[] = [
  { key: "home", label: "Home", Icon: Home },
  { key: "search", label: "Search", Icon: Search },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-black/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-[560px] items-stretch justify-around px-2">
        {TABS.map(({ key, label, Icon }) => {
          const on = key === active;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              aria-label={label}
              aria-current={on ? "page" : undefined}
              className="relative flex flex-1 flex-col items-center gap-1 py-2.5"
            >
              {on && (
                  <span className="absolute -top-px h-0.5 w-8 rounded-full bg-[#f4c327] shadow-[0_0_12px_rgba(244,195,39,0.45)]" />
              )}
              <Icon
                className={cn(
                  "h-5 w-5 transition",
                  on ? "text-[#f4c327]" : "text-zinc-500"
                )}
                strokeWidth={on ? 2.4 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide",
                  on ? "text-[#f4c327]" : "text-zinc-500"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
