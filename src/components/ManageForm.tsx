"use client";

import { useState } from "react";
import type { Frequency } from "@/lib/frequency";
import { FrequencyPicker } from "./FrequencyPicker";
import { PreviewPanel } from "./PreviewPanel";
import { TopicPicker } from "./TopicPicker";
import { usePreview } from "./usePreview";

interface Props {
  token: string;
  email: string;
  initialTopics: string[];
  initialFrequency: Frequency;
  initiallyUnsubscribed: boolean;
}

export function ManageForm({ token, email, initialTopics, initialFrequency, initiallyUnsubscribed }: Props) {
  const [topics, setTopics] = useState(initialTopics);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [unsubscribed, setUnsubscribed] = useState(initiallyUnsubscribed);
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const preview = usePreview(topics, frequency);

  async function post(url: string, body: object) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      return true;
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Something went wrong.", error: true });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (await post("/api/preferences", { token, topics, frequency, resubscribe: unsubscribed })) {
      setUnsubscribed(false);
      setMessage({ text: unsubscribed ? "Welcome back! You're subscribed again." : "Saved. Your next issue will use these preferences." });
    }
  }

  async function unsubscribe() {
    if (await post("/api/unsubscribe", { token })) {
      setUnsubscribed(true);
      setMessage({ text: "You've been unsubscribed. You won't receive any more issues." });
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="font-serif text-4xl text-stone-900">Your newsletter</h1>
      <p className="mt-2 text-stone-600">
        Delivered to <strong>{email}</strong>
        {unsubscribed && <span className="ml-2 rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium">Unsubscribed</span>}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-5 font-serif text-2xl">Topics</h2>
            <TopicPicker selected={topics} onChange={setTopics} />
          </section>
          <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-5 font-serif text-2xl">Frequency</h2>
            <FrequencyPicker value={frequency} onChange={setFrequency} />
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={busy || topics.length === 0}
              className="rounded-full bg-orange-700 px-6 py-3 font-semibold text-white hover:bg-orange-800 disabled:opacity-50"
            >
              {unsubscribed ? "Resubscribe with these settings" : "Save changes"}
            </button>
            {message && <p className={`text-sm ${message.error ? "text-red-700" : "text-emerald-700"}`}>{message.text}</p>}
          </div>

          {!unsubscribed && (
            <section id="unsubscribe" className="rounded-2xl border border-stone-200 p-6">
              <h2 className="font-semibold">Unsubscribe</h2>
              <p className="mt-1 text-sm text-stone-600">Stop all emails. You can come back any time using this page.</p>
              <button
                type="button"
                onClick={unsubscribe}
                disabled={busy}
                className="mt-4 rounded-full border border-red-700 px-5 py-2 text-sm font-medium text-red-700 hover:bg-red-700 hover:text-white disabled:opacity-50"
              >
                Unsubscribe
              </button>
            </section>
          )}
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <PreviewPanel html={preview.html} loading={preview.loading} error={preview.error} onRefresh={preview.refresh} canPreview={topics.length > 0} />
        </div>
      </div>
    </div>
  );
}
