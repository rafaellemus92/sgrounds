// Forgiving scoring: capitals relaxed by default and strict as a setting, straight and curly quotes alike, separate
// records per setting, earlier records kept apart and untouched, composition and autocorrect counted once, and the
// typed text never rewritten. Desktop Chromium; composition is driven through the DevTools protocol, which is how
// Chromium emulates an IME, not a phone keyboard. Run: node experiments/typing-mood-ring/tests/scoring.mjs
import { chromium, checks, fresh as open, txt, typeAt, instrumented } from './harness.mjs';
const { ok, done } = checks('scoring');
const browser = await chromium.launch(); const errors = [];
const URL = instrumented('scoring.html', [["setMode('free'); booted = true;", "window.__st = st; window.__sp = sp; window.__norm = norm; window.__same = same; setMode('free'); booted = true;"]]);
const page = (opts = {}) => open(browser, errors, opts, URL);
const S = p => p.evaluate(() => ({ typed: __st.typed, errors: __st.errors, acc: __st.acc }));
const caps = p => p.locator('.capsB:visible').first();
const sub = async p => { await p.waitForTimeout(80); return txt(p, '#moodSub'); };   // the line under the word updates on the next frame
const reload = async p => { await p.reload(); await p.waitForTimeout(300); };

// ── capitals relaxed by default; quotes alike; strict as a setting ─────────────────────────────────────────
{ const p = await page();
  await p.click('button[data-mode="faith"]'); await p.waitForTimeout(100);
  ok('capitals are relaxed by default, and the faith bar says so', (await caps(p).textContent()) === 'Aa relaxed' && (await p.evaluate(() => localStorage.getItem('tmr-caps'))) === null);
  const v1 = await txt(p, '#target');
  await p.click('#input'); await typeAt(p, v1.toLowerCase(), 12);
  let s = await S(p);
  ok('relaxed: a verse typed all in lower case completes with no errors and 100% accuracy', (await sub(p)) === 'complete ;' && s.errors === 0 && (await txt(p, '#sAcc')) === '100%', s);
  await p.click('#nextVerse'); await p.click('#input');
  const v2 = await txt(p, '#target'); await typeAt(p, v2.toUpperCase(), 12);
  ok('relaxed: …and one typed in capitals', (await sub(p)) === 'complete ;' && (await S(p)).errors === 0);
  ok('the text in the field is what was typed, not a normalised copy', (await p.inputValue('#input')) === v2.toUpperCase());
  for (let i = 0; i < 2; i++) await p.click('#nextVerse');   // Psalm 23:2-3, with an apostrophe
  await p.click('#input');
  const v4 = await txt(p, '#target');
  await p.evaluate(t => { for (const ch of t.replace(/'/g, '’')) document.execCommand('insertText', false, ch); }, v4);
  ok('a curly apostrophe matches a straight one', (await sub(p)) === 'complete ;' && (await S(p)).errors === 0 && (await p.inputValue('#input')).includes('’'));
  const eq = await p.evaluate(() => ['‘', '’', 'ʼ', '‛', '′'].every(c => __same(__norm(c), "'")) && ['“', '”', '„', '″'].every(c => __same(__norm(c), '"')) && __norm('a b') === 'a b');
  ok('every curly or typographic apostrophe and quotation mark compares as the straight one', eq);
  await caps(p).click();
  ok('the Aa button switches to strict and remembers it', (await caps(p).textContent()) === 'Aa strict' && (await p.evaluate(() => localStorage.getItem('tmr-caps'))) === '"strict"');
  await p.click('#prevVerse'); await p.click('#input');
  await p.evaluate(t => { for (const ch of t.replace(/'/g, '’')) document.execCommand('insertText', false, ch); }, await txt(p, '#target'));
  ok('strict still treats curly and straight apostrophes alike', (await sub(p)) === 'complete ;' && (await S(p)).errors === 0);
  await p.click('#prevVerse'); await p.click('#input');
  const v = await txt(p, '#target'); await typeAt(p, v.toLowerCase(), 12);
  s = await S(p);
  ok('strict: lower case where the verse has capitals counts as errors and does not complete', (await sub(p)) !== 'complete ;' && s.errors > 0 && (await txt(p, '#sAcc')) !== '100%', s);
  await reload(p); await p.click('button[data-mode="faith"]');
  ok('strict survives a reload', (await caps(p).textContent()) === 'Aa strict');
  await p.close(); }

// ── each setting keeps its own bests; scores say which they used; the button is locked during a run ────────
{ const p = await page();
  await p.click('button[data-mode="game"]'); await p.waitForTimeout(80);
  ok('the game intro says capitals are relaxed and bests are kept apart', (await txt(p, '#gameCard')).includes('Capitals: relaxed') && (await txt(p, '#gameCard')).includes('separate bests'));
  await p.click('#gStart'); await p.waitForTimeout(80);
  ok('the capitals button is locked during a run', await caps(p).isDisabled());
  await typeAt(p, (await txt(p, '#target')).toLowerCase(), 25);
  const rs = await S(p);
  await p.click('button[data-mode="free"]'); await p.click('button[data-mode="game"]');
  const relaxed = await p.evaluate(() => localStorage.getItem('tmr-best:relaxed'));
  ok('relaxed: a line typed in lower case scores with no errors, and the best is saved for relaxed', rs.errors === 0 && +relaxed > 0 && (await txt(p, '#gBest')) === relaxed, { rs, relaxed });
  await caps(p).click();
  ok('switching to strict shows the strict best, and leaves the relaxed one alone', (await txt(p, '#gBest')) === '0' && (await p.evaluate(() => localStorage.getItem('tmr-best:relaxed'))) === relaxed && (await txt(p, '#gameCard')).includes('Capitals: strict'));
  await p.click('#gStart'); await p.waitForTimeout(80);
  await typeAt(p, await txt(p, '#target'), 25);
  await p.click('button[data-mode="free"]'); await p.click('button[data-mode="game"]');
  const strict = await p.evaluate(() => localStorage.getItem('tmr-best:strict'));
  ok('strict: its best is saved under its own key', +strict > 0 && (await txt(p, '#gBest')) === strict);
  await caps(p).click();
  ok('switching back shows the relaxed best again', (await txt(p, '#gBest')) === relaxed);
  await p.click('button[data-mode="sprint"]'); await p.click('#pStart'); await p.waitForTimeout(1700);
  for (let i = 0; i < 3; i++) await typeAt(p, (await txt(p, '#moodWord')).toUpperCase(), 40);
  ok('relaxed sprint: words typed in capitals clear, and the streak holds', +(await txt(p, '#pWords')) === 3 && !(await p.locator('#pCombo').evaluate(e => e.classList.contains('hot'))));
  await p.waitForFunction(() => gameCard.textContent.includes('went dark'), null, { timeout: 20000 });
  ok('the result card names the setting its score used', (await txt(p, '#gameCard')).includes('relaxed capitals'));
  await caps(p).click(); await p.click('#pStart'); await p.waitForTimeout(1700);
  const w = await txt(p, '#moodWord'); await typeAt(p, w.toUpperCase(), 40);
  ok('strict sprint: a word typed in capitals is a typo and does not clear', +(await txt(p, '#pWords')) === 0 && (await p.locator('#pCombo').evaluate(e => e.classList.contains('hot'))));
  await p.close(); }

// ── earlier records: shown apart, never compared with the new ones, never touched ──────────────────────────
{ const p = await page();
  const OLD = { 'tmr-best': '777', 'tmr-sprint-best': '88', 'tmr-sprint-far': '9', 'tmr-duel': '{"w":3,"l":1,"d":0,"giant":42}' };
  await p.evaluate(o => { for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v); }, OLD); await reload(p);
  await p.click('button[data-mode="game"]');
  const g = await txt(p, '#gameCard');
  ok('game: the earlier best is shown apart, with the rule it was scored under, and is not the new best', g.includes('earlier best, 777') && g.includes('capitals counted') && (await txt(p, '#gBest')) === '0', g);
  await p.click('button[data-mode="sprint"]');
  const sp = await txt(p, '#gameCard');
  ok('sprint: likewise, noting capitals were ignored then', sp.includes('earlier best, 88') && sp.includes('farthest 9') && sp.includes('capitals ignored'), sp);
  await p.click('button[data-mode="duel"]');
  const d = await txt(p, '#gameCard');
  ok('duel: the earlier record and jötunn are shown apart; the new jötunn starts fresh', d.includes('3–1') && d.includes('42 wpm') && (await txt(p, '#dGiant')) === '30' && (await txt(p, '#dRec')) === '0–0', d);
  await p.click('button[data-mode="game"]'); await p.click('#gStart'); await p.waitForTimeout(80);
  await typeAt(p, await txt(p, '#target'), 25); await p.click('button[data-mode="free"]');
  const now = await p.evaluate(ks => Object.fromEntries(ks.map(k => [k, localStorage.getItem(k)])), Object.keys(OLD));
  ok('new bests go under the new keys; the earlier records are left byte for byte', JSON.stringify(now) === JSON.stringify(OLD) && +(await p.evaluate(() => localStorage.getItem('tmr-best:relaxed'))) > 0, now);
  await p.evaluate(() => localStorage.setItem('tmr-best', '1e999')); await reload(p); await p.click('button[data-mode="game"]');
  ok('a damaged earlier record is not shown, and not deleted either', !(await txt(p, '#gameCard')).includes('earlier best') && (await p.evaluate(() => localStorage.getItem('tmr-best'))) === '1e999');
  await p.close(); }

// ── composition (an IME, as Chromium emulates it) and autocorrect are counted once ──────────────────────────
{ const p = await page();
  const cdp = await p.context().newCDPSession(p);
  await p.click('button[data-mode="faith"]'); await p.click('#input');   // "In the beginning God created …"
  await cdp.send('Input.imeSetComposition', { text: 'Ib', selectionStart: 2, selectionEnd: 2 });
  const mid = await S(p);
  await cdp.send('Input.imeSetComposition', { text: 'In', selectionStart: 2, selectionEnd: 2 });   // the IME rewrites its own text
  await cdp.send('Input.insertText', { text: 'In' });                                               // and commits it
  let s = await S(p);
  ok('nothing is judged while a composition is open', mid.typed === 0, mid);
  ok('a composition the IME rewrote, then committed, counts its two letters once, with no error', s.typed === 2 && s.errors === 0 && (await p.inputValue('#input')) === 'In', s);
  await typeAt(p, ' teh', 20);
  s = await S(p);
  const blocked = await p.evaluate(() => { const e = new InputEvent('beforeinput', { inputType: 'insertReplacementText', cancelable: true, bubbles: true }); input.dispatchEvent(e); return e.defaultPrevented; });
  await p.evaluate(() => { input.value = 'In the'; input.dispatchEvent(new InputEvent('input', { inputType: 'insertReplacementText', bubbles: true })); });   // one that could not be stopped
  const s2 = await S(p);
  ok('autocorrect replacing a word is refused while copying a line', blocked);
  ok('…and if it lands anyway, only the two letters it changed are counted again; nothing is counted twice', s2.typed === s.typed + 2 && s2.errors === s.errors, { before: s, after: s2 });
  const v = await txt(p, '#target');
  await typeAt(p, v.slice(6), 8);
  ok('progress carries on to the end of the verse', (await sub(p)) === 'complete ;');
  await p.click('button[data-mode="sprint"]'); await p.click('#pStart'); await p.waitForTimeout(1700);
  const w = await txt(p, '#moodWord');
  await cdp.send('Input.imeSetComposition', { text: w, selectionStart: w.length, selectionEnd: w.length });   // the word completes mid-composition
  await cdp.send('Input.insertText', { text: w });                                                            // and the keyboard commits it again
  await p.waitForTimeout(100);
  const after = { words: +(await txt(p, '#pWords')), value: await p.inputValue('#input'), hot: await p.locator('#pCombo').evaluate(e => e.classList.contains('hot')) };
  ok('a sprint word completed inside a composition counts once; the keyboard re-committing it does not spill into the next word', after.words === 1 && after.value === '' && !after.hot, after);
  await typeAt(p, await txt(p, '#moodWord'), 40);
  ok('…and the next word types normally', +(await txt(p, '#pWords')) === 2);
  await p.click('#reset'); await p.waitForTimeout(100); await p.click('#pStart'); await p.waitForTimeout(1700);
  const w2 = await txt(p, '#moodWord'), base = await S(p);
  await cdp.send('Input.imeSetComposition', { text: w2[0], selectionStart: 1, selectionEnd: 1 });                          // keys into a composition,
  await cdp.send('Input.imeSetComposition', { text: w2[0] + 'q', selectionStart: 2, selectionEnd: 2 });                    // a typo,
  await cdp.send('Input.imeSetComposition', { text: w2[0], selectionStart: 1, selectionEnd: 1 });                          // taken back,
  for (let i = 2; i <= w2.length; i++) await cdp.send('Input.imeSetComposition', { text: w2.slice(0, i), selectionStart: i, selectionEnd: i });   // then the word
  const s3 = await S(p);
  const run = await p.evaluate(() => ({ words: __sp.words, streak: __sp.streak, best: __sp.bestStreak }));
  ok('a typo made and fixed inside a composition counts once, as on a plain keyboard, and breaks the streak', s3.errors - base.errors === 1 && s3.typed - base.typed === w2.length + 1 && run.words === 1 && run.streak === 0 && run.best === 0, { base, s3, w2, run });
  await cdp.send('Input.insertText', { text: w2 }); await p.waitForTimeout(80);
  await p.click('button[data-mode="free"]');
  const free = await p.evaluate(() => { const e = new InputEvent('beforeinput', { inputType: 'insertReplacementText', cancelable: true, bubbles: true }); input.dispatchEvent(e); return e.defaultPrevented; });
  ok('in the journal, autocorrect is the writer\'s own business and is never blocked', !free);
  await p.close(); }

// ── the urðr ghost belongs to the setting it was typed under; the old one is left alone ─────────────────────
{ const p = await page();
  const ghost = JSON.stringify({ v: 1, d: Array.from({ length: 30 }, (_, i) => i*200), acc: 0.9, at: '2026-10-01' });
  await p.evaluate(g => { localStorage.setItem('tmr-ghost', g); localStorage.setItem('tmr-ghost:relaxed', g); }, ghost); await reload(p);
  await p.click('button[data-mode="duel"]');
  const relaxedOn = await p.locator('#oppGhost').isEnabled();
  await caps(p).click();
  const strictOn = await p.locator('#oppGhost').isEnabled();
  ok('urðr races only a ghost typed under the same capitals setting; the earlier unsuffixed ghost is not used or touched', relaxedOn && !strictOn && (await p.evaluate(() => localStorage.getItem('tmr-ghost'))) === ghost, { relaxedOn, strictOn });
  await caps(p).click(); await p.click('#oppGhost'); await caps(p).click();   // urðr chosen under relaxed, then strict, which has no ghost
  const sel = await p.evaluate(() => ({ giant: document.querySelector('[data-opp="giant"]').classList.contains('on'), ghost: oppGhost.classList.contains('on'), tag: ltagB.textContent }));
  ok('switching to a setting with no ghost visibly hands the duel back to the jötunn', sel.giant && !sel.ghost && sel.tag === 'jötunn', sel);
  await p.close(); }

// ── the journal keeps exactly what was typed, whatever the scoring compares ────────────────────────────────
{ const p = await page();
  const T = 'Teh  QUICK ‘fox’ said “Hi” ;\n\tA line with Typos and  spaces  ';
  await p.evaluate(t => document.execCommand('insertText', false, t), T);
  await p.click('#jSave'); await p.waitForTimeout(60);
  const e = await p.evaluate(() => JSON.parse(localStorage.getItem('tmr-journal')).entries[0].text);
  ok('a journal save keeps capitals, curly quotes, tabs, double spaces and typos exactly', e === T, e);
  await p.close(); }

ok('no page errors', errors.length === 0, errors);
done();
await browser.close();
