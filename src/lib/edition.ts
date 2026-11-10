import { frequencyInfo, type Frequency } from "./frequency";
import { WINDOWS, unpack, type Article, type PackedArticle } from "./news-data";
import { normalizeTitle, type EditionSources } from "./sources";
import { emojiFor, presetFor, queryFor } from "./topics";

export interface TopicSection {
  topic: string;
  emoji: string;
  articles: Article[];
}

const ARTICLES_PER_TOPIC = 5;
const DAY_S = 86_400;

/** Candidates for one topic, preferring the look-back window closest to the reader's frequency. */
function candidates(sources: EditionSources, topic: string, days: number): PackedArticle[] {
  const lists = sources.topics.get(topic)?.lists ?? {};
  const order = [...WINDOWS].sort((a, b) => Math.abs(Math.log(a / days)) - Math.abs(Math.log(b / days)));
  return order.flatMap((w) => lists[w] ?? []);
}

/** Assemble an edition's sections, removing stories that already appeared under another topic. */
export function buildSections(sources: EditionSources, topics: string[], frequency: Frequency): TopicSection[] {
  const days = frequencyInfo(frequency).days;
  const cutoff = new Date(sources.generatedAt).getTime() / 1000 - (days + 1) * DAY_S;
  const seen = new Set<string>();

  // Free-text topics have few candidates, so they claim theirs before broad presets de-duplicate them away.
  const order = [...topics].sort((a, b) => Number(Boolean(presetFor(a))) - Number(Boolean(presetFor(b))));
  const built = new Map<string, TopicSection>();
  for (const topic of order) {
    const articles: Article[] = [];
    for (const a of candidates(sources, topic, days)) {
      if (a[3] < cutoff) continue;
      const key = normalizeTitle(a[0]);
      if (seen.has(key)) continue;
      seen.add(key);
      articles.push(unpack(a));
      if (articles.length === ARTICLES_PER_TOPIC) break;
    }
    built.set(topic, { topic, emoji: emojiFor(topic), articles });
  }
  return topics.map((t) => built.get(t)!);
}

/** Full, live coverage of a topic on Google News: the "read more" link under every section. */
export function moreCoverageUrl(topic: string): string {
  return `https://news.google.com/search?${new URLSearchParams({ q: queryFor(topic), hl: "en-US", gl: "US", ceid: "US:en" })}`;
}
