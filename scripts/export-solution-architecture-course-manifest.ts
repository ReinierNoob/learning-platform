import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { buildSolutionArchitectureCourseManifest } from "../lib/solution-architecture-course-manifest";

const destination = resolve(process.argv[2] ?? "artifacts/solution-architecture-course-manifest.json");
const manifest = buildSolutionArchitectureCourseManifest();
const canonicalManifest = JSON.stringify(manifest);
const manifestHash = createHash("sha256").update(canonicalManifest).digest("hex");
const sourceCommit = process.env.EAW_MANIFEST_SOURCE_COMMIT ?? process.env.GITHUB_SHA ?? "unknown";

const artifact = {
  artifactVersion: "sa-course-materialization-artifact-v1",
  sourceRepository: "ReinierNoob/learning-platform",
  sourceCommit,
  manifestHash: `sha256:${manifestHash}`,
  generatedAt: new Date().toISOString(),
  manifest,
};

mkdirSync(dirname(destination), { recursive: true });
writeFileSync(destination, `${JSON.stringify(artifact, null, 2)}\n`, { mode: 0o600 });

console.log(
  `Solution Architecture manifest: ${manifest.modules.length} modules, ${manifest.modules.reduce((sum, module) => sum + module.quiz.length, 0)} assessment questions, ${artifact.manifestHash}`,
);
