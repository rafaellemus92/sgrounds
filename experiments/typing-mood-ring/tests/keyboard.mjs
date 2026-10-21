// The phone writing view: a small sphere above the field, sized to the visual viewport while the keyboard is open.
// Everything here is EMULATED: desktop Chromium with phone viewports (isMobile, hasTouch) and a stand-in for
// window.visualViewport that the checks move by hand, the way iOS reports a keyboard, a reveal pan, browser bars,
// pinch zoom and rotation. Chromium has no iOS keyboard and no reveal pan, so none of this proves the layout on
// an iPhone; README lists what has to be checked on a real one.
// Run: node experiments/typing-mood-ring/tests/keyboard.mjs
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { chromium, checks, fresh as open, typeAt, shot, PAGE, OUT } from './harness.mjs';
const { ok: ok0, done } = checks('keyboard');
const ok = (name, ...a) => ok0('emulated: ' + name, ...a);
const browser = await chromium.launch(); const errors = [];

// A visual viewport the checks control. Width and height follow the window until a check sets them.
const FAKE_VV = () => {
  const t = new EventTarget(), s = { width: null, height: null, offsetTop: 0, offsetLeft: 0, scale: 1 };
  for (const k of Object.keys(s)) Object.defineProperty(t, k, { get: () => s[k] == null ? (k === 'width' ? innerWidth : innerHeight) : s[k] });
  Object.defineProperty(window, 'visualViewport', { value: t, configurable: true });
  window.__vv = o => { Object.assign(s, o); t.dispatchEvent(new Event('resize')); t.dispatchEvent(new Event('scroll')); };
  window.__vvReset = () => window.__vv({ width: null, height: null, offsetTop: 0, offsetLeft: 0, scale: 1 });
};
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, init: FAKE_VV };
const SIDE = { ...PHONE, viewport: { width: 844, height: 390 } };
const settle = (f, ms = 0) => f.evaluate(ms => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, ms)))), ms);
const vv = async (f, o) => { await f.evaluate(o => window.__vv(o), o); await settle(f); };
const geo = f => f.evaluate(() => {
  const r = s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const b = e.getBoundingClientRect(); return { t: Math.round(b.top), b: Math.round(b.bottom), l: Math.round(b.left), r: Math.round(b.right), h: Math.round(b.height), w: Math.round(b.width) }; };
  return { kb: document.body.classList.contains('kb'), cls: document.body.className, wrap: r('.wrap'), ring: r('#ring'), input: r('#input'), target: r('#target'), mood: r('#moodWord'),
           done: r('#kbDone'), save: r('#kbSave'), header: r('header'), card: r('#gameCard'), docH: document.documentElement.scrollHeight, y: scrollY, ih: innerHeight,
           active: document.activeElement && document.activeElement.id, ta: { st: input.scrollTop, ch: input.clientHeight, sh: input.scrollHeight } };
});
// a rect inside the band [top, top + h] of the visible area
const inside = (x, top, h) => !!x && x.t >= top - 1 && x.b <= top + h + 1;
const stacked = (g, top, h) => g.kb && inside(g.ring, top, h) && inside(g.input, top, h) && g.ring.b <= g.input.t + 1;

// ── portrait: keyboard, reveal pan, long entry, browser bars, Save, zoom, odd readings, done ─────────────────
{ const p = await open(browser, errors, PHONE);
  ok('portrait: no writing view before the field is touched', !(await geo(p)).kb);
  await p.tap('#jOpen'); await p.evaluate(() => window.scrollTo(0, 100)); await settle(p);   // a page long enough to scroll
  const y0 = await p.evaluate(() => scrollY);
  await p.tap('#input'); await settle(p);
  let g = await geo(p);
  ok('portrait: touching the field opens the writing view at once, before any keyboard resize; header and controls hidden', g.kb && !g.header && g.done && g.save && stacked(g, 0, 844), g);
  const ringTop = g.ring.t, ringH = g.ring.h, inTop = g.input.t;
  await vv(p, { height: 420 });                       // the keyboard: iOS shrinks only the visual viewport
  g = await geo(p);
  ok('portrait keyboard (visible 390x420): sphere above the field, both above the keyboard, done and save on screen', stacked(g, 0, 420) && g.wrap.t === 0 && g.wrap.h === 420 && inside(g.done, 0, 420) && inside(g.save, 0, 420), g);
  ok('portrait keyboard: the sphere and the top of the field do not move when the keyboard arrives', g.ring.t === ringTop && g.ring.h === ringH && g.input.t === inTop, { before: { ringTop, ringH, inTop }, after: { t: g.ring.t, h: g.ring.h, i: g.input.t } });
  await vv(p, { offsetTop: 210 });                    // iOS pans the visual viewport to reveal the field
  g = await geo(p);
  ok('reveal pan (offsetTop 210): the view moves with the visible area', g.wrap.t === 210 && stacked(g, 210, 420), g);
  // the caret's line is in view when the field is scrolled to its end, less its bottom padding (8 px) and a little
  const long = Array.from({ length: 80 }, (_, i) => `line ${i + 1}: teh  quick brwn fox ;`).join('\n');
  await p.evaluate(t => document.execCommand('insertText', false, t), long);
  await typeAt(p, ' and more', 40); await settle(p);
  const before = await geo(p);
  ok('long entry (80 lines): the field scrolls on its own and keeps the caret line in view; the page itself does not scroll',
     before.ta.sh > before.ta.ch * 3 && before.ta.st + before.ta.ch >= before.ta.sh - 12 && before.docH <= before.ih + 1 && before.y === 0, { ta: before.ta, docH: before.docH, ih: before.ih, y: before.y });
  await typeAt(p, ' still typing here', 40); await settle(p);
  const after = await geo(p);
  ok('no layout jumps while typing: sphere and field keep their place', JSON.stringify([after.ring, after.input]) === JSON.stringify([before.ring, before.input]), { before: [before.ring, before.input], after: [after.ring, after.input] });
  await vv(p, { height: 376 });                       // the predictive bar or a browser bar takes 44 px
  g = await geo(p);
  ok('the keyboard grows 44 px: sphere size and the top of the field stay put, the field shortens to fit', g.ring.h === after.ring.h && g.ring.t === after.ring.t && g.input.t === after.input.t && stacked(g, 210, 376), g);
  await p.tap('#kbSave'); await settle(p);
  g = await geo(p);
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('tmr-journal')).entries[0].text);
  ok('save in the writing view: saved exactly as typed, and the field keeps focus (keyboard stays up)', saved === long + ' and more still typing here' && g.active === 'input' && g.kb && (await p.textContent('#kbSave')) === 'saved ;', { len: saved.length, active: g.active });
  await vv(p, { scale: 2, width: 195, height: 188 }); // pinch zoom
  g = await geo(p);
  ok('pinch zoom is allowed and the view keeps its last layout instead of jumping', g.kb && g.wrap.h === 376 && g.wrap.t === 210, g.wrap);
  await vv(p, { scale: 1, width: 390, height: 376 });
  await vv(p, { height: 0 });                         // a reading no screen has, as rotation briefly reports
  g = await geo(p);
  ok('an impossible reading (height 0) is ignored', g.kb && g.wrap.h === 376, g.wrap);
  await vv(p, { height: 376, offsetTop: -30 });
  ok('an impossible reading (negative offset) is ignored', (await geo(p)).wrap.t === 210);
  await vv(p, { offsetTop: 210 });
  await p.tap('#kbDone'); await settle(p, 20); await p.evaluate(() => window.__vvReset()); await settle(p);
  g = await geo(p);
  ok('done closes the writing view and returns the page to where it was', !g.kb && g.active !== 'input' && y0 === 100 && g.y === y0 && g.header, { y: g.y, y0, active: g.active });
  ok('the text is untouched by the round trip', (await p.inputValue('#input')) === long + ' and more still typing here');
  const meta = await p.evaluate(() => document.querySelector('meta[name=viewport]').content);
  ok('zoom is not disabled: no maximum-scale or user-scalable in the viewport meta', !/maximum-scale|user-scalable/.test(meta), meta);
  await p.evaluate(() => window.__vv({ scale: 1.5, width: 260, height: 563 }));
  await p.tap('#input'); await settle(p);
  ok('touching the field while zoomed in leaves the page as it is', !(await geo(p)).kb);
  await vv(p, { scale: 1, width: 390, height: 420 });
  ok('zooming back out with the field focused opens the writing view', stacked(await geo(p), 0, 420));
  const fs = await p.evaluate(() => parseFloat(getComputedStyle(input).fontSize));
  ok('field text is at least 16 px in the writing view, so iOS does not zoom on focus', fs >= 16, fs);
  await p.screenshot({ path: shot('kb-portrait.png') });
  await p.close(); }

// ── the modes in portrait with the keyboard open ─────────────────────────────────────────────────────────
{ const p = await open(browser, errors, PHONE);
  const res = {};
  for (const [m, start, what] of [['faith', null, 'target'], ['game', '#gStart', 'target'], ['sprint', '#pStart', 'mood'], ['duel', '#dStart', 'target']]) {
    await p.tap(`button[data-mode="${m}"]`); await settle(p, 100);
    res[m + ':noKeyboardOnTabSwitch'] = !(await geo(p)).kb;
    if (start) await p.tap(start); else await p.tap('#input');
    await settle(p, 1700); await vv(p, { height: 420 });
    const g = await geo(p), x = g[what];
    res[m] = stacked(g, 0, 420) && inside(x, 0, 420) && x.t >= g.ring.b - 8 && x.b <= g.input.t + 1 && g.ring.r <= 390 && g.input.h >= 44;
    if (!res[m]) res[m + ':rects'] = { ring: g.ring, x, input: g.input };
    await p.screenshot({ path: shot(`kb-portrait-${m}.png`) });
    await p.tap('#kbDone'); await settle(p, 20); await p.evaluate(() => window.__vvReset()); await settle(p);
    await p.tap('#reset'); await settle(p, 100);
  }
  ok('faith, game, sprint and duel with the keyboard open: sphere, the line or word to type, then the field, all above the keyboard; tab switches open no keyboard',
     Object.entries(res).every(([k, v]) => k.endsWith(':rects') || v), res);
  await p.tap('button[data-mode="sprint"]'); await p.tap('#pStart'); await settle(p, 100); await vv(p, { height: 420 });
  await p.waitForFunction(() => gameCard.textContent.includes('went dark'), null, { timeout: 20000 });
  await p.evaluate(() => window.__vvReset()); await settle(p, 50);
  const g = await geo(p);
  ok('a run that ends closes the writing view, so the result card shows', !g.kb && g.card && g.card.t >= 0 && g.card.t < g.ih - 40, { kb: g.kb, card: g.card });
  await p.close(); }

// ── sideways, and turning the phone with the keyboard open ───────────────────────────────────────────────
{ const p = await open(browser, errors, SIDE);
  await p.tap('#input'); await settle(p); await vv(p, { height: 140 });
  let g = await geo(p);
  ok('landscape keyboard (visible 844x140): sphere to the left of the field, both above the keyboard, field at least two lines',
     g.kb && g.cls.includes('kb-side') && g.ring.r <= g.input.l && inside(g.ring, 0, 140) && inside(g.input, 0, 140) && g.input.h >= 44 && inside(g.done, 0, 140), g);
  await p.keyboard.type('sideways'); await p.tap('#kbDone'); await settle(p, 20); await p.evaluate(() => window.__vvReset()); await settle(p);
  const res = {};
  for (const [m, start, what] of [['faith', null, 'target'], ['sprint', '#pStart', 'mood'], ['duel', '#dStart', 'target']]) {
    await p.tap(`button[data-mode="${m}"]`); await settle(p, 100);
    if (start) { await p.locator(start).scrollIntoViewIfNeeded(); await p.tap(start); } else await p.tap('#input');
    await settle(p, 1700); await vv(p, { height: 140 });
    const q = await geo(p), x = q[what];
    res[m] = q.kb && inside(q.ring, 0, 140) && inside(x, 0, 140) && inside(q.input, 0, 140) && x.b <= q.input.t + 1 && q.ring.r <= q.input.l + 1 && q.input.h >= 40;
    if (!res[m]) res[m + ':rects'] = { ring: q.ring, x, input: q.input };
    await p.screenshot({ path: shot(`kb-landscape-${m}.png`) });
    await p.tap('#kbDone'); await settle(p, 20); await p.evaluate(() => window.__vvReset()); await settle(p);
    await p.tap('#reset'); await settle(p, 100);
  }
  ok('landscape faith, sprint and duel: the line or word to type and the field beside the sphere, all above the keyboard', Object.entries(res).every(([k, v]) => k.endsWith(':rects') || v), res);
  await p.close(); }
{ const p = await open(browser, errors, PHONE);
  await p.tap('#input'); await p.keyboard.type('turning ;'); await vv(p, { height: 420 });
  await p.setViewportSize({ width: 844, height: 390 });
  await p.evaluate(() => { window.__vv({ width: 844, height: 140 }); window.dispatchEvent(new Event('orientationchange')); }); await settle(p, 450);
  let g = await geo(p);
  ok('turned sideways with the keyboard open: side by side within the new visible area', g.kb && g.cls.includes('kb-side') && inside(g.ring, 0, 140) && inside(g.input, 0, 140) && g.ring.r <= g.input.l, g);
  await p.setViewportSize({ width: 390, height: 844 });
  await p.evaluate(() => { window.__vv({ width: 390, height: 420 }); window.dispatchEvent(new Event('orientationchange')); }); await settle(p, 450);
  g = await geo(p);
  ok('turned back upright: stacked again within the visible area, text and focus kept', g.kb && !g.cls.includes('kb-side') && stacked(g, 0, 420) && g.active === 'input' && (await p.inputValue('#input')) === 'turning ;', g);
  await p.close(); }

// ── in a frame, as claude.ai shows the page: the frame cannot see the keyboard ───────────────────────────
function framePage(name, w, h){
  const f = `${OUT}/${name}`;
  writeFileSync(f, `<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;height:100%;background:#000}iframe{display:block;width:100%;height:100%;border:0}</style><iframe id="f" src="${PAGE}"></iframe>`);
  return pathToFileURL(f).href;
}
{ const p = await open(browser, errors, PHONE, framePage('frame-portrait.html'));
  const fr = p.frames().find(f => f !== p.mainFrame());
  await p.frameLocator('#f').locator('#input').tap(); await settle(fr);
  let g = await geo(fr);
  ok('framed portrait, frame unchanged by the keyboard: the view keeps to the top 45% of the frame (a guess to check on a real iPhone)',
     g.kb && g.cls.includes('kb-capped') && g.wrap.t === 0 && Math.abs(g.wrap.h - Math.round(844*0.45)) <= 1 && stacked(g, 0, g.wrap.h) && g.input.h >= 120, g);
  await p.evaluate(() => { document.getElementById('f').style.height = '420px'; }); await settle(fr, 50);
  g = await geo(fr);
  ok('framed, host shrinks the frame to the visible area: the view uses all of it', g.kb && !g.cls.includes('kb-capped') && g.wrap.h === 420 && stacked(g, 0, 420), g);
  await p.close(); }
{ const p = await open(browser, errors, SIDE, framePage('frame-landscape.html'));
  const fr = p.frames().find(f => f !== p.mainFrame());
  await p.frameLocator('#f').locator('#input').tap(); await settle(fr);
  const g = await geo(fr);
  ok('framed landscape: side by side in the top quarter of the frame, field at least two lines', g.kb && g.cls.includes('kb-side') && g.cls.includes('kb-capped') && inside(g.ring, 0, g.wrap.h) && inside(g.input, 0, g.wrap.h) && g.input.h >= 40 && g.wrap.h <= 110, g);
  await p.screenshot({ path: shot('kb-frame-landscape.png') });
  await p.close(); }

// ── review fixes: caret away from the end, landscape stability, turning then done, open sideways, verse window ──
// The caret's line is in view when the browser's own caret reveal has nothing to scroll: moving the caret right
// and back (which Chromium follows by scrolling the field) leaves scrollTop where it was. Independent of the page's
// own measurement.
const caretSeen = async f => {
  const st = await f.evaluate(() => input.scrollTop);
  await f.keyboard.press('ArrowRight'); await f.keyboard.press('ArrowLeft'); await settle(f);
  const after = await f.evaluate(() => input.scrollTop);
  return { st, after, seen: Math.abs(after - st) <= 1 };
};
{ const p = await open(browser, errors, PHONE);
  const long = Array.from({ length: 80 }, (_, i) => `line ${i + 1}: an old entry being fixed`).join('\n');
  await p.evaluate(t => { input.value = t; input.dispatchEvent(new Event('input')); const at = t.indexOf('line 78:'); input.setSelectionRange(at, at); input.scrollTop = input.scrollHeight; }, long);
  await p.evaluate(() => input.focus()); await settle(p);
  await vv(p, { height: 420 }); await settle(p);
  const c = await caretSeen(p);
  ok('a caret away from the end (line 78 of 80) stays in view when the keyboard shrinks the field', c.seen, c);
  await p.evaluate(() => { const at = input.value.indexOf('line 3:'); input.setSelectionRange(at, at); input.scrollTop = input.scrollHeight; });
  await vv(p, { height: 380 }); await settle(p);
  const c2 = await caretSeen(p);
  ok('…and one near the top (line 3) too', c2.seen, c2);
  await p.close(); }
{ const p = await open(browser, errors, PHONE);   // a caret inside a word that soft-wraps to the next line
  const prose = Array.from({ length: 400 }, (_, i) => ['the', 'loom', 'keeps', 'its', 'beat', 'while', 'sentences', 'gather', 'slowly', 'cooling'][i % 10]).join(' ');
  await p.evaluate(t => { input.value = t; input.dispatchEvent(new Event('input')); }, prose);
  await p.evaluate(() => input.focus()); await settle(p);
  const pos = await p.evaluate(() => {   // the first word of a wrapped line two thirds of the way down, caret inside it
    const words = [...input.value.matchAll(/\S+/g)], m = document.createElement('div'), cs = getComputedStyle(input);
    Object.assign(m.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'pre-wrap', overflowWrap: 'break-word', font: cs.font, width: (input.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)) + 'px' });
    document.body.appendChild(m); let prev = -1, starts = [];
    for (const w of words) { m.textContent = input.value.slice(0, w.index + w[0].length); const h = m.offsetHeight; if (h > prev && prev >= 0) starts.push(w.index); prev = h; }
    m.remove(); const at = starts[Math.floor(starts.length*0.66)]; return at + 3;
  });
  await p.evaluate(at => { input.setSelectionRange(at, at); input.scrollTop = 0; }, pos);
  const res = [];
  for (const h of [420, 380, 360]) { await vv(p, { height: h }); await settle(p); res.push(await caretSeen(p)); }
  ok('a caret inside the first word of a wrapped line stays in view as the keyboard shrinks the field', res.every(r => r.seen), res);
  await p.close(); }
for (const [vw, vh, kh] of [[844, 390, 140], [667, 330, 110]]) {
  const p = await open(browser, errors, { ...PHONE, viewport: { width: vw, height: vh } });
  const res = {};
  for (const m of ['free', 'faith']) {
    await p.tap(`button[data-mode="${m}"]`); await settle(p, 100);
    await p.tap('#input'); await settle(p);
    const a = await geo(p);
    await vv(p, { height: kh });
    const b = await geo(p);
    res[m] = { before: [a.input.l, a.input.t, a.target && a.target.w, a.target && a.target.h], after: [b.input.l, b.input.t, b.target && b.target.w, b.target && b.target.h] };
    res[m].same = JSON.stringify(res[m].before) === JSON.stringify(res[m].after) && inside(b.input, 0, kh) && inside(b.ring, 0, kh);
    await p.tap('#kbDone'); await settle(p, 20); await p.evaluate(() => window.__vvReset()); await settle(p);
  }
  ok(`landscape ${vw}x${vh}: the keyboard arriving (visible ${kh}) moves neither the field nor the verse box`, res.free.same && res.faith.same, res);
  await p.close(); }
{ const p = await open(browser, errors, PHONE);
  await p.tap('button[data-mode="faith"]'); await settle(p, 100);
  await p.tap('#input'); await vv(p, { height: 420 });
  await p.setViewportSize({ width: 844, height: 390 });
  await p.evaluate(() => { window.__vv({ width: 844, height: 140 }); window.dispatchEvent(new Event('orientationchange')); }); await settle(p, 450);
  await p.tap('#kbDone'); await settle(p, 20); await p.evaluate(() => window.__vvReset()); await settle(p);
  let g = await geo(p);
  ok('upright, typing, turned sideways, done: the field is on screen', !g.kb && g.input.t >= 0 && g.input.t < g.ih - 40, g.input);
  await p.close(); }
{ const p = await open(browser, errors, PHONE);   // turning with the keyboard open: same sizes as entering in each orientation
  await p.tap('#input'); await vv(p, { height: 420 });
  const up = await geo(p);
  await p.setViewportSize({ width: 844, height: 390 });
  await p.evaluate(() => { window.__vv({ width: 844, height: 140 }); window.dispatchEvent(new Event('orientationchange')); }); await settle(p, 450);
  const side = await geo(p);
  await p.setViewportSize({ width: 390, height: 844 });
  await p.evaluate(() => { window.__vv({ width: 390, height: 420 }); window.dispatchEvent(new Event('orientationchange')); }); await settle(p, 450);
  const back = await geo(p);
  ok('turning with the keyboard open keeps the sphere at its own size for each orientation, and the field where it was', up.ring.h === 80 && side.ring.h === 72 && back.ring.h === 80 && back.input.t === up.input.t, { up: up.ring.h, side: side.ring.h, back: back.ring.h, t: [up.input.t, back.input.t] });
  await p.close(); }
{ const p = await open(browser, errors, SIDE);   // sideways, back into the writing view mid-verse
  await p.tap('button[data-mode="faith"]'); await settle(p, 100);
  for (let i = 0; i < 3; i++) await p.tap('#nextVerse');
  await p.tap('#input'); await settle(p);
  const v = await p.textContent('#target');
  await typeAt(p, v.slice(0, Math.round(v.length*0.55)), 8);
  await p.tap('#kbDone'); await settle(p, 50);
  await p.tap('#input'); await settle(p, 50);
  const lineSeen = () => p.evaluate(() => { const c = document.querySelector('#target .cur').getBoundingClientRect(), t = target.getBoundingClientRect(); return { c: [Math.round(c.top), Math.round(c.bottom)], t: [Math.round(t.top), Math.round(t.bottom)], ok: c.top >= t.top - 1 && c.bottom <= t.bottom + 1 }; });
  const a = await lineSeen(); await vv(p, { height: 140 }); const b = await lineSeen();
  ok('sideways, back into the writing view mid-verse: the one-line window shows the next letter, before and after the keyboard', a.ok && b.ok, { a, b });
  await p.close(); }
{ const p = await open(browser, errors, SIDE);
  await p.tap('#input'); await p.keyboard.type('turning back upright'); await vv(p, { height: 140 });
  await p.evaluate(() => window.scrollTo(0, 99999));
  await p.setViewportSize({ width: 390, height: 844 });
  await p.evaluate(() => { window.__vv({ width: 390, height: 420 }); window.dispatchEvent(new Event('orientationchange')); }); await settle(p, 450);
  await p.tap('#kbDone'); await settle(p, 20); await p.evaluate(() => window.__vvReset()); await settle(p);
  const g = await geo(p), stage = await p.evaluate(() => document.querySelector('.stage').getBoundingClientRect().bottom);
  ok('sideways, typing, turned upright, done: the field is below the pinned sphere, not under it', !g.kb && g.input.t >= stage - 1 && g.input.t < g.ih - 40, { input: g.input, stage });
  await p.close(); }
{ const p = await open(browser, errors, SIDE);
  await p.tap('#input'); await p.keyboard.type('an entry to reopen sideways'); await p.tap('#kbSave'); await p.tap('#kbDone'); await settle(p, 50);
  await p.locator('#jOpen').scrollIntoViewIfNeeded(); await p.tap('#jOpen'); await settle(p, 50);
  await p.locator('#jList [data-open]').first().scrollIntoViewIfNeeded(); await p.tap('#jList [data-open]'); await settle(p, 50);
  const g = await geo(p);
  ok('opening an entry on a sideways phone shows the field', (await p.inputValue('#input')) === 'an entry to reopen sideways' && g.input.t >= 0 && g.input.t < g.ih - 40, g.input);
  await p.close(); }
{ const p = await open(browser, errors, PHONE);
  await p.tap('button[data-mode="faith"]'); await settle(p, 100);
  for (let i = 0; i < 3; i++) await p.tap('#nextVerse');   // Psalm 23:2-3, a long verse
  await p.tap('#input'); await vv(p, { height: 420 });
  const v = await p.textContent('#target');
  await typeAt(p, v.slice(0, Math.round(v.length*0.8)), 8);
  await p.tap('#kbDone'); await settle(p, 20); await p.evaluate(() => window.__vvReset()); await settle(p, 50);
  const r = await p.evaluate(() => { const c = document.querySelector('#target .cur').getBoundingClientRect(), t = target.getBoundingClientRect(); return { c: [c.top, c.bottom], t: [t.top, t.bottom] }; });
  ok('done in the middle of a long verse: the two-line window still shows the next letter to type', r.c[0] >= r.t[0] - 1 && r.c[1] <= r.t[1] + 1, r);
  await p.close(); }
{ const DRAWN = () => { const f = CanvasRenderingContext2D.prototype.fillText; window.__drawn = new Set(); CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__drawn.add(String(t).split(' ')[0]); return f.call(this, t, ...a); }; };
  const p = await open(browser, errors, { viewport: { width: 280, height: 653 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, init: DRAWN });
  await p.tap('button[data-mode="duel"]'); await settle(p, 200);
  const seen = await p.evaluate(() => [...window.__drawn]);
  ok('a 280 px phone, keyboard closed: the duel still labels both spheres', seen.includes('you') && seen.includes('jötunn'), seen);
  await p.close(); }

// ── no writing view without a touch screen ───────────────────────────────────────────────────────────────
{ const p = await open(browser, errors, { viewport: { width: 400, height: 800 }, init: FAKE_VV });
  await p.click('#input'); await settle(p);
  ok('a narrow desktop window (no touch): focus leaves the page as it is', !(await geo(p)).kb);
  await p.close(); }

ok('no page errors', errors.length === 0, errors);
done();
await browser.close();
