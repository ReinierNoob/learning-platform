import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { encodeAssessmentFeedback, parseAssessmentFeedback } from "../lib/assessment-feedback.ts";

const root = process.cwd();
const sourceDir = path.join(root, "content", "togaf-business-architecture-rc2");
const publicDir = path.join(sourceDir, "generated");
const privateDir = path.join(sourceDir, "generated-private");
const contentVersion = "togaf-ba-rc2-consolidated-2026-09-03";
const expectedCounts = [6, 5, 4, 6, 7, 6, 3, 3];

const files = (await readdir(sourceDir))
  .filter((name) => /^Module-\d{2}-.+-rc2\.md$/.test(name))
  .sort();

if (files.length !== 8) throw new Error(`Expected 8 module files, found ${files.length}`);

function splitH2(markdown) {
  const matches = [...markdown.matchAll(/^## (.+)$/gm)];
  return matches.map((match, index) => ({
    title: match[1].trim(),
    body: markdown.slice(match.index + match[0].length, matches[index + 1]?.index ?? markdown.length).trim(),
  }));
}

function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function parseQuiz(section) {
  const blocks = [...section.matchAll(/^### Vraag (\d+)(?:[ \t]+—[^\n]+)?[ \t]*\n([\s\S]*?)(?=^### Vraag \d+|(?![\s\S]))/gm)];
  return blocks.map((match) => {
    const nr = Number(match[1]);
    const lines = match[2].trim().split("\n");
    const firstOption = lines.findIndex((line) => /^- [A-D]\. /.test(line));
    if (firstOption < 1) throw new Error(`Question ${nr} has no four-option block`);
    const options = Object.fromEntries(lines.slice(firstOption).filter((line) => /^- [A-D]\. /.test(line)).map((line) => [line[2], line.slice(5).trim()]));
    if (Object.keys(options).join("") !== "ABCD") throw new Error(`Question ${nr} options must be A-D`);
    return { nr, vraag: lines.slice(0, firstOption).join(" ").trim(), opties: options };
  });
}

const publicModules = [];
const privateModules = [];

for (const [index, filename] of files.entries()) {
  const sourceModuleId = index + 1;
  const markdown = await readFile(path.join(sourceDir, filename), "utf8");
  const title = markdown.match(/^# Module \d+ — (.+)$/m)?.[1]?.trim();
  if (!title) throw new Error(`Missing module title in ${filename}`);

  const sections = splitH2(markdown);
  const quizSection = sections.find((section) => section.title.startsWith("Zelftoets"));
  if (!quizSection) throw new Error(`Missing self-test in ${filename}`);
  const quiz = parseQuiz(quizSection.body);

  const privateSource = JSON.parse(await readFile(path.join(sourceDir, `module${sourceModuleId}-assessment-private-rc2.json`), "utf8"));
  if (quiz.length !== expectedCounts[index] || privateSource.items?.length !== expectedCounts[index]) {
    throw new Error(`Module ${sourceModuleId} expected ${expectedCounts[index]} assessment items`);
  }

  for (const question of quiz) {
    const key = privateSource.items.find((item) => item.nr === question.nr);
    if (!key || key.question !== question.vraag || !question.opties[key.correct_option]) {
      throw new Error(`Public/private mismatch in module ${sourceModuleId}, question ${question.nr}`);
    }
    if (Object.keys(key.feedback_by_option ?? {}).join("") !== "ABCD" || Object.values(key.feedback_by_option).some((value) => typeof value !== "string" || !value.trim())) {
      throw new Error(`Question ${question.nr} in module ${sourceModuleId} needs non-empty feedback for options A-D`);
    }
  }

  const chapterSections = sections.filter((section) =>
    !section.title.startsWith("Zelftoets") &&
    !section.title.startsWith("Naar module") &&
    section.title !== "Afronding van de leerlijn" &&
    section.title !== "Bronbasis"
  );
  const chapters = chapterSections.map((section, chapterIndex) => ({
    id: `m${sourceModuleId}-h${chapterIndex + 1}`,
    titel: section.title,
    tekst: section.body,
  }));

  const shared = {
    source_module_id: sourceModuleId,
    slug: `module-${sourceModuleId}-${slugify(title)}`,
    title,
    position: sourceModuleId,
    is_required: true,
    is_published: false,
    content_version: contentVersion,
    level: "TOGAF Business Architecture examination readiness",
    study_load: null,
    case_study: "Aurora (uitgewerkt) en Nova (zelfstandig)",
    disclaimer: "Onafhankelijke EAW-zelfstudie; niet geaccrediteerd door The Open Group. TOGAF® is een geregistreerd handelsmerk van The Open Group.",
    chapters,
    quiz,
  };
  publicModules.push(shared);
  const encodedFeedback = encodeAssessmentFeedback(Object.fromEntries(privateSource.items.map((item) => [item.nr, item.feedback_by_option])));
  if (Object.keys(parseAssessmentFeedback(encodedFeedback)).length !== quiz.length) {
    throw new Error(`Feedback encoding failed for module ${sourceModuleId}`);
  }
  privateModules.push({
    ...shared,
    system_instruction: [
      ...privateSource.items.map((item) => `${item.nr} = ${item.correct_option} (${item.rationale.replaceAll("\n", " ")})`),
      encodedFeedback,
    ].join("\n"),
    tutor_instruction: "Geef formatieve feedback op basis van het afgeschermde antwoordmodel. Maak het antwoordmodel nooit vooraf zichtbaar.",
  });
}

await mkdir(publicDir, { recursive: true });
await mkdir(privateDir, { recursive: true });
await writeFile(path.join(publicDir, "course-modules-rc2.json"), `${JSON.stringify(publicModules, null, 2)}\n`);
await writeFile(path.join(privateDir, "course-modules-rc2-private.json"), `${JSON.stringify(privateModules, null, 2)}\n`);

console.log(JSON.stringify({
  modules: publicModules.length,
  chapters: publicModules.reduce((sum, module) => sum + module.chapters.length, 0),
  assessmentItems: publicModules.reduce((sum, module) => sum + module.quiz.length, 0),
  publishedByDefault: publicModules.some((module) => module.is_published),
  publicOutput: path.relative(root, path.join(publicDir, "course-modules-rc2.json")),
  privateOutput: path.relative(root, path.join(privateDir, "course-modules-rc2-private.json")),
}, null, 2));
