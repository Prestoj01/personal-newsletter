import { APP_NAME } from "@/lib/config";
import { moreCoverageUrl, type TopicSection } from "@/lib/edition";
import { frequencyInfo, type Frequency } from "@/lib/frequency";

function relativeTime(iso: string, now: number): string {
  const h = Math.floor(Math.max(0, now - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
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
}

/** A newsletter issue, styled like a printed paper. */
export function Edition({ sections, frequency, date, number, asOf, inset = false }: Props) {
  const now = new Date(asOf).getTime();
  const withNews = sections.filter((s) => s.articles.length);
  return (
    <article className={`mx-auto max-w-2xl ${inset ? "rounded-inset" : "rounded-card"} border border-line bg-surface font-serif text-ink`}>
      <header className="border-b-[3px] border-double border-ink px-6 pb-5 pt-8 sm:px-9">
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] tabular-nums text-accent">
          {frequencyInfo(frequency).label} edition{number ? ` · No. ${number}` : ""}
        </p>
        <h2 className="mt-1.5 text-4xl font-bold leading-tight">{APP_NAME}</h2>
        <p className="mt-2 font-sans text-sm tabular-nums text-muted">
          {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </header>

      {withNews.length > 0 && (
        <p className="px-6 pt-4 font-sans text-sm text-muted sm:px-9">
          In this issue: {withNews.map((s) => `${s.emoji} ${s.topic}`).join("  ·  ")}
        </p>
      )}

      <div className="px-6 pb-8 sm:px-9">
        {sections.map((s) => (
          <section key={s.topic} className="pt-6">
            <h3 className="border-b border-line pb-2 font-sans text-xs font-bold uppercase tracking-[0.15em] text-accent">
              {s.emoji} {s.topic}
            </h3>
            {s.articles.length === 0 ? (
              <p className="py-3 font-sans text-sm text-muted">No matching headlines in this edition&apos;s news.</p>
            ) : (
              <ul className="divide-y divide-line/60">
                {s.articles.map((a) => (
                  <li key={a.url} className="py-3">
                    <a href={a.url} target="_blank" rel="noreferrer" className="text-lg font-semibold leading-snug text-pretty hover:text-accent">
                      {a.title}
                    </a>
                    <p className="mt-1 font-sans text-xs tabular-nums text-muted">
                      {a.source} · {relativeTime(a.publishedAt, now)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <a
              href={moreCoverageUrl(s.topic)}
              target="_blank"
              rel="noreferrer"
              aria-label={`More on ${s.topic} on Google News`}
              className="mt-1 inline-block font-sans text-xs font-medium text-accent hover:underline"
            >
              More on Google News ↗
            </a>
          </section>
        ))}
      </div>
    </article>
  );
}

/** Placeholder with the same layout as an edition, shown while headlines load. */
export function EditionSkeleton({ inset = false }: { inset?: boolean }) {
  const bar = "rounded bg-line motion-safe:animate-pulse";
  return (
    <div
      role="status"
      aria-label="Loading headlines"
      className={`mx-auto max-w-2xl ${inset ? "rounded-inset" : "rounded-card"} border border-line bg-surface`}
    >
      <div className="space-y-3 border-b-[3px] border-double border-line px-6 pb-5 pt-8 sm:px-9">
        <div className={`${bar} h-3 w-32`} />
        <div className={`${bar} h-9 w-56`} />
        <div className={`${bar} h-4 w-44`} />
      </div>
      <div className="space-y-8 px-6 py-8 sm:px-9">
        {[0, 1, 2].map((s) => (
          <div key={s} className="space-y-4">
            <div className={`${bar} h-3 w-24`} />
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className={`${bar} h-5 ${i === 1 ? "w-4/5" : "w-full"}`} />
                <div className={`${bar} h-3 w-28`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
