import { KineticHeadline } from "@/components/KineticHeadline";
import { NewsletterBuilder } from "@/components/NewsletterBuilder";

const HOW_IT_WORKS = [
  { title: "160+ topics, or type your own", body: "Teams, companies, people, shows and hobbies have dedicated feeds. Anything else is matched against thousands of headlines." },
  { title: "A new edition on your schedule", body: "Daily, weekly, biweekly or monthly. Each edition stays the same until the next one is printed, and past ones are kept." },
  { title: "Headlines refreshed every 6 hours", body: "Stories are pulled from Google News, de-duplicated across your topics and linked to the original publisher." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12">
        <KineticHeadline />
        <div className="intro-fade flex flex-col justify-end gap-5 lg:border-l lg:border-ink lg:pl-8" style={{ "--d": "700ms" } as React.CSSProperties}>
          <p className="kicker text-xs font-semibold text-accent">Extra! Extra! Read all about it</p>
          <p className="drop-cap font-serif text-lg leading-relaxed text-ink">
            Tell us your favorite things and hobbies, pick how often you want a new edition, and get a personal newspaper with the latest on exactly
            those topics. No account, no email, no clutter.
          </p>
          <a href="#builder" className="kicker inline-flex items-center gap-2 text-xs font-semibold hover:text-accent">
            Build your paper <span className="motion-safe:animate-bounce">↓</span>
          </a>
        </div>
      </section>

      <div id="builder" className="scroll-mt-6">
        <NewsletterBuilder />
      </div>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {HOW_IT_WORKS.map((step) => (
          <div key={step.title} className="border-t-2 border-ink pt-4">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className="mt-1 text-muted">{step.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
