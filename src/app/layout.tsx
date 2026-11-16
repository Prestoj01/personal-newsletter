import type { Metadata } from "next";
import { Anton, Newsreader, Oswald, UnifrakturCook } from "next/font/google";
import Link from "next/link";
import { Dateline } from "@/components/Dateline";
import { Ticker } from "@/components/Ticker";
import { APP_NAME, GITHUB_URL } from "@/lib/config";
import "./globals.css";

const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], axes: ["opsz"] });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });
const unifraktur = UnifrakturCook({ variable: "--font-unifraktur", subsets: ["latin"], weight: "700" });

export const metadata: Metadata = {
  title: `${APP_NAME}: a free newspaper about your teams, hobbies and interests`,
  description: "Pick your interests and hobbies, choose how often, and get a free personal newspaper with the latest headlines on just those topics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${newsreader.variable} ${anton.variable} ${oswald.variable} ${unifraktur.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="mx-auto w-full max-w-6xl px-6">
          <div className="kicker flex items-center justify-between gap-4 py-2 text-[11px] text-muted">
            <span>Vol. I</span>
            <span className="hidden sm:inline">
              <Dateline />
            </span>
            <span>Price: Free</span>
          </div>
          <div className="rule-double" />
          <div className="flex items-center justify-between py-3">
            <Link href="/" className="font-nameplate text-3xl leading-none">
              {APP_NAME}
            </Link>
            <nav className="kicker flex items-center gap-5 text-xs">
              <Link href="/read/" className="hover:text-accent">
                My edition
              </Link>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-accent">
                GitHub ↗
              </a>
            </nav>
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl px-6">
          <Ticker />
        </div>
        <main className="flex-1">{children}</main>
        <footer className="mx-auto mt-16 w-full max-w-6xl px-6">
          <div className="rule-double" />
          <div className="flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:justify-between">
            <p>
              <span className="font-nameplate text-base text-ink">{APP_NAME}</span> is free and open source. Headlines via Google News; every
              story links to its original publisher.
            </p>
            <p className="kicker text-xs">Built with Next.js, GitHub Actions &amp; GitHub Pages</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
