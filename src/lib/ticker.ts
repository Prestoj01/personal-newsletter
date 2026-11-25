import { WINDOWS, unpack, type Article, type PackedArticle } from "./news-data";
import type { EditionSources } from "./sources";

export interface TickerItem {
  article: Article;
  /** Shown before the headline: a section ("Sports") or one of the reader's beats ("NFL"). */
  label: string;
}

/** Round-robin through labeled lists so no single section dominates the band. */
export function interleaveSections(sections: { label: string; items: PackedArticle[] }[], limit: number) {
  const headlines: PackedArticle[] = [];
  const labels: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; headlines.length < limit && sections.some((s) => i < s.items.length); i++) {
    for (const s of sections) {
      const a = s.items[i];
      if (!a || seen.has(a[1]) || headlines.length >= limit) continue;
      seen.add(a[1]);
      headlines.push(a);
      labels.push(s.label);
    }
  }
  return { headlines, labels };
}

/**
 * A personal ticker from the reader's own beats: the freshest couple of stories per topic
 * from the last two days, interleaved.
 */
export function beatsTicker(sources: EditionSources, topics: string[], perTopic = 2): TickerItem[] {
  const cutoff = new Date(sources.generatedAt).getTime() / 1000 - 2 * 86_400;
  const sections = topics.map((topic) => {
    const lists = sources.topics.get(topic)?.lists ?? {};
    const fresh = WINDOWS.flatMap((w) => lists[w] ?? [])
      .filter((a) => a[3] >= cutoff && a[0].length <= 110)
      .sort((a, b) => b[3] - a[3]);
    return { label: topic, items: fresh.slice(0, perTopic) };
  });
  const { headlines, labels } = interleaveSections(sections, topics.length * perTopic);
  return headlines.map((a, i) => ({ article: unpack(a), label: labels[i] }));
}
