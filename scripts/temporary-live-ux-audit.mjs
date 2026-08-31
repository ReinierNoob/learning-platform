import { chromium } from 'playwright';

const target = 'https://learning-platform-m8mkal3ha-reiniernoobs-projects.vercel.app';
const oidc = process.env.VERCEL_OIDC_TOKEN;
if (!oidc) throw new Error('missing_vercel_oidc_token');

const headers = { 'x-vercel-trusted-oidc-idp-token': oidc };
const audit = { desktop: {}, mobile: {}, routes: {}, accessibility: {} };

function ok(condition, message) {
  if (!condition) throw new Error(message);
}

async function answerIntake(page, answers) {
  for (let index = 0; index < answers.length; index += 1) {
    const textarea = page.locator('textarea').first();
    await textarea.fill(answers[index]);
    if (index === answers.length - 1) {
      await page.getByRole('button', { name: 'Bepaal mijn leerroute' }).click();
    } else {
      await page.getByRole('button', { name: 'Volgende vraag' }).click();
    }
  }
  await page.getByText('Jouw route').waitFor();
}

async function unknownIntake(page) {
  for (let index = 0; index < 4; index += 1) {
    await page.getByRole('button', { name: 'Ik weet dit nog niet' }).click();
  }
  await page.getByText('Jouw route').waitFor();
}

async function completeCurrentRoute(page, assessmentOptionIndex = 1) {
  for (let guard = 0; guard < 20; guard += 1) {
    if (await page.getByRole('heading', { name: 'Verplichte eindcheck' }).count()) break;
    const promptArea = page.getByText('Jouw redenering', { exact: true });
    if (await promptArea.count()) {
      const promptText = await page.locator('div').filter({ hasText: 'Jouw redenering' }).last().textContent().catch(() => '');
      let answer = 'Consequenties';
      if (/vierde alternatief|trade-off/i.test(promptText ?? '')) {
        answer = 'Een webhookservice stuurt statussen naar het portaal. De winst is snellere beschikbaarheid, maar het nadeel is extra beheer en meer complexiteit.';
      } else if (/winst.*verlies/i.test(promptText ?? '')) {
        answer = 'De winst is betere vertrouwelijkheid, maar het verlies is lagere beschikbaarheid en extra beheer.';
      }
      const textareas = page.locator('textarea');
      await textareas.last().fill(answer);
      const reactButton = page.getByRole('button', { name: /Laat (Eva|Alexander) reageren/ });
      await reactButton.click();
      await page.getByText('Je kunt door').waitFor();
    }
    const next = page.getByRole('button', { name: 'Volgende', exact: true });
    ok(await next.isEnabled(), 'next_not_enabled');
    await next.click();
  }

  const fieldsets = page.locator('fieldset');
  ok(await fieldsets.count() === 3, 'assessment_question_count');
  for (let index = 0; index < 3; index += 1) {
    const radios = fieldsets.nth(index).getByRole('radio');
    await radios.nth(assessmentOptionIndex).check();
  }
  await page.getByRole('button', { name: 'Beoordeel mijn antwoorden' }).click();
}

const browser = await chromium.launch({ headless: true });
try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, extraHTTPHeaders: headers });
  const page = await desktop.newPage();
  const response = await page.goto(`${target}/lab/solution-architecture-module-6`, { waitUntil: 'networkidle' });
  ok(response?.status() === 200, `desktop_http_${response?.status()}`);
  ok(await page.getByRole('heading', { name: 'Ontwerpkeuzes en trade-offs' }).isVisible(), 'desktop_heading_missing');
  ok(await page.getByText('De casus:').isVisible(), 'case_intro_missing');
  ok(await page.getByRole('button', { name: 'Ik weet dit nog niet' }).isVisible(), 'unknown_action_missing');
  audit.desktop.http = 200;
  audit.desktop.caseIntro = true;
  audit.desktop.unknownAction = true;

  // Keyboard/focus sanity check from the auto-focused textarea.
  const startTag = await page.evaluate(() => document.activeElement?.tagName ?? null);
  await page.keyboard.press('Tab');
  const afterTab = await page.evaluate(() => ({ tag: document.activeElement?.tagName ?? null, text: document.activeElement?.textContent?.trim() ?? '', outline: getComputedStyle(document.activeElement).outlineWidth }));
  audit.accessibility.keyboard = { startTag, afterTab };
  ok(startTag === 'TEXTAREA', 'textarea_not_autofocused');
  ok(afterTab.tag === 'BUTTON', 'tab_did_not_reach_button');

  // Route A via explicit uncertainty.
  await unknownIntake(page);
  ok(await page.getByText('Uitgebreide route', { exact: true }).isVisible(), 'route_a_missing');
  audit.routes.A = 'PASS';
  const desktopStepsOpen = await page.locator('details').filter({ hasText: 'Bekijk leerstappen' }).evaluate((el) => el.open);
  ok(desktopStepsOpen === true, 'desktop_steps_should_be_open');

  // Route B full pass, including tutor observation and final assessment.
  const pageB = await desktop.newPage();
  await pageB.goto(`${target}/lab/solution-architecture-module-6`, { waitUntil: 'networkidle' });
  await answerIntake(pageB, [
    'Vertrouwelijkheid en privacy van gevoelige gegevens bepalen welke ontwerpen toelaatbaar zijn.',
    'Als één optie objectief beter is op alle relevante punten is er geen echte trade-off; de keuze is dan gegeven.',
    'De consequenties zijn onvolledig: alleen positieve gevolgen zijn genoemd en nadelen en lasten ontbreken.',
    'Vooraf, voordat de bouw begint, zodat de afweging en beslissing transparant zijn.',
  ]);
  ok(await pageB.getByText('Verkorte route', { exact: true }).isVisible(), 'route_b_missing');
  await completeCurrentRoute(pageB, 1);
  await pageB.getByText('3/3 correct').waitFor();
  ok(await pageB.getByText(/modulecheck is afgerond/i).isVisible(), 'assessment_success_missing');
  audit.routes.B = 'PASS';
  audit.routes.assessmentPass = 'PASS';

  // Route C detection.
  const pageC = await desktop.newPage();
  await pageC.goto(`${target}/lab/solution-architecture-module-6`, { waitUntil: 'networkidle' });
  await answerIntake(pageC, [
    'Vertrouwelijkheid en privacy van gevoelige gegevens bepalen welke ontwerpen toelaatbaar zijn.',
    'Als één optie objectief beter is op alle relevante punten is er geen echte trade-off; de keuze is dan gegeven.',
    'De consequenties zijn onvolledig: alleen positieve gevolgen zijn genoemd en nadelen en lasten ontbreken.',
    'Achteraf, na de bouw, want dan leg je vast wat gekozen is.',
  ]);
  ok(await pageC.getByText('Focusroute', { exact: true }).isVisible(), 'route_c_missing');
  audit.routes.C = 'PASS';

  // Failed assessment -> targeted remediation.
  const pageFail = await desktop.newPage();
  await pageFail.goto(`${target}/lab/solution-architecture-module-6`, { waitUntil: 'networkidle' });
  await answerIntake(pageFail, [
    'Vertrouwelijkheid en privacy van gevoelige gegevens bepalen welke ontwerpen toelaatbaar zijn.',
    'Als één optie objectief beter is op alle relevante punten is er geen echte trade-off; de keuze is dan gegeven.',
    'De consequenties zijn onvolledig: alleen positieve gevolgen zijn genoemd en nadelen en lasten ontbreken.',
    'Vooraf, voordat de bouw begint, zodat de afweging en beslissing transparant zijn.',
  ]);
  await completeCurrentRoute(pageFail, 0);
  await pageFail.getByText(/aandacht vraagt/i).first().waitFor();
  const remediationButton = pageFail.getByRole('button', { name: /Oefen alleen wat nog aandacht vraagt/ });
  ok(await remediationButton.isVisible(), 'remediation_cta_missing');
  await remediationButton.click();
  await pageFail.getByText('Extra oefenroute', { exact: true }).waitFor();
  audit.routes.remediation = 'PASS';

  // Accessibility tree: verify key semantic roles/names are exposed by Chromium.
  const cdp = await desktop.newCDPSession(pageB);
  const ax = await cdp.send('Accessibility.getFullAXTree');
  const roles = ax.nodes.filter((n) => !n.ignored).map((n) => n.role?.value).filter(Boolean);
  audit.accessibility.axRoles = {
    heading: roles.filter((r) => r === 'heading').length,
    button: roles.filter((r) => r === 'button').length,
    radio: roles.filter((r) => r === 'radio').length,
    progressbar: roles.filter((r) => r === 'progressbar').length,
  };
  ok(audit.accessibility.axRoles.heading > 0, 'ax_heading_missing');
  ok(audit.accessibility.axRoles.button > 0, 'ax_button_missing');
  ok(audit.accessibility.axRoles.radio >= 3, 'ax_radios_missing');
  await desktop.close();

  // Mobile/touch layout.
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, extraHTTPHeaders: headers });
  const mobilePage = await mobile.newPage();
  const mobileResponse = await mobilePage.goto(`${target}/lab/solution-architecture-module-6`, { waitUntil: 'networkidle' });
  ok(mobileResponse?.status() === 200, `mobile_http_${mobileResponse?.status()}`);
  const overflow = await mobilePage.evaluate(() => ({ innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  ok(overflow.scrollWidth <= overflow.innerWidth + 1, `horizontal_overflow_${overflow.scrollWidth}_${overflow.innerWidth}`);
  await unknownIntake(mobilePage);
  const mobileStepsOpen = await mobilePage.locator('details').filter({ hasText: 'Bekijk leerstappen' }).evaluate((el) => el.open);
  ok(mobileStepsOpen === false, 'mobile_steps_should_be_collapsed');
  const lessonText = mobilePage.getByText(/Een trade-off is niet een fout in het ontwerp/i).first();
  const visualLabel = mobilePage.getByText('Afwegingsbord · Gemeente Middelveen').first();
  const lessonBox = await lessonText.boundingBox();
  const visualBox = await visualLabel.boundingBox();
  ok(Boolean(lessonBox && visualBox), 'mobile_boxes_missing');
  ok(lessonBox.y < visualBox.y, `mobile_information_order_wrong_${lessonBox.y}_${visualBox.y}`);
  audit.mobile = { http: 200, noHorizontalOverflow: true, stepsCollapsed: true, lessonBeforeVisual: true, hasTouch: true };
  await mobile.close();

  console.log('EAW_LIVE_UX_AUDIT=' + JSON.stringify(audit));
} finally {
  await browser.close();
}
