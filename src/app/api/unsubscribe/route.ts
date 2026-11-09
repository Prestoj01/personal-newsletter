import { findByToken, unsubscribe } from "@/lib/subscribers";

/**
 * POST only (never GET) so email link scanners can't unsubscribe people by accident.
 * Accepts the token in the query string (RFC 8058 one-click unsubscribe from mail clients)
 * or in a JSON body (the manage page).
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  let token = url.searchParams.get("token") ?? "";
  if (!token && request.headers.get("content-type")?.includes("application/json")) {
    const body = await request.json().catch(() => null);
    token = typeof body?.token === "string" ? body.token : "";
  }

  const sub = await findByToken(token);
  if (!sub) return Response.json({ error: "This link is invalid or has expired." }, { status: 404 });
  await unsubscribe(sub.id);
  return Response.json({ ok: true });
}
