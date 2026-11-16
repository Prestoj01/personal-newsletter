import type { Metadata } from "next";
import { PageTurn } from "@/components/PageTurn";
import { Reader } from "@/components/Reader";
import { APP_NAME } from "@/lib/config";

export const metadata: Metadata = { title: `Your edition · ${APP_NAME}` };

export default function ReadPage() {
  return (
    <PageTurn>
      <Reader />
    </PageTurn>
  );
}
