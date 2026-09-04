import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "content", "togaf-business-architecture-rc2");
const letters = ["A", "B", "C", "D"];

// Balanced, non-repeating target sequence: every position occurs ten times.
const targetSequence = "CCCACDADCDABADAABDACADBDDBCDCBABADCBCBBB";

const moduleFiles = [
  "Module-01-Enterprise-Architecture-en-de-TOGAF-Standard-rc2.md",
  "Module-02-De-ADM-toepassen-en-aanpassen-rc2.md",
  "Module-03-Business-Modeling-rc2.md",
  "Module-04-Business-Capabilities-rc2.md",
  "Module-05-Value-Streams-rc2.md",
  "Module-06-Information-en-Organization-Mapping-rc2.md",
  "Module-07-TOGAF-Business-Scenarios-rc2.md",
  "Module-08-Integratie-van-baseline-naar-target-rc2.md",
];

let globalQuestionIndex = 0;

for (const [moduleIndex, filename] of moduleFiles.entries()) {
  const moduleNumber = moduleIndex + 1;
  const markdownPath = path.join(sourceDir, filename);
  const privatePath = path.join(sourceDir, `module${moduleNumber}-assessment-private-rc2.json`);
  const privateSource = JSON.parse(await readFile(privatePath, "utf8"));
  const privateByNumber = new Map(privateSource.items.map((item) => [item.nr, item]));
  const markdown = await readFile(markdownPath, "utf8");

  const rewritten = markdown.replace(
    /(^### Vraag (\d+)(?:[ \t]+—[^\n]+)?[ \t]*\n)([\s\S]*?)(?=^### Vraag \d+|^## |(?![\s\S]))/gm,
    (block, heading, numberText, body) => {
      const questionNumber = Number(numberText);
      const privateItem = privateByNumber.get(questionNumber);
      if (!privateItem) throw new Error(`Missing private item for module ${moduleNumber}, question ${questionNumber}`);

      const optionMatches = [...body.matchAll(/^- ([A-D])\. (.+)$/gm)];
      if (optionMatches.length !== 4) {
        throw new Error(`Expected four options for module ${moduleNumber}, question ${questionNumber}`);
      }

      const options = Object.fromEntries(optionMatches.map((match) => [match[1], match[2]]));
      const currentCorrectIndex = letters.indexOf(privateItem.correct_option);
      const targetLetter = targetSequence[globalQuestionIndex++];
      const targetCorrectIndex = letters.indexOf(targetLetter);
      const shift = (currentCorrectIndex - targetCorrectIndex + letters.length) % letters.length;

      const oldForNew = Object.fromEntries(
        letters.map((newLetter, newIndex) => [newLetter, letters[(newIndex + shift) % letters.length]])
      );
      const newOptions = Object.fromEntries(
        letters.map((newLetter) => [newLetter, options[oldForNew[newLetter]]])
      );
      const newFeedback = Object.fromEntries(
        letters.map((newLetter) => [newLetter, privateItem.feedback_by_option[oldForNew[newLetter]]])
      );

      privateItem.correct_option = targetLetter;
      privateItem.feedback_by_option = newFeedback;

      const firstOptionOffset = optionMatches[0].index;
      const lastOption = optionMatches.at(-1);
      const afterOptionsOffset = lastOption.index + lastOption[0].length;
      const optionsBlock = letters.map((letter) => `- ${letter}. ${newOptions[letter]}`).join("\n");
      const newBody = `${body.slice(0, firstOptionOffset)}${optionsBlock}${body.slice(afterOptionsOffset)}`;
      return `${heading}${newBody}`;
    }
  );

  await writeFile(markdownPath, rewritten);
  await writeFile(privatePath, `${JSON.stringify(privateSource, null, 2)}\n`);
}

if (globalQuestionIndex !== targetSequence.length) {
  throw new Error(`Expected ${targetSequence.length} questions, rewrote ${globalQuestionIndex}`);
}

console.log(JSON.stringify({ questions: globalQuestionIndex, targetDistribution: { A: 10, B: 10, C: 10, D: 10 } }, null, 2));
