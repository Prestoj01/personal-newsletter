import { expect, test } from "@playwright/test";
import { chip, mainEdition, seedPaper } from "./helpers";

test("build a paper, preview it, print it and come back to the same edition", async ({ page }) => {
  await page.goto("/");
  await chip(page, "NFL").click();
  await page.getByPlaceholder(/Taylor Swift/).fill("chiefs");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("button", { name: /Remove Kansas City Chiefs/ })).toBeVisible(); // alias resolved
  await page.getByRole("radio", { name: /Daily/ }).click();

  const preview = page.locator("[data-fly-target]");
  await expect(preview.getByText("All the news on NFL & Kansas City Chiefs", { exact: false })).toBeVisible();

  await page.getByRole("button", { name: /Print my edition/ }).first().click();
  await expect(page.getByRole("status").filter({ hasText: "Printing your edition" })).toBeAttached();
  await page.waitForURL(/\/read\/$/);
  await expect(mainEdition(page).getByText("No. 1")).toBeVisible();
  await expect(mainEdition(page).getByText("Daily edition")).toBeVisible();

  // Reloading the same day shows the same edition, not a new one.
  await page.reload();
  await expect(mainEdition(page).getByText("No. 1")).toBeVisible();
  const editions = await page.evaluate(() => JSON.parse(localStorage.getItem("personal-press:editions") ?? "[]").length);
  expect(editions).toBe(1);
});

test("the kinetic headline adds its topic to the builder", async ({ page }) => {
  await page.goto("/");
  const word = page.getByRole("heading", { level: 1 }).getByRole("button");
  const label = (await word.getAttribute("title"))!.replace(/^Add | to my paper$/g, "");
  await word.click();
  await expect(page.locator("#builder").getByText(label).first()).toBeVisible();
});

test("open a sample paper and make it your own", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /Read a sample/ }).click();
  await expect(page).toHaveURL(/beats=/);
  await expect(mainEdition(page).getByText("Shared paper")).toBeVisible();
  await page.getByRole("button", { name: /Make it my paper/ }).click();
  await page.waitForURL(/\/read\/$/);
  await expect(mainEdition(page).getByText("No. 1")).toBeVisible();
});

test("a shared link rebuilds the exact paper, including free-text topics", async ({ page }) => {
  await page.goto("/read/?beats=kansas-city-chiefs,travis-kelce&run=daily");
  await expect(mainEdition(page).getByText("Travis Kelce catches two touchdowns", { exact: false }).first()).toBeVisible();
  await page.getByRole("link", { name: "Customize it first" }).click();
  await expect(page.getByRole("button", { name: /Remove travis kelce/i })).toBeVisible();
});

test("clip a story into the scrapbook and unclip it", async ({ page }) => {
  await seedPaper(page, ["NBA", "Coffee"]);
  await page.goto("/read/");
  const counter = page.locator("header [data-clippings-target]");
  await expect(counter).toHaveText("0");
  await mainEdition(page).getByRole("button", { name: /^Clip "/ }).first().click();
  await expect(counter).toHaveText("1");
  await expect(mainEdition(page).getByRole("button", { name: /^Unclip "/ })).toHaveCount(1);

  await page.getByRole("link", { name: /Clippings/ }).first().click();
  await page.waitForURL(/clippings/);
  await expect(page.locator("main article")).toHaveCount(1);
  await page.getByRole("button", { name: /^Unclip "/ }).click();
  await expect(page.getByText("Nothing clipped yet")).toBeVisible();
  await expect(counter).toHaveText("0");
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("printing skips the press animation", async ({ page }) => {
    await page.goto("/");
    await chip(page, "Coffee").click();
    const started = Date.now();
    await page.getByRole("button", { name: /Print my edition/ }).first().click();
    await page.waitForURL(/\/read\/$/);
    expect(Date.now() - started).toBeLessThan(1500);
    await expect(mainEdition(page).getByText("No. 1")).toBeVisible();
  });
});
