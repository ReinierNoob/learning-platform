// Generate a guarded SQL transaction from the private authoring bundle.
// Usage: node scripts/prepare-togaf-import.mjs /private/course-import-private-rc1.json /private/import.sql
// Never place input or output in this public repository.
import fs from 'node:fs';
const [input, output] = process.argv.slice(2);
if (!input || !output) throw new Error('Provide private input and output paths');
const rows = JSON.parse(fs.readFileSync(input, 'utf8'));
if (rows.length !== 8 || new Set(rows.map(r => r.public.id)).size !== 8) throw new Error('Expected eight unique modules');
for (const { public: m, private_assessment: a, baseline_guard: guard } of rows) {
  if (!guard?.content_version || !guard?.updated_at || a.content_version !== m.content_version || a.module_id !== m.id || a.items.length !== m.quiz.length) throw new Error('Version or assessment mismatch');
  for (const q of m.quiz) {
    const keys = a.items.filter(i => i.nr === q.nr);
    if (keys.length !== 1 || !Object.hasOwn(q.opties, keys[0].correct_option) || Object.keys(q.opties).some(k => !keys[0].feedback_by_option[k])) throw new Error('Invalid key or feedback');
  }
}
const payload = JSON.stringify(rows);
if (payload.includes('$togaf_bundle$')) throw new Error('SQL delimiter in content');
fs.writeFileSync(output, `begin;\ndo $import$\ndeclare r jsonb; m jsonb; changed integer;\nbegin\nfor r in select value from jsonb_array_elements($togaf_bundle$${payload}$togaf_bundle$::jsonb) loop\nm:=r->'public';\nupdate public.course_modules set title=m->>'title', chapters=m->'chapters', quiz=m->'quiz', tutor_instruction=m->>'tutor_instruction', system_instruction=(r->'private_assessment')::text, disclaimer=m->>'disclaimer', content_version=m->>'content_version', updated_at=now()\nwhere id=(m->>'id')::uuid and course_id=(m->>'course_id')::uuid and source_module_id=(m->>'source_module_id')::integer and content_version=r->'baseline_guard'->>'content_version' and updated_at=(r->'baseline_guard'->>'updated_at')::timestamptz;\nget diagnostics changed = row_count;\nif changed<>1 then raise exception 'Baseline conflict for module %',m->>'source_module_id'; end if;\nend loop;\nend $import$;\ncommit;\n`);
console.log('Guarded import generated; no database modified.');
