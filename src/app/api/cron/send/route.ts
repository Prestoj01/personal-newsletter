import { connection } from "next/server";
import { runDueDeliveries } from "@/lib/delivery";

export const maxDuration = 60;

/** Triggered once a day by Vercel Cron (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  await connection();
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await runDueDeliveries();
  console.log("[cron] run complete", summary);
  return Response.json(summary);
}
