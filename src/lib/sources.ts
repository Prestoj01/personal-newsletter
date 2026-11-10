import { BASE_PATH } from "./config";
import type { PackedArticle, SearchFile, TopicFile } from "./news-data";
import { presetFor, topicSlug } from "./topics";

/** Headlines for each of a reader's topics, keyed by the topic as they typed it. */
export interface EditionSources {
  generatedAt: string;
  topics: Map<string, TopicFile>;
}

const cache = new Map<string, Promise<unknown>>();

function getJson<T>(path: string): Promise<T> {
  let p = cache.get(path) as Promise<T> | undefined;
  if (!p) {
    p = fetch(`${BASE_PATH}/data/${path}`).then((r) => {
      if (!r.ok) throw new Error(`Couldn't load headlines (HTTP ${r.status}).`);
      return r.json() as Promise<T>;
    });
    p.catch(() => cache.delete(path));
    cache.set(path, p);
  }
  return p;
}

const loadTopicFile = (slug: string) => getJson<TopicFile>(`topics/${slug}.json`);

const STOPWORDS = new Set(["the", "a", "an", "and", "or", "of", "in", "on", "for", "to", "news"]);
export const normalizeTitle = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Free-text topic: whole-word match of every keyword against the title index, then fetch just those files. */
async function matchFreeText(topic: string): Promise<TopicFile> {
  const search = await getJson<SearchFile>("search.json");
  const words = normalizeTitle(topic)
    .split(" ")
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
  if (words.length === 0) return { generatedAt: search.generatedAt, lists: {} };

  const patterns = words.map((w) => new RegExp(`\\b${w}s?\\b`));
  const hits = search.entries
    .filter(([title]) => {
      const t = normalizeTitle(title);
      return patterns.every((p) => p.test(t));
    })
    .sort((a, b) => b[2] - a[2])
    .slice(0, 20);

  const files = await Promise.all([...new Set(hits.map((h) => h[1]))].map((i) => loadTopicFile(search.files[i]).then((f) => [i, f] as const)));
  const byFile = new Map(files);
  const articles: PackedArticle[] = [];
  for (const [title, fileIdx] of hits) {
    const f = byFile.get(fileIdx);
    const a = f && Object.values(f.lists).flat().find((x) => x![0] === title);
    if (a) articles.push(a);
  }
  return { generatedAt: search.generatedAt, lists: { 7: articles } };
}

export async function loadSources(topics: string[]): Promise<EditionSources> {
  const entries = await Promise.all(
    topics.map(async (t) => {
      const known = presetFor(t);
      return [t, known ? await loadTopicFile(topicSlug(known.label)) : await matchFreeText(t)] as const;
    }),
  );
  const generatedAt = entries.reduce((max, [, f]) => (f.generatedAt > max ? f.generatedAt : max), "");
  return { generatedAt: generatedAt || new Date().toISOString(), topics: new Map(entries) };
}
