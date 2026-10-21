// Interaction pass: count-in, background and resume, caret, Loki's HUD and rays, phone layout.
// Phones are viewport emulation in desktop Chromium (isMobile, hasTouch), not a real device.
// Run: node experiments/typing-mood-ring/tests/interaction.mjs
import { chromium, checks, fresh as open, txt, typeAt, hide, instrumented, shot } from './harness.mjs';
const { ok, done } = checks('interaction');
const browser = await chromium.launch(); const errors = [];
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const visible = (p, sel) => p.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, vw: innerWidth }; }, sel);
// record every string drawn on canvases, to see the duel count-in that phones show only there
const DRAWN = () => { const f = CanvasRenderingContext2D.prototype.fillText; window.__drawn = []; CanvasRenderingContext2D.prototype.fillText = function (t, ...a) { window.__drawn.push(String(t)); if (window.__drawn.length > 5000) window.__drawn.splice(0, 2500); return f.call(this, t, ...a); }; };

// the opponent's keystrokes per animation frame, to catch a catch-up burst after the page was hidden
const BURST_URL = instrumented('burst.html', [
  ["function driveOpp(now){\n  if (!duel.on) return;", "function driveOpp(now){\n  if (!duel.on) return; let __n = 0; queueMicrotask(() => (window.__kf ||= []).push(__n));"],
  ["keystroke(opp, duel.next);", "__n++; keystroke(opp, duel.next);"],
  ["keystroke(opp, t); duel.si++;", "__n++; keystroke(opp, t); duel.si++;"],
]);

// ── count-in ─────────────────────────────────────────────────────────────────
{ const p = await open(browser, errors);
  const cdp = await p.context().newCDPSession(p);
  await p.click('button[data-mode="sprint"]'); await p.click('#pStart'); await p.waitForTimeout(150);
  const seen = new Set([await txt(p, '#moodWord')]);
  await p.keyboard.type('abc');
  await cdp.send('Input.imeSetComposition', { text: 'xy', selectionStart: 2, selectionEnd: 2 });
  await cdp.send('Input.insertText', { text: 'xy' });
  const during = await p.inputValue('#input');
  for (let i = 0; i < 14; i++) { await p.waitForTimeout(100); seen.add(await txt(p, '#moodWord')); }
  const word = await txt(p, '#moodWord');
  ok('sprint count-in shows 3, 2, 1 then a word', ['3', '2', '1'].every(n => seen.has(n)) && /^[A-Za-z']+$/.test(word), [...seen]);
  ok('keys and IME text typed during the count-in are discarded', during === '' && (await p.inputValue('#input')) === '' && (await txt(p, '#sKps')) === '0.0', { during, kps: await txt(p, '#sKps') });
  const t0 = Date.now(); await typeAt(p, word, 60);
  ok('the first word is typeable right after go', +(await txt(p, '#pWords')) === 1, Date.now() - t0);
  await p.close(); }
{ const p = await open(browser, errors, { ...PHONE, init: DRAWN });
  await p.tap('button[data-mode="duel"]'); await p.waitForTimeout(450);
  await p.evaluate(() => { window.__drawn.length = 0; }); await p.tap('#dStart');
  await p.waitForTimeout(250); await p.keyboard.type('Hold');
  await p.waitForTimeout(1500);
  const drawn = await p.evaluate(() => window.__drawn), moodShown = await p.evaluate(() => getComputedStyle(document.querySelector('.mood')).display !== 'none');
  ok('phone duel: the count-in is drawn on the pinned canvas (3, 2, 1)', ['3', '2', '1'].every(n => drawn.includes(n)) && !moodShown, { moodShown });
  ok('phone duel: keys during the count-in do not enter the field', (await p.inputValue('#input')) === '');
  await p.close(); }

// ── background and resume (emulated: visibilitychange + held animation frames) ─
{ const p = await open(browser, errors, { gate: true });
  await p.click('button[data-mode="game"]'); await p.click('#gStart'); await p.waitForTimeout(1200);
  const before = parseInt(await txt(p, '#gTime'));
  await hide(p, true); await p.waitForTimeout(4000); await hide(p, false); await p.waitForTimeout(300);
  const after = parseInt(await txt(p, '#gTime'));
  ok('game: 4 s in the background does not cost line time', after >= before - 1 && (await p.evaluate(() => gameCard.classList.contains('hidden'))), { before, after });
  await p.click('button[data-mode="sprint"]'); await p.click('#pStart'); await p.waitForTimeout(1700);
  for (let i = 0; i < 2; i++) await typeAt(p, await txt(p, '#moodWord'), 50);
  await hide(p, true); await p.waitForTimeout(8000); await hide(p, false); await p.waitForTimeout(300);
  const alive = await p.evaluate(() => gameCard.classList.contains('hidden'));
  await typeAt(p, await txt(p, '#moodWord'), 50);
  ok('sprint: 8 s in the background (longer than a full tank) does not end the run', alive && +(await txt(p, '#pWords')) === 3);
  await p.close(); }
{ const p = await open(browser, errors, { gate: true }, BURST_URL);
  await p.click('button[data-mode="duel"]'); await p.click('#dStart'); await p.waitForTimeout(3600);
  const h1 = +(await txt(p, '#hT')), k1 = parseFloat(await txt(p, '#hB1'));
  await hide(p, true); await p.waitForTimeout(4000);
  await p.evaluate(() => { window.__kf = []; });
  await hide(p, false); await p.waitForTimeout(600);
  const h2 = +(await txt(p, '#hT')), k2 = parseFloat(await txt(p, '#hB1')), most = await p.evaluate(() => Math.max(0, ...(window.__kf || [])));
  ok('duel: the clock pauses in the background', h2 >= h1 - 1, { h1, h2 });
  ok('duel: the jötunn neither bursts nor resets on return (≤ 2 keys a frame, steady k/s)', most <= 2 && Math.abs(k2 - k1) < 0.6, { mostKeysInOneFrame: most, before: k1, after: k2 });
  await p.close(); }
{ const p = await open(browser, errors, { gate: true });
  await p.click('#input'); await typeAt(p, 'a steady pulse here', 150);
  await hide(p, true); await p.waitForTimeout(1500); await hide(p, false); await p.waitForTimeout(150);
  const s = { kps: await txt(p, '#sKps'), sync: await txt(p, '#sSync'), sub: await txt(p, '#moodSub') };
  ok('free: the ring wakes fresh after the page was hidden', s.kps === '0.0' && s.sync === '—' && s.sub === 'type to wake the ring', s);
  await p.close(); }

// ── caret ────────────────────────────────────────────────────────────────────
{ const p = await open(browser, errors);
  await p.click('button[data-mode="faith"]'); await p.waitForTimeout(150);
  const verse = await txt(p, '#target');
  await p.click('#input'); await typeAt(p, verse.slice(0, 6), 40);
  const box = await p.locator('#input').boundingBox();
  await p.mouse.click(box.x + 20, box.y + 24);                 // click at the start of the text
  await p.keyboard.type(verse[6]);
  await p.keyboard.press('ArrowLeft'); await p.keyboard.press('ArrowLeft'); await p.keyboard.press('Home');
  await p.keyboard.type(verse[7]);
  await p.mouse.move(box.x + 20, box.y + 24); await p.mouse.down(); await p.mouse.move(box.x + 60, box.y + 24); await p.mouse.up();  // drag-select
  await p.keyboard.type(verse[8]);
  const v = await p.inputValue('#input'), bad = await p.evaluate(() => document.querySelectorAll('#target .bad').length);
  ok('faith: clicks, arrows, Home and drag-select cannot move the caret off the end', v === verse.slice(0, 9) && bad === 0, { v, bad });
  await p.click('button[data-mode="free"]'); await p.click('#input'); await p.keyboard.type('hello world');
  const fbox = await p.locator('#input').boundingBox();                // the field moves when the verse goes away
  await p.mouse.click(fbox.x + 20, fbox.y + 24); await p.keyboard.press('Home'); await p.keyboard.type('>');
  ok('free: the caret is yours to move (no target, no lock)', (await p.inputValue('#input')).startsWith('>'), await p.inputValue('#input'));
  await p.close(); }
{ const p = await open(browser, errors, PHONE);
  await p.tap('button[data-mode="faith"]'); await p.waitForTimeout(150);
  const verse = await txt(p, '#target');
  await p.tap('#input'); await typeAt(p, verse.slice(0, 6), 40);
  const box = await p.locator('#input').boundingBox();
  await p.touchscreen.tap(box.x + 18, box.y + 20); await p.waitForTimeout(100);
  await p.keyboard.type(verse[6]);
  ok('phone faith: a tap at the start of the field still appends at the end', (await p.inputValue('#input')) === verse.slice(0, 7), await p.inputValue('#input'));
  await p.close(); }

// ── Loki: the HUD and the rays agree on every frame (instrumented copy of the page) ─
const LOKI_URL = instrumented('loki.html', [
  ["  const pt = new Path2D(), pr = new Path2D();", "  const pt = new Path2D(), pr = new Path2D(); const __rc = { t: 0, r: 0 }; window.__rays[dir] = __rc;"],
  ["      pt.moveTo(x0, y0); pt.lineTo(xm, yb);", "      __rc.t++; pt.moveTo(x0, y0); pt.lineTo(xm, yb);"],
  ["      pr.moveTo(x0, y0); pr.lineTo(xm, yb);", "      __rc.r++; pr.moveTo(x0, y0); pr.lineTo(xm, yb);"],
  ["  const la = duel.on && now < duel.lokiUntil[0], lb = duel.on && now < duel.lokiUntil[1];", "  window.__rays = {}; const la = duel.on && now < duel.lokiUntil[0], lb = duel.on && now < duel.lokiUntil[1];"],
  ["  if (E.lB.style.width !== wb) E.lB.style.width = wb;\n}", "  if (E.lB.style.width !== wb) E.lB.style.width = wb;\n  if (duel.on && (now < duel.lokiUntil[0] || now < duel.lokiUntil[1])) (window.__loki ||= []).push({ side: now < duel.lokiUntil[0] ? 0 : 1, a: E.hA2.textContent, b: E.hB2.textContent, rays: JSON.parse(JSON.stringify(window.__rays)) });\n}"],
]);
const lokiCheck = (log, side) => {
  const s = log.filter(x => x.side === side);
  const bad = s.filter(x => side === 0
    ? !(x.a === 'light through 100%' && x.b === 'light through 0%' && x.rays['-1'] && x.rays['-1'].t === 0 && x.rays['-1'].r > 0 && x.rays['1'] && x.rays['1'].t > 0)
    : !(x.b === 'light through 100%' && x.a === 'light through 0%' && x.rays['1'] && x.rays['1'].t === 0 && x.rays['1'].r > 0 && x.rays['-1'] && x.rays['-1'].t > 0));
  return { frames: s.length, bad: bad.length, sample: bad[0] || s[0] };
};
{ const p = await open(browser, errors, {}, LOKI_URL);
  await p.click('button[data-mode="duel"]'); await p.click('#dStart');
  await p.waitForFunction(() => (window.__loki || []).some(x => x.side === 0), null, { timeout: 25000 }).catch(() => {});
  await p.waitForTimeout(2200);
  const r = lokiCheck(await p.evaluate(() => window.__loki || []), 0);
  ok('your Loki: every frame shows your light 100% through, theirs 0%, and their rays turned back', r.frames > 30 && r.bad === 0, r);
  await p.screenshot({ path: shot('loki-yours.png') });
  await p.close(); }
{ const p = await open(browser, errors, {}, LOKI_URL);
  await p.click('button[data-mode="duel"]'); await p.click('#dStart'); await p.waitForTimeout(1700);
  const t0 = Date.now();
  while (Date.now() - t0 < 16000 && !(await p.evaluate(() => (window.__loki || []).some(x => x.side === 1)))) {
    const line = await txt(p, '#target'); if (!line) break;
    const typed = await p.inputValue('#input'); await typeAt(p, line.slice(typed.length, typed.length + 6), 150);
  }
  await p.waitForTimeout(2200);
  const r = lokiCheck(await p.evaluate(() => window.__loki || []), 1);
  ok('jötunn Loki: every frame shows its light 100% through, yours 0%, and your rays turned back', r.frames > 30 && r.bad === 0, r);
  await p.close(); }

// ── phone layout (viewport emulation) ────────────────────────────────────────
for (const vp of [{ width: 320, height: 480 }, { width: 360, height: 420 }, { width: 390, height: 844 }]) {
  const p = await open(browser, errors, { ...PHONE, viewport: vp });
  const tabs = await visible(p, '#tabs');
  const res = {};
  for (const [m, start, what] of [['sprint', '#pStart', '#moodWord'], ['duel', '#dStart', '#target'], ['faith', null, '#target']]) {
    await p.tap(`button[data-mode="${m}"]`); await p.waitForTimeout(450);
    if (start) { const b = await visible(p, start), st = await visible(p, '.stage'); res[m + ':start'] = b.top >= st.bottom - 1 && b.bottom <= b.vh; await p.tap(start); await p.waitForTimeout(1800); }
    else await p.tap('#input');
    await p.waitForTimeout(450);
    const c = await visible(p, '#ring'), s = await visible(p, '.stage'), w = await visible(p, what === '#target' ? '#target .cur' : what), i = await visible(p, '#input');
    const slack = what === '#moodWord' ? 8 : 1;    // the word's line box has a few px of padding above the letters
    res[m] = c.top >= 0 && w.top >= s.bottom - slack && w.bottom <= i.top + 1 && i.bottom <= i.vh;
    if (!res[m]) res[m + ':rects'] = { c, s, w, i };
    await p.screenshot({ path: shot(`phone-${vp.width}x${vp.height}-${m}.png`) });
    await p.tap('#reset'); await p.waitForTimeout(150);
  }
  ok(`phone ${vp.width}x${vp.height}: tabs on screen at load; start bars visible; sphere, the caret's line and field visible while typing`, tabs.top >= 0 && Object.entries(res).every(([k, v]) => k.endsWith(':rects') || v), res);
  await p.close();
}
// landscape: the redesign is deferred; check only that the controls remain usable
for (const vp of [{ width: 844, height: 390 }, { width: 740, height: 360 }]) {
  const p = await open(browser, errors, { ...PHONE, viewport: vp });
  const res = {};
  for (const [m, start] of [['game', '#gStart'], ['sprint', '#pStart'], ['duel', '#dStart']]) {
    await p.tap(`button[data-mode="${m}"]`); await p.waitForTimeout(300);
    await p.locator(start).scrollIntoViewIfNeeded();
    const hit = await p.evaluate(sel => { const b = document.querySelector(sel), r = b.getBoundingClientRect(); return document.elementFromPoint(r.left + r.width/2, r.top + r.height/2) === b; }, start);
    await p.tap(start); await p.waitForTimeout(1800);
    const i = await visible(p, '#input'), c = await visible(p, '#ring'), t = await visible(p, m === 'sprint' ? '#moodWord' : '#target');
    res[m] = { startTappable: hit, fieldOnScreen: i.top >= 0 && i.bottom <= i.vh, lineOnScreen: t.top >= 0 && t.bottom <= i.top + 1, sphereOnScreen: c.bottom > 0 && c.top < c.vh };
    if (m === 'game') await p.screenshot({ path: shot(`landscape-${vp.width}x${vp.height}-game.png`) });
    await p.tap('#reset'); await p.waitForTimeout(150);
  }
  await p.tap('button[data-mode="sprint"]'); await p.waitForTimeout(300);
  await p.locator('#pStart').scrollIntoViewIfNeeded(); await p.tap('#pStart');
  await p.waitForFunction(() => gameCard.textContent.includes('went dark'), null, { timeout: 20000 });
  await p.waitForTimeout(300);
  const card = await visible(p, '#gameCard');
  res.resultCard = { onScreen: card.top >= 0 && card.top < card.vh - 40, top: card.top, vh: card.vh };
  ok(`landscape ${vp.width}x${vp.height}: sprint result card on screen when the run ends`, res.resultCard.onScreen, res.resultCard);
  delete res.resultCard;
  ok(`landscape ${vp.width}x${vp.height}: start buttons tappable; the line to type and the field on screen`, Object.values(res).every(r => r.startTappable && r.fieldOnScreen && r.lineOnScreen), res);
  await p.screenshot({ path: shot(`landscape-${vp.width}x${vp.height}.png`) });
  await p.close();
}

{ const p = await open(browser, errors, { viewport: { width: 1280, height: 480 } });
  await p.keyboard.type('abc');
  ok('short desktop window (1280x480): the field is focused at load and takes typing', (await p.inputValue('#input')) === 'abc');
  await p.close(); }

ok('no page errors', errors.length === 0, errors);
done();
await browser.close();
