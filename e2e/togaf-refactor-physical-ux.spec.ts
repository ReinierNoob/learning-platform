import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const baseURL = process.env.EAW_UX_BASE_URL ?? '';
const share = process.env.EAW_UX_VERCEL_SHARE ?? '';
const tokenHash = process.env.EAW_UX_TOKEN_HASH ?? '';
const trainingId = 'f76eb8d2-3484-4207-8bf7-b7385cfbc7d9';
const slug = 'togaf-business-architecture-refactor-rc1';
const version = 'refactor-2026-09-02-rc1';
const launch = 'https://enterprisearchitectureworks.nl';
const artifacts = 'artifacts/togaf-refactor-ux';
fs.mkdirSync(artifacts, { recursive: true });

async function navigate(page: Page, path: string) {
  await page.evaluate(url => { window.location.href = url; }, `${baseURL}${path}`);
  await expect(page).toHaveURL(`${baseURL}${path}`, { timeout: 20000 });
  await expect(page.locator('h1')).toBeVisible();
}
async function overflow(page: Page) {
  return page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
}
async function save(page: Page, module: number) {
  const response = page.waitForResponse(r => r.url().includes(`/api/practice/${module}?`) && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Uitwerking opslaan', exact: true }).click();
  const r = await response;
  expect(r.status(), `practice module ${module}`).toBe(200);
  await expect(page.locator('.practiceWork [role=status]')).toContainText('opgeslagen');
  return r.json();
}
async function quiz(page: Page, module: number) {
  const fields = page.locator('.quiz fieldset');
  const count = await fields.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) await fields.nth(i).getByRole('radio').first().check();
  const response = page.waitForResponse(r => r.url().endsWith(`/api/grade-quiz/${module}`));
  await page.getByRole('button', { name: 'Controleer antwoorden en registreer voortgang' }).click();
  const r = await response;
  expect(r.status(), `assessment module ${module}`).toBe(200);
  const body = await r.json();
  expect(body.resultaten).toHaveLength(count);
  expect(body.resultaten.every((item: { uitleg: string }) => item.uitleg.length > 0)).toBe(true);
  await expect(page.locator('.quiz [role=status]')).toContainText('voortgang');
  return count;
}

test('TOGAF RC1 authenticated lessons, practice, retries and mobile', async ({ browser }) => {
  test.setTimeout(720000);
  expect(baseURL).toMatch(/^https:\/\/learning-platform-.*\.vercel\.app$/);
  expect(share).not.toBe('');
  expect(tokenHash).not.toBe('');
  expect(process.env.EAW_UX_TRAINING_ID).toBe(trainingId);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  const result: Record<string, unknown> = { contentVersion: version, modules: [], checks: [], limitations: ['No payment/email-registration test', 'No human screenreader or audio review', 'New video not coupled yet'] };
  const checks = result.checks as string[];
  const modules = result.modules as Array<Record<string, unknown>>;
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.name));
  const accessibility: Array<{ page: string; id: string; impact: string | null | undefined; targets: unknown[] }> = [];
  const axe = async (p: Page, label: string) => {
    const scan = await new AxeBuilder({ page: p }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    for (const v of scan.violations) if (['serious','critical'].includes(v.impact ?? '')) accessibility.push({ page: label, id: v.id, impact: v.impact, targets: v.nodes.map(n => n.target) });
  };
  try {
    const probe = await page.goto(`${baseURL}/api/practice/1?trainingId=${trainingId}&_vercel_share=${encodeURIComponent(share)}`);
    expect(probe?.status()).toBe(401);
    checks.push('unauthenticated practice denied');
    await page.goto(launch, { waitUntil: 'domcontentloaded' });
    await page.evaluate(url => { window.location.href = url; }, `${baseURL}/auth/handoff?token_hash=${encodeURIComponent(tokenHash)}&type=magiclink&training_id=${trainingId}&next=${encodeURIComponent(`/leren/${slug}/module/1`)}`);
    await expect(page).toHaveURL(`${baseURL}/leren/${slug}/module/1`, { timeout: 25000 });
    checks.push('real Supabase magic-link handoff and entitlement');
    const sessionToken = (await context.cookies()).find(c => c.name === 'eaw_learning_access_token')?.value;
    expect(Boolean(sessionToken)).toBe(true);
    const edgeUrl = 'https://mhjykzrljvtxauaatlom.supabase.co/functions/v1/course-work';
    const edgePayload = { action: 'course_practice_work', p_user_id: process.env.EAW_UX_USER_ID, p_module_id: 'd9eb8f92-6109-4408-a923-f87d328bf007', p_content_version: version, p_text: null, p_expected_id: null };
    expect((await page.request.post(edgeUrl, { data: edgePayload })).status()).toBe(401);
    const edgeHeaders = { apikey: 'sb_publishable_qa9v9qDYMzr3Fr3h0N29gg_1Ip6gfb5', Authorization: `Bearer ${sessionToken}` };
    expect((await page.request.post(edgeUrl, { headers: edgeHeaders, data: { ...edgePayload, p_user_id: '00000000-0000-0000-0000-000000000000' } })).status()).toBe(403);
    expect((await page.request.post(edgeUrl, { headers: edgeHeaders, data: edgePayload })).status()).toBe(403);
    checks.push('edge rejects missing session, forged identity and another course without entitlement');
    let totalChapters = 0, totalQuestions = 0;
    let module5PracticePath = '';
    for (let module = 1; module <= 8; module++) {
      const modulePath = `/leren/${slug}/module/${module}`;
      if (module > 1) await navigate(page, modulePath);
      await expect(page.locator('.hero')).toContainText(version);
      const paths = await page.locator('.chapterTile').evaluateAll(nodes => nodes.map(n => n.getAttribute('href') ?? ''));
      expect(paths.length).toBeGreaterThan(0);
      let practicePath = '', demonstrated = false;
      for (const path of paths) {
        await navigate(page, path);
        await expect(page.locator('.lessonContent')).toBeVisible();
        expect((await page.locator('.lessonContent').innerText()).length).toBeGreaterThan(100);
        expect(await overflow(page), `module ${module} chapter overflow`).toBe(0);
        expect(await page.locator('video').count()).toBe(0);
        if (await page.locator('.modelDemo').count()) {
          const before = await page.locator('.modelSteps li').count();
          await page.getByRole('button', { name: 'Volgende modelkeuze' }).click();
          await expect(page.locator('.modelSteps li')).toHaveCount(before + 1);
          await page.getByRole('button', { name: 'Opnieuw doorlopen' }).click();
          await expect(page.locator('.modelSteps li')).toHaveCount(1);
          demonstrated = true;
        }
        if (await page.locator('.practiceWork').count()) practicePath = path;
        if (module === 5 && await page.locator('.lessonContent table').count()) await axe(page, 'm5-table');
        totalChapters++;
      }
      expect(demonstrated).toBe(true);
      expect(practicePath).not.toBe('');
      await navigate(page, practicePath);
      const input = page.getByRole('textbox', { name: 'Je model en onderbouwing' });
      await expect(input).toBeEnabled();
      const work = `E2E RC1 module ${module}: waarde voor de stakeholder, bewijs van ontvangst en een onderbouwde modelkeuze.`;
      await input.fill(work);
      await save(page, module);
      await navigate(page, practicePath);
      await expect(input).toHaveValue(work);
      if (module === 5) {
        module5PracticePath = practicePath;
        const competing = await context.newPage();
        await competing.goto(launch, { waitUntil: 'domcontentloaded' });
        await navigate(competing, practicePath);
        await expect(competing.getByRole('textbox', { name: 'Je model en onderbouwing' })).toHaveValue(work);
        await input.fill(work + ' Tweede versie.');
        await save(page, module);
        await competing.getByRole('textbox', { name: 'Je model en onderbouwing' }).fill('Eigen onopgeslagen wijziging');
        const conflict = competing.waitForResponse(r => r.url().includes('/api/practice/5?') && r.request().method() === 'POST');
        await competing.getByRole('button', { name: 'Uitwerking opslaan', exact: true }).click();
        expect((await conflict).status()).toBe(409);
        await expect(competing.locator('.practiceWork [role=status]')).toContainText('andere versie');
        await expect(competing.getByRole('textbox', { name: 'Je model en onderbouwing' })).toHaveValue('Eigen onopgeslagen wijziging');
        const download = competing.waitForEvent('download');
        await competing.getByRole('button', { name: 'Eigen werk downloaden' }).click();
        expect((await download).suggestedFilename()).toBe('mijn-uitwerking-module-5.md');
        checks.push('optimistic save conflict preserves text and download');
        await competing.close();
        await axe(page, 'm5-practice');
      }
      const stale = await page.request.post(`${baseURL}/api/practice/${module}?trainingId=${trainingId}`, { data: { text: 'stale', expectedId: null, contentVersion: 'obsolete' } });
      expect(stale.status()).toBe(409);
      await navigate(page, modulePath);
      const count = await quiz(page, module);
      totalQuestions += count;
      if (module === 1) {
        await page.getByRole('button', { name: 'Opnieuw oefenen' }).click();
        await expect(page.locator('.quiz input:checked')).toHaveCount(0);
        await quiz(page, module);
        checks.push('quiz retry succeeds after clearing selections');
        await axe(page, 'm1-quiz');
      }
      modules.push({ module, chapters: paths.length, questions: count, practiceSaveReload: true, demonstration: true });
    }
    expect(totalChapters).toBe(45); expect(totalQuestions).toBe(41);
    await navigate(page, `/leren/${slug}`);
    await expect(page.locator('.hero')).toContainText('Voortgang 100%');
    checks.push('all eight modules completed in authoritative progress');
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await mobile.addCookies(await context.cookies());
    const phone = await mobile.newPage();
    await phone.goto(launch, { waitUntil: 'domcontentloaded' });
    await navigate(phone, module5PracticePath);
    await expect(phone.getByRole('textbox', { name: 'Je model en onderbouwing' })).toBeEnabled();
    expect(await overflow(phone)).toBe(0);
    await phone.getByText('Bekijk een mogelijke uitwerking', { exact: true }).tap();
    await expect(phone.locator('.practiceWork details')).toHaveAttribute('open', '');
    await phone.getByRole('textbox', { name: 'Je model en onderbouwing' }).fill('Mobiele uitwerking via touch.');
    await save(phone, 5);
    await axe(phone, 'm5-mobile');
    await phone.keyboard.press('Tab');
    expect(await phone.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY');
    checks.push('mobile touch practice save and keyboard focus');
    await mobile.close();
    result.accessibility = accessibility;
    expect(accessibility, 'Serious/critical automated accessibility findings').toEqual([]);
    expect(errors).toEqual([]);
    result.passed = true;
  } finally {
    result.accessibility = accessibility;
    // No private lesson text, answer keys, tokens, AI output or learner screenshot in public-repository artifacts.
    fs.writeFileSync(`${artifacts}/result.json`, JSON.stringify(result, null, 2));
    await context.close();
  }
});
