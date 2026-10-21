// Saved records (tmr-best, tmr-sprint-best, tmr-sprint-far): corrupt values recover, valid ones
// survive, new bests save afterwards, the sprint ghost is still replaced, and it all survives reload.
// Run: node experiments/typing-mood-ring/tests/records.mjs
import { chromium, checks, fresh as open, txt, typeAt } from './harness.mjs';
const { ok, done } = checks('records');
const browser = await chromium.launch(); const errors = [];
const KEYS = ['tmr-best', 'tmr-sprint-best', 'tmr-sprint-far'];
const setKeys = (p, vals) => p.evaluate(v => { for (const [k, x] of Object.entries(v)) x === null ? localStorage.removeItem(k) : localStorage.setItem(k, x); }, vals);
const getKeys = p => p.evaluate(ks => Object.fromEntries(ks.map(k => [k, localStorage.getItem(k)])), [...KEYS, 'tmr-sprint-ghost']);
const reload = async p => { await p.reload(); await p.waitForTimeout(300); };
const gameBest = async p => { await p.click('button[data-mode="game"]'); await p.waitForTimeout(80); const b = await txt(p, '#gBest'); await p.click('button[data-mode="free"]'); return b; };
async function gameLine(p) {           // play one line, then leave the tab mid-run; returns the score
  await p.click('button[data-mode="game"]'); await p.waitForTimeout(80);
  await p.click('#gStart'); await p.waitForTimeout(80);
  await typeAt(p, await txt(p, '#target'), 35);
  const score = +(await txt(p, '#gScore'));
  await p.click('button[data-mode="free"]'); await p.waitForTimeout(80);
  return score;
}
async function sprintRun(p, words, during) {   // type N words, let the fuel run out; returns the end card
  await p.click('button[data-mode="sprint"]'); await p.waitForTimeout(80);
  await p.click('#pStart'); await p.waitForTimeout(1700);
  for (let i = 0; i < words; i++) await typeAt(p, await txt(p, '#moodWord'), 45);
  if (during) await during();
  await p.waitForFunction(() => !gameCard.classList.contains('hidden') && gameCard.textContent.includes('went dark'), null, { timeout: 30000 });
  const card = await txt(p, '#gameCard');
  await p.click('button[data-mode="free"]'); await p.waitForTimeout(80);
  return card;
}
const cardNum = (card, label) => { const m = card.match(new RegExp(label + ' ([0-9.]+)')); return m ? +m[1] : NaN; };

// 1. every corrupt form is read as 0 and removed from storage
{ const p = await open(browser, errors);
  const forms = ['1e999', '-1e999', '-5', '-0.5', '"12"', 'NaN', 'abc', '{}', '[]', 'true', 'null', ''];
  const bad = [];
  for (const f of forms) {
    await setKeys(p, Object.fromEntries(KEYS.map(k => [k, f]))); await reload(p);
    const shown = await gameBest(p), kept = await getKeys(p);
    if (shown !== '0' || KEYS.some(k => kept[k] !== null)) bad.push({ f, shown, kept });
  }
  ok(`corrupt records (${forms.length} forms) read as 0 and are cleared from storage`, bad.length === 0, bad.length ? bad : forms.join(' | '));
  await p.close(); }

// 2. valid records survive, fractions included, and are not lowered by a weaker run
{ const p = await open(browser, errors);
  const valid = { 'tmr-best': '654', 'tmr-sprint-best': '1012.5', 'tmr-sprint-far': '7', 'tmr-sprint-ghost': '[0,1,2,3]' };
  await setKeys(p, valid); await reload(p);
  ok('valid game best survives load', (await gameBest(p)) === '654');
  ok('valid records are left untouched in storage', JSON.stringify(await getKeys(p)) === JSON.stringify(valid), await getKeys(p));
  const card = await sprintRun(p, 0);
  ok('fractional sprint best and farthest survive load', cardNum(card, 'best') === 1012.5 && cardNum(card, 'farthest') === 7, card.slice(-70));
  const s = await gameLine(p);
  const weak = await sprintRun(p, 2);                       // a sprint that scores, but below the saved best
  const after = await getKeys(p);
  ok('weaker runs that score do not lower valid records or replace the ghost', cardNum(weak, 'score') > 0 && after['tmr-best'] === '654' && after['tmr-sprint-best'] === '1012.5' && after['tmr-sprint-far'] === '7' && after['tmr-sprint-ghost'] === '[0,1,2,3]', { game: s, sprint: cardNum(weak, 'score'), after });
  await p.close(); }

// 3. after recovery a legitimate new best saves, and the sprint ghost is replaced
let saved;
{ const p = await open(browser, errors);
  await setKeys(p, { 'tmr-best': '1e999', 'tmr-sprint-best': '1e999', 'tmr-sprint-far': '1e999', 'tmr-sprint-ghost': '[0,1,2]' }); await reload(p);
  const s1 = await gameLine(p);
  ok('after recovery a new game best is saved', s1 > 0 && (await getKeys(p))['tmr-best'] === String(s1) && (await gameBest(p)) === String(s1), s1);
  const card = await sprintRun(p, 3);
  const k = await getKeys(p), ghost = JSON.parse(k['tmr-sprint-ghost']), best = cardNum(card, 'best');
  ok('after recovery a new sprint best and farthest are saved', best > 0 && k['tmr-sprint-best'] === String(best) && k['tmr-sprint-far'] === '3' && cardNum(card, 'farthest') === 3, { card: card.slice(-60), k });
  ok('the stale sprint ghost is replaced by the new best run', k['tmr-sprint-ghost'] !== '[0,1,2]' && ghost.length >= 3 && ghost[ghost.length - 1] === 3, ghost);
  saved = { s1, best, k };
  // 4. the corrected state survives reload, and later records still compare against it
  await reload(p);
  ok('corrected records survive reload', JSON.stringify(await getKeys(p)) === JSON.stringify(k) && (await gameBest(p)) === String(s1));
  let sub = '';
  const card2 = await sprintRun(p, 5, async () => { sub = await txt(p, '#moodSub'); });
  const k2 = await getKeys(p), run2 = cardNum(card2, 'score'), beat = run2 > best;
  ok('the reloaded ghost is raced (readout shows)', sub.includes('ghost'), sub);
  ok('the next run replaces best and ghost only if it beats the reloaded best',
     beat ? (k2['tmr-sprint-best'] === String(run2) && k2['tmr-sprint-ghost'] !== k['tmr-sprint-ghost'])
          : (k2['tmr-sprint-best'] === String(best) && k2['tmr-sprint-ghost'] === k['tmr-sprint-ghost']),
     { best, run2, beat });
  ok('farthest moves from 3 to 5', k2['tmr-sprint-far'] === '5' && cardNum(card2, 'farthest') === 5, k2['tmr-sprint-far']);
  await p.close(); }

// 5. storage that throws: the page loads, bests read 0, play works, no errors
{ const errs2 = [];
  const p = await open(browser, errs2, { init: () => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }) });
  const shown = await gameBest(p), s = await gameLine(p);
  ok('blocked storage: bests read 0, a game still scores, no page errors', shown === '0' && s > 0 && errs2.length === 0, { shown, s, errs2 });
  await p.close(); }

ok('no page errors', errors.length === 0, errors);
done();
await browser.close();
