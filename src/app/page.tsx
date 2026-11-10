import { NewsletterBuilder } from "@/components/NewsletterBuilder";

const HOW_IT_WORKS = [
  { title: "Pick your interests", body: "Choose from 40+ topics or add anything you like: a team, a band, a hobby, a company." },
  { title: "Choose your rhythm", body: "Daily, weekly, biweekly or monthly. A new edition is printed on your schedule, and past ones are kept." },
  { title: "Read what matters", body: "Headlines are refreshed every few hours, de-duplicated across topics and laid out as one tidy issue." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="py-12 text-center sm:py-20">
        <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight text-ink sm:text-6xl">
          The news you care about.
          <br />
          <span className="text-accent">Nothing else.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">
          Tell us your favorite things and hobbies, pick how often you want a new edition, and get a personal newsletter with the latest on exactly those topics.
        </p>
      </section>

      <NewsletterBuilder />

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {HOW_IT_WORKS.map((step, i) => (
          <div key={step.title} className="border-t-2 border-ink pt-4">
            <p className="font-serif text-4xl text-accent">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="mt-1 text-muted">{step.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
