#!/usr/bin/env node
/**
 * Fails CI on the lint rules that represent real bugs, not style.
 *
 * A blanket `eslint .` gate would be red on arrival: the app carries 27
 * pre-existing errors, all of them type hygiene (`no-explicit-any` and
 * friends). A pipeline that is red for reasons nobody intends to fix gets
 * ignored, and then it catches nothing at all.
 *
 * So this gates on the rules that have actually broken the app in production
 * and that nothing else catches. `rules-of-hooks` is the important one: a hook
 * placed after an early return blanked the couple's website, and neither `tsc`
 * nor `vite build` says a word about it, because esbuild does not typecheck and
 * hook order is not a type error.
 *
 * Everything else is reported as advisory and does not fail the run. Add a rule
 * to BLOCKING once the codebase is clean of it, never before.
 */
import { spawnSync } from 'node:child_process';

const BLOCKING = new Set([
  'react-hooks/rules-of-hooks',
  'no-const-assign',
  'no-dupe-keys',
  'no-unsafe-negation',
]);

const target = process.argv[2] ?? 'src';

const run = spawnSync('npx', ['eslint', target, '-f', 'json'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

// eslint exits non-zero when it reports problems, which is expected here — we
// decide what counts. A missing report means it failed to run at all.
if (!run.stdout) {
  console.error('eslint produced no report:\n' + (run.stderr || '(no stderr)'));
  process.exit(1);
}

const report = JSON.parse(run.stdout);
const blocking = [];
let advisory = 0;

for (const file of report) {
  for (const m of file.messages) {
    if (m.ruleId && BLOCKING.has(m.ruleId)) {
      blocking.push(`${file.filePath}:${m.line}:${m.column}  ${m.ruleId}  ${m.message}`);
    } else if (m.severity === 2) {
      advisory++;
    }
  }
}

console.log(`advisory problems (not blocking): ${advisory}`);

if (blocking.length > 0) {
  console.error(`\n${blocking.length} blocking problem(s):\n`);
  for (const line of blocking) console.error('  ' + line);
  process.exit(1);
}

console.log('no blocking lint problems');
