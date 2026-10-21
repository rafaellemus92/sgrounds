// Rhythm Lab analysis core, tested in Node on synthetic data with known ground truth. No browser needed.
// It loads the LAB-CORE block straight out of index.html (or TMR_PAGE). Run: node experiments/typing-mood-ring/tests/lab-core.mjs
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const page = readFileSync(process.env.TMR_PAGE ? path.resolve(process.env.TMR_PAGE) : path.join(here, '..', 'index.html'), 'utf8');
const a = page.indexOf('/* LAB-CORE:BEGIN'), b = page.indexOf('/* LAB-CORE:END */');
if (a < 0 || b < 0) throw new Error('LAB-CORE markers not found');
const L = new Function(page.slice(a, b) + '\nreturn LabCore;')();
const results = [];
const ok = (name, cond, info = '') => { results.push(!!cond); console.log((cond ? 'PASS ' : 'FAIL ') + name + (info !== '' ? '  — ' + JSON.stringify(info) : '')); };
const TAU = 2*Math.PI, seeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const near = (x, y, tol) => Math.abs(x - y) <= tol;

// ── the equation itself ──────────────────────────────────────────────────────
{ const D = 3, k = 2, want = TAU/Math.sqrt(D*D - k*k); let d = 0, t = 0; const dt = 0.001;
  while (d < TAU) { d = L.flow('sine', d, D, k, dt); t += dt; }
  ok('integrator: slip period matches 2π/√(Δ² − k²)', near(t, want, 0.01*want), { t: +t.toFixed(4), want: +want.toFixed(4) }); }
{ const d = L.flow('sine', 0, 1, 2, 60);
  ok('integrator: locks at asin(Δ/k) when |Δ| < k', near(d, Math.asin(0.5), 1e-6), d); }
{ const d = L.flow('sine', 0, 2, 2, 20);
  ok('integrator: at |Δ| = k it creeps toward π/2 without passing it', d < Math.PI/2 && d > Math.PI/2 - 0.2, d); }
{ const r = [L.regime(1, 2).kind, L.regime(2, 2).kind, L.regime(-2, 2).kind, L.regime(3, 2).kind, L.regime(0, 0).kind, L.regime(0.5, 0).kind];
  ok('regimes: locked, boundary at equality (both signs), slipping, neutral, slipping without coupling', JSON.stringify(r) === JSON.stringify(['locked', 'boundary', 'boundary', 'slipping', 'neutral', 'slipping']), r); }
{ const d = L.flow('linear', 0, 1, 2, 60);
  ok('linear model settles at Δ/k and never slips', near(d, 0.5, 1e-9) && near(L.flow('linear', 0, 3, 2, 60), 1.5, 1e-9)); }

// ── taps ─────────────────────────────────────────────────────────────────────
{ const d = L.dedupe([0, 5, 30, 100, 150, 400].map(t => ({ t })));
  ok('duplicates: events within 80 ms of the last kept tap are dropped', JSON.stringify(d.taps.map(x => x.t)) === '[0,100,400]' && d.dropped === 3, d); }
{ const r = L.rng(1), taps = Array.from({ length: 24 }, (_, i) => ({ t: i*600 + (r() - 0.5)*20 }));
  const b = L.baseline(taps), few = L.baseline(taps.slice(0, 8)), fast = L.baseline(Array.from({ length: 24 }, (_, i) => ({ t: i*200 })));
  ok('baseline: median interval of steady taps, invalid when too few or too fast', near(b.T0, 600, 8) && b.valid && !few.valid && few.reason === 'too few taps' && !fast.valid, { T0: b.T0, few: few.reason, fast: fast.reason }); }

// ── synthetic trials with known ground truth ─────────────────────────────────
{ const out = seeds.map(seed => { const s = L.synth({ T0: 600, T: 630, k: 4, L: 40, seed }); const a = L.analyzeTrial(s); return { k: a.kind, s: a.slips, m: a.missed, e: a.extra }; });
  ok('locked sequences (10 seeds): steady, no slips, nothing missed or extra', out.every(o => o.k === 'steady' && !o.s && !o.m && !o.e), out); }
// ground truth = the jitter-free phase path, counted with the same slip rule and the same anchor as the observed taps
const truthOf = (s, a) => L.levels(s.truth, a.ref);
{ const out = seeds.map(seed => { const s = L.synth({ T0: 600, T: 540, k: 0.8, L: 40, seed }); const a = L.analyzeTrial(s), t = truthOf(s, a); return { kind: a.kind, slips: a.slips, net: a.net, truth: t.slips, truthNet: t.net }; });
  // tap jitter (10 ms) can carry a final tap across the 0.75-cycle threshold that the jitter-free path just misses
  const exact = out.filter(o => o.slips === o.truth && o.net === o.truthNet).length;
  ok('slipping sequences (10 seeds): slips equal the ground truth in at least 9, never off by more than one', out.every(o => o.kind === 'slipping' && o.net > 0 && Math.abs(o.net - o.truthNet) <= 1) && exact >= 9, { exact, out }); }
{ const s = L.synth({ T0: 600, T: 660, k: 0.8, L: 40, seed: 3 }), a = L.analyzeTrial(s), t = truthOf(s, a);
  ok('slow beat with weak coupling: the person runs ahead, so the net slip is negative', a.kind === 'slipping' && a.net < 0 && a.net === t.net, { net: a.net, truth: t.net }); }
{ const out = [];
  for (const f of [0.3, 0.45, 0.5, 0.52, 0.55, 0.6]) for (const seed of seeds) { const a = L.analyzeTrial(L.synth({ T0: 600, T: 630, k: 4, L: 40, seed, strayAt: [[10, f]] })); if (a.kind !== 'steady' || a.slips || a.extra !== 1) out.push({ f, seed, kind: a.kind, net: a.net, extra: a.extra }); }
  ok('a stray tap anywhere between beats (0.3–0.6 beat, 10 seeds each) is one extra tap, never a slip', out.length === 0, out.slice(0, 4)); }
{ const run = d0 => L.analyzeTrial(L.synth({ T0: 600, T: 570, k: 0.5, L: 40, jitter: 0, noise: 0, d0 }));
  const a = run(-1.5), b = run(3.0), move = x => +(x.pts[x.pts.length - 1].psi - x.pts[0].psi).toFixed(2);
  ok('a slip means the same movement wherever the trial starts: 0.67 and 0.74 cycle moves are not slips', a.slips === 0 && b.slips === 0, { a: [a.kind, move(a)], b: [b.kind, move(b)] }); }
{ const clean = L.analyzeTrial(L.synth({ T0: 600, T: 630, k: 4, seed: 5 }));
  const s = L.synth({ T0: 600, T: 630, k: 4, seed: 5, missAt: [5, 12, 13, 20] }), a = L.analyzeTrial(s);
  ok('missed taps (one single, one double): counted, no false slip', a.missed === 4 && a.slips === 0 && a.kind === 'steady' && a.credited === clean.credited, { missed: a.missed, slips: a.slips, credited: a.credited }); }
{ const s = L.synth({ T0: 600, T: 630, k: 4, seed: 6, extraAt: [3, 9, 22] }), a = L.analyzeTrial(s);
  ok('extra taps within half a beat: counted and dropped, no false slip', a.extra === 3 && a.slips === 0 && a.kind === 'steady', { extra: a.extra, slips: a.slips }); }
{ const base = L.analyzeTrial(L.synth({ T0: 600, T: 630, k: 4, seed: 7 })), s = L.synth({ T0: 600, T: 630, k: 4, seed: 7, dupAt: [2, 7, 15, 28] }), a = L.analyzeTrial(s);
  ok('duplicate events 12 ms apart: dropped, analysis identical to the clean trial', a.dropped === 4 && JSON.stringify(a.pts.map(p => p.psi)) === JSON.stringify(base.pts.map(p => p.psi)), { dropped: a.dropped }); }
{ const out = seeds.map(seed => L.analyzeTrial(L.synth({ T0: 600, T: 630, k: 4, jitter: 25, seed })));
  const steady = out.filter(a => a.kind === 'steady' && !a.slips).length;
  ok('timing jitter of 25 ms: locked trials stay steady with no slips (at least 9 of 10)', steady >= 9, steady); }
{ const s = L.synth({ T0: 600, T: 630, k: 0.2, L: 0, seed: 2, jitter: 4, noise: 0.02, beats: 40 }), a = L.analyzeTrial(s);
  const wrapped = a.pts.map(p => p.psi - Math.round(p.psi)), maxWrap = Math.max(...wrapped.map(Math.abs));
  ok('a slow slip is visible unwrapped, though nearest-beat phase never leaves ±0.5', a.slips >= 1 && a.net !== 0 && maxWrap <= 0.5, { slips: a.slips, net: a.net, maxWrapped: +maxWrap.toFixed(2) }); }
{ const s = L.synth({ T0: 600, T: 630, k: 4, seed: 8 }), a = L.analyzeTrial({ cues: s.cues, taps: s.taps.slice(0, 10) });
  ok('a trial with fewer than 15 analysed taps is not classified', !a.valid && a.kind === 'too few taps', a.n); }

// ── estimation and held-out comparison ──────────────────────────────────────
function session(model, k, Lms, { seed0 = 100, T0 = 600, jitter = 8, noise = 0.05 } = {}){
  const conds = [-0.10, -0.05, 0.05, 0.10], order = [...conds, ...conds.slice().reverse()];
  return { T0, trials: order.map((p, i) => { const s = L.synth({ T0, T: Math.round(T0*(1 + p)), k, L: Lms, model, jitter, noise, seed: seed0 + i }); return { id: i, cond: p, analysis: L.analyzeTrial(s) }; }) };
}
{ const c = L.compare(session('sine', 0.7, 40));
  const pred = c.slipTable.map(r => `${r.cond}:${r.sine.kind}`);
  ok('phase-model data (k = 0.7): k and L recovered', c.ready && near(c.fits.sine.k, 0.7, 0.2) && near(c.fits.sine.L, 40, 20), c.ready && { k: +c.fits.sine.k.toFixed(2), L: Math.round(c.fits.sine.L) });
  ok('phase-model data: it wins on held-out trials and predicts which ones slip', c.verdict === 'phase model ahead on these held-out trials' && c.checks[0].ok, { held: c.held, pred, verdict: c.verdict });
  ok('phase-model data: ±10% trials predicted to slip, ±5% predicted steady', c.slipTable.every(r => (Math.abs(r.cond) > 0.07) === (r.sine.kind === 'slipping')), pred); }
{ const c = L.compare(session('linear', 3, 40));
  ok('linear-model data with small offsets: the phase model is not declared ahead', c.ready && c.verdict !== 'phase model ahead on these held-out trials', { held: c.held, verdict: c.verdict }); }
{ const c = L.compare(session('null', 0, 40, { noise: 0.03 }));
  ok('no-coupling data: fitted k near 0 and the phase model no better than no coupling', c.ready && c.fits.sine.k < 0.3 && c.held.sine >= 0.95*c.held.null, { k: +c.fits.sine.k.toFixed(3), held: c.held }); }
{ const res = { linear: [], sine: [], fast: [] };
  for (const seed of [200, 300, 400, 500, 600]) {
    res.linear.push(L.compare(session('linear', 3, 300, { seed0: seed })).verdict);
    res.sine.push(L.compare(session('sine', 0.7, 300, { seed0: seed })).verdict);
    res.fast.push(L.compare(session('linear', 3, 150, { seed0: seed, T0: 300 })).verdict);
  }
  const ahead = v => v === 'phase model ahead on these held-out trials';
  ok('a delay near half a beat (L = 300 ms at 600 ms; 150 ms at 300 ms) no longer makes linear data look like the phase model', !res.linear.some(ahead) && !res.fast.some(ahead), res);
  ok('with the same delay, real phase-model data is still recognised (at least 4 of 5)', res.sine.filter(ahead).length >= 4, res.sine); }
{ const okShrink = [];
  for (const seed of [10, 20, 30, 40, 50]) { const c = L.compare(session('sine', 1, 40, { seed0: seed, jitter: 6, noise: 0.03 })); okShrink.push(c.checks.find(x => x.name.startsWith('offsets')).ok); }
  ok('the phase model settling from its first tap does not count as shrinking offsets', okShrink.every(x => x !== false), okShrink); }
{ const c = L.compare(session('sine', 0.7, 40));
  const base = c.checks.find(x => x.name.startsWith('baseline')), lag = c.checks.find(x => x.diagnostic);
  ok('checks with nothing to test say so: no second baseline is "not tested"; lag-1 is a diagnostic, never a count against', base.ok === null && lag && lag.ok === null, { base, lag }); }
{ const ss = session('sine', 0.7, 40); ss.trials = ss.trials.slice(0, 5);
  const c = L.compare(ss);
  ok('comparison waits until at least two conditions have a second valid run', !c.ready && c.test === 1, c); }
{ const s = L.synth({ T0: 600, T: 630, k: 4, seed: 5, missAt: [5, 12, 13] }), a = L.analyzeTrial(s), P = L.pairs([Object.assign({ id: 0 }, a)], 600);
  ok('fitting uses only consecutive taps: pairs skip across missed taps', P.length === a.n - 1 - 2, { pairs: P.length, taps: a.n }); }

{ const T0 = 600, trials = [-0.1, -0.05, 0.05, 0.1, 0.1, 0.05, -0.05, -0.1].map((p, i) => { const T = Math.round(T0*(1 + p)), cues = Array.from({ length: 34 }, (_, j) => j*T), taps = cues.slice(4).map(c => ({ t: c + 25 })); return { id: i, cond: p, analysis: L.analyzeTrial({ cues, taps }) }; });
  const c = L.compare({ T0, trials });
  ok('perfectly constant taps: k stops at its bound instead of running away, and no model is declared ahead', c.ready && c.fits.sine.k <= L.K_MAX && c.fits.sine.atBound && c.verdict !== 'phase model ahead on these held-out trials', { k: c.fits.sine.k, verdict: c.verdict }); }

console.log(`\nlab-core: ${results.filter(Boolean).length}/${results.length} passed`);
if (results.some(r => !r)) process.exitCode = 1;
