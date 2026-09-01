import fs from 'node:fs';

const mode = process.argv[2] ?? 'wave1';
if (!new Set(['wave1','generated','release']).has(mode)) {
  throw new Error(`solution_architecture_presenter_assets_unknown_mode:${mode}`);
}

const data = JSON.parse(fs.readFileSync('content/solution-architecture-presenter-assets-v1.json','utf8'));
const fail = (m) => { throw new Error(`solution_architecture_presenter_assets_${m}`); };
if (data.schemaVersion !== 'eaw-presenter-assets-v1') fail('schema');
if (data.courseSlug !== 'solution-architectuur-ontwerppraktijk') fail('course');
if (data.provider !== 'heygen' || data.transport !== 'v3_create_video_from_avatar') fail('transport');
if (!Array.isArray(data.assets)) fail('assets');

const expectedKeys = [];
for (let module = 1; module <= 10; module += 1) {
  expectedKeys.push(`sa-m${String(module).padStart(2,'0')}-eva-intro-v1`);
  expectedKeys.push(`sa-m${String(module).padStart(2,'0')}-alexander-explainer-v1`);
}
const expectedAll = new Set(expectedKeys);
const wave1Modules = new Set([1,4,6,10]);
const wave1Keys = new Set(expectedKeys.filter((key) => wave1Modules.has(Number(key.slice(4,6)))));

const seen = new Set();
for (const a of data.assets) {
  if (!a.assetKey || seen.has(a.assetKey)) fail(`asset_key:${a.assetKey}`);
  if (!expectedAll.has(a.assetKey)) fail(`unexpected_asset:${a.assetKey}`);
  seen.add(a.assetKey);
  if (!Number.isInteger(Number(a.module)) || Number(a.module) < 1 || Number(a.module) > 10) fail(`module:${a.assetKey}`);
  const expectedPersona = a.assetKey.includes('-eva-') ? 'eva' : 'alexander';
  if (a.persona !== expectedPersona) fail(`persona:${a.assetKey}`);
}

const selected = mode === 'wave1'
  ? data.assets.filter((a) => wave1Keys.has(a.assetKey))
  : data.assets;
const expectedCount = mode === 'wave1' ? 8 : 20;
if (selected.length !== expectedCount) fail(`count:${mode}:${selected.length}`);
if (mode !== 'wave1' && data.assets.length !== 20) fail(`full_count:${data.assets.length}`);

for (const a of selected) {
  if (a.renderStatus !== 'completed') fail(`render:${a.assetKey}`);
  if (!/^[0-9a-f]{32}$/i.test(a.videoId ?? '')) fail(`video_id:${a.assetKey}`);
  if (!(Number(a.durationSeconds) > 0)) fail(`duration:${a.assetKey}`);
  if (a.subtitleArtifact !== 'generated') fail(`subtitle:${a.assetKey}`);
  if (a.failure !== null) fail(`failure:${a.assetKey}`);
  if (mode === 'release') {
    if (a.captionReview !== 'ready') fail(`caption_review:${a.assetKey}`);
    if (a.transcriptReview !== 'ready') fail(`transcript_review:${a.assetKey}`);
    if (a.physicalPlaybackReview !== 'ready') fail(`playback_review:${a.assetKey}`);
    if (a.secureDelivery !== 'ready') fail(`secure_delivery:${a.assetKey}`);
  }
}

console.log(`Solution Architecture presenter asset ${mode} contract: PASS (${selected.length} checked, ${data.assets.length} registered)`);
