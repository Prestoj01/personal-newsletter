import "server-only";

/**
 * Minimal database layer.
 *  - Production: any Postgres via DATABASE_URL (Neon / Supabase free tiers work great).
 *  - Local dev: if DATABASE_URL is unset, an embedded Postgres (PGlite) is stored in ./.data,
 *    so the app runs with zero setup.
 */
export interface Db {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS subscribers (
  id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email                 TEXT NOT NULL UNIQUE,
  topics                JSONB NOT NULL,
  frequency             TEXT NOT NULL,
  token                 TEXT NOT NULL UNIQUE,
  confirmed_at          TIMESTAMPTZ,
  unsubscribed_at       TIMESTAMPTZ,
  confirmation_sent_at  TIMESTAMPTZ,
  last_sent_at          TIMESTAMPTZ,
  next_send_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS subscribers_due_idx
  ON subscribers (next_send_at)
  WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL;
`;

async function createDb(): Promise<Db> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const { default: postgres } = await import("postgres");
    // prepare:false keeps us compatible with transaction-mode poolers (Neon/Supabase pooled URLs).
    const sql = postgres(url, { prepare: false, max: 3, idle_timeout: 20 });
    const db: Db = {
      query: async (text, params = []) =>
        (await sql.unsafe(text, params as never[])) as unknown as never[],
    };
    for (const stmt of SCHEMA.split(";").map((s) => s.trim()).filter(Boolean)) {
      await sql.unsafe(stmt);
    }
    return db;
  }

  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    throw new Error("DATABASE_URL is not set. Add a Postgres connection string in your Vercel project settings.");
  }

  const { mkdir } = await import("node:fs/promises");
  await mkdir("./.data", { recursive: true });
  const { PGlite } = await import("@electric-sql/pglite");
  const pg = new PGlite("./.data/pglite");
  await pg.exec(SCHEMA);
  return {
    query: async (text, params = []) => (await pg.query(text, params)).rows as never[],
  };
}

const globalForDb = globalThis as unknown as { __db?: Promise<Db> };

export function getDb(): Promise<Db> {
  if (!globalForDb.__db) {
    globalForDb.__db = createDb().catch((err) => {
      globalForDb.__db = undefined;
      throw err;
    });
  }
  return globalForDb.__db;
}
