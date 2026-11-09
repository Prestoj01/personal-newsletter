"use client";

import { useState } from "react";
import type { Frequency } from "@/lib/frequency";
import { FrequencyPicker } from "./FrequencyPicker";
import { PreviewPanel } from "./PreviewPanel";
import { TopicPicker } from "./TopicPicker";
import { usePreview } from "./usePreview";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; email: string } | { kind: "error"; message: string };

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="mb-5 flex items-center gap-3 font-serif text-2xl text-stone-900">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 font-sans text-sm font-semibold text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function NewsletterBuilder() {
  const [topics, setTopics] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const preview = usePreview(topics, frequency);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (topics.length === 0) {
      setStatus({ kind: "error", message: "Pick at least one topic first." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, topics, frequency, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setStatus({ kind: "sent", email });
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <Step n={1} title="What are you into?">
          <TopicPicker selected={topics} onChange={setTopics} />
        </Step>

        <Step n={2} title="How often?">
          <FrequencyPicker value={frequency} onChange={setFrequency} />
        </Step>

        <Step n={3} title="Where should we send it?">
          {status.kind === "sent" ? (
            <div className="rounded-xl bg-emerald-50 p-5 text-emerald-900">
              <p className="font-semibold">Check your inbox ✉️</p>
              <p className="mt-1 text-sm">
                We sent a confirmation link to <strong>{status.email}</strong>. Click it and your first issue goes out right away.
              </p>
            </div>
          ) : (
            <form onSubmit={subscribe} className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="min-w-0 flex-1 rounded-full border border-stone-300 bg-white px-5 py-3 outline-none focus:border-orange-700 focus:ring-2 focus:ring-orange-700/20"
                />
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="hidden"
                  aria-hidden
                />
                <button
                  type="submit"
                  disabled={status.kind === "sending"}
                  className="rounded-full bg-orange-700 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-800 disabled:opacity-60"
                >
                  {status.kind === "sending" ? "Subscribing…" : "Subscribe — it's free"}
                </button>
              </div>
              {status.kind === "error" && <p className="text-sm text-red-700">{status.message}</p>}
              <p className="text-xs text-stone-500">No account, no password, no spam. Unsubscribe with one click from any issue.</p>
            </form>
          )}
        </Step>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <PreviewPanel
          html={preview.html}
          loading={preview.loading}
          error={preview.error}
          onRefresh={preview.refresh}
          canPreview={topics.length > 0}
        />
      </div>
    </div>
  );
}
