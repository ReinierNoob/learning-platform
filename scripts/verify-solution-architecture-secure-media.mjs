import fs from 'node:fs';

const fail = (message) => { throw new Error(`solution_architecture_secure_media_${message}`); };
const route = fs.readFileSync('app/api/presenter-media/[id]/[persona]/route.ts', 'utf8');
const component = fs.readFileSync('components/adaptive/config-driven/SolutionArchitecturePresenterMedia.tsx', 'utf8');
const experience = fs.readFileSync('components/adaptive/config-driven/AdaptiveModuleExperience.tsx', 'utf8');
const transcripts = fs.readFileSync('lib/solution-architecture-presenter-transcripts.ts', 'utf8');
const delivery = JSON.parse(fs.readFileSync('content/solution-architecture-presenter-delivery-v1.json', 'utf8'));
const assets = JSON.parse(fs.readFileSync('content/solution-architecture-presenter-assets-v1.json', 'utf8'));

if (delivery.schemaVersion !== 'eaw-presenter-delivery-v1') fail('delivery_schema');
if (delivery.courseSlug !== 'solution-architectuur-ontwerppraktijk') fail('delivery_course');
if (delivery.storage?.bucket !== 'cursus-videos' || delivery.storage?.public !== false) fail('private_bucket_contract');
if (delivery.storage?.projectSource !== 'media_edge_function') fail('media_edge_source');
if (delivery.storage?.serviceRoleBoundary !== 'media_supabase_internal_only') fail('service_role_boundary');
if (delivery.storage?.signedUrlTtlSeconds !== 900) fail('ttl_contract');
if (!String(delivery.storage?.authorizationSource ?? '').includes('get_my_learning_access')) fail('authorization_source');
if (!Array.isArray(delivery.assets) || delivery.assets.length !== 20) fail(`delivery_asset_count:${delivery.assets?.length}`);
if (!Array.isArray(assets.assets) || assets.assets.length !== 20) fail('presenter_registry_count');

const registered = new Set(assets.assets.map((asset) => asset.assetKey));
const paths = new Set();
for (let module = 1; module <= 10; module += 1) {
  const nn = String(module).padStart(2, '0');
  for (const persona of ['eva', 'alexander']) {
    const suffix = persona === 'eva' ? 'eva-intro-v1' : 'alexander-explainer-v1';
    const assetKey = `sa-m${nn}-${suffix}`;
    if (!registered.has(assetKey)) fail(`missing_presenter_registry:${assetKey}`);
    const item = delivery.assets.find((entry) => entry.assetKey === assetKey);
    if (!item) fail(`missing_delivery:${assetKey}`);
    const base = `solution-architecture/presenter/module-${nn}/${suffix}`;
    if (item.videoObject !== `${base}.mp4`) fail(`video_path:${assetKey}`);
    if (item.sourceSubtitleObject !== `${base}.srt`) fail(`srt_path:${assetKey}`);
    if (item.captionObject !== `${base}.vtt`) fail(`vtt_path:${assetKey}`);
    for (const value of [item.videoObject, item.sourceSubtitleObject, item.captionObject]) {
      if (paths.has(value)) fail(`duplicate_path:${value}`);
      if (/^https?:\/\//i.test(value) || /heygen\.ai/i.test(value)) fail(`external_runtime_path:${assetKey}`);
      paths.add(value);
    }
  }
}
if (paths.size !== 60) fail(`path_count:${paths.size}`);

for (const required of ['getAccessToken', 'getSessionUser', 'getCourseBySlug', 'getLearningAccess', 'getPublishedModule']) {
  if (!route.includes(required)) fail(`route_access_check:${required}`);
}
for (const required of ['PRESENTER_MEDIA_EDGE_URL', 'solution-architecture-presenter-media', 'eawPublishableKey', 'x-eaw-publishable-key', 'private, no-store', 'no-referrer']) {
  if (!route.includes(required)) fail(`route_security_contract:${required}`);
}
if (route.includes('VIDEO_SUPABASE_SERVICE_ROLE_KEY') || route.includes('SUPABASE_SERVICE_ROLE_KEY')) fail('service_role_in_learning_runtime');
if (route.includes('heygen.ai')) fail('runtime_heygen_dependency');
if (!route.includes('EXPECTED_SIGNED_URL_TTL_SECONDS = 900')) fail('route_ttl');
if (!route.includes('type === "captions"') || !route.includes('Content-Type": "text/vtt; charset=utf-8"')) fail('same_origin_caption_proxy');

for (const required of ['controls', 'playsInline', 'preload="metadata"', 'kind="captions"', 'srcLang="nl"', '<details', '<summary>Lees transcript']) {
  if (!component.includes(required)) fail(`accessible_media_component:${required}`);
}
if (/autoPlay|autoplay/.test(component)) fail('autoplay_forbidden');
if (!component.includes('De essentiële leerstof staat ook als tekst in de module.')) fail('media_not_optional_copy');
if (!experience.includes('persona="eva"') || !experience.includes('persona="alexander"')) fail('experience_presenter_integration');
const evaPosition = experience.indexOf('persona="eva"');
const diagnoseCardPosition = experience.indexOf('aria-labelledby="adaptive-eva-heading"');
const alexanderPosition = experience.indexOf('persona="alexander"');
const learningGridPosition = experience.indexOf('<div className={styles.learningGrid}>');
if (!(evaPosition > 0 && evaPosition < diagnoseCardPosition)) fail('eva_sequence');
if (!(alexanderPosition > 0 && alexanderPosition < learningGridPosition)) fail('alexander_sequence');

const transcriptEntries = (transcripts.match(/transcript:\s*"/g) ?? []).length;
if (transcriptEntries !== 20) fail(`transcript_count:${transcriptEntries}`);
if (transcripts.includes('heygen.ai')) fail('transcript_external_url');

console.log('Solution Architecture secure presenter media source contract: PASS (20 assets / 60 private objects / media-edge trust boundary / entitlement route / captions / transcripts)');
