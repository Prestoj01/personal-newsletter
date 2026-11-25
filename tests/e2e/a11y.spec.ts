import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { mainEdition, seedPaper } from "./helpers";

/** Fail on serious or critical WCAG A/AA violations; report everything else. */
async function audit(page: import("@playwright/test").Page) {
  // Let entrance animations settle so axe measures final colors.
  await page.waitForTimeout(1200);
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
}

test.use({ reducedMotion: "reduce" });

test("home page has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-fly-target] article")).toBeVisible();
  await audit(page);
});

test("reader has no serious accessibility violations", async ({ page }) => {
  await seedPaper(page, ["NBA", "Coffee", "Space Exploration"]);
  await page.goto("/read/");
  await expect(mainEdition(page).getByText("No. 1")).toBeVisible();
  await audit(page);
});

test("scrapbook has no serious accessibility violations", async ({ page }) => {
  await seedPaper(page, ["NBA"]);
  await page.goto("/read/");
  await mainEdition(page).getByRole("button", { name: /^Clip "/ }).first().click();
  await page.goto("/clippings/");
  await expect(page.locator("main article")).toHaveCount(1);
  await audit(page);
});

test("empty reader has no serious accessibility violations", async ({ page }) => {
  await page.goto("/read/");
  await expect(page.getByText("No paper today")).toBeVisible();
  await audit(page);
});

test.describe("night edition", () => {
  test.use({ colorScheme: "dark" });

  test("home page has no serious accessibility violations", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "night");
    await expect(page.locator("[data-fly-target] article")).toBeVisible();
    await audit(page);
  });

  test("reader has no serious accessibility violations", async ({ page }) => {
    await seedPaper(page, ["NBA", "Coffee"]);
    await page.goto("/read/");
    await expect(mainEdition(page).getByText("No. 1")).toBeVisible();
    await audit(page);
  });
});
