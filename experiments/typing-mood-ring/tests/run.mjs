// Runs every browser check for the typing mood ring, one file at a time, and exits non-zero on any
// failure. Run from anywhere: node experiments/typing-mood-ring/tests/run.mjs
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
let failed = 0;
for (const f of ['suite.mjs', 'regress.mjs', 'records.mjs', 'interaction.mjs', 'keyboard.mjs', 'journal.mjs', 'scoring.mjs', 'background.mjs', 'lab-core.mjs', 'lab.mjs']) {
  console.log(`\n── ${f}`);
  const r = spawnSync(process.execPath, [path.join(here, f)], { stdio: 'inherit' });
  if (r.status !== 0) failed++;
}
console.log(failed ? `\n${failed} file(s) had failures` : '\nall check files passed');
process.exitCode = failed ? 1 : 0;
