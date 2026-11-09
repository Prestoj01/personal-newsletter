import "server-only";
import { randomBytes } from "node:crypto";
import { getDb } from "./db";
import { nextSendAt, type Frequency } from "./frequency";

export interface Subscriber {
  id: string;
  email: string;
  topics: string[];
  frequency: Frequency;
  token: string;
  confirmed_at: Date | null;
  unsubscribed_at: Date | null;
  confirmation_sent_at: Date | null;
  last_sent_at: Date | null;
  next_send_at: Date | null;
}

const newToken = () => randomBytes(24).toString("base64url");

function hydrate(row: Subscriber): Subscriber {
  // jsonb comes back parsed from both drivers, but be defensive.
  const topics = typeof row.topics === "string" ? JSON.parse(row.topics) : row.topics;
  return { ...row, id: String(row.id), topics };
}

export async function findByEmail(email: string) {
  const db = await getDb();
  const [row] = await db.query<Subscriber>("SELECT * FROM subscribers WHERE email = $1", [email]);
  return row ? hydrate(row) : null;
}

export async function findByToken(token: string) {
  if (!token || token.length > 100) return null;
  const db = await getDb();
  const [row] = await db.query<Subscriber>("SELECT * FROM subscribers WHERE token = $1", [token]);
  return row ? hydrate(row) : null;
}

/** Create a pending subscriber, or reset an unconfirmed/unsubscribed one with new preferences. */
export async function upsertPending(email: string, topics: string[], frequency: Frequency) {
  const db = await getDb();
  const [row] = await db.query<Subscriber>(
    `INSERT INTO subscribers (email, topics, frequency, token)
     VALUES ($1, $2::jsonb, $3, $4)
     ON CONFLICT (email) DO UPDATE SET
       topics = EXCLUDED.topics,
       frequency = EXCLUDED.frequency,
       confirmed_at = NULL,
       unsubscribed_at = NULL,
       next_send_at = NULL
     RETURNING *`,
    [email, JSON.stringify(topics), frequency, newToken()],
  );
  return hydrate(row);
}

export async function markConfirmationSent(id: string) {
  const db = await getDb();
  await db.query("UPDATE subscribers SET confirmation_sent_at = now() WHERE id = $1", [id]);
}

/** Confirm a pending subscriber. Returns null if it was already active (e.g. a double-clicked link). */
export async function confirm(id: string) {
  const db = await getDb();
  const [row] = await db.query<Subscriber>(
    `UPDATE subscribers SET confirmed_at = now(), unsubscribed_at = NULL
     WHERE id = $1 AND (confirmed_at IS NULL OR unsubscribed_at IS NOT NULL)
     RETURNING *`,
    [id],
  );
  return row ? hydrate(row) : null;
}

export async function updatePreferences(id: string, topics: string[], frequency: Frequency) {
  const db = await getDb();
  const [row] = await db.query<Subscriber>(
    `UPDATE subscribers SET topics = $2::jsonb, frequency = $3,
       next_send_at = CASE WHEN frequency = $3 THEN next_send_at ELSE $4 END
     WHERE id = $1 RETURNING *`,
    [id, JSON.stringify(topics), frequency, nextSendAt(frequency)],
  );
  return hydrate(row);
}

export async function unsubscribe(id: string) {
  const db = await getDb();
  await db.query("UPDATE subscribers SET unsubscribed_at = now(), next_send_at = NULL WHERE id = $1", [id]);
}

export async function resubscribe(id: string, frequency: Frequency) {
  const db = await getDb();
  await db.query(
    "UPDATE subscribers SET unsubscribed_at = NULL, next_send_at = $2 WHERE id = $1",
    [id, nextSendAt(frequency)],
  );
}

/**
 * Atomically claim subscribers whose issue is due by pushing their next_send_at forward.
 * Overlapping cron runs can never pick the same subscriber twice.
 */
export async function claimDue(limit: number) {
  const db = await getDb();
  const rows = await db.query<Subscriber & { previous_next_send_at: Date }>(
    `WITH due AS (
       SELECT id, next_send_at FROM subscribers
       WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL
         AND next_send_at IS NOT NULL AND next_send_at <= now()
       ORDER BY next_send_at
       LIMIT $1
       FOR UPDATE SKIP LOCKED
     )
     UPDATE subscribers s SET next_send_at = now() + interval '20 hours'
     FROM due WHERE s.id = due.id
     RETURNING s.*, due.next_send_at AS previous_next_send_at`,
    [limit],
  );
  return rows.map((r) => ({ ...hydrate(r), previous_next_send_at: r.previous_next_send_at }));
}

export async function recordSent(id: string, frequency: Frequency) {
  const db = await getDb();
  await db.query("UPDATE subscribers SET last_sent_at = now(), next_send_at = $2 WHERE id = $1", [
    id,
    nextSendAt(frequency),
  ]);
}

export async function releaseClaim(id: string, previous: Date) {
  const db = await getDb();
  await db.query("UPDATE subscribers SET next_send_at = $2 WHERE id = $1", [id, previous]);
}
