import fs from 'node:fs';

const mode = process.argv[2] ?? 'wave1';
const data = JSON.parse(fs.readFileSync('content/solution-architecture-presenter-assets-v1.json','utf8'));
const fail = (m) => { throw new Error(`solution_architecture_presenter_assets_${m}`); };
if (data.schemaVersion !== 'eaw-presenter-assets-v1') fail('schema');
if (data.courseSlug !== 'solution-architectuur-ontwerppraktijk') fail('course');
if (data.provider !== 'heygen' || data.transport !== 'v3_create_video_from_avatar') fail('transport');
if (!Array.isArray(data.assets)) fail('assets');
const expected = mode === 'release' ? 20 : 8;
if (data.assets.length !== expected) fail(`count:${data.assets.length}`);
const seen = new Set();
for (const a of data.assets) {
  if (!a.assetKey || seen.has(a.assetKey)) fail(`asset_key:${a.assetKey}`);
  seen.add(a.assetKey);
  if (a.renderStatus !== 'completed') fail(`render:${a.assetKey}`);
  if (!/^[0-9a-f]{32}$/i.test(a.videoId ?? '')) fail(`video_id:${a.assetKey}`);
  if (!(Number(a.durationSeconds) > 0)) fail(`duration:${a.assetKey}`);
  if (a.subtitleArtifact !== 'generated') fail(`subtitle:${a.assetKey}`);
  if (a.failure !== null) fail(`failure:${a.assetKey}`);
  if (mode === 'release') {
    if (a.captionReview !== 'ready') fail(`caption_review:${a.assetKey}`);
    if (a.transcriptReview !== 'ready') fail(`transcript_review:${a.assetKey}`);
    if (a.physicalPlaybackReview !== 'ready') fail(`playback_review:${a.assetKey}`);
  }
}
console.log(`Solution Architecture presenter asset ${mode} contract: PASS (${data.assets.length} assets)`);
