import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";

const baseURL = process.env.EAW_UX_BASE_URL ?? "";
const vercelShare = process.env.EAW_UX_VERCEL_SHARE ?? "";
const tokenHash = process.env.EAW_UX_TOKEN_HASH ?? "";
const trainingId = process.env.EAW_UX_TRAINING_ID ?? "";
const slug = "togaf-business-architecture-readiness";
const launchOrigin = "https://enterprisearchitectureworks.nl";
const artifactsDir = "artifacts/togaf-business-architecture-rc2";

fs.mkdirSync(artifactsDir, { recursive: true });

async function noHorizontalOverflow(page: Page) {
  return page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
}

async function axeSeriousCritical(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const blocking = results.violations.filter((item) => item.impact === "serious" || item.impact === "critical");
  fs.writeFileSync(`${artifactsDir}/axe-${label}.json`, JSON.stringify(results.violations, null, 2));
  expect(blocking, `serious/critical axe violations at ${label}`).toEqual([]);
}

async function copyAuthCookies(source: BrowserContext, target: BrowserContext) {
  await target.addCookies(await source.cookies());
}

async function navigateFromDocument(page: Page, target: string) {
  await page.evaluate((url) => { window.location.href = url; }, target);
  await expect(page).toHaveURL(target, { timeout: 20_000 });
  await page.waitForLoadState("networkidle");
}

test("TOGAF Business Architecture rc2 complete learner route", async ({ browser }) => {
  test.setTimeout(360_000);
  expect(baseURL).not.toBe("");
  expect(vercelShare).not.toBe("");
  expect(tokenHash).not.toBe("");
  expect(trainingId).not.toBe("");

  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const probe = await page.goto(`${baseURL}/api/grade-quiz/1?_vercel_share=${encodeURIComponent(vercelShare)}`);
  expect(probe?.status()).toBe(405);
  consoleErrors.length = 0;

  await page.goto(launchOrigin, { waitUntil: "domcontentloaded" });
  const handoff = `${baseURL}/auth/handoff?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&training_id=${encodeURIComponent(trainingId)}&next=${encodeURIComponent(`/leren/${slug}`)}`;
  await page.evaluate((url) => { window.location.href = url; }, handoff);
  await expect(page).toHaveURL(new RegExp(`/leren/${slug}$`), { timeout: 20_000 });
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: /TOGAF.*Business Architecture/i })).toBeVisible();
  await expect(page.locator(".moduleTiles .learningTile")).toHaveCount(8);
  expect(await noHorizontalOverflow(page)).toBe(0);
  await axeSeriousCritical(page, "desktop-course");

  const moduleEvidence: Array<{ module: number; chapters: number; questions: number }> = [];
  for (let module = 1; module <= 8; module += 1) {
    await navigateFromDocument(page, `${baseURL}/leren/${slug}/module/${module}`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText("togaf-ba-rc2-consolidated-2026-09-03", { exact: false })).toBeVisible();
    const chapters = page.locator(".chapterTiles .chapterTile");
    const questions = page.locator(".quiz .question");
    const chapterCount = await chapters.count();
    const questionCount = await questions.count();
    expect(chapterCount).toBeGreaterThanOrEqual(9);
    expect(questionCount).toBeGreaterThanOrEqual(3);
    expect(await noHorizontalOverflow(page)).toBe(0);

    await chapters.first().click();
    await page.waitForLoadState("networkidle");
    await expect(page.locator("article.lessonContent .markdownBody")).not.toBeEmpty();
    await expect(page.getByRole("alert").filter({ hasText: /video/i })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Chat met Alexander" })).toBeVisible();

    await navigateFromDocument(page, `${baseURL}/leren/${slug}/module/${module}`);
    for (const question of await page.locator(".quiz .question").all()) {
      await question.getByRole("radio").first().check();
    }
    await page.getByRole("button", { name: "Controleer antwoorden en registreer voortgang" }).click();
    await expect(page.getByText("Je antwoorden zijn verwerkt in je voortgang.")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(".quiz .question .success, .quiz .question .error")).toHaveCount(questionCount);
    await expect(page.locator(".quiz .question .success, .quiz .question .error").filter({ hasText: /^(Juist|Niet juist)\./ })).toHaveCount(questionCount);
    moduleEvidence.push({ module, chapters: chapterCount, questions: questionCount });
  }

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  await copyAuthCookies(desktop, mobile);
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(launchOrigin, { waitUntil: "domcontentloaded" });
  await navigateFromDocument(mobilePage, `${baseURL}/leren/${slug}/module/5`);
  expect(await noHorizontalOverflow(mobilePage)).toBe(0);
  await axeSeriousCritical(mobilePage, "mobile-module-5");
  await mobilePage.screenshot({ path: `${artifactsDir}/mobile-module-5.png`, fullPage: true });

  fs.writeFileSync(`${artifactsDir}/summary.json`, JSON.stringify({
    baseURL,
    modules: moduleEvidence,
    consoleErrors,
    pageErrors,
    automatedAccessibilityScope: "Chromium + axe; geen menselijke VoiceOver/NVDA-test.",
  }, null, 2));
  expect(moduleEvidence.reduce((sum, item) => sum + item.questions, 0)).toBe(40);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);

  await mobile.close();
  await desktop.close();
});
