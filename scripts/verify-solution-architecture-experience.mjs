import fs from "node:fs";
import path from "node:path";

const mode = process.argv[2] ?? "design";
if (!new Set(["design", "visual", "identity", "wave1", "release"]).has(mode)) {
  throw new Error(`Unknown experience validation mode: ${mode}`);
}

const requireVisualAssets = mode === "visual" || mode === "identity" || mode === "wave1" || mode === "release";
const requireIdentity = mode === "identity" || mode === "wave1" || mode === "release";
const requireWave1 = mode === "wave1";
const requireReleaseAssets = mode === "release";
const wave1ModuleIds = new Set([1, 4, 6, 10]);
const registryPath = path.resolve("content/solution-architecture-learning-experience-v1.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const fail = (message) => { throw new Error(`solution_architecture_experience_${message}`); };

const presenterRegistry = requireReleaseAssets
  ? JSON.parse(fs.readFileSync(path.resolve("content/solution-architecture-presenter-assets-v1.json"), "utf8"))
  : null;
const presenterAssetsByKey = new Map(
  presenterRegistry?.assets?.map((asset) => [asset.assetKey, asset]) ?? [],
);

if (registry.schemaVersion !== "eaw-learning-experience-v1") fail("schema_version");
if (registry.courseSlug !== "solution-architectuur-ontwerppraktijk") fail("course_slug");
if (registry.sourceManifestHash !== "sha256:ab0186d5dd65e6598eb9f7ecd728fd9985a1fc0b1048cf46c2df2460b6edf6d3") fail("manifest_hash");
if (registry.visualArchitecture?.implementationType !== "semantic_react") fail("visual_architecture_type");
if ((requireWave1 || requireReleaseAssets) && registry.mediaArchitecture?.generationRoute !== "v3_create_video_from_avatar") fail("media_generation_route");
if ((requireWave1 || requireReleaseAssets) && registry.mediaArchitecture?.outputContract?.captions !== "srt_sidecar") fail("media_caption_contract");
if ((requireWave1 || requireReleaseAssets) && registry.mediaArchitecture?.physicalPlaybackReviewRequired !== true) fail("media_playback_review_policy");
if ((requireWave1 || requireReleaseAssets) && registry.mediaArchitecture?.secureDeliveryRequired !== true) fail("media_secure_delivery_policy");

if (requireReleaseAssets) {
  if (presenterRegistry?.schemaVersion !== "eaw-presenter-assets-v1") fail("presenter_registry_schema");
  if (presenterRegistry?.courseSlug !== registry.courseSlug) fail("presenter_registry_course");
  if (!Array.isArray(presenterRegistry?.assets) || presenterRegistry.assets.length !== 20) fail("presenter_registry_count");
}

const personaKeys = ["eva", "alexander"];
for (const key of personaKeys) {
  const persona = registry.personas?.[key];
  if (!persona?.releaseRequired) fail(`persona_required:${key}`);
  if (persona.scriptLanguage !== "nl-NL") fail(`persona_language:${key}`);
  if (!persona.accessibility?.captionsRequired || !persona.accessibility?.transcriptRequired || !persona.accessibility?.textEquivalentRequired) {
    fail(`persona_accessibility_contract:${key}`);
  }
  if (persona.avatar?.provider !== "heygen") fail(`persona_provider:${key}`);
  if (requireIdentity) {
    if (persona.avatar?.status !== "ready") fail(`persona_avatar_not_ready:${key}`);
    if (!/^[0-9a-f]{32}$/i.test(persona.avatar?.groupId ?? "")) fail(`persona_group_id:${key}`);
    if (!/^[0-9a-f]{32}$/i.test(persona.avatar?.voiceId ?? "")) fail(`persona_voice_id:${key}`);
    if (!persona.avatar?.voiceName || !persona.avatar?.selectionBasis) fail(`persona_identity_metadata:${key}`);
  }
}

if (!Array.isArray(registry.modules) || registry.modules.length !== 10) fail(`module_count:${registry.modules?.length ?? 0}`);
const seenModules = new Set();
const seenAssetKeys = new Set();
const seenVideoAssetIds = new Set();
const visualSourceCache = new Map();
let visualCount = 0;
let generatedPresenterCount = 0;
for (const module of registry.modules) {
  const id = Number(module.sourceModuleId);
  if (!Number.isInteger(id) || id < 1 || id > 10 || seenModules.has(id)) fail(`module_identity:${id}`);
  seenModules.add(id);
  if (!module.slug || !module.title) fail(`module_metadata:${id}`);

  for (const personaKey of personaKeys) {
    const script = module.scripts?.[personaKey];
    if (!script?.assetKey || seenAssetKeys.has(script.assetKey)) fail(`script_asset_key:${id}:${personaKey}`);
    seenAssetKeys.add(script.assetKey);
    if (script.status !== "script_ready") fail(`script_not_ready:${id}:${personaKey}`);
    if (script.transcriptStatus !== "script_is_transcript") fail(`script_transcript_basis:${id}:${personaKey}`);

    if (requireReleaseAssets) {
      const presenterAsset = presenterAssetsByKey.get(script.assetKey);
      if (!presenterAsset) fail(`presenter_asset_missing:${id}:${personaKey}`);
      if (Number(presenterAsset.module) !== id) fail(`presenter_asset_module:${id}:${personaKey}`);
      if (presenterAsset.persona !== personaKey) fail(`presenter_asset_persona:${id}:${personaKey}`);
    }

    if (requireWave1) {
      if (wave1ModuleIds.has(id)) {
        if (script.generationStatus !== "completed") fail(`wave1_generation_status:${id}:${personaKey}`);
        if (!/^[0-9a-f]{32}$/i.test(script.videoAssetId ?? "")) fail(`wave1_video_asset_id:${id}:${personaKey}`);
        if (seenVideoAssetIds.has(script.videoAssetId)) fail(`wave1_duplicate_video_asset:${id}:${personaKey}`);
        seenVideoAssetIds.add(script.videoAssetId);
        if (!(Number(script.durationSeconds) > 0)) fail(`wave1_duration:${id}:${personaKey}`);
        if (script.captionStatus !== "generated") fail(`wave1_caption_status:${id}:${personaKey}`);
        if (script.playbackReviewStatus !== "pending") fail(`wave1_playback_review_status:${id}:${personaKey}`);
        generatedPresenterCount += 1;
      } else if (script.videoAssetId || script.generationStatus || script.captionStatus || script.playbackReviewStatus) {
        fail(`wave1_unexpected_generation:${id}:${personaKey}`);
      }
    }
  }

  if (!Array.isArray(module.visuals) || module.visuals.length < 1) fail(`visuals_missing:${id}`);
  for (const visual of module.visuals) {
    visualCount += 1;
    if (!visual.assetKey || seenAssetKeys.has(visual.assetKey)) fail(`visual_asset_key:${id}:${visual.assetKey}`);
    seenAssetKeys.add(visual.assetKey);
    if (!visual.visualMode) fail(`visual_mode:${id}:${visual.assetKey}`);
    if (visual.briefStatus !== "ready" || visual.altTextStatus !== "ready") fail(`visual_design_incomplete:${id}:${visual.assetKey}`);
    if (requireVisualAssets) {
      if (visual.assetStatus !== "ready") fail(`visual_not_ready:${id}:${visual.assetKey}`);
      if (visual.implementationType !== "semantic_react") fail(`visual_implementation_type:${id}:${visual.assetKey}`);
      if (!visual.assetPath) fail(`visual_path_missing:${id}:${visual.assetKey}`);
      const resolvedPath = path.resolve(visual.assetPath);
      if (!fs.existsSync(resolvedPath)) fail(`visual_path_not_found:${id}:${visual.assetKey}`);
      const source = visualSourceCache.get(resolvedPath) ?? fs.readFileSync(resolvedPath, "utf8");
      visualSourceCache.set(resolvedPath, source);
      if (!source.includes("aria-label") && !source.includes("aria-labelledby")) fail(`visual_accessibility_semantics_missing:${id}:${visual.assetKey}`);
      const hasModes = Array.isArray(visual.runtimeModes) && visual.runtimeModes.length > 0;
      const hasBinding = typeof visual.runtimeBinding === "string" && visual.runtimeBinding.trim().length > 0;
      if (!hasModes && !hasBinding) fail(`visual_runtime_binding_missing:${id}:${visual.assetKey}`);
      if (hasModes && !visual.runtimeModes.some((runtimeMode) => source.includes(`\"${runtimeMode}\"`))) {
        fail(`visual_runtime_mode_not_found:${id}:${visual.assetKey}`);
      }
    }
  }

  if (requireWave1) {
    const expectedReleaseStatus = wave1ModuleIds.has(id) ? "blocked_playback_review_pending" : "blocked_avatar_media_pending";
    if (module.releaseStatus !== expectedReleaseStatus) fail(`wave1_module_release_status:${id}`);
  }
}

for (let id = 1; id <= 10; id += 1) if (!seenModules.has(id)) fail(`module_missing:${id}`);
if (visualCount !== 19) fail(`visual_count:${visualCount}`);
if (requireWave1 && generatedPresenterCount !== 8) fail(`wave1_presenter_count:${generatedPresenterCount}`);

console.log(`Solution Architecture learning experience ${mode} contract: PASS (10 modules, 20 presenter scripts, ${visualCount} visual concepts${requireWave1 ? `, ${generatedPresenterCount} generated Wave 1 presenter assets` : ""})`);
