import type { Page } from "@playwright/test";

/** Seed a reader's saved paper (localStorage) before the app loads. */
export async function seedPaper(page: Page, topics: string[], frequency = "weekly") {
  await page.addInitScript(
    ([t, f]) => {
      if (!localStorage.getItem("personal-press:prefs")) {
        const d = new Date();
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        localStorage.setItem("personal-press:prefs", JSON.stringify({ topics: t, frequency: f, startedAt: key }));
      }
    },
    [topics, frequency] as const,
  );
}

/** A topic chip by its label (chips lead with an emoji, which is part of their accessible name). */
export const chip = (page: Page, label: string) =>
  page.getByRole("button", { name: new RegExp(`^[^\\p{L}\\p{N}]*${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "u") });

/** The newspaper edition rendered in the main reading area (not the preview). */
export const mainEdition = (page: Page) => page.locator("main article").first();
