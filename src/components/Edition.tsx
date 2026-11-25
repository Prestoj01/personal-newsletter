import { APP_NAME } from "@/lib/config";
import { moreCoverageUrl, type TopicSection } from "@/lib/edition";
import { frequencyInfo, type Frequency } from "@/lib/frequency";
import type { Article } from "@/lib/news-data";
import { ClipButton } from "./ClipButton";
import { PriceEar, WeatherEar } from "./Ears";
import { Story } from "./Story";

function relativeTime(iso: string, now: number): string {
  const h = Math.floor(Math.max(0, now - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

/** "NFL, Coffee & Space Exploration" */
function listTopics(topics: string[]): string {
  if (topics.length <= 1) return topics.join("");
  return `${topics.slice(0, -1).join(", ")} & ${topics[topics.length - 1]}`;
}

interface Props {
  sections: TopicSection[];
  frequency: Frequency;
  date: Date;
  number?: number;
  /** When the headlines were fetched; relative times are measured from here. */
  asOf: string;
  /** Set when rendered inside another card, so its corners nest correctly. */
  inset?: boolean;
  /** Overrides the dateline's edition number, e.g. "Shared paper". */
  badge?: string;
}

/** Source and age of a story, with the scissors to clip it at the end of the line. */
function Byline({ article, topic, now }: { article: Article; topic: string; now: number }) {
  return (
    <div className="mt-1.5 flex items-baseline justify-between gap-3">
      <p className="kicker text-[10px] tabular-nums text-muted">
        {article.source} · {relativeTime(article.publishedAt, now)}
      </p>
      <ClipButton article={article} topic={topic} />
    </div>
  );
}

/**
 * A newsletter issue laid out as a broadsheet front page: nameplate, a banner lead story, then
 * every topic flowing through newspaper columns. Column count follows the space available
 * (container queries), so the same component works in the narrow preview and the full reader.
 */
export function Edition({ sections, frequency, date, number, asOf, inset = false, badge }: Props) {
  const now = new Date(asOf).getTime();
  const withNews = sections.filter((s) => s.articles.length);
  const leadSection = withNews[0];
  const lead = leadSection?.articles[0];
  let order = 0; // stagger index for the typesetting animation, in reading order
  const ts = () => ({ "--i": order++ }) as React.CSSProperties;
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <article
      className={`@container mx-auto max-w-5xl ${inset ? "rounded-inset" : "rounded-card"} border border-line bg-surface px-5 pb-8 pt-4 text-ink shadow-[0_1px_0_var(--color-line),0_12px_30px_-18px_rgb(0_0_0/0.35)] motion-safe:animate-fade-in @lg:px-8`}
    >
      {/* Masthead */}
      <header className="text-center">
        <div className="kicker flex items-center justify-between gap-2 border-b border-ink pb-1.5 text-[10px] tabular-nums text-muted">
          <span>{badge ?? (number ? `No. ${number}` : "Preview")}</span>
          <span className="hidden @md:inline">{dateStr}</span>
          <span>{frequencyInfo(frequency).label} edition</span>
        </div>
        {/* Nameplate, flanked by "ears" (weather and price) when the page is wide enough. */}
        <div className="flex items-center justify-center gap-4 py-2 @2xl:justify-between">
          <div className="hidden @2xl:flex">
            <WeatherEar />
          </div>
          <h2 className="font-nameplate text-[clamp(2.25rem,11cqi,4.75rem)] leading-none">{APP_NAME}</h2>
          <div className="hidden @2xl:flex">
            <PriceEar />
          </div>
        </div>
        <div className="rule-double" />
        {withNews.length > 0 && (
          <p className="kicker border-b border-ink py-1.5 text-[10px] font-medium @md:text-[11px]">
            All the news on {listTopics(withNews.map((s) => s.topic))}
          </p>
        )}
      </header>

      {/* Banner lead story */}
      {lead && (
        <Story as="section" url={lead.url} className="border-b border-ink py-5">
          <p className="kicker text-[11px] font-semibold text-accent">
            {leadSection.emoji} {leadSection.topic}
          </p>
          <a href={lead.url} target="_blank" rel="noreferrer" className="group mt-1 block">
            <h3 className="slam font-display text-[clamp(1.9rem,7.5cqi,4rem)] uppercase leading-[0.95] tracking-tight group-hover:text-accent">
              {lead.title}
            </h3>
          </a>
          <Byline article={lead} topic={leadSection.topic} now={now} />
        </Story>
      )}

      {/* Everything else, in columns */}
      <div className="edition-columns gap-8 pt-5 [column-rule:1px_solid_var(--color-line)] @xl:columns-2 @4xl:columns-3">
        {sections.map((s) => {
          const articles = s === leadSection ? s.articles.slice(1) : s.articles;
          if (s === leadSection && articles.length === 0) return null;
          return (
            <section key={s.topic} className="mb-6 break-inside-avoid">
              <h3 className="typeset kicker flex items-center gap-1.5 border-t-[3px] border-ink pt-1.5 text-[11px] font-semibold text-accent" style={ts()}>
                <span aria-hidden>{s.emoji}</span> {s.topic}
              </h3>
              {articles.length === 0 ? (
                <p className="py-3 text-sm text-muted">No matching headlines in this edition&apos;s news.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {articles.map((a, i) => (
                    <Story key={a.url} url={a.url} className="typeset py-3" style={ts()}>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`headline-link font-serif leading-snug text-pretty ${i === 0 ? "text-xl font-bold" : "text-[1.05rem] font-semibold"}`}
                      >
                        {a.title}
                      </a>
                      <Byline article={a} topic={s.topic} now={now} />
                    </Story>
                  ))}
                </ul>
              )}
              <a
                href={moreCoverageUrl(s.topic)}
                target="_blank"
                rel="noreferrer"
                aria-label={`More on ${s.topic} on Google News`}
                className="kicker mt-1 inline-block text-[10px] font-semibold text-accent hover:underline print:hidden"
              >
                More on Google News ↗
              </a>
            </section>
          );
        })}
      </div>

      <p className="kicker mt-2 text-center text-xs text-muted" aria-hidden>
        — 30 —
      </p>
      {/* Colophon that only appears on paper. */}
      <p className="kicker mt-3 hidden border-t border-ink pt-2 text-center text-[9px] text-muted print:block">
        Printed from {APP_NAME} · prestoj01.github.io/personal-newsletter · Headlines via Google News
      </p>
    </article>
  );
}

/** Placeholder with the same layout as an edition, shown while headlines load. */
export function EditionSkeleton({ inset = false }: { inset?: boolean }) {
  const bar = "bg-line motion-safe:animate-pulse";
  return (
    <div
      role="status"
      aria-label="Loading headlines"
      className={`@container mx-auto max-w-5xl ${inset ? "rounded-inset" : "rounded-card"} border border-line bg-surface px-5 pb-8 pt-4 @lg:px-8`}
    >
      <div className="flex flex-col items-center gap-3 border-b-4 border-line pb-4">
        <div className={`${bar} h-2.5 w-full`} />
        <div className={`${bar} h-12 w-2/3`} />
      </div>
      <div className="space-y-3 border-b border-line py-5">
        <div className={`${bar} h-3 w-24`} />
        <div className={`${bar} h-10 w-full`} />
        <div className={`${bar} h-10 w-3/4`} />
      </div>
      <div className="gap-8 pt-5 @xl:columns-2">
        {[0, 1, 2, 3].map((s) => (
          <div key={s} className="mb-6 break-inside-avoid space-y-3">
            <div className={`${bar} h-3 w-28`} />
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className={`${bar} h-5 ${i === 1 ? "w-4/5" : "w-full"}`} />
                <div className={`${bar} h-2.5 w-24`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
