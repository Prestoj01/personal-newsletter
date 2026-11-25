"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BASE_PATH } from "@/lib/config";

/** Registers the service worker that keeps the app shell and today's headlines available offline. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(`${BASE_PATH}/sw.js`, { scope: `${BASE_PATH}/` }).catch(() => {});
  }, []);
  return null;
}

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** "Offline edition" marker for the dateline when the connection drops. */
export function OfflineBadge() {
  const online = useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
  if (online) return null;
  return (
    <span role="status" className="kicker inline-flex items-center gap-1.5 bg-ink px-1.5 text-paper">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
      Offline edition
    </span>
  );
}

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** "Install app" link, shown only where the browser offers installation (e.g. Chrome, Edge, Android). */
export function InstallButton({ className = "" }: { className?: string }) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallPromptEvent);
    };
    const onInstalled = () => setPrompt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!prompt) return null;
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await prompt.prompt();
        await prompt.userChoice;
        setPrompt(null);
      }}
    >
      Install the app ↓
    </button>
  );
}
