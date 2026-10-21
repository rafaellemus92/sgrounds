// Regressions for the review of the sprint and duel tabs (13 checks).
// Run: node experiments/typing-mood-ring/tests/regress.mjs
import { chromium, checks, fresh as open, txt, typeAt, hide } from './harness.mjs';
const { ok, done } = checks('regress');
const browser = await chromium.launch(); const errors = [];
const fresh = (opts = {}) => open(browser, errors, opts);

// hidden during count-in: duel clock never above 45, sprint ghost readout never NaN
{ const p = await fresh();
  await p.click('button[data-mode="duel"]'); await p.click('#dStart'); await p.waitForTimeout(100);
  await hide(p, true); await p.waitForTimeout(2500); await hide(p, false); await p.waitForTimeout(100);
  const hT = +(await txt(p, '#hT')); ok('duel: hide during count-in keeps the clock ≤ 45', hT <= 45, hT);
  await p.click('button[data-mode="sprint"]'); await p.evaluate(() => localStorage.setItem('tmr-sprint-ghost', '[0,1,2,3,4,5,6]'));
  await p.reload(); await p.waitForTimeout(200); await p.click('button[data-mode="sprint"]');
  await p.click('#pStart'); await p.waitForTimeout(100); await hide(p, true); await p.waitForTimeout(2200); await hide(p, false);
  let nan = false; for (let i = 0; i < 10; i++) { if ((await txt(p, '#moodSub')).includes('NaN')) nan = true; await p.waitForTimeout(100); }
  ok('sprint: hide during count-in never shows NaN', !nan, await txt(p, '#moodSub'));
  const sub = await txt(p, '#moodSub');   // ghost seeded at 1 word/s: about a second after return the run is one word behind
  ok('sprint: the run clock starts at return, not in the future', /ghost −[12]\b/.test(sub), sub);
  await p.close(); }

// reset after a duel clears the board; desktop focus keeps the sphere on screen
{ const p = await fresh({ viewport: { width: 1280, height: 720 } });
  await p.click('button[data-mode="duel"]'); await p.waitForTimeout(150);
  const top = await p.evaluate(() => ring.getBoundingClientRect().top);
  ok('desktop 1280x720: switching tabs keeps the sphere on screen', top >= 0, top);
  await p.click('#dStart'); await p.waitForTimeout(6000);   // idle: the jötunn pushes
  await p.click('#reset'); await p.waitForTimeout(150);
  const h = await p.evaluate(() => [hA2.textContent, hB2.textContent, lB.style.width, lA.style.width]);
  ok('reset after a duel clears light % and Loki meters', h[0].endsWith('100%') && h[1].endsWith('100%') && h[2] === '0%' && h[3] === '0%', h);
  await p.close(); }

// phones: no scroll at load; start buttons not under the pinned sphere; long verse caret visible; count-in drawn
{ const p = await fresh({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.waitForTimeout(500);
  ok('phone 360x640: page loads at the top', (await p.evaluate(() => scrollY)) === 0, await p.evaluate(() => scrollY));
  for (const [m, btn] of [['game', '#gStart'], ['sprint', '#pStart'], ['duel', '#dStart']]) {
    await p.tap(`button[data-mode="${m}"]`); await p.waitForTimeout(450);
    const r = await p.evaluate(b => ({ stage: document.querySelector('.stage').getBoundingClientRect().bottom, btn: document.querySelector(b).getBoundingClientRect().top, vh: innerHeight }), btn);
    ok(`phone ${m}: start button visible below the sphere`, r.btn >= r.stage - 1 && r.btn < r.vh, r);
  }
  await p.tap('button[data-mode="faith"]'); await p.waitForTimeout(200);
  for (let i = 0; i < 10; i++) await p.tap('#nextVerse');   // Isaiah 40:31
  await p.tap('#input'); await p.waitForTimeout(450);
  const ref = await txt(p, '#ref'); const t = await txt(p, '#target');
  await typeAt(p, t.slice(0, 90), 10); await p.waitForTimeout(200);
  const c = await p.evaluate(() => { const c = document.querySelector('#target .cur').getBoundingClientRect(), s = document.querySelector('.stage').getBoundingClientRect(), i = input.getBoundingClientRect(); return { cur: c.top, stage: s.bottom, inTop: i.top }; });
  ok(`phone long verse (${ref.split(' ·')[0]}): caret line visible`, c.cur >= c.stage && c.cur < c.inTop, c);
  await p.close(); }

// sprint whitespace inside multi-char input; faith carry-over with a leading space; stale sprint spans cleared
{ const p = await fresh();
  await p.click('button[data-mode="sprint"]'); await p.click('#pStart'); await p.waitForTimeout(1700);
  const w = await txt(p, '#moodWord');
  await p.evaluate(w => document.execCommand('insertText', false, w + ' '), w); await p.waitForTimeout(100);
  ok('sprint: a word committed with a trailing space still clears', +(await txt(p, '#pWords')) === 1 && (await txt(p, '#pCombo')) === '×1' && !(await p.inputValue('#input')).includes(' '));
  await p.click('#reset'); await p.waitForTimeout(100);
  ok('sprint: no stale word spans after reset', (await p.evaluate(() => moodWord.querySelectorAll('span').length)) === 0);
  await p.click('button[data-mode="faith"]'); await p.waitForTimeout(150);
  const v = await txt(p, '#target'); await p.click('#input'); await typeAt(p, v, 10); await typeAt(p, ' And', 30);
  ok('faith: a space after a finished verse is not an error', (await p.inputValue('#input')) === 'And' && (await txt(p, '#sAcc')) === '100%', [await p.inputValue('#input'), await txt(p, '#sAcc')]);
  await p.close(); }

ok('no page errors', errors.length === 0, errors);
done();
await browser.close();
