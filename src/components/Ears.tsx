"use client";

import { useEffect, useState } from "react";
import { describeWeather, forgetPlace, getWeather, locate, savedPlace, unitFor, type Sky, type Weather } from "@/lib/weather";

const earClass = "flex min-h-28 w-36 shrink-0 flex-col items-center justify-center border-4 border-double border-ink px-2 py-1.5 text-center";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "ready"; weather: Weather } | { kind: "error" };

/** Line-drawn weather icons in ink, like a newspaper's weather box (no emoji: it varies by platform). */
function SkyIcon({ sky, className = "" }: { sky: Sky; className?: string }) {
  const sun = (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </>
  );
  const cloud = <path d="M7 18h10.5a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.7-1.2A4 4 0 0 0 7 18z" />;
  const paths: Record<Sky, React.ReactNode> = {
    sun,
    moon: <path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z" />,
    partly: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M9 2.5v1.5M3.5 8H5M5 4l1 1M13 4l-1 1" />
        <path d="M9 19h9a3 3 0 0 0 .3-6 4.5 4.5 0 0 0-8.6-1A3.5 3.5 0 0 0 9 19z" />
      </>
    ),
    cloud,
    fog: <path d="M4 9h16M2.5 13h19M4 17h16" />,
    rain: (
      <>
        <path d="M7 14h10.5a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.7-1.2A4 4 0 0 0 7 14z" />
        <path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3" />
      </>
    ),
    snow: (
      <>
        <path d="M7 14h10.5a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.7-1.2A4 4 0 0 0 7 14z" />
        <path d="M8 18h.01M12 20h.01M16 18h.01" strokeWidth={3} />
      </>
    ),
    storm: (
      <>
        <path d="M7 14h10.5a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.7-1.2A4 4 0 0 0 7 14z" />
        <path d="M12.5 15l-2 3.5h3l-2 3.5" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {paths[sky]}
    </svg>
  );
}

/** Left ear: today's local weather, like the box beside a newspaper's nameplate. */
export function WeatherEar() {
  const [state, setState] = useState<State>({ kind: "idle" });

  async function load(ask: boolean) {
    setState({ kind: "loading" });
    try {
      const place = ask ? await locate() : savedPlace();
      if (!place) return setState({ kind: "idle" });
      setState({ kind: "ready", weather: await getWeather(place, unitFor(navigator.language)) });
    } catch {
      setState({ kind: "error" });
    }
  }

  // Readers who already shared a location get their weather without being asked again.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable after mount
    if (savedPlace()) void load(false);
  }, []);

  if (state.kind === "ready") {
    const w = state.weather;
    const { label, sky } = describeWeather(w.code, w.isDay);
    return (
      <div className={`${earClass} motion-safe:animate-pop-in`} aria-label={`Weather: ${w.temp}°${w.unit}, ${label}, high ${w.high}°, low ${w.low}°`}>
        <p className="kicker text-[9px] text-muted">Today&apos;s weather</p>
        <p className="flex items-baseline gap-1.5 font-display text-3xl leading-none tabular-nums">
          <SkyIcon sky={sky} className="h-6 w-6 self-center text-accent" />
          {w.temp}°
        </p>
        <p className="kicker text-[9px] font-semibold">{label}</p>
        <p className="kicker text-[9px] tabular-nums text-muted">
          H {w.high}° · L {w.low}°
        </p>
        <button type="button" onClick={() => (forgetPlace(), setState({ kind: "idle" }))} className="kicker mt-0.5 text-[8px] text-muted underline print:hidden">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className={`${earClass} print:hidden`}>
      <p className="kicker text-[9px] text-muted">Weather</p>
      {state.kind === "loading" ? (
        <p className="kicker py-2 text-[10px] motion-safe:animate-pulse">Checking the sky…</p>
      ) : (
        <button
          type="button"
          onClick={() => load(true)}
          title="Uses your location once to fetch the forecast from Open-Meteo. Nothing leaves your browser otherwise."
          className="kicker py-1 text-[10px] font-semibold text-accent hover:underline"
        >
          {state.kind === "error" ? "Couldn't get it · retry" : "Add your weather"}
        </button>
      )}
    </div>
  );
}

/** Right ear: the cover price, as every front page has one. */
export function PriceEar() {
  return (
    <div className={earClass}>
      <p className="kicker text-[9px] text-muted">Price</p>
      <p className="font-display text-3xl leading-none text-accent">Free</p>
      <p className="kicker text-[9px] text-muted">No ads · No account</p>
    </div>
  );
}
