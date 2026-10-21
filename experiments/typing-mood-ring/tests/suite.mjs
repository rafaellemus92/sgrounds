// The original 42-check browser suite: sync, input, faith, game, sprint, duel, phone layout,
// reduced motion and snapshots. Run: node experiments/typing-mood-ring/tests/suite.mjs
import { chromium, checks, fresh as open, txt, stats, typeAt, shot } from './harness.mjs';
const { ok, done } = checks('suite');
const browser = await chromium.launch();
const errors = [];
const fresh = (opts = {}) => open(browser, errors, opts);
// a new page in the free tab, through the entries panel; unsaved text asks for a second tap
const newPage = async p => { await p.click('#jOpen'); await p.click('#jNew'); if (await p.isVisible('#journal')) await p.click('#jNew'); };

// 1. steady vs jittered sync, free mode
{
  const p = await fresh();
  await p.click('#input');
  await typeAt(p, 'the lighthouse keeps a steady beat and the ring is listening to every pulse', 160);
  const a = await stats(p); ok('steady 6 k/s locks (sync ≥ 85%)', parseInt(a.sync) >= 85, a);
  await p.screenshot({ path: shot('free-steady.png') });
  await p.waitForTimeout(3000);
  await typeAt(p, 'now i am typing in bursts and stalls with no rhythm at all here ok', 290, 250);
  const b = await stats(p); ok('jittered typing reads scattered (sync < 60%)', parseInt(b.sync) < 60, b);
  // idle > 2.5 s shows no sync and 'type to wake'
  await p.waitForTimeout(2700);
  const c = await stats(p); ok('idle past 2.5 s shows — and wake prompt', c.sync === '—' && c.sub === 'type to wake the ring', c);
  // re-clicking the active tab keeps text
  await p.click('#input'); await p.keyboard.type('keep me');
  await p.click('button[data-mode="free"]');
  ok('re-clicking free keeps the text', (await p.inputValue('#input')).includes('keep me'));
  // short pause does not wreck sync: lock, pause 1.5 s, resume
  await newPage(p); await p.click('#input');
  await typeAt(p, 'abcdefghijklmnopqrstuvwxyzabcd', 160);
  const pre = await stats(p);
  await p.waitForTimeout(1500);
  await typeAt(p, 'abcdefgh', 160);
  const d = await stats(p); ok('1.5 s rest then resume keeps sync (≥ 85%, and within 10 points of before)', parseInt(d.sync) >= 85 && parseInt(d.sync) >= parseInt(pre.sync) - 10, { pre: pre.sync, d });
  await p.close();
}

// 2. key auto-repeat does not count as keystrokes
{
  const p = await fresh(); await p.click('#input');
  await p.keyboard.down('j'); 
  for (let i = 0; i < 20; i++) { await p.evaluate(() => { const e = new KeyboardEvent('keydown', { key: 'j', repeat: true, bubbles: true }); input.dispatchEvent(e); document.execCommand('insertText', false, 'j'); }); await p.waitForTimeout(33); }
  await p.keyboard.up('j');
  const s = await stats(p); ok('auto-repeat does not drive velocity', parseFloat(s.kps) < 1, s);
  await p.close();
}

// 3. faith: timer cancelled on navigation; carry-over; smart quotes; drop blocked
{
  const p = await fresh();
  await p.click('button[data-mode="faith"]'); await p.waitForTimeout(200);
  const v1 = await txt(p, '#target');
  await p.click('#input'); await typeAt(p, v1, 15);
  ok('verse 1 completes', (await txt(p, '#moodSub')) === 'complete ;');
  await p.click('#nextVerse'); await p.waitForTimeout(150);
  await p.click('#input'); await p.keyboard.type('And');
  await p.waitForTimeout(1500);
  const cnt = await txt(p, '#verseCount'); const val = await p.inputValue('#input');
  ok('› during the 1.2 s window does not double-advance or wipe', cnt.startsWith('2 /') && val === 'And', { cnt, val });
  // carry-over: finish verse 2 and keep typing verse 3 immediately
  await p.click('#reset'); await p.waitForTimeout(100);
  const v2 = await txt(p, '#target');
  await p.click('#input'); await typeAt(p, v2, 15);
  await typeAt(p, 'The LORD', 40);
  const cnt3 = await txt(p, '#verseCount'), val3 = await p.inputValue('#input');
  ok('typing past a completed verse carries into the next', cnt3.startsWith('3 /') && val3 === 'The LORD', { cnt3, val3 });
  // smart apostrophe completes Psalm 23:2-3
  await p.click('#nextVerse'); await p.waitForTimeout(100);
  const v4 = await txt(p, '#target');
  ok('reached Psalm 23:2-3', (await txt(p, '#ref')).startsWith('Psalm 23:2-3'));
  await p.click('#input');
  await p.evaluate(t => { for (const ch of t.replace("'", '’')) document.execCommand('insertText', false, ch); }, v4);
  ok('smart apostrophe still completes the verse', (await txt(p, '#moodSub')) === 'complete ;');
  // drop / paste are blocked
  await p.click('#nextVerse'); await p.waitForTimeout(100);
  const prevented = await p.evaluate(() => { const e = new InputEvent('beforeinput', { inputType: 'insertFromDrop', data: 'x', cancelable: true, bubbles: true }); input.dispatchEvent(e); return e.defaultPrevented; });
  ok('insertFromDrop is cancelled in target modes', prevented);
  // Al-Fatihah parenthesis
  await p.click('button[data-scr="quran"]'); await p.click('#nextVerse'); await p.click('#nextVerse');
  ok('Al-Fatihah 1:7 reads "Not (the path)"', (await txt(p, '#target')).includes('Not (the path) of those'));
  await p.screenshot({ path: shot('faith.png') });
  await p.close();
}

// 4. game: peak excludes pre-start keys; tab switch persists best; Enter starts
{
  const p = await fresh();
  await p.click('button[data-mode="game"]'); await p.waitForTimeout(150);
  await p.click('#input'); await typeAt(p, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 10);
  await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok('Enter starts the game', !!(await txt(p, '#target')) && (await txt(p, '#gTime')) !== '–');
  const line = await txt(p, '#target');
  await typeAt(p, line, 60);
  const score = +(await txt(p, '#gScore'));
  ok('a completed line scores and levels up', score > 0 && (await txt(p, '#gLevel')) === '2', { score });
  await p.click('button[data-mode="free"]'); await p.waitForTimeout(100);
  const best = await p.evaluate(() => localStorage.getItem('tmr-best:relaxed'));
  ok('leaving mid-run still saves the best', +best === score, { best, score });
  await p.close();
}

// 5. sprint: count-in, words clear without spaces, typo breaks combo, fuel-out, ghost saved, Enter restarts
{
  const p = await fresh();
  await p.click('button[data-mode="sprint"]'); await p.waitForTimeout(150);
  await p.click('#pStart');
  await p.waitForTimeout(250); ok('count-in shows 3/2/1', ['3','2','1'].includes(await txt(p, '#moodWord')));
  await p.waitForTimeout(1500);
  let cleared = 0;
  for (let i = 0; i < 12; i++) {
    const w = await txt(p, '#moodWord');
    await typeAt(p, w, 70); await p.keyboard.type(' ');   // habitual space is swallowed
    cleared++;
  }
  const words = +(await txt(p, '#pWords'));
  ok('sprint words clear (12 typed)', words === 12, { words, val: await p.inputValue('#input') });
  ok('combo rises after five clean words', (await txt(p, '#pCombo')) !== '×1', await txt(p, '#pCombo'));
  await p.screenshot({ path: shot('sprint-run.png') });
  // typo
  const w = await txt(p, '#moodWord'); await p.keyboard.type('q' === w[0] ? 'z' : 'q');
  ok('a typo resets the combo', (await txt(p, '#pCombo')) === '×1');
  await p.keyboard.press('Backspace'); await typeAt(p, w, 60);
  ok('the word still clears after fixing the typo', +(await txt(p, '#pWords')) === 13);
  // stop typing: fuel runs out
  await p.waitForTimeout(7000);
  const cardTxt = await txt(p, '#gameCard');
  ok('fuel runs out → end card', cardTxt.includes('went dark at word 13'), cardTxt.slice(0, 80));
  const ls = await p.evaluate(() => ({ b: localStorage.getItem('tmr-sprint-best:relaxed'), g: localStorage.getItem('tmr-sprint-ghost:relaxed') }));
  ok('sprint best and ghost persisted', +ls.b > 0 && JSON.parse(ls.g).length >= 5, ls);
  await p.screenshot({ path: shot('sprint-end.png') });
  await p.click('#input'); await p.keyboard.press('Enter'); await p.waitForTimeout(1800);
  const w2 = await txt(p, '#moodWord'); await typeAt(p, w2, 60);
  const sub = await txt(p, '#moodSub');
  ok('Enter restarts and the ghost readout appears', sub.includes('ghost'), sub);
  // case-insensitive verse words
  await p.click('#reset'); await p.waitForTimeout(100);
  await p.check('#sVerses'); await p.click('#pStart'); await p.waitForTimeout(1700);
  let vOK = 0;
  for (let i = 0; i < 6; i++) { const vw = await txt(p, '#moodWord'); await typeAt(p, vw.toLowerCase(), 50); vOK++; }
  ok('verse words clear when typed in lowercase', +(await txt(p, '#pWords')) === 6, await txt(p, '#moodSub'));
  await p.close();
}

// 6. duel: fast player beats a 30-wpm giant; idle player loses; no NaN; ghost saved & selectable
{
  const p = await fresh();
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(200);
  await p.click('button[data-mode="duel"]'); await p.waitForTimeout(200);
  ok('urðr disabled before any duel', await p.isDisabled('[data-opp="ghost"]'));
  await p.screenshot({ path: shot('duel-intro.png') });
  await p.click('#dStart'); await p.waitForTimeout(1700);
  const t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    const card = await p.evaluate(() => !gameCard.classList.contains('hidden'));
    if (card) break;
    const line = await txt(p, '#target'); if (!line) break;
    const typed = await p.inputValue('#input');
    await typeAt(p, line.slice(typed.length, typed.length + 12), 110);
    const pr = await p.evaluate(() => document.querySelector('#hA2').textContent);
    if (Date.now() - t0 > 6000 && Date.now() - t0 < 6400) await p.screenshot({ path: shot('duel-run.png') });
  }
  const c1 = await txt(p, '#gameCard');
  ok('fast typist beats the 30-wpm jötunn', /yours|leans your way/.test(c1), c1.slice(0, 120));
  const st1 = await p.evaluate(() => ({ d: localStorage.getItem('tmr-duel:relaxed'), g: !!localStorage.getItem('tmr-ghost') }));
  ok('duel record and ghost persisted, giant moved up', JSON.parse(st1.d).w === 1 && JSON.parse(st1.d).giant === 34 && st1.g, st1);
  await p.screenshot({ path: shot('duel-end.png') });
  ok('urðr enabled after a duel', !(await p.isDisabled('[data-opp="ghost"]')));
  // idle loses vs ghost
  await p.click('[data-opp="ghost"]');
  await p.click('#dStart'); await p.waitForTimeout(1700);
  let nan = false;
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(500);
    const s = await p.evaluate(() => [hA2.textContent, hB2.textContent, hT.textContent]);
    if (s.join(' ').includes('NaN')) nan = true;
    if (await p.evaluate(() => !gameCard.classList.contains('hidden'))) break;
  }
  const c2 = await txt(p, '#gameCard');
  ok('idle typist loses to their own ghost', /urðr/.test(c2) && /took every ring|leans to/.test(c2), c2.slice(0, 120));
  ok('no NaN in duel HUD', !nan);
  // snapshot works in duel
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#snap')]);
  await dl.saveAs(shot('duel-snap.png')); ok('duel snapshot downloads', dl.suggestedFilename().startsWith('aura-'));
  await p.close();
}

// 7. phone layout: sphere stays visible with the keyboard open (360x420)
{
  const p = await fresh({ viewport: { width: 360, height: 420 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  for (const m of ['free', 'faith', 'sprint', 'duel']) {
    await p.click(`button[data-mode="${m}"]`); await p.waitForTimeout(150);
    if (m === 'sprint') { await p.click('#pStart'); await p.waitForTimeout(1800); }
    if (m === 'duel') { await p.click('#dStart'); await p.waitForTimeout(1800); }
    if (m === 'free' || m === 'faith') { await p.tap('#input'); }   // a tab switch on a phone does not open the keyboard
    await p.waitForTimeout(450);
    const r = await p.evaluate(() => { const c = ring.getBoundingClientRect(), i = input.getBoundingClientRect(), t = (document.querySelector('.m-sprint') ? moodWord : target).getBoundingClientRect(); return { cTop: c.top, cBot: c.bottom, iTop: i.top, iBot: i.bottom, tTop: t.top, tBot: t.bottom, vh: innerHeight }; });
    ok(`phone ${m}: canvas and input both on screen`, r.cTop >= -1 && r.cBot <= r.iTop + 1 && r.iBot <= r.vh + 1, r);
    if (m !== 'free') ok(`phone ${m}: the line or word to type is visible`, r.tBot > r.cBot + 10 && r.tBot <= r.iTop + 1, r);
    await p.screenshot({ path: shot(`phone-${m}.png`) });
    await p.tap('#kbDone');
    if (m !== 'free') await p.click('#reset');
  }
  await p.close();
}

// 8. reduced motion: idle canvas frames identical
{
  const p = await fresh({ reducedMotion: 'reduce' });
  await p.waitForTimeout(500);
  const a = await p.evaluate(() => ring.toDataURL()); await p.waitForTimeout(400);
  const b = await p.evaluate(() => ring.toDataURL());
  ok('reduced motion: idle canvas is still', a === b);
  await p.close();
}

// 9. about tab renders, snapshot in free mode
{
  const p = await fresh();
  await p.click('button[data-mode="about"]'); await p.waitForTimeout(150);
  await p.screenshot({ path: shot('about.png'), fullPage: true });
  await p.click('button[data-mode="free"]');
  await p.click('#jOpen');   // in the free tab the snapshot sits with the entries
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('#jSnap')]);
  await dl.saveAs(shot('free-snap.png')); ok('free snapshot downloads', true);
  await p.close();
}

ok('no page or console errors', errors.length === 0, errors);
done();
await browser.close();
