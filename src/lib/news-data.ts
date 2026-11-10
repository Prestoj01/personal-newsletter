/**
 * Files produced by scripts/fetch-news.ts on a schedule and read by the browser:
 *
 *   data/topics/<slug>.json  headlines for one known topic, per look-back window
 *                            (plus _sections.json: Google News front page + section feeds)
 *   data/search.json         title-only index of every recent headline, for free-text topics
 *
 * The browser only downloads the files for the topics a reader picked. A free-text topic is
 * matched against the small title index, then just the files holding its matches are fetched.
 */

/** [title, url, source, publishedAt (unix seconds)] */
export type PackedArticle = [string, string, string, number];

/** Look-back windows (days) fetched for every known topic. */
export const WINDOWS = [1, 7, 30] as const;
export type Window = (typeof WINDOWS)[number];

export interface TopicFile {
  generatedAt: string;
  /** window -> articles in Google News relevance order */
  lists: Partial<Record<Window, PackedArticle[]>>;
}

export const SECTIONS_SLUG = "_sections";

/** [title, index into `files`, publishedAt (unix seconds)] */
export type SearchEntry = [string, number, number];

export interface SearchFile {
  generatedAt: string;
  files: string[];
  entries: SearchEntry[];
}

export interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO
}

const GN_PREFIX = "https://news.google.com/rss/articles/";
const GN_SUFFIX = "?oc=5";

/** Google News links share a long prefix/suffix; store just the id ("~<id>") to save ~20% of the data. */
export function packUrl(url: string): string {
  if (url.startsWith(GN_PREFIX)) return "~" + url.slice(GN_PREFIX.length).replace(GN_SUFFIX, "");
  return url;
}

export function unpackUrl(url: string): string {
  return url.startsWith("~") ? `${GN_PREFIX}${url.slice(1)}${GN_SUFFIX}` : url;
}

export const unpack = ([title, url, source, ts]: PackedArticle): Article => ({
  title,
  url: unpackUrl(url),
  source,
  publishedAt: new Date(ts * 1000).toISOString(),
});
