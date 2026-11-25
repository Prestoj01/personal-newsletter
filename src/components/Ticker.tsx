"use client";

import { useEffect, useState } from "react";
import { unpack, type TickerFile } from "@/lib/news-data";
import { getJson, loadSources } from "@/lib/sources";
import { loadPrefs } from "@/lib/storage";
import { beatsTicker, type TickerItem } from "@/lib/ticker";

/**
 * A wire-service band of headlines, scrolling endlessly. Readers with a paper see the latest
 * from their own beats; everyone else gets a mix of Tech, Sports, Entertainment and Science.
 */
export function Ticker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [personal, setPersonal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const prefs = loadPrefs();
      if (prefs) {
        const mine = await loadSources(prefs.topics.slice(0, 8))
          .then((s) => beatsTicker(s, prefs.topics.slice(0, 8)))
          .catch(() => []);
        if (mine.length >= 4) return { items: mine, personal: true };
      }
      const t = await getJson<TickerFile>("ticker.json");
      return { items: t.headlines.map((a, i) => ({ article: unpack(a), label: t.labels?.[i] ?? a[2] })), personal: false };
    }
    load().then(
      (r) => {
        if (cancelled) return;
        setItems(r.items);
        setPersonal(r.personal);
      },
      () => !cancelled && setItems([]),
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) return <div className="h-10 bg-ink" aria-hidden />;

  // The track holds the list twice and slides by exactly half its width, so the loop is seamless.
  const loop = [...items, ...items];
  return (
    <div
      className="group relative flex h-10 items-stretch overflow-hidden bg-ink text-paper"
      aria-label={personal ? "Latest headlines on your beats" : "Top headlines right now"}
    >
      <div className="kicker relative z-10 flex shrink-0 items-center gap-2 bg-accent px-4 text-xs font-semibold text-on-accent">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-on-accent opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-on-accent" />
        </span>
        {personal ? "Your beats" : "Extra!"}
      </div>
      <div className="ticker-mask relative flex-1 overflow-hidden motion-reduce:overflow-x-auto">
        <ul
          className="ticker-track flex h-full w-max items-center group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
          style={{ animationDuration: `${items.length * 7}s` }}
        >
          {loop.map(({ article: a, label }, i) => (
            <li key={i} aria-hidden={i >= items.length} className="flex items-center whitespace-nowrap">
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                tabIndex={i >= items.length ? -1 : undefined}
                className="flex items-center gap-2 px-5 font-serif text-[15px] hover:text-accent-soft hover:underline"
              >
                <span className="kicker text-[10px] font-semibold text-accent-soft">{label}</span>
                {a.title}
              </a>
              <span className="text-accent" aria-hidden>
                ◆
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
