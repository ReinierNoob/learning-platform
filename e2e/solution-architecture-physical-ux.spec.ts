import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const baseURL = process.env.EAW_UX_BASE_URL ?? '';
const vercelShare = process.env.EAW_UX_VERCEL_SHARE ?? '';
const tokenHash = process.env.EAW_UX_TOKEN_HASH ?? '';
const trainingId = process.env.EAW_UX_TRAINING_ID ?? '25456c47-2a33-4e8e-97af-ab9ac8185953';
const slug = 'solution-architectuur-ontwerppraktijk';
const eawLaunchOrigin = 'https://enterprisearchitectureworks.nl';
const artifactsDir = 'artifacts/solution-architecture-ux';
const screenshotModules = new Set([1, 5, 7, 10]);

type VideoResult = {
  width: number;
  height: number;
  duration: number;
  currentTime: number;
  readyState: number;
  cueCount: number;
  firstCueStart: number | null;
  lastCueEnd: number | null;
  captionSimilarity: number;
};

type ModuleResult = {
  module: number;
  eva: VideoResult;
  alexander: VideoResult;
  horizontalOverflow: number;
  visualLabel: string | null;
};

fs.mkdirSync(artifactsDir, { recursive: true });

function normalizeWords(value: string) {
  return value
    .toLocaleLowerCase('nl-NL')
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function multisetSimilarity(expected: string, actual: string) {
  const expectedWords = normalizeWords(expected);
  const actualWords = normalizeWords(actual);
  const counts = new Map<string, number>();
  for (const word of actualWords) counts.set(word, (counts.get(word) ?? 0) + 1);
  let matched = 0;
  for (const word of expectedWords) {
    const count = counts.get(word) ?? 0;
    if (count > 0) {
      matched += 1;
      counts.set(word, count - 1);
    }
  }
  return expectedWords.length ? matched / expectedWords.length : 0;
}

async function noHorizontalOverflow(page: Page) {
  return page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - window.innerWidth));
}

async function presenterSection(page: Page, name: 'Eva' | 'Alexander') {
  const heading = page.getByRole('heading', { name, exact: true });
  await expect(heading).toBeVisible();
  return heading.locator('xpath=ancestor::section[1]');
}

async function verifyPresenter(page: Page, name: 'Eva' | 'Alexander'): Promise<VideoResult> {
  const section = await presenterSection(page, name);
  const video = section.locator('video');
  await expect(video).toBeVisible();
  await expect(section.locator('track[kind="captions"][srclang="nl"]')).toHaveCount(1);
  const transcript = (await section.locator('details p').innerText()).trim();
  expect(transcript.length).toBeGreaterThan(30);

  const media = await video.evaluate(async (node: HTMLVideoElement) => {
    const waitUntil = async (predicate: () => boolean, timeoutMs = 12000) => {
      const started = Date.now();
      while (!predicate()) {
        if (Date.now() - started > timeoutMs) throw new Error('media_timeout');
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };
    node.muted = true;
    try { await node.play(); } catch {}
    await waitUntil(() => node.readyState >= 2 && Number.isFinite(node.duration) && node.duration > 0);
    await waitUntil(() => node.currentTime > 0.05);
    const track = node.textTracks?.[0];
    if (track) track.mode = 'hidden';
    await waitUntil(() => Boolean(track?.cues && track.cues.length > 0));
    const cues = Array.from(track?.cues ?? []) as VTTCue[];
    return {
      width: node.videoWidth,
      height: node.videoHeight,
      duration: node.duration,
      currentTime: node.currentTime,
      readyState: node.readyState,
      cueCount: cues.length,
      firstCueStart: cues.length ? cues[0].startTime : null,
      lastCueEnd: cues.length ? cues[cues.length - 1].endTime : null,
      captionText: cues.map((cue) => cue.text).join(' '),
    };
  });

  const captionSimilarity = multisetSimilarity(transcript, media.captionText);
  expect(media.width).toBeGreaterThan(0);
  expect(media.height).toBeGreaterThan(0);
  expect(media.duration).toBeGreaterThan(1);
  expect(media.currentTime).toBeGreaterThan(0);
  expect(media.readyState).toBeGreaterThanOrEqual(2);
  expect(media.cueCount).toBeGreaterThan(0);
  expect(media.firstCueStart ?? 999).toBeLessThan(2);
  expect(media.lastCueEnd ?? 0).toBeLessThanOrEqual(media.duration + 1.5);
  expect(captionSimilarity).toBeGreaterThanOrEqual(0.9);

  return {
    width: media.width,
    height: media.height,
    duration: media.duration,
    currentTime: media.currentTime,
    readyState: media.readyState,
    cueCount: media.cueCount,
    firstCueStart: media.firstCueStart,
    lastCueEnd: media.lastCueEnd,
    captionSimilarity,
  };
}

async function diagnoseUnknown(page: Page) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (await page.getByRole('heading', { name: 'Alexander', exact: true }).isVisible().catch(() => false)) return;
    const unknown = page.getByRole('button', { name: /ik weet dit nog niet/i }).first();
    if (await unknown.isVisible().catch(() => false)) {
      await unknown.click();
      await page.waitForTimeout(200);
      continue;
    }
    const radio = page.getByRole('radio').first();
    if (await radio.isVisible().catch(() => false)) {
      await radio.check();
      const next = page.getByRole('button', { name: /volgende|verder|doorgaan|bevestig/i }).first();
      if (await next.isVisible().catch(() => false)) await next.click();
      await page.waitForTimeout(200);
      continue;
    }
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill('Ik weet dit nog niet.');
      const next = page.getByRole('button', { name: /volgende|verder|doorgaan|bevestig|verstuur/i }).first();
      if (await next.isVisible().catch(() => false)) await next.click();
      await page.waitForTimeout(200);
      continue;
    }
    break;
  }
  await expect(page.getByRole('heading', { name: 'Alexander', exact: true })).toBeVisible();
}

async function axeSeriousCritical(page: Page, label: string) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const blocking = results.violations.filter((item) => item.impact === 'serious' || item.impact === 'critical');
  fs.writeFileSync(`${artifactsDir}/axe-${label}.json`, JSON.stringify(results.violations, null, 2));
  expect(blocking, `serious/critical axe violations at ${label}`).toEqual([]);
}

async function copyAuthCookies(source: BrowserContext, target: BrowserContext) {
  const cookies = await source.cookies();
  await target.addCookies(cookies);
}

async function navigateFromDocument(page: Page, targetUrl: string) {
  await page.evaluate((url) => { window.location.href = url; }, targetUrl);
  await expect(page).toHaveURL(targetUrl, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

test('Solution Architecture complete physical learner experience', async ({ browser }) => {
  test.setTimeout(240_000);
  expect(baseURL, 'EAW_UX_BASE_URL must resolve the exact READY PR deployment').not.toBe('');
  expect(vercelShare, 'EAW_UX_VERCEL_SHARE must be a short-lived deployment-scoped share secret').not.toBe('');
  expect(tokenHash, 'EAW_UX_TOKEN_HASH must be provided by OIDC bootstrap').not.toBe('');

  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await desktop.newPage();
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  // Establish Vercel protection bypass against an application endpoint that must
  // remain fail-closed without an EAW session. A 401 proves the request reached
  // the exact preview while avoiding root-page navigation semantics.
  const bypassProbe = await page.goto(
    `${baseURL}/api/presenter-media/1/eva?_vercel_share=${encodeURIComponent(vercelShare)}`,
    { waitUntil: 'networkidle' },
  );
  expect(new URL(page.url()).hostname).toBe(new URL(baseURL).hostname);
  expect(bypassProbe?.status(), 'Vercel bypass probe must reach fail-closed presenter API').toBe(401);

  // Reproduce the real EAW launch boundary instead of entering the handoff from
  // the address bar. The learning proxy intentionally rejects Sec-Fetch-Site:none
  // on /leren/*, while the real launch originates cross-site from EAW.
  await page.goto(eawLaunchOrigin, { waitUntil: 'domcontentloaded' });
  expect(new URL(page.url()).hostname).toBe('enterprisearchitectureworks.nl');
  const handoff = `${baseURL}/auth/handoff?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&training_id=${encodeURIComponent(trainingId)}&next=${encodeURIComponent(`/leren/${slug}/module/1`)}`;
  await navigateFromDocument(page, handoff);
  await expect(page).toHaveURL(new RegExp(`/leren/${slug}/module/1$`), { timeout: 15000 });

  const moduleResults: ModuleResult[] = [];
  for (let module = 1; module <= 10; module += 1) {
    const moduleUrl = `${baseURL}/leren/${slug}/module/${module}`;
    if (module > 1) await navigateFromDocument(page, moduleUrl);
    else await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(moduleUrl);
    await expect(page.locator('h1')).toBeVisible();
    const overflowStart = await noHorizontalOverflow(page);
    expect(overflowStart, `module ${module} desktop overflow before diagnosis`).toBe(0);
    const eva = await verifyPresenter(page, 'Eva');
    await diagnoseUnknown(page);
    await page.waitForLoadState('networkidle');
    const alexander = await verifyPresenter(page, 'Alexander');
    const visual = page.locator('section[aria-label]').filter({ hasNot: page.locator('video') }).first();
    const visualLabel = await visual.getAttribute('aria-label').catch(() => null);
    expect(visualLabel, `module ${module} semantic visual missing`).toBeTruthy();
    const overflowEnd = await noHorizontalOverflow(page);
    expect(overflowEnd, `module ${module} desktop overflow after diagnosis`).toBe(0);

    if (screenshotModules.has(module)) {
      await page.screenshot({ path: `${artifactsDir}/desktop-module-${module}.png`, fullPage: true });
    }
    moduleResults.push({ module, eva, alexander, horizontalOverflow: Math.max(overflowStart, overflowEnd), visualLabel });
  }

  await navigateFromDocument(page, `${baseURL}/leren/${slug}/module/1`);
  await axeSeriousCritical(page, 'desktop-module-1-eva');
  await diagnoseUnknown(page);
  await axeSeriousCritical(page, 'desktop-module-1-alexander');

  const focusTrail: string[] = [];
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab');
    focusTrail.push(await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return [el?.tagName, el?.getAttribute('aria-label'), el?.textContent?.trim().slice(0, 80)].filter(Boolean).join(':');
    }));
  }
  expect(focusTrail.filter(Boolean).length).toBeGreaterThan(3);

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  await copyAuthCookies(desktop, mobile);
  const mobilePage = await mobile.newPage();
  await mobilePage.goto(eawLaunchOrigin, { waitUntil: 'domcontentloaded' });
  expect(new URL(mobilePage.url()).hostname).toBe('enterprisearchitectureworks.nl');
  await navigateFromDocument(mobilePage, `${baseURL}/leren/${slug}/module/1`);
  await expect(mobilePage.getByRole('heading', { name: 'Eva', exact: true })).toBeVisible();
  expect(await noHorizontalOverflow(mobilePage)).toBe(0);
  const actionTargets = mobilePage.locator('button:visible, a:visible, summary:visible');
  const targetCount = await actionTargets.count();
  for (let index = 0; index < targetCount; index += 1) {
    const box = await actionTargets.nth(index).boundingBox();
    if (box) expect(box.height, `mobile target ${index} height`).toBeGreaterThanOrEqual(44);
  }
  await axeSeriousCritical(mobilePage, 'mobile-module-1-eva');
  await mobilePage.screenshot({ path: `${artifactsDir}/mobile-module-1-eva.png`, fullPage: true });
  await diagnoseUnknown(mobilePage);
  await expect(mobilePage.getByRole('heading', { name: 'Alexander', exact: true })).toBeVisible();
  expect(await noHorizontalOverflow(mobilePage)).toBe(0);
  await axeSeriousCritical(mobilePage, 'mobile-module-1-alexander');
  await mobilePage.screenshot({ path: `${artifactsDir}/mobile-module-1-alexander.png`, fullPage: true });

  fs.writeFileSync(`${artifactsDir}/physical-ux-summary.json`, JSON.stringify({
    baseURL,
    modules: moduleResults,
    focusTrail,
    consoleErrors,
    pageErrors,
    automatedAccessibilityScope: 'Chromium + axe WCAG 2.0/2.1/2.2 serious/critical. This is not a real VoiceOver/NVDA session.',
  }, null, 2));

  expect(consoleErrors, 'browser console errors').toEqual([]);
  expect(pageErrors, 'browser page errors').toEqual([]);

  await mobile.close();
  await desktop.close();
});