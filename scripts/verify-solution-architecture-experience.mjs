import fs from "node:fs";
import path from "node:path";

const mode = process.argv[2] ?? "design";
if (!new Set(["design", "release"]).has(mode)) {
  throw new Error(`Unknown experience validation mode: ${mode}`);
}

const registryPath = path.resolve("content/solution-architecture-learning-experience-v1.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const fail = (message) => { throw new Error(`solution_architecture_experience_${message}`); };

if (registry.schemaVersion !== "eaw-learning-experience-v1") fail("schema_version");
if (registry.courseSlug !== "solution-architectuur-ontwerppraktijk") fail("course_slug");
if (registry.sourceManifestHash !== "sha256:ab0186d5dd65e6598eb9f7ecd728fd9985a1fc0b1048cf46c2df2460b6edf6d3") fail("manifest_hash");

const personaKeys = ["eva", "alexander"];
for (const key of personaKeys) {
  const persona = registry.personas?.[key];
  if (!persona?.releaseRequired) fail(`persona_required:${key}`);
  if (persona.scriptLanguage !== "nl-NL") fail(`persona_language:${key}`);
  if (!persona.accessibility?.captionsRequired || !persona.accessibility?.transcriptRequired || !persona.accessibility?.textEquivalentRequired) {
    fail(`persona_accessibility_contract:${key}`);
  }
  if (persona.avatar?.provider !== "heygen") fail(`persona_provider:${key}`);
  if (mode === "release") {
    if (persona.avatar?.status !== "ready") fail(`persona_avatar_not_ready:${key}`);
    if (!persona.avatar?.groupId || !persona.avatar?.voiceId) fail(`persona_identity_missing:${key}`);
  }
}

if (!Array.isArray(registry.modules) || registry.modules.length !== 10) fail(`module_count:${registry.modules?.length ?? 0}`);
const seenModules = new Set();
const seenAssetKeys = new Set();
let visualCount = 0;
for (const module of registry.modules) {
  const id = Number(module.sourceModuleId);
  if (!Number.isInteger(id) || id < 1 || id > 10 || seenModules.has(id)) fail(`module_identity:${id}`);
  seenModules.add(id);
  if (!module.slug || !module.title) fail(`module_metadata:${id}`);

  for (const personaKey of personaKeys) {
    const script = module.scripts?.[personaKey];
    if (!script?.assetKey || seenAssetKeys.has(script.assetKey)) fail(`script_asset_key:${id}:${personaKey}`);
    seenAssetKeys.add(script.assetKey);
    if (mode === "design") {
      if (script.status !== "script_ready") fail(`script_not_ready:${id}:${personaKey}`);
      if (script.transcriptStatus !== "script_is_transcript") fail(`script_transcript_basis:${id}:${personaKey}`);
    } else {
      if (script.status !== "ready") fail(`video_not_ready:${id}:${personaKey}`);
      if (!script.videoAssetId) fail(`video_asset_missing:${id}:${personaKey}`);
      if (script.captionStatus !== "ready") fail(`captions_not_ready:${id}:${personaKey}`);
      if (script.transcriptStatus !== "ready") fail(`transcript_not_ready:${id}:${personaKey}`);
    }
  }

  if (!Array.isArray(module.visuals) || module.visuals.length < 1) fail(`visuals_missing:${id}`);
  for (const visual of module.visuals) {
    visualCount += 1;
    if (!visual.assetKey || seenAssetKeys.has(visual.assetKey)) fail(`visual_asset_key:${id}`);
    seenAssetKeys.add(visual.assetKey);
    if (!visual.visualMode) fail(`visual_mode:${id}:${visual.assetKey}`);
    if (visual.briefStatus !== "ready" || visual.altTextStatus !== "ready") fail(`visual_design_incomplete:${id}:${visual.assetKey}`);
    if (mode === "release") {
      if (visual.assetStatus !== "ready") fail(`visual_not_ready:${id}:${visual.assetKey}`);
      if (!visual.assetPath) fail(`visual_path_missing:${id}:${visual.assetKey}`);
    }
  }

  if (mode === "release" && module.releaseStatus !== "ready") fail(`module_release_blocked:${id}`);
}

for (let id = 1; id <= 10; id += 1) if (!seenModules.has(id)) fail(`module_missing:${id}`);
if (visualCount !== 19) fail(`visual_count:${visualCount}`);

console.log(`Solution Architecture learning experience ${mode} contract: PASS (10 modules, 20 presenter scripts, ${visualCount} visuals)`);
