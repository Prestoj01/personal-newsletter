import { NewsletterBuilder } from "@/components/NewsletterBuilder";

const HOW_IT_WORKS = [
  { title: "160+ topics, or type your own", body: "Teams, companies, people, shows and hobbies have dedicated feeds. Anything else is matched against thousands of headlines." },
  { title: "A new edition on your schedule", body: "Daily, weekly, biweekly or monthly. Each edition stays the same until the next one is printed, and past ones are kept." },
  { title: "Headlines refreshed every 6 hours", body: "Stories are pulled from Google News, de-duplicated across your topics and linked to the original publisher." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="py-12 text-center sm:py-20">
        <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          The latest on your teams, hobbies and interests.
          <br />
          <span className="text-accent">Nothing else.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Tell us your favorite things and hobbies, pick how often you want a new edition, and get a personal newsletter with the latest on exactly those topics.
        </p>
      </section>

      <NewsletterBuilder />

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
