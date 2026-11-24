import type { Article } from "./news-data";

/** A story the reader cut out and kept. Stored in this browser only. */
export interface Clipping extends Article {
  topic: string;
  clippedAt: string;
}

const KEY = "extra-extra:clippings";
const MAX = 200;
const EVENT = "extra:clippings";
const EMPTY: Clipping[] = [];

let cache: { raw: string | null; list: Clipping[] } = { raw: null, list: EMPTY };

/** Snapshot for useSyncExternalStore: re-parsed only when the stored value changes. */
export function getClippings(): Clipping[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = localStorage.getItem(KEY);
  if (raw !== cache.raw) {
    let list: Clipping[] = EMPTY;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      /* corrupt value: treat as empty */
    }
    cache = { raw, list };
  }
  return cache.list;
}

export const getServerClippings = () => EMPTY;

export function subscribeClippings(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage); // other tabs
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function write(list: Clipping[]) {
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  window.dispatchEvent(new Event(EVENT));
}

export const isClipped = (list: Clipping[], url: string) => list.some((c) => c.url === url);

/** Clip or unclip a story. Returns true if it is now clipped. */
export function toggleClipping(article: Article, topic: string): boolean {
  const list = getClippings();
  if (isClipped(list, article.url)) {
    write(list.filter((c) => c.url !== article.url));
    return false;
  }
  write([{ ...article, topic, clippedAt: new Date().toISOString() }, ...list]);
  return true;
}

export function removeClipping(url: string) {
  write(getClippings().filter((c) => c.url !== url));
}
