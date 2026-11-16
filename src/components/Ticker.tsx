"use client";

import { useEffect, useState } from "react";
import { unpack, type Article, type TickerFile } from "@/lib/news-data";
import { getJson } from "@/lib/sources";

/** A wire-service style band of today's top headlines, scrolling endlessly. */
export function Ticker() {
  const [items, setItems] = useState<Article[]>([]);

  useEffect(() => {
    getJson<TickerFile>("ticker.json").then(
      (t) => setItems(t.headlines.map(unpack)),
      () => setItems([]),
    );
  }, []);

  if (items.length === 0) return <div className="h-10 bg-ink" aria-hidden />;

  // The track holds the list twice and slides by exactly half its width, so the loop is seamless.
  const loop = [...items, ...items];
  return (
    <div className="group relative flex h-10 items-stretch overflow-hidden bg-ink text-paper" aria-label="Top headlines right now">
      <div className="kicker relative z-10 flex shrink-0 items-center gap-2 bg-accent px-4 text-xs font-semibold text-white">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        Extra!
      </div>
      <div className="ticker-mask relative flex-1 overflow-hidden motion-reduce:overflow-x-auto">
        <ul
          className="ticker-track flex h-full w-max items-center group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
          style={{ animationDuration: `${items.length * 7}s` }}
        >
          {loop.map((a, i) => (
            <li key={i} aria-hidden={i >= items.length} className="flex items-center whitespace-nowrap">
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                tabIndex={i >= items.length ? -1 : undefined}
                className="px-5 font-serif text-[15px] hover:text-accent-soft hover:underline"
              >
                {a.title}
                <span className="kicker ml-2 text-[10px] not-italic text-line-strong">{a.source}</span>
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
