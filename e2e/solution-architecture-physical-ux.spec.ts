import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const baseURL = process.env.EAW_UX_BASE_URL ?? '';
const vercelShare = process.env.EAW_UX_VERCEL_SHARE ?? '';
const tokenHash = process.env.EAW_UX_TOKEN_HASH ?? '';
const trainingId = process.env.EAW_UX_TRAINING_ID ?? '25456c47-2a33-4e8e-97af-ab9ac8185953';
const slug = 'solution-architectuur-ontwerppraktijk';
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
        if (Date.now() - started > timeoutMs) throw new Error('media_wait_timeout');
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };
    await waitUntil(() => node.readyState >= 1 && Number.isFinite(node.duration) && node.duration > 0);
    const track = node.textTracks[0];
    if (!track) throw new Error('captions_track_missing');
    track.mode = 'hidden';
    await waitUntil(() => (track.cues?.length ?? 0) > 0);
    node.muted = true;
    await node.play();
    const startedAt = node.currentTime;
    await waitUntil(() => node.currentTime > startedAt + 0.35, 8000);
    node.pause();
    const cues = Array.from(track.cues ?? []).map((cue) => ({
      start: cue.startTime,
      end: cue.endTime,
      text: 'text' in cue ? String((cue as VTTCue).text) : '',
    }));
    return {
      width: node.videoWidth,
      height: node.videoHeight,
      duration: node.duration,
      currentTime: node.currentTime,
      readyState: node.readyState,
      cues,
      errorCode: node.error?.code ?? null,
    };
  });

  expect(media.errorCode).toBeNull();
  expect(media.width).toBeGreaterThan(0);
  expect(media.height).toBeGreaterThan(0);
  expect(media.duration).toBeGreaterThan(3);
  expect(media.currentTime).toBeGreaterThan(0.3);
  expect(media.cues.length).toBeGreaterThan(0);
  const firstCueStart = media.cues[0]?.start ?? null;
  const lastCueEnd = media.cues.at(-1)?.end ?? null;
  expect(firstCueStart ?? 99).toBeLessThanOrEqual(2);
  expect(lastCueEnd ?? 0).toBeLessThanOrEqual(media.duration + 1);
  expect((lastCueEnd ?? 0) - media.duration).toBeGreaterThanOrEqual(-4);
  const captionText = media.cues.map((cue) => cue.text).join(' ');
  const captionSimilarity = multisetSimilarity(transcript, captionText);
  expect(captionSimilarity).toBeGreaterThanOrEqual(0.86);

  return {
    width: media.width,
    height: media.height,
    duration: media.duration,
    currentTime: media.currentTime,
    readyState: media.readyState,
    cueCount: media.cues.length,
    firstCueStart,
    lastCueEnd,
    captionSimilarity,
  };
}

async function diagnoseUnknown(page: Page) {
  for (let index = 0; index < 10; index += 1) {
    const alexander = page.getByRole('heading', { name: 'Alexander', exact: true });
    if (await alexander.isVisible().catch(() => false)) return;
    const unknown = page.getByRole('button', { name: 'Ik weet dit nog niet', exact: true });
    await expect(unknown).toBeVisible();
    await unknown.click();
    await page.waitForTimeout(80);
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

  await page.goto(`${baseURL}/?_vercel_share=${encodeURIComponent(vercelShare)}`, { waitUntil: 'networkidle' });
  expect(new URL(page.url()).hostname).toBe(new URL(baseURL).hostname);

  const handoff = `${baseURL}/auth/handoff?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&training_id=${encodeURIComponent(trainingId)}&next=${encodeURIComponent(`/leren/${slug}/module/1`)}`;
  await page.goto(handoff, { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(new RegExp(`/leren/${slug}/module/1$`));

  const moduleResults: ModuleResult[] = [];
  for (let module = 1; module <= 10; module += 1) {
    await page.goto(`${baseURL}/leren/${slug}/module/${module}`, { waitUntil: 'networkidle' });
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

  await page.goto(`${baseURL}/leren/${slug}/module/1`, { waitUntil: 'networkidle' });
  await axeSeriousCritical(page, 'desktop-module-1-eva');
  await page.keyboard.press('Tab');
  const focusTrail: Array<{ tag: string; text: string; aria: string | null }> = [];
  for (let index = 0; index < 8; index += 1) {
    focusTrail.push(await page.evaluate(() => ({
      tag: document.activeElement?.tagName ?? '',
      text: (document.activeElement?.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 100),
      aria: document.activeElement?.getAttribute('aria-label') ?? null,
    })));
    await page.keyboard.press('Tab');
  }
  expect(focusTrail.some((entry) => ['BUTTON', 'INPUT', 'TEXTAREA', 'SUMMARY', 'VIDEO', 'A'].includes(entry.tag))).toBeTruthy();
  fs.writeFileSync(`${artifactsDir}/focus-trail.json`, JSON.stringify(focusTrail, null, 2));
  await diagnoseUnknown(page);
  await axeSeriousCritical(page, 'desktop-module-1-alexander');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 3, reducedMotion: 'reduce' });
  await copyAuthCookies(desktop, mobile);
  const mobilePage = await mobile.newPage();
  mobilePage.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(`[mobile] ${message.text()}`); });
  mobilePage.on('pageerror', (error) => pageErrors.push(`[mobile] ${error.message}`));
  await mobilePage.goto(`${baseURL}/leren/${slug}/module/1`, { waitUntil: 'networkidle' });
  expect(await noHorizontalOverflow(mobilePage), 'mobile overflow before diagnosis').toBe(0);
  expect(await mobilePage.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBeTruthy();
  const mobileEva = await verifyPresenter(mobilePage, 'Eva');
  const videoBox = await (await presenterSection(mobilePage, 'Eva')).locator('video').boundingBox();
  expect(videoBox?.width ?? 9999).toBeLessThanOrEqual(390);
  const actionable = mobilePage.getByRole('button', { name: /Ik weet dit nog niet|Volgende|Vorige|Bepaal mijn route/ });
  const actionableCount = await actionable.count();
  for (let index = 0; index < actionableCount; index += 1) {
    const box = await actionable.nth(index).boundingBox();
    if (box) expect(box.height, `mobile action target ${index}`).toBeGreaterThanOrEqual(44);
  }
  await mobilePage.screenshot({ path: `${artifactsDir}/mobile-module-1-eva.png`, fullPage: true });
  await diagnoseUnknown(mobilePage);
  const mobileAlexander = await verifyPresenter(mobilePage, 'Alexander');
  expect(await noHorizontalOverflow(mobilePage), 'mobile overflow after diagnosis').toBe(0);
  await axeSeriousCritical(mobilePage, 'mobile-module-1-alexander');
  await mobilePage.screenshot({ path: `${artifactsDir}/mobile-module-1-alexander.png`, fullPage: true });

  const report = {
    generatedAt: new Date().toISOString(),
    target: { baseURL, deploymentHost: new URL(baseURL).hostname },
    viewportDesktop: { width: 1440, height: 900 },
    viewportMobile: { width: 390, height: 844, hasTouch: true, reducedMotion: true },
    modules: moduleResults,
    mobile: { eva: mobileEva, alexander: mobileAlexander },
    focusTrail,
    consoleErrors,
    pageErrors,
    caveat: 'Automated Chromium + axe validates browser behavior and accessibility semantics, but is not a real VoiceOver/NVDA session.',
  };
  fs.writeFileSync(`${artifactsDir}/physical-ux-report.json`, JSON.stringify(report, null, 2));

  expect(pageErrors, 'uncaught browser page errors').toEqual([]);
  expect(consoleErrors.filter((message) => !/favicon/i.test(message)), 'unexpected browser console errors').toEqual([]);

  await mobile.close();
  await desktop.close();
});
