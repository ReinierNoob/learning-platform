const baseUrl = process.env.EAW_ADAPTIVE_BASE_URL ?? 'http://127.0.0.1:3000';
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

async function probe(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual', cache: 'no-store' });
  return response;
}

for (const path of [
  '/api/presenter-media/1/eva',
  '/api/presenter-media/1/eva?type=captions',
  '/api/presenter-media/10/alexander',
]) {
  const response = await probe(path);
  check(response.status === 401, `${path}: unauthenticated fail-closed verwacht 401, kreeg ${response.status}`);
  check(response.headers.get('location') === null, `${path}: unauthenticated request mag niet redirecten`);
}

for (const path of [
  '/api/presenter-media/0/eva',
  '/api/presenter-media/11/eva',
  '/api/presenter-media/1/unknown',
]) {
  const response = await probe(path);
  check(response.status === 400, `${path}: invalid input verwacht 400, kreeg ${response.status}`);
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log('Solution Architecture presenter media HTTP fail-closed contract: PASS');
