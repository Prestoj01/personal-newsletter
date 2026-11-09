# Personal Press

**A free, personalized newsletter about exactly the things you care about.**

Pick your interests and hobbies from 40+ topics, or type in your own (a team, a band, a company, a hobby). Choose daily, weekly, biweekly, or monthly. Personal Press collects the latest headlines for each topic and emails them to you as one clean issue on your schedule.

- **Live preview.** Before subscribing, you see a real issue built from today's news.
- **No accounts or passwords.** Signup uses a double opt-in email. Every issue has a link to change your preferences, plus one-click unsubscribe (RFC 8058).
- **Costs $0 to run.** Every service it uses has a permanent free tier.

## How it works

```
Browser ──► Next.js on Vercel ──► Postgres (Neon free tier)
                 │
                 ├─► Google News RSS (per-topic search, no API key)
                 └─► SMTP (Gmail app password, 500 emails/day free)

Vercel Cron (daily, 12:00 UTC) ──► /api/cron/send ──► sends every issue that's due
```

| Piece | Where |
| --- | --- |
| Topic and frequency picker, live preview | `src/components/` |
| News fetching, de-duplication, caching | `src/lib/news.ts` |
| Email templates (newsletter, confirmation) | `src/lib/templates.ts` |
| Scheduling and delivery | `src/lib/delivery.ts`, `src/lib/frequency.ts` |
| Database (Postgres in prod, embedded PGlite locally) | `src/lib/db.ts`, `src/lib/subscribers.ts` |
| API routes | `src/app/api/{preview,subscribe,preferences,unsubscribe,cron/send}` |

### Design notes

- **Exactly-once delivery.** The cron handler claims due subscribers with one `UPDATE … FOR UPDATE SKIP LOCKED`. If two runs overlap, they can't send the same person two issues. A failed send releases the claim so the subscriber is retried on the next run.
- **Schedule snapping.** `next_send_at` is snapped to midnight UTC. A once-a-day cron then delivers on the due day regardless of what time someone signed up.
- **Abuse resistance.**
  - The signup form has a honeypot field and a per-address cooldown.
  - The subscribe endpoint gives the same response whether or not an email is already subscribed.
  - An existing subscriber's preferences are never overwritten from the public form; they get a "manage" link by email instead.
  - Unsubscribing only happens over POST, so email link scanners can't trigger it.
- **News fetching.** Each topic is fetched once per run and cached in memory, and the same story is removed when it matches several topics.

## Run it locally

You don't need a database or email account for local development.

```bash
npm install
npm run dev
```

Open http://localhost:3000. Locally:

- Data is stored in an embedded Postgres (PGlite) under `.data/`.
- Emails aren't sent. They're saved to `.data/outbox/*.html`, and their links (confirm, manage) are printed in the terminal.

To trigger a delivery run by hand:

```bash
CRON_SECRET=dev npm run dev
curl -H "Authorization: Bearer dev" http://localhost:3000/api/cron/send
```

## Deploy for free

1. **Database.** Create a free project at [neon.tech](https://neon.tech) and copy the **pooled** connection string. The table is created automatically on first use.
2. **Email.** Use a dedicated Gmail account (recommended) and turn on 2-step verification. Then create an [App Password](https://myaccount.google.com/apppasswords).
3. **Hosting.** Import this repo at [vercel.com/new](https://vercel.com/new) on the Hobby plan and add these environment variables (see `.env.example`):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Neon pooled connection string |
   | `SMTP_HOST` / `SMTP_PORT` | `smtp.gmail.com` / `465` |
   | `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | Gmail address / app password / Gmail address |
   | `CRON_SECRET` | Any long random string (`openssl rand -hex 32`) |
   | `SITE_URL` | Optional. Your custom domain, if you add one. |

4. Deploy. `vercel.json` registers the daily cron automatically.

Any SMTP provider works in place of Gmail, for example Brevo's free tier (300 emails/day).

## Tech

Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS 4, Postgres (`postgres` and PGlite), Nodemailer, and `fast-xml-parser`.

Headlines come from Google News RSS, and every story links to its original publisher.
