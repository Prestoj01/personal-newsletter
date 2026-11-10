import type { TopicSection } from "./edition";
import { isFrequency, type Frequency } from "./frequency";

export interface Prefs {
  topics: string[];
  frequency: Frequency;
  /** YYYY-MM-DD the current schedule started (reset when preferences change). */
  startedAt: string;
}

export interface StoredEdition {
  key: string;
  number: number;
  frequency: Frequency;
  topics: string[];
  createdAt: string;
  newsAsOf: string;
  sections: TopicSection[];
}

const PREFS_KEY = "personal-press:prefs";
const EDITIONS_KEY = "personal-press:editions";
const MAX_EDITIONS = 12;

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function loadPrefs(): Prefs | null {
  const p = read<Prefs>(PREFS_KEY);
  if (!p || !Array.isArray(p.topics) || p.topics.length === 0 || !isFrequency(p.frequency) || !p.startedAt) return null;
  return p;
}

export function savePrefs(prefs: Prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export function loadEditions(): StoredEdition[] {
  return read<StoredEdition[]>(EDITIONS_KEY) ?? [];
}

export function saveEdition(edition: StoredEdition): StoredEdition[] {
  const rest = loadEditions().filter((e) => e.key !== edition.key);
  const all = [edition, ...rest].slice(0, MAX_EDITIONS);
  try {
    localStorage.setItem(EDITIONS_KEY, JSON.stringify(all));
  } catch {
    // Storage full: keep only the newest edition.
    localStorage.setItem(EDITIONS_KEY, JSON.stringify([edition]));
  }
  return all;
}

export function clearAll() {
  localStorage.removeItem(PREFS_KEY);
  localStorage.removeItem(EDITIONS_KEY);
}
