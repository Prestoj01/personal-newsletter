import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import Link from "next/link";
import { APP_NAME, GITHUB_URL } from "@/lib/config";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${APP_NAME} — a newsletter about exactly what you care about`,
  description: "Pick your interests and hobbies, choose how often, and get a free personalized newsletter with the latest news on just those topics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${newsreader.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
            {APP_NAME}
          </Link>
          <nav className="flex items-center gap-5 text-sm text-muted">
            <Link href="/read/" className="font-medium hover:text-ink">
              My edition
            </Link>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="hover:text-ink">
              GitHub ↗
            </a>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-16 border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:justify-between">
            <p>
              {APP_NAME} is free and open source. Headlines via Google News; every story links to its original publisher.
            </p>
            <p>Built with Next.js, GitHub Actions &amp; GitHub Pages</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
