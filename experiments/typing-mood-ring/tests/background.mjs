// The colour field and ripples behind the typing and journal tabs: a hue opposite the sphere's at a fixed
// brightness, ripples pooled from rapid typing with no flashes, Reduce Motion and the still setting, the lab and
// about tabs left black, and text contrast measured against the pixels actually behind it. Desktop Chromium; phone
// sizes are emulated. Run: node experiments/typing-mood-ring/tests/background.mjs
import { chromium, checks, fresh as open, typeAt, instrumented } from './harness.mjs';
const { ok, done } = checks('background');
const browser = await chromium.launch(); const errors = [];
const URL = instrumented('background.html', [["setMode('free'); booted = true;", "window.__BG = BG; window.__st = st; window.__RIP = RIP; setMode('free'); booted = true;"]]);
const page = (opts = {}) => open(browser, errors, { viewport: { width: 600, height: 1000 }, ...opts }, URL);
const angle = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
// OKLab lightness of the background canvas at (x, y) in CSS px, and the mean over a coarse grid
const SAMPLE = () => {
  const lin = c => { c /= 255; return c <= 0.04045 ? c/12.92 : ((c + 0.055)/1.055)**2.4; };
  const okL = (r, g, b) => { r = lin(r); g = lin(g); b = lin(b);
    const l = Math.cbrt(0.4122214708*r + 0.5363325363*g + 0.0514459929*b), m = Math.cbrt(0.2119034982*r + 0.6806995451*g + 0.1073969566*b), s = Math.cbrt(0.0883024619*r + 0.2817188376*g + 0.6299787005*b);
    return 0.2104542553*l + 0.7936177850*m - 0.0040720468*s; };
  const c = document.getElementById('bg'), x = c.getContext('2d'), k = c.width/innerWidth;
  window.__Lat = (px, py) => { const d = x.getImageData(Math.floor(px*k), Math.floor(py*k), 1, 1).data; return okL(d[0], d[1], d[2]); };
  window.__Lmean = () => { const d = x.getImageData(0, 0, c.width, c.height).data; let t = 0, n = 0; for (let i = 0; i < d.length; i += 4*37) { t += okL(d[i], d[i + 1], d[i + 2]); n++; } return t/n; };
};
const sample = p => p.evaluate(SAMPLE);

// ── the colour: opposite the sphere's hue, at a steady brightness ──────────────────────────────────────────
{ const p = await page();
  await sample(p);
  const rest = await p.evaluate(() => ({ on: getComputedStyle(document.getElementById('bg')).display, hue: __BG.hue, sphere: __st.cur.H }));
  ok('at rest the background is on and opposite the resting sphere (about 180°)', rest.on === 'block' && Math.abs(angle(rest.hue, rest.sphere) - 180) < 5, rest);
  const L0 = await p.evaluate(() => __Lat(10, innerHeight - 10));
  await p.click('#input');
  await typeAt(p, 'quick steady typing makes the sphere warm and bright now', 95);
  const typing = await p.evaluate(() => ({ hue: __BG.hue, sphere: __st.cur.H }));
  await p.waitForTimeout(5000);
  const later = await p.evaluate(() => ({ hue: __BG.hue, target: (__st.cur.H + 180) % 360 }));
  ok('the colour eases toward the complement over seconds, not at once', angle(typing.hue, rest.hue) < angle(later.hue, rest.hue) || angle(rest.hue, later.hue) < 20, { rest: rest.hue, typing, later });
  const L1 = await p.evaluate(() => __Lat(10, innerHeight - 10));
  ok('brightness at a fixed spot stays the same while the hue moves (OKLab L within 0.02)', Math.abs(L1 - L0) < 0.02, { L0, L1 });
  // colour is not black: the page edge has a hue and lightness well above the old near-black
  ok('the background is coloured, not black (OKLab L ≥ 0.18 at the edge)', L1 >= 0.18, L1);
  await p.close(); }

// ── ripples: pooled from rapid typing, faded in and out, no flashes ─────────────────────────────────────────
{ const p = await page();
  await sample(p); await p.click('#input');
  await p.evaluate(() => { window.__rips = []; const push = __BG.rip.push.bind(__BG.rip); __BG.rip.push = (...a) => { window.__rips.push(performance.now()); return push(...a); }; });
  const means = [];
  const typing = (async () => { for (let i = 0; i < 48; i++) { await p.keyboard.type('abcdefghijkl'[i % 12]); await p.waitForTimeout(80); } })();   // 12 keys a second
  for (let i = 0; i < 40; i++) { means.push(await p.evaluate(() => __Lmean())); await p.waitForTimeout(100); }
  await typing;
  const rips = await p.evaluate(() => window.__rips), gaps = rips.slice(1).map((t, i) => t - rips[i]);
  ok('12 keys a second for 4 s make a handful of ripples, never closer than 0.8 s apart', rips.length >= 3 && rips.length <= 6 && gaps.every(g => g >= 795), { n: rips.length, gaps: gaps.map(Math.round) });
  const steps = means.slice(1).map((m, i) => Math.abs(m - means[i])), range = Math.max(...means) - Math.min(...means);
  ok('no flashes: the mean brightness of the background moves by less than 0.003 between samples and 0.01 overall', Math.max(...steps) < 0.003 && range < 0.01, { maxStep: Math.max(...steps).toFixed(4), range: range.toFixed(4) });
  const peak = await p.evaluate(() => __RIP.alpha);
  ok('a ripple is faint: its strongest stroke is 7% opaque, faded in over 0.8 s', peak <= 0.07);
  await p.close(); }

// ── easing toward the opposite hue: the colour passes through grey at the same lightness, it never spins ──────
{ const p = await page();
  await p.evaluate(() => { const D = Math.PI/180; __BG.x = Math.cos(300*D); __BG.y = Math.sin(300*D); });   // the field sits at 300…
  await p.click('button[data-mode="about"]'); await p.click('[data-set-bg="still"]'); await p.click('button[data-mode="free"]');   // …and is asked for 120
  const steps = await p.evaluate(() => new Promise(done => {
    const out = []; let prev = null, t0 = performance.now();
    const look = () => { const C = 0.05*Math.min(1, Math.hypot(__BG.x, __BG.y)), h = __BG.hue*Math.PI/180, ab = [C*Math.cos(h), C*Math.sin(h)];
      if (prev) out.push(Math.hypot(ab[0] - prev[0], ab[1] - prev[1])); prev = ab;
      if (performance.now() - t0 < 4000) requestAnimationFrame(look); else done({ max: Math.max(...out), hue: __BG.hue }); };
    requestAnimationFrame(look); }));
  ok('the colour eases straight across to the opposite hue, with no frame changing it by more than 0.003 in OKLab', steps.max < 0.003, steps);
  await p.close(); }

// ── Reduce Motion, and the still setting ────────────────────────────────────────────────────────────────────
{ const p = await page({ reducedMotion: 'reduce' });
  await p.click('#input'); await typeAt(p, 'typing with reduce motion on', 80); await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({ rips: __BG.rip.length, on: getComputedStyle(document.getElementById('bg')).display }));
  ok('Reduce Motion: the colour stays, the ripples do not appear', r.rips === 0 && r.on === 'block', r);
  await p.close(); }
{ const p = await page();
  await p.click('button[data-mode="about"]'); await p.click('[data-set-bg="still"]');
  ok('the still setting is in the about tab and is remembered', (await p.evaluate(() => localStorage.getItem('tmr-bg'))) === '"still"' && (await p.locator('[data-set-bg="still"]').getAttribute('aria-pressed')) === 'true');
  await p.click('button[data-mode="free"]'); await p.click('#input');
  await typeAt(p, 'fast typing should not move a still background at all', 70); await p.waitForTimeout(3500);
  const r = await p.evaluate(() => ({ rips: __BG.rip.length, hue: __BG.hue }));
  ok('still: no ripples, and one fixed colour whatever the sphere does', r.rips === 0 && angle(r.hue, 120) < 1, r);
  await p.reload(); await p.waitForTimeout(300);
  ok('still survives a reload', await p.evaluate(() => getComputedStyle(document.getElementById('bg')).display === 'block'));
  await p.close(); }

// ── the lab (and about) stay black; the lab's display is unchanged ──────────────────────────────────────────
{ const p = await page();
  const bgOf = () => p.evaluate(() => ({ canvas: getComputedStyle(document.getElementById('bg')).display, page: getComputedStyle(document.documentElement).backgroundColor }));
  await p.click('button[data-mode="lab"]'); await p.waitForTimeout(100);
  const lab = await bgOf();
  await p.click('button[data-mode="about"]'); await p.waitForTimeout(100);
  const about = await bgOf();
  ok('the lab and about tabs have no colour field and the old black page', lab.canvas === 'none' && lab.page === 'rgb(9, 9, 10)' && about.canvas === 'none' && about.page === 'rgb(9, 9, 10)', { lab, about });
  await p.close(); }

// ── text contrast against what is really behind it ──────────────────────────────────────────────────────────
const CONTRAST = sels => {
  const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1]; };
  const over = (b, c) => [0, 1, 2].map(i => c[i]*c[3] + b[i]*(1 - c[3]));
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x/12.92 : ((x + 0.055)/1.055)**2.4; }; return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); };
  const cv = document.getElementById('bg'), cx = cv.getContext('2d'), k = cv.width/innerWidth;
  const out = {};
  for (const sel of sels) {
    const e = document.querySelector(sel); if (!e || !e.getClientRects().length) { out[sel] = null; continue; }
    const r = e.getBoundingClientRect(), x = r.left + Math.min(10, r.width/2), y = r.top + r.height/2;
    const d = cx.getImageData(Math.floor(x*k), Math.floor(y*k), 1, 1).data; let base = [d[0], d[1], d[2]];
    const chain = []; for (let n = e; n && n !== document.documentElement; n = n.parentElement) chain.unshift(n);
    for (const n of chain) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c[3] > 0) base = over(base, c); }
    const fg = over(base, parse(getComputedStyle(e).color)), a = lum(fg), b = lum(base);
    out[sel] = +((Math.max(a, b) + 0.05)/(Math.min(a, b) + 0.05)).toFixed(2);
  }
  return out;
};
for (const [label, opts] of [['desktop', {}], ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
  const p = await page(opts);
  await p.click('button[data-mode="free"]');
  const typed = label === 'desktop' ? p.click('#input') : p.tap('#input');
  await typed; await typeAt(p, 'contrast check', 90);
  if (label === 'phone') { await p.tap('#kbDone'); await p.waitForTimeout(100); }
  await p.waitForTimeout(800);
  const free = await p.evaluate(CONTRAST, ['#tabs button:not(.on)', '#moodSub', '.legendLabels span', '#input', '#jStatus', '.stats span', '#feel span']);
  await p.click('button[data-mode="faith"]'); await p.waitForTimeout(800);
  const faith = await p.evaluate(CONTRAST, ['#target', '#ref', '#verseCount', '.capsB']);
  const all = { ...free, ...faith }, low = Object.entries(all).filter(([, v]) => v != null && v < 4.5);
  ok(`${label}: every text checked has at least 4.5:1 contrast against the colour behind it`, low.length === 0, all);
  await p.close(); }

// ── phones: the pinned sphere takes the page colour only once the page scrolls under it ─────────────────────
{ const p = await page({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.tap('#jOpen'); await p.waitForTimeout(100);
  const look = () => p.evaluate(() => { const e = document.querySelector('.stage'), cs = getComputedStyle(e); return { stuck: e.classList.contains('stuck'), color: cs.backgroundColor, image: cs.backgroundImage.slice(0, 15) }; });
  const top = await look();
  await p.evaluate(() => window.scrollTo(0, 500)); await p.waitForTimeout(150);
  const down = await look();
  ok('phone: at the top the sphere sits on the open colour field; scrolled, it gets an opaque backdrop so text does not show through', !top.stuck && top.color === 'rgba(0, 0, 0, 0)' && top.image === 'none' && down.stuck && down.image.startsWith('radial-gradient'), { top, down });
  await p.close(); }

// the pinned sphere's backdrop against the field around it, from real screenshot pixels decoded in the page
{ const p = await page({ viewport: { width: 390, height: 700 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await p.tap('#jOpen'); await p.waitForTimeout(100);
  await p.evaluate(() => window.scrollTo(0, 500)); await p.waitForTimeout(400);
  // down the left gutter, from inside the pinned stage (above its faded bottom) to the open field just below it
  const edge = await p.evaluate(() => { const r = document.querySelector('.stage').getBoundingClientRect(); return { x: 6, y: Math.round(r.bottom - 22), below: Math.round(r.bottom + 4), h: Math.round(r.bottom + 10) }; });
  const png = (await p.screenshot({ clip: { x: 0, y: 0, width: 390, height: edge.h } })).toString('base64');
  const px = await p.evaluate(async ([src, e]) => {
    const i = new Image(); i.src = 'data:image/png;base64,' + src; await i.decode();
    const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0);
    const at = (x, y) => [...g.getImageData(x, y, 1, 1).data].slice(0, 3);
    return { stage: at(e.x, e.y), field: at(e.x, e.below) };
  }, [png, edge]);
  const diff = (u, v) => Math.max(...u.map((x, i) => Math.abs(x - v[i])));
  ok('phone: the pinned sphere\'s backdrop is the same colour field as around it, with no box edge (screenshot pixels inside it and just below it)', diff(px.stage, px.field) <= 4, px);
  await p.close(); }
{ const p = await page();
  await p.click('button[data-mode="lab"]');
  const t3 = await p.evaluate(() => getComputedStyle(document.querySelector('.lab .small')).color);
  ok('the lab keeps its old text tone (the faint tier was raised only for the colour field)', t3 === 'rgba(255, 255, 255, 0.46)', t3);
  await p.close(); }

ok('no page errors', errors.length === 0, errors);
done();
await browser.close();
