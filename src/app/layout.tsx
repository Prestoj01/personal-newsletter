import type { Metadata } from "next";
import { Anton, Newsreader, Oswald, UnifrakturCook } from "next/font/google";
import Link from "next/link";
import { ClippingsLink } from "@/components/ClippingsLink";
import { Dateline } from "@/components/Dateline";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Ticker } from "@/components/Ticker";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import { SOCIAL_CARD_ALT } from "@/lib/brand-images";
import { APP_NAME, BASE_PATH, GITHUB_URL, SITE_URL } from "@/lib/config";
import "./globals.css";

const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], axes: ["opsz"] });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });
const unifraktur = UnifrakturCook({ variable: "--font-unifraktur", subsets: ["latin"], weight: "700" });

const DESCRIPTION = "Pick your interests and hobbies, choose how often, and get a free personal newspaper with the latest headlines on just those topics.";

export const metadata: Metadata = {
  // Absolute base for social-card URLs (GitHub Pages serves under /personal-newsletter).
  metadataBase: new URL(`${SITE_URL}/`),
  title: `${APP_NAME}: a free newspaper about your teams, hobbies and interests`,
  description: DESCRIPTION,
  icons: {
    icon: [{ url: `${BASE_PATH}/brand/icon.png`, type: "image/png", sizes: "64x64" }],
    apple: [{ url: `${BASE_PATH}/brand/apple-icon.png`, sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME}: the news you care about, nothing else`,
    description: DESCRIPTION,
    images: [{ url: "brand/social-card.png", width: 1200, height: 630, alt: SOCIAL_CARD_ALT }],
  },
  twitter: { card: "summary_large_image", images: ["brand/social-card.png"] },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning // data-theme is set by the boot script before React hydrates
      className={`${newsreader.variable} ${anton.variable} ${oswald.variable} ${unifraktur.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <header className="mx-auto w-full max-w-6xl px-6 [view-transition-name:site-header] print:hidden">
          <div className="kicker flex items-center justify-between gap-4 py-2 text-[11px] text-muted">
            <span>Vol. I</span>
            <span className="hidden sm:inline">
              <Dateline />
            </span>
            <span>Price: Free</span>
          </div>
          <div className="rule-double intro-rule" />
          <div className="flex items-center justify-between py-3">
            <Link href="/" transitionTypes={["nav-back"]} className="intro-stamp whitespace-nowrap font-nameplate text-2xl leading-none sm:text-3xl">
              {APP_NAME}
            </Link>
            <nav className="kicker flex items-center gap-4 text-xs sm:gap-5">
              <Link href="/read/" transitionTypes={["nav-forward"]} className="hover:text-accent">
                <span className="hidden sm:inline">My edition</span>
                <span className="sm:hidden">Edition</span>
              </Link>
              <ClippingsLink />
              <ThemeToggle />
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hidden hover:text-accent sm:inline">
                GitHub ↗
              </a>
            </nav>
          </div>
        </header>
        <div className="mx-auto w-full max-w-6xl px-6 [view-transition-name:site-ticker] print:hidden">
          <Ticker />
        </div>
        {/* Compact masthead that slides in once the main one scrolls away (scroll-driven CSS). */}
        <div className="sticky-masthead fixed inset-x-0 top-0 z-40 print:hidden border-b-4 border-double border-ink bg-paper/95 backdrop-blur" aria-hidden>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2">
            <Link href="/" transitionTypes={["nav-back"]} tabIndex={-1} className="font-nameplate text-2xl leading-none">
              {APP_NAME}
            </Link>
            <span className="kicker hidden text-[11px] text-muted sm:inline">
              <Dateline />
            </span>
            <span className="kicker flex items-center gap-5 text-xs">
              <ClippingsLink tabIndex={-1} />
              <ThemeToggle compact tabIndex={-1} />
              <Link href="/read/" transitionTypes={["nav-forward"]} tabIndex={-1} className="hover:text-accent">
                My edition →
              </Link>
            </span>
          </div>
        </div>
        <main className="flex-1">{children}</main>
        <footer className="mx-auto mt-16 w-full max-w-6xl px-6 print:hidden">
          <div className="rule-double" />
          <div className="flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:justify-between">
            <p>
              <span className="font-nameplate text-base text-ink">{APP_NAME}</span> is free and open source. Headlines via Google News; every
              story links to its original publisher.
            </p>
            <p className="kicker text-xs">
              Built with Next.js, GitHub Actions &amp; GitHub Pages
              {/* The header hides its GitHub link on phones; it lives here instead. */}
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="mt-2 block text-ink hover:text-accent sm:hidden">
                Source on GitHub ↗
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
