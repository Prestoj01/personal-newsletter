import type { Metadata } from "next";
import { PageTurn } from "@/components/PageTurn";
import { Scrapbook } from "@/components/Scrapbook";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = { title: `Clippings · ${APP_NAME}` };

export default function ClippingsPage() {
  return (
    <PageTurn>
      <Scrapbook />
    </PageTurn>
  );
}
