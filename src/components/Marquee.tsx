import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Auto-scrolling text like Spotify: if the text overflows its container,
 * it scrolls right-to-left continuously. Otherwise stays static.
 */
export function Marquee({
  text,
  className,
  speed = 30, // px per second
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);
  const [duration, setDuration] = useState(12);

  useEffect(() => {
    const wrap = wrapRef.current;
    const span = spanRef.current;
    if (!wrap || !span) return;
    const check = () => {
      const w = span.scrollWidth;
      const c = wrap.clientWidth;
      const over = w > c + 2;
      setOverflow(over);
      if (over) setDuration(Math.max(6, w / speed));
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(wrap);
    ro.observe(span);
    return () => ro.disconnect();
  }, [text, speed]);

  return (
    <div
      ref={wrapRef}
      className={cn("overflow-hidden whitespace-nowrap", className)}
    >
      <span
        ref={spanRef}
        className={cn("inline-block", overflow && "marquee-anim")}
        style={overflow ? ({ animationDuration: `${duration}s` } as any) : undefined}
      >
        {text}
        {overflow && (
          <span className="inline-block pl-12" aria-hidden="true">
            {text}
          </span>
        )}
      </span>
    </div>
  );
}
