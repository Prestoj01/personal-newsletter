import { NewsletterBuilder } from "@/components/NewsletterBuilder";

const HOW_IT_WORKS = [
  { title: "Pick your interests", body: "Choose from 40+ topics or add anything you like — a team, a band, a hobby, a company." },
  { title: "Choose your rhythm", body: "Daily, weekly, every two weeks or monthly. Change it any time from the link in every issue." },
  { title: "Read what matters", body: "We gather the freshest headlines for each topic, remove duplicates and deliver one tidy email." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <section className="py-12 text-center sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-700">Free · No account needed</p>
        <h1 className="mx-auto mt-4 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight text-stone-900 sm:text-6xl">
          The news you care about.
          <br />
          <em className="text-orange-700">Nothing else.</em>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-stone-600">
          Tell us your favorite things and hobbies, pick how often you want to hear from us, and get a personal newsletter with the latest on exactly those topics.
        </p>
      </section>

      <NewsletterBuilder />

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {HOW_IT_WORKS.map((step, i) => (
          <div key={step.title} className="border-t-2 border-stone-900 pt-4">
            <p className="font-serif text-4xl text-orange-700">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="mt-1 text-stone-600">{step.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
