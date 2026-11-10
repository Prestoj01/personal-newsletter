# Personal Press

**A free, personalized newsletter about exactly the things you care about. It runs entirely on GitHub Pages.**

Pick your interests and hobbies from 40+ topic chips, or type in anything else: a team, a person, a company, a hobby. Then choose daily, weekly, biweekly, or monthly. Personal Press prints a new edition of the latest headlines for those topics on your schedule and keeps an archive of past editions.

- **Live preview.** As you pick topics, you see a real edition built from current news.
- **No account, no email, no server.** Your picks and past editions live in your browser.
- **Calendar reminders.** One click downloads a recurring `.ics` reminder that matches your frequency.
- **Costs $0 to run.** It's a static site, and the headlines are refreshed by a scheduled GitHub Action.

## How it works

```
GitHub Actions (every 6 hours)
  └─ scripts/fetch-news.ts ── Google News RSS ──► public/data/topics/*.json  (one small file per topic)
                                                  public/data/search.json    (title index for free-text topics)
  └─ next build (static export) ──► GitHub Pages

Browser
  └─ downloads only the selected topics' files ──► builds the edition ──► saves it in localStorage
```

Browsers can't call Google News directly because it doesn't allow cross-origin requests. Instead, the deploy workflow fetches headlines on the server side, about 500 feeds per run, and publishes them as static JSON next to the site.

| Piece | Where |
| --- | --- |
| Topic chips, searchable catalog, aliases | `src/lib/topics.ts` |
| Headline fetching (runs in CI) | `scripts/fetch-news.ts` |
| Loading data and matching free-text topics in the browser | `src/lib/sources.ts` |
| Building an edition and de-duplicating stories | `src/lib/edition.ts` |
| Edition schedule (daily, weekly, biweekly, monthly) | `src/lib/frequency.ts` |
| Saved preferences and edition archive | `src/lib/storage.ts` |
| UI | `src/components/`, `src/app/` |

### Design notes

- **Small downloads.**
  - Each known topic has its own file of about 7 KB gzipped, so a reader downloads only the topics they picked.
  - Free-text topics first search a title-only index, then fetch just the topic files that hold the matching stories.
  - Google News article URLs are stored in compressed form.
- **About 165 known topics.**
  - Besides the chips, a searchable catalog (teams, companies, people, franchises, hobbies) has dedicated feeds.
  - Aliases map to the full topic, so typing "chiefs" gives you **Kansas City Chiefs**.
  - Anything else matches against roughly 5,000 recent headlines.
- **Editions follow a schedule.** Editions are counted from the day you start, so a weekly reader sees the same issue all week. A new one is printed on the next publish day and the old one moves to the archive. Changing your topics or frequency starts a fresh edition.
- **Freshness checks.** Each section prefers the feed window that matches the reader's frequency (1, 7, or 30 days) and drops stories older than that window. A story that fits several topics appears only once.
- **Failure handling.**
  - If a feed fails during a refresh, the workflow reuses the copy that's currently live.
  - If too many feeds fail, the workflow refuses to publish.
  - GitHub pauses scheduled workflows after 60 days of repo inactivity, so the workflow makes an empty commit when needed to keep the schedule running.

## Run it locally

```bash
npm install
npm run dev      # fetches headlines on first run, then opens http://localhost:3000
```

Run `npm run fetch-news` any time to refresh the local headlines.

## Deploy to GitHub Pages

1. Push to `main`.
2. In the repo, go to **Settings → Pages → Build and deployment** and set the source to **GitHub Actions**.
3. The **Refresh news & deploy** workflow builds and publishes the site at `https://<user>.github.io/personal-newsletter/`. It then re-runs every 6 hours to refresh the headlines. You can also run it by hand from the **Actions** tab.

You don't need any accounts, API keys, or secrets.

## Tech

Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS 4, GitHub Actions, and GitHub Pages.

Headlines come from Google News RSS, and every story links to its original publisher.
