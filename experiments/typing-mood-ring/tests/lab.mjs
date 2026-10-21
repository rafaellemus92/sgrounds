// Rhythm Lab in the browser: consent, baseline, one clock for clicks and taps, duplicates, interruptions,
// a full session, export, reset, simulation. Headless Chromium with emulated input; not a real device.
// Run: node experiments/typing-mood-ring/tests/lab.mjs
import { chromium, checks, fresh as open, txt, hide, instrumented, shot } from './harness.mjs';
const { ok, done } = checks('lab');
const browser = await chromium.launch(); const errors = [];
const URL = instrumented('lab.html', [["setMode('free'); booted = true;", "window.__lab = Lab; window.__core = LabCore; setMode('free'); booted = true;"]]);
const state = p => p.evaluate(() => window.__lab.st);
const session = p => p.evaluate(() => JSON.parse(JSON.stringify(window.__lab.session)));
const press = async (p, n, ms) => { for (let i = 0; i < n; i++) { await p.keyboard.press('Space'); await p.waitForTimeout(ms); } };
// tap the circle at each high click's mapped output time + off ms, from inside the page, until the trial ends
const tapAlong = (p, off, skip = []) => p.evaluate(({ off, skip }) => new Promise(res => {
  const lab = window.__lab, seen = new Set(), t0 = performance.now();
  const iv = setInterval(() => {
    const tr = lab.trial;
    if (!tr || performance.now() - t0 > 60000) { clearInterval(iv); res(); return; }
    tr.cuesP.forEach((cp, j) => {
      if (j < 4 || seen.has(j)) return; seen.add(j);
      if (skip.includes(j)) return;
      setTimeout(() => document.querySelector('#labTap').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'touch' })), Math.max(0, cp + off - performance.now()));
    });
  }, 5);
}), { off, skip });
const waitState = (p, want, ms = 30000) => p.waitForFunction(w => window.__lab.st === w, want, { timeout: ms });

const p = await open(browser, errors, {}, URL);
await p.evaluate(() => localStorage.removeItem('tmr-lab')); await p.reload(); await p.waitForTimeout(300);
await p.click('button[data-mode="lab"]'); await p.waitForTimeout(150);
const gate = await p.evaluate(() => ({ consent: !labConsent.classList.contains('hidden'), run: !labRun.classList.contains('hidden'), stage: getComputedStyle(document.querySelector('.stage')).display }));
ok('consent comes first: nothing to start until agreed; the sphere is hidden in the lab', gate.consent && !gate.run && gate.stage === 'none', gate);
await p.click('#labAgree'); await p.click('#labStart'); await p.waitForTimeout(200);
ok('Start begins the baseline with a static tap target', (await state(p)) === 'pre' && await p.isVisible('#labTap'));

// baseline at ~300 ms, with a duplicate pair and a held-key repeat mixed in
const before = await p.locator('#labTap').screenshot();
await press(p, 6, 300);
const c1 = await txt(p, '#labCount');
await p.evaluate(() => { document.querySelector('#labTap').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerType: 'mouse' })); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true, cancelable: true })); });
await p.waitForTimeout(300);
const c2 = await txt(p, '#labCount');
await p.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', key: ' ', repeat: true, bubbles: true, cancelable: true })));
await p.waitForTimeout(300);
const c3 = await txt(p, '#labCount');
ok('a pointer and a key event 1 ms apart count as one tap; a held-key repeat counts as none', parseInt(c2) === parseInt(c1) + 1 && c3 === c2, { c1, c2, c3 });
const after = await p.locator('#labTap').screenshot();
ok('the tap target does not change when tapped (static visual)', before.equals(after));
await press(p, 14, 300);
await waitState(p, 'between', 5000).catch(() => {});
const s1 = await session(p);
ok('baseline gives T0 near the 300 ms pace and 8 trials in random order', (await state(p)) === 'between' && s1.pre && s1.pre.T0 > 285 && s1.pre.T0 < 335 && (await p.evaluate(() => window.__lab.queue.length)) === 8, { T0: s1.pre && s1.pre.T0 });

// one paced trial, tapped exactly 30 ms after each click's mapped time
await p.click('#labNext'); await waitState(p, 'trial', 5000);
await tapAlong(p, 30);
await waitState(p, 'between', 15000).catch(() => {});
let s2 = await session(p), t1 = s2.trials[0];
const a1 = await p.evaluate(t => window.__core.analyzeTrial({ cues: t.cues, taps: t.taps }), t1);
// Headless Chromium's fake audio device sometimes steps its output clock; the lab then flags 'audio clock drift',
// as it should, since clicks after a step play at a different time than recorded. Only that flag is tolerated here.
const envOnly = t => t.flags.every(f => f === 'audio clock drift');
ok('one clock: taps placed 30 ms after each mapped click read back as a steady +30 ms offset', envOnly(t1) && a1.kind === 'steady' && a1.slips === 0 && a1.missed === 0 && Math.abs(a1.offsetMs - 30) < 12, { method: t1.method, offset: +a1.offsetMs.toFixed(1), kind: a1.kind, flags: t1.flags });
const iti = t1.cues.slice(1).map((x, i) => x - t1.cues[i]), spread = Math.max(...iti) - Math.min(...iti);
ok('recorded clicks follow the audio clock exactly (spacing T, spread under 0.05 ms) with a settled offset', spread < 0.05 && Math.abs(iti[0] - t1.T) < 0.05 && t1.clock && Number.isFinite(t1.clock.driftMs), { T: t1.T, spread: +spread.toFixed(3), clock: t1.clock });

// interruptions: hidden page, lost focus, leaving the tab
for (const [label, act] of [
  ['page hidden', async () => { await hide(p, true); await p.waitForTimeout(100); await hide(p, false); }],
  ['focus lost', async () => { await p.evaluate(() => window.dispatchEvent(new Event('blur'))); }],
  ['left the lab', async () => { await p.click('button[data-mode="free"]'); await p.click('button[data-mode="lab"]'); }],
]) {
  const q0 = await p.evaluate(() => window.__lab.queue.length);
  await p.click('#labNext'); await waitState(p, 'trial', 5000); await p.waitForTimeout(1500);
  await act(); await p.waitForTimeout(200);
  const s = await session(p), last = s.trials[s.trials.length - 1], q1 = await p.evaluate(() => window.__lab.queue.length);
  ok(`interrupted trial (${label}) is flagged, not counted, and re-queued`, !last.valid && last.flags.includes(label) && (await state(p)) === 'between' && q1 === q0 + 1 && (await txt(p, '#labStep')).includes('flagged'), { flags: last.flags, q0, q1 });
}

// the rest of the session, tapped along with one missed tap per trial, then the second baseline
let guard = 0;
while ((await state(p)) === 'between' && guard++ < 20) {
  await p.click('#labNext'); await waitState(p, 'trial', 5000);
  await tapAlong(p, 25, [10]);
  await p.waitForFunction(() => window.__lab.st !== 'trial', null, { timeout: 30000 });
}
ok('after the last trial the second baseline starts', (await state(p)) === 'post');
await press(p, 21, 300);
await waitState(p, 'done', 5000).catch(() => {});
const s3 = await session(p);
const valid = s3.trials.filter(t => t.valid).length, flagged = s3.trials.filter(t => !t.valid);
const mine = ['page hidden', 'focus lost', 'left the lab'], drift = flagged.filter(t => !t.flags.some(f => mine.includes(f))).length;
const perCond = {}; for (const t of s3.trials) { const c = perCond[t.cond] ||= { tries: 0, flagged: 0, valid: 0 }; c.tries++; t.valid ? c.valid++ : c.flagged++; }
ok('session completes: the 3 interrupted trials are kept but not counted; every other flag is audio clock drift',
   (await state(p)) === 'done' && s3.complete && mine.every(f => flagged.some(t => t.flags.includes(f))) && flagged.every(t => t.flags.some(f => mine.includes(f)) || envOnly(t)),
   { valid, flagged: flagged.length, environmentDrift: drift, flags: s3.trials.map(t => t.flags.join('+') || 'ok') });
ok('redo rule: each flagged run is retried at most twice per condition (tries = 2 + min(flagged, 2))', Object.keys(perCond).length === 4 && Object.values(perCond).every(c => c.tries === 2 + Math.min(c.flagged, 2) && c.valid === c.tries - c.flagged), perCond);
const rows = await p.locator('#labTable tbody tr').count(), model = await txt(p, '#labModel');
ok('results show every trial and the held-out model comparison', rows === s3.trials.length && model.includes('fitted on each condition') && model.includes('not proof of permanent locking'), { rows, model: model.slice(0, 120) });
const missed = await p.evaluate(s => s.trials.filter(t => t.valid).slice(1).map(t => window.__core.analyzeTrial({ cues: t.cues, taps: t.taps })).map(a => [a.missed, a.slips, a.kind]), s3);
ok('a skipped tap in each later trial is counted as missed, never as a slip', missed.every(([m, sl, k]) => m === 1 && sl === 0 && k === 'steady'), missed);
await p.screenshot({ path: shot('lab-results.png'), fullPage: true });

// export, then reset
const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#labExport')]);
const file = shot('lab-export.json'); await dl.saveAs(file);
const data = JSON.parse((await import('node:fs')).readFileSync(file, 'utf8')), t0 = data.sessions.at(-1).trials[0];
ok('export: one JSON file with cue and tap times and no text fields', dl.suggestedFilename().endsWith('.json') && Array.isArray(t0.cues) && Array.isArray(t0.taps) && !JSON.stringify(data).includes('"text"') && typeof data.timeBase === 'string', dl.suggestedFilename());
await p.click('#labReset'); const armed = await txt(p, '#labReset'); await p.click('#labReset'); await p.waitForTimeout(100);
ok('reset asks for a second tap, then deletes all lab data and the consent', armed.includes('tap again') && (await p.evaluate(() => localStorage.getItem('tmr-lab'))) === null && await p.isVisible('#labConsent'), armed);

// simulation and example
await p.evaluate(() => { labSimBox.open = true; });
const sim = async (D, k) => { await p.evaluate(([D, k]) => { labD.value = D; labK.value = k; labD.dispatchEvent(new Event('input')); }, [D, k]); return txt(p, '#labSimText'); };
const r = [await sim(1, 2), await sim(2, 2), await sim(3, 2)];
ok('simulation states the regime: locked at asin(Δ/k), the boundary at |Δ| = k, slipping with its period', r[0].includes('30°') && r[1].includes('boundary') && r[2].includes('2.8 s'), r);
await p.click('#labExample'); ok('the example plot is labelled as simulated, not your taps', (await txt(p, '#labPlotTitle')).startsWith('Simulated example'));
await p.close();

// an audio route change mid-trial (the output mapping jumps 50 ms) flags the trial
{ const DRIFT = instrumented('lab-drift.html', [
    ["setMode('free'); booted = true;", "window.__lab = Lab; window.__core = LabCore; setMode('free'); booted = true;"],
    ["  if (c.getOutputTimestamp) { const o = c.getOutputTimestamp();", "  if (c.getOutputTimestamp) { const o = c.getOutputTimestamp(); if (o && window.__shift) o.performanceTime += window.__shift;"],
  ]);
  const d = await open(browser, errors, {}, DRIFT);
  await d.evaluate(() => localStorage.setItem('tmr-lab', JSON.stringify({ v: 1, consent: { at: 'x' }, sessions: [] }))); await d.reload(); await d.waitForTimeout(300);
  await d.click('button[data-mode="lab"]'); await d.click('#labStart');
  await press(d, 21, 300); await waitState(d, 'between', 5000);
  await d.click('#labNext'); await waitState(d, 'trial', 5000); await d.waitForTimeout(2500);
  await d.evaluate(() => { window.__shift = 50; });
  await tapAlong(d, 30); await d.waitForFunction(() => window.__lab.st !== 'trial', null, { timeout: 30000 });
  const tr = (await session(d)).trials.at(-1);
  ok('an audio clock mapping that moves 50 ms mid-trial flags the trial (audio clock drift)', !tr.valid && tr.flags.includes('audio clock drift'), { flags: tr.flags, clock: tr.clock });
  await d.close(); }

// ── review regressions ───────────────────────────────────────────────────────
const SEEDED = JSON.stringify({ v: 1, consent: { at: 'x' }, sessions: [] });
async function toBetween(init){
  const q = await open(browser, errors, init ? { init } : {}, URL);
  await q.evaluate(s => localStorage.setItem('tmr-lab', s), SEEDED); await q.reload(); await q.waitForTimeout(300);
  await q.click('button[data-mode="lab"]'); await q.click('#labStart');
  await press(q, 21, 300); await waitState(q, 'between', 5000);
  return q;
}
{ const q = await toBetween();
  await q.evaluate(() => { const c = window.__lab.ctx, r = c.resume.bind(c); return c.suspend().then(() => { c.resume = () => new Promise(res => setTimeout(() => r().then(res), 400)); }); });
  await q.click('#labNext'); await q.click('#labStop'); await q.waitForTimeout(1200);
  ok('stopping while the sound is starting: no trial starts afterwards', (await state(q)) === 'done' && !(await q.isVisible('#labTap')), await state(q));
  await q.close(); }
{ const q = await toBetween();
  await q.click('#labNext'); await waitState(q, 'trial', 5000); await q.waitForTimeout(2500);
  await q.evaluate(() => { const c = window.__lab.ctx, t = c.currentTime, o = c.getOutputTimestamp(); Object.defineProperty(c, 'currentTime', { get: () => t }); c.getOutputTimestamp = () => o; });
  await q.waitForFunction(() => window.__lab.st !== 'trial', null, { timeout: 5000 }).catch(() => {});
  const last = (await session(q)).trials.at(-1);
  ok('audio clock stalls while the context still says running: the watchdog ends and flags the trial', (await state(q)) === 'between' && last && last.flags.includes('audio stalled'), last && last.flags);
  await q.close(); }
{ const q = await toBetween();
  await q.evaluate(() => { const c = window.__lab.ctx, g = c.getOutputTimestamp.bind(c); window.__t0 = 0; c.getOutputTimestamp = () => (window.__t0 && performance.now() - window.__t0 < 1600) ? { contextTime: 0, performanceTime: 0 } : g(); });
  await q.evaluate(() => { window.__t0 = performance.now(); }); await q.click('#labNext');
  await q.waitForFunction(() => window.__lab.st !== 'trial' && window.__lab.st !== 'between' || (window.__lab.session.trials.length > 0), null, { timeout: 40000 }).catch(() => {});
  const last = (await session(q)).trials.at(-1);
  ok('getOutputTimestamp waking up during settling: settling restarts and the trial completes', last && last.method === 'getOutputTimestamp' && last.cues.length === 34 && !last.flags.includes('clock method changed'), last && { method: last.method, cues: last.cues.length, flags: last.flags });
  await q.close(); }
{ const DRIFT2 = instrumented('lab-drift2.html', [
    ["setMode('free'); booted = true;", "window.__lab = Lab; window.__core = LabCore; setMode('free'); booted = true;"],
    ["  if (c.getOutputTimestamp) { const o = c.getOutputTimestamp();", "  if (c.getOutputTimestamp) { const o = c.getOutputTimestamp(); if (o && window.__stable) { o.performanceTime = o.contextTime*1000 + window.__stable + (window.__shift || 0); }"],
  ]);
  const q = await open(browser, errors, {}, DRIFT2);
  await q.evaluate(s => localStorage.setItem('tmr-lab', s), SEEDED); await q.reload(); await q.waitForTimeout(300);
  await q.click('button[data-mode="lab"]'); await q.click('#labStart'); await press(q, 21, 300); await waitState(q, 'between', 5000);
  await q.evaluate(() => { window.__stable = 120; });     // a perfectly steady mapping, so only the step below can move it
  await q.click('#labNext'); await waitState(q, 'trial', 5000); await q.waitForTimeout(3000);
  await q.evaluate(() => { window.__shift = 60; }); await q.waitForTimeout(2500); await q.evaluate(() => { window.__shift = 0; });
  await q.waitForFunction(() => window.__lab.st !== 'trial', null, { timeout: 30000 });
  const last = (await session(q)).trials.at(-1);
  ok('a 60 ms clock jump that reverts before the trial ends is still flagged as drift', last.flags.includes('audio clock drift') && Math.abs(last.clock.maxDevMs) >= 50, { flags: last.flags, clock: last.clock });
  await q.close(); }
{ const q = await open(browser, errors, { init: () => { window.claude = {}; } }, URL);
  await q.evaluate(s => localStorage.setItem('tmr-lab', s), JSON.stringify({ v: 1, consent: { at: 'x' }, sessions: [{ id: 'a', env: {}, pre: { taps: [{ t: 0 }], T0: 600, cv: 0 }, post: { taps: [{ t: 0 }], T0: 800, cv: 0 }, trials: [], complete: true }] }));
  await q.reload(); await q.waitForTimeout(300); await q.click('button[data-mode="lab"]'); await q.waitForTimeout(100);
  ok('a pace change over 10% between baselines is flagged even before any model comparison', (await txt(q, '#labSummary')).includes('Flagged'), await txt(q, '#labSummary'));
  await q.click('#labExport'); await q.waitForTimeout(300);
  const shown = await q.evaluate(() => !labDump.classList.contains('hidden') && labDump.value.length > 0);
  await q.click('#labReset'); await q.click('#labReset'); await q.waitForTimeout(100);
  const after = await q.evaluate(() => ({ hidden: labDump.classList.contains('hidden'), len: labDump.value.length, ls: localStorage.getItem('tmr-lab') }));
  ok('reset also clears exported data shown on the page', shown && after.hidden && after.len === 0 && after.ls === null, after);
  ok('consent lists dates and device timing details', (await txt(q, '#labConsent')).includes('date and time of each session and trial'));
  await q.close(); }
{ const q = await open(browser, errors, { init: () => { const n = performance.now.bind(performance); performance.now = () => Math.floor(n()/16)*16; } }, URL);
  await q.evaluate(s => localStorage.setItem('tmr-lab', s), SEEDED); await q.reload(); await q.waitForTimeout(300);
  await q.click('button[data-mode="lab"]'); await q.click('#labStart'); await q.waitForTimeout(100);
  const env = await q.evaluate(() => window.__lab.session.env);
  ok('a 16 ms clock is measured as 16 ms, not as fine', env.timerResMs >= 15 && env.timerResMs <= 17, env);
  await q.close(); }
{ const q = await open(browser, errors, {}, URL);
  await q.evaluate(() => localStorage.setItem('tmr-lab', JSON.stringify({ v: 1, consent: { at: 'x' }, sessions: [{ id: 'a', env: { timerResMs: 16 }, pre: { taps: [{ t: 0 }], T0: 600, cv: 0 }, post: null, trials: [], complete: false }] })));
  await q.reload(); await q.waitForTimeout(300); await q.click('button[data-mode="lab"]'); await q.waitForTimeout(100);
  ok('the results warn when the clock is coarser than 5 ms', (await txt(q, '#labSummary')).includes('too coarse'), await txt(q, '#labSummary'));
  await q.close(); }

// touch: one tap on a touch screen is one tap
{ const t = await open(browser, errors, { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, URL);
  await t.evaluate(() => localStorage.setItem('tmr-lab', JSON.stringify({ v: 1, consent: { at: 'x' }, sessions: [] }))); await t.reload(); await t.waitForTimeout(300);
  await t.tap('button[data-mode="lab"]'); await t.tap('#labStart'); await t.waitForTimeout(150);
  for (let i = 0; i < 3; i++) { await t.tap('#labTap'); await t.waitForTimeout(350); }
  const raw = await t.evaluate(() => window.__lab.base.raw.map(x => x.src));
  ok('phone: three taps record three touch taps, no mouse or click duplicates', raw.length === 3 && raw.every(s => s === 'touch'), raw);
  const box = await t.locator('#labTap').boundingBox();
  ok('phone: the tap target is large (at least 200 px)', box.width >= 200, box.width);
  await t.screenshot({ path: shot('lab-phone.png') });
  await t.close(); }

ok('no page errors', errors.length === 0, errors);
done();
await browser.close();
