import { KineticHeadline } from "@/components/KineticHeadline";
import { NewsletterBuilder } from "@/components/NewsletterBuilder";

const INSIDE = [
  { title: "160+ beats, or type your own", body: "Teams, companies, people, shows and hobbies have dedicated feeds. Anything else is matched against thousands of headlines." },
  { title: "Printed on your schedule", body: "Daily, weekly, biweekly or monthly. Each edition stays put until the next one rolls off the press, and past ones are kept." },
  { title: "Fresh ink every 6 hours", body: "Stories are pulled from Google News, de-duplicated across your beats and linked to the original publisher." },
];

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <div className="mx-auto max-w-6xl px-6">
        <section className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
          <KineticHeadline />
          <div className="intro-fade flex flex-col justify-end gap-5 lg:border-l lg:border-ink lg:pl-8" style={{ "--d": "700ms" } as React.CSSProperties}>
            <p className="kicker text-xs font-semibold text-accent">Extra! Extra! Read all about it</p>
            <p className="drop-cap font-serif text-lg leading-relaxed text-ink">
              Tell us your favorite things and hobbies, pick how often you want a new edition, and get a personal newspaper with the latest on
              exactly those topics. No account, no email, no clutter.
            </p>
            <a href="#builder" className="kicker inline-flex items-center gap-2 text-xs font-semibold hover:text-accent">
              Build your paper <span className="motion-safe:animate-bounce">↓</span>
            </a>
          </div>
        </section>

        <div id="builder" className="scroll-mt-16">
          <NewsletterBuilder />
        </div>
      </div>

      {/* Giant outlined banner that slides sideways as it scrolls past. */}
      <div className="mt-24 border-y-4 border-double border-ink py-4" aria-hidden>
        <p className="scrub-x outline-type whitespace-nowrap font-display text-[clamp(4rem,13vw,11rem)] uppercase leading-none">
          Extra! Extra! Read all about it <span className="text-accent [-webkit-text-stroke:0]">◆</span> Extra! Extra! Read all about it
        </p>
      </div>

      <section className="mx-auto mt-16 max-w-6xl px-6">
        <h2 className="reveal font-display text-5xl uppercase leading-none sm:text-6xl">Inside the paper</h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-ink">
          {INSIDE.map((item, i) => (
            <div key={item.title} className="reveal sm:px-6 sm:first:pl-0 sm:last:pr-0" style={{ "--from": `${i * 15}%` } as React.CSSProperties}>
              <p className="font-display text-7xl leading-none text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 font-display text-2xl uppercase leading-tight tracking-wide">{item.title}</h3>
              <p className="mt-2 font-serif text-lg leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
