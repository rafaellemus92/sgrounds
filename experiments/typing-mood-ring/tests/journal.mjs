// The optional journal in the free tab: exact text, save, edit, confirmed delete, export, feelings chosen by the
// writer (before or after, skip, their own words, intensity), the typing summary kept apart from them, descriptive
// patterns, storage failures, damaged and unreadable data, other saved records left alone, and the Rhythm Lab's
// k uncertainty note. Desktop Chromium. Run: node experiments/typing-mood-ring/tests/journal.mjs
import { readFileSync } from 'node:fs';
import { chromium, checks, fresh as open, typeAt, instrumented } from './harness.mjs';
const { ok, done } = checks('journal');
const browser = await chromium.launch(); const errors = [];
const J = 'tmr-journal';
const stored = p => p.evaluate(k => JSON.parse(localStorage.getItem(k) || 'null'), J);
const status = p => p.textContent('#jStatus');
const save = async p => { await p.click('#jSave'); await p.waitForTimeout(60); };
const panel = async p => { if (!(await p.isVisible('#journal'))) await p.click('#jOpen'); await p.waitForTimeout(40); };
const exported = async p => { const [d] = await Promise.all([p.waitForEvent('download'), p.click('#jExport')]); return JSON.parse(readFileSync(await d.path(), 'utf8')); };
const EXACT = 'teh  quick\n\n  brown fox ;  \tend 🙂 ñ  ';

// ── save keeps the text exactly; nothing is stored until save ───────────────────────────────────────────────
{ const p = await open(browser, errors);
  await p.keyboard.type('teh  quick\n\n  brown fox ;  ');
  await p.evaluate(() => document.execCommand('insertText', false, '\tend 🙂 ñ  '));
  await p.click('button[data-mode="faith"]'); await p.click('button[data-mode="game"]'); await p.click('button[data-mode="free"]');
  ok('the page being written survives a trip through other tabs', (await p.inputValue('#input')) === EXACT);
  ok('nothing is stored before save: typing, tab switches and the feelings prompt write nothing', (await p.evaluate(k => localStorage.getItem(k), J)) === null);
  await save(p);
  let s = await stored(p);
  ok('save stores the text exactly as typed: typos, double spaces, tabs, blank lines, emoji, trailing spaces', s && s.v === 1 && s.entries.length === 1 && s.entries[0].text === EXACT, s && s.entries[0]);
  ok('save says so, and the field keeps the text', (await status(p)) === 'saved ;' && (await p.inputValue('#input')) === EXACT);
  await p.reload(); await p.waitForTimeout(300);
  ok('after a reload the field starts empty (drafts are never stored) and the entry is still saved', (await p.inputValue('#input')) === '' && (await stored(p)).entries[0].text === EXACT);
  await save(p);
  ok('an empty page is not saved, and nothing blocks writing', (await status(p)) === 'nothing to save yet' && (await stored(p)).entries.length === 1);
  await p.keyboard.type('saved with the keyboard');
  await p.keyboard.press('Control+s'); await p.waitForTimeout(60);
  ok('Ctrl+S saves in the free tab', (await stored(p)).entries.length === 2);
  await p.close(); }

// ── list, reopen and edit, confirmed delete ────────────────────────────────────────────────────────────────
{ const p = await open(browser, errors);
  await p.keyboard.type('first entry'); await save(p);
  await panel(p); await p.click('#jNew'); await p.keyboard.type('second entry'); await save(p);
  let s = await stored(p); const [a, b] = s.entries;
  await panel(p);
  const items = await p.locator('#jList .jitem').allTextContents();
  ok('entries list: newest first, each dated', items.length === 2 && items[0].includes('second entry') && items[1].includes('first entry') && /\d{4}/.test(items[0]), items);
  await p.click(`[data-open="${a.id}"]`); await p.waitForTimeout(60);
  ok('open puts the entry back in the field and closes the list', (await p.inputValue('#input')) === 'first entry' && !(await p.isVisible('#journal')) && (await status(p)).startsWith('editing the entry from'));
  await p.click('#input'); await p.keyboard.press('End'); await p.keyboard.type(', edited'); await p.waitForTimeout(1100); await save(p);
  s = await stored(p); const e = s.entries.find(x => x.id === a.id);
  ok('edit: the same entry is updated, not copied', s.entries.length === 2 && e.text === 'first entry, edited' && e.createdAt === a.createdAt && Date.parse(e.updatedAt) > Date.parse(a.updatedAt), e);
  await p.keyboard.type(' unsaved');
  await panel(p); await p.click(`[data-open="${b.id}"]`);
  ok('opening another entry over unsaved text asks first', (await p.isVisible(`[data-open-yes="${b.id}"]`)) && (await p.inputValue('#input')).endsWith(' unsaved'));
  await p.click(`[data-open-yes="${b.id}"]`); await p.waitForTimeout(60);
  ok('…and replaces the text only once confirmed', (await p.inputValue('#input')) === 'second entry');
  await panel(p); await p.click(`[data-del="${b.id}"]`);
  ok('delete asks for confirmation and deletes nothing yet', (await p.isVisible(`[data-del-yes="${b.id}"]`)) && (await p.textContent('#jList')).includes('cannot be undone') && (await stored(p)).entries.length === 2);
  await p.click(`[data-del-no="${b.id}"]`);
  ok('keep cancels the delete', (await stored(p)).entries.length === 2 && (await p.isVisible(`[data-del="${b.id}"]`)));
  await p.click(`[data-del="${b.id}"]`); await p.click(`[data-del-yes="${b.id}"]`); await p.waitForTimeout(60);
  s = await stored(p);
  ok('confirmed delete removes the entry from storage and the list; the open entry leaves the field', s.entries.length === 1 && s.entries[0].id === a.id && (await p.locator('#jList .jitem').count()) === 1 && (await p.inputValue('#input')) === '');
  await p.click('#input'); await p.keyboard.type('a page I have not saved');
  await panel(p); await p.click('#jNew');
  ok('new entry over unsaved text needs a second tap', (await p.inputValue('#input')) === 'a page I have not saved' && (await p.textContent('#jNew')).includes('tap again'));
  await p.click('#jNew');
  ok('…and then starts a blank page', (await p.inputValue('#input')) === '' && !(await p.isVisible('#journal')));
  await p.close(); }

// ── feelings: before and after, skip, own words, intensity; kept apart from the typing summary ────────────────
{ const p = await open(browser, errors);
  ok('an empty new page offers an optional feeling before writing', (await p.textContent('#feel')).includes('Before writing') && (await p.isVisible('#feel [data-skip="before"]')));
  await p.click('#feel [data-feel="before"]');
  await p.click('[data-chip="calm"]'); await p.click('[data-chip="tired"]'); await p.click('[data-chip="tired"]');
  await p.fill('#feelNew', '  wobbly   but ok '); await p.click('#feelAdd');
  await p.click('[data-int="3"]');
  const pressed = await p.evaluate(() => [...document.querySelectorAll('#feelPick [data-int], #feelPick [data-chip]')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent));
  ok('the chooser shows what is picked: two words and intensity 3, not "no rating"', JSON.stringify(pressed.sort()) === JSON.stringify(['3', 'calm', 'wobbly but ok']), pressed);
  const fs = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#feelNew')).fontSize));
  await p.click('#feelDone'); await p.waitForTimeout(40);
  ok('choosing before writing stores nothing until the entry is saved', (await p.evaluate(k => localStorage.getItem(k), J)) === null && (await p.textContent('#feel')).includes('before: calm, wobbly but ok · 3/5'));
  await p.click('#input');
  await typeAt(p, 'steady typing for the summary here', 130); await save(p);
  let e = (await stored(p)).entries[0];
  ok('the feeling is saved with the entry, own word tidied, tapped-twice word left out', JSON.stringify(e.feelings.before) === JSON.stringify({ labels: ['calm', 'wobbly but ok'], intensity: 3, skipped: false }), e.feelings);
  ok('own words are remembered for next time', JSON.stringify((await stored(p)).labels) === JSON.stringify(['wobbly but ok']));
  ok('the word box is 16 px, so iOS does not zoom into it', fs >= 16, fs);
  const t = e.typing;
  ok('the typing summary is stored apart from the feelings: speed, rhythm and colour only', t && JSON.stringify(Object.keys(t)) === JSON.stringify(['keys', 'activeSec', 'kps', 'syncSec', 'sync', 'lab', 'color']) && t.activeSec >= 2 && t.kps > 3 && t.kps < 12 && /^#[0-9a-f]{6}$/.test(t.color) && !('labels' in t) && !('typing' in e.feelings), t);
  ok('after saving, an optional feeling after writing is offered', (await p.textContent('#feel')).includes('How do you feel now?'));
  await p.click('#feel [data-skip="after"]'); await p.waitForTimeout(40);
  e = (await stored(p)).entries[0];
  ok('skip is recorded as skipped and saved at once for a saved entry', e.feelings.after && e.feelings.after.skipped === true && (await p.textContent('#feel')).includes('after: skipped'), e.feelings.after);
  await p.click('#feel [data-feel="after"]'); await p.click('[data-chip="content"]'); await p.click('[data-int="0"]'); await p.click('#feelDone'); await p.waitForTimeout(40);
  e = (await stored(p)).entries[0];
  ok('a feeling can be chosen after skipping; intensity is optional', JSON.stringify(e.feelings.after) === JSON.stringify({ labels: ['content'], intensity: null, skipped: false }), e.feelings.after);
  await p.click('#feel [data-feel="after"]'); await p.click('[data-chip="content"]'); await p.click('#feelDone'); await p.waitForTimeout(40);
  ok('choosing nothing and pressing done clears the answer', (await stored(p)).entries[0].feelings.after === null && (await p.textContent('#feel')).includes('How do you feel now?'));
  await p.click('#feel [data-feel="after"]'); await p.click('[data-forget="wobbly but ok"]'); await p.click('#feelCancel');
  await p.keyboard.type('.'); await save(p);
  ok('a forgotten word leaves the suggestions; saved entries keep it', JSON.stringify((await stored(p)).labels) === '[]' && (await stored(p)).entries[0].feelings.before.labels.includes('wobbly but ok'));
  const before = (await stored(p)).entries[0].typing.activeSec;
  await p.click('#input'); await typeAt(p, ' more typing to add', 130); await save(p);
  ok('an edit adds its typing to the entry\'s summary', (await stored(p)).entries[0].typing.activeSec > before);
  await p.close(); }

// ── missing and damaged feelings, damaged entries: shown as missing, kept as saved ─────────────────────────
{ const p = await open(browser, errors);
  const at = '2026-10-01T09:00:00.000Z';
  const seed = { v: 1, labels: ['mine', 7, ''], entries: [
    { id: 'a', createdAt: at, text: 'no feelings key at all' },
    { id: 'b', createdAt: at, updatedAt: at, text: 'feelings null', feelings: null, typing: null },
    { id: 'c', createdAt: at, text: 'feelings broken', feelings: { before: { labels: 'calm', intensity: 9 }, after: 'x' }, typing: { activeSec: 'x', color: 'red;background:url(x)' } },
    { id: 'd', createdAt: '2026-10-02T09:00:00.000Z', text: 'messy words', feelings: { after: { labels: ['ok', 5, '', '  spaced   out '], intensity: 2 } } },
    { id: 'e', createdAt: at, text: 'colour injected', typing: { keys: 9, activeSec: 4, kps: 3, syncSec: 2, sync: 0.5, lab: [0.6, 0.1, 0.05], color: 'red;background:url(x)' } },
    null, 42, { text: 'no id' }, { id: 'z', createdAt: 'not a date', text: 'bad date' } ] };
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), [J, JSON.stringify(seed)]); await p.reload(); await p.waitForTimeout(300);
  await panel(p);
  const list = await p.textContent('#jList');
  ok('entries without feelings, with null or broken feelings show as "no feeling chosen"', (list.match(/no feeling chosen/g) || []).length === 4 && list.includes('after: ok, spaced out · 2/5'), list.slice(0, 300));
  ok('damaged entries are counted, not shown, and not deleted', (await p.textContent('#jNotice')).includes('4 saved entries could not be shown. Nothing was deleted'));
  const sw = await p.evaluate(() => [...document.querySelectorAll('#jList .swatch')].map(s => s.getAttribute('style')));
  ok('a stored colour is never trusted: the swatch is recomputed from the numbers', sw.length === 1 && /^background:#[0-9a-f]{6}$/.test(sw[0]), sw);
  ok('patterns render with missing and damaged feelings', (await p.textContent('#jPatterns')).includes('5 saved entries: 1 with a feeling you chose'));
  await p.click('#jNew'); await p.keyboard.type('new one'); await save(p);
  const s = await stored(p);
  ok('saving keeps every stored item, readable or not, exactly as it was', s.entries.length === 10 && JSON.stringify(s.entries.slice(0, 9)) === JSON.stringify(seed.entries), s.entries.length);
  ok('stored words are tidied and kept', JSON.stringify(s.labels) === JSON.stringify(['mine']), s.labels);
  await p.close(); }

// ── descriptive patterns, with the number of entries behind each ───────────────────────────────────────────
{ const p = await open(browser, errors);
  const ty = kps => ({ keys: 50, activeSec: 10, kps, syncSec: 8, sync: 0.6, lab: [0.6, 0.05, 0.05], color: '#000000' });
  const f = (labels, intensity) => ({ labels, intensity, skipped: false });
  const ent = (id, before, after, typing) => ({ id: String(id), createdAt: `2026-10-0${id}T09:00:00.000Z`, text: 'x' + id, feelings: { before, after }, typing });
  const seed = { v: 1, labels: [], entries: [
    ent(1, f(['calm'], 4), f(['calm'], 2), ty(3)), ent(2, f(['calm'], 3), f(['calm', 'tired'], 3), ty(4)), ent(3, f(['calm'], 2), null, ty(5)),
    ent(4, f(['tired'], 2), f(['ok'], 4), ty(2)), ent(5, { labels: [], intensity: null, skipped: true }, null, null), ent(6, f(['lonely'], null), null, ty(6)) ] };
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), [J, JSON.stringify(seed)]); await p.reload(); await p.waitForTimeout(300);
  await panel(p);
  const t = await p.textContent('#jPatterns');
  ok('patterns count entries: totals, entries with a chosen feeling, entries with a typing summary', t.includes('6 saved entries: 5 with a feeling you chose, 5 with a typing summary'), t.slice(0, 200));
  ok('each word shows how many entries it appears in', t.includes('calm 3') && t.includes('tired 2') && t.includes('lonely 1') && t.includes('ok 1'), t);
  ok('before and after intensity is described with its count', t.includes('In the 3 entries where you rated') && t.includes('lower after in 1, the same in 1, higher after in 1'), t);
  const rows = await p.locator('#jPatterns tbody tr').allTextContents();
  ok('typing beside words: medians with n, and only for words with at least two entries', JSON.stringify(rows) === JSON.stringify(['all entries54.060%', 'calm34.060%', 'tired23.060%']), rows);
  ok('patterns say colour is typing mechanics, infer no feelings, diagnose nothing and claim no causes',
     t.includes('typing mechanics') && t.includes('say nothing about feelings') && t.includes('diagnoses anything') && t.includes('does not mean one causes the other'));
  const note = await p.textContent('#journal .small');
  ok('the panel says entries stay in this browser, can be erased with browser data, export is the backup, and nothing leaves',
     ['stay in this browser', 'can erase them', 'Export is your backup', 'no accounts, uploads, analytics or AI'].every(x => note.includes(x)), note);
  await p.close(); }

// ── export ─────────────────────────────────────────────────────────────────────────────────────────────────
{ const p = await open(browser, errors);
  await panel(p); await p.click('#jExport');
  ok('export with nothing written says so', (await p.textContent('#jNotice')) === 'Nothing to export yet.');
  await p.click('#input'); await p.keyboard.type('exported ;\nexactly  '); await save(p);
  await p.keyboard.type(' plus unsaved');
  await panel(p);
  const x = await exported(p);
  ok('export is a JSON file with every entry exactly as typed and the unsaved page alongside', x.app.includes('journal') && x.entries.length === 1 && x.entries[0].text === 'exported ;\nexactly  ' && x.unsaved && x.unsaved.text === 'exported ;\nexactly   plus unsaved', x);
  ok('the export explains feelings versus typing', x.note.includes('only what you chose') && x.note.includes('not feelings'));
  await p.close(); }

// ── storage that fails: full, silently dropped, blocked ────────────────────────────────────────────────────
const FAILING = () => {
  const o = Storage.prototype.setItem; window.__mode = '';
  Storage.prototype.setItem = function (k, v) {
    if (k === 'tmr-journal' && window.__mode === 'full') throw new DOMException('full', 'QuotaExceededError');
    if (k === 'tmr-journal' && window.__mode === 'drop') return;
    return o.call(this, k, v);
  };
};
{ const p = await open(browser, errors, { init: FAILING });
  await p.keyboard.type('please keep this');
  await p.evaluate(() => { window.__mode = 'full'; }); await save(p);
  ok('storage full: says why, keeps the text in the field, stores nothing', (await status(p)).includes('storage for this page is full') && (await status(p)).includes('Your text is still in the field') && (await p.inputValue('#input')) === 'please keep this' && (await stored(p)) === null);
  await p.evaluate(() => { window.__mode = 'drop'; }); await save(p);
  ok('a write the browser silently drops is caught and reported', (await status(p)).includes('did not keep the change') && (await stored(p)) === null);
  await p.evaluate(() => { window.__mode = ''; }); await save(p);
  ok('once storage works again, save succeeds', (await status(p)) === 'saved ;' && (await stored(p)).entries.length === 1);
  await p.evaluate(() => { window.__mode = 'full'; });
  await panel(p); const id = (await stored(p)).entries[0].id;
  await p.click(`[data-del="${id}"]`); await p.click(`[data-del-yes="${id}"]`); await p.waitForTimeout(60);
  ok('a delete that cannot be written says so and keeps the entry', (await status(p)).startsWith('Not deleted') && (await stored(p)).entries.length === 1 && (await p.locator('#jList .jitem').count()) === 1);
  await p.close(); }
{ const errs = [];
  const p = await open(browser, errs, { init: () => Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } }) });
  await p.keyboard.type('nowhere to keep this'); await save(p);
  ok('storage blocked: save explains, the text stays', (await status(p)).includes('not letting the page keep anything') && (await p.inputValue('#input')) === 'nowhere to keep this');
  await panel(p);
  ok('storage blocked: the panel says so up front', (await p.textContent('#jNotice')).includes('entries cannot be saved'));
  const x = await exported(p);
  ok('storage blocked: export still saves the page as a file', x.entries.length === 0 && x.unsaved.text === 'nowhere to keep this');
  ok('storage blocked: no page errors', errs.length === 0, errs);
  await p.close(); }

// ── unreadable journal: copied aside before anything is written; never deleted ─────────────────────────────
{ const p = await open(browser, errors);
  const RAW = '{"v":1,"entries":[{"id":"a","text":"half a sav';
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), [J, RAW]); await p.reload(); await p.waitForTimeout(300);
  await p.reload(); await p.waitForTimeout(300);
  const keys = await p.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('tmr-journal-unreadable-')));
  const copy = keys.length ? await p.evaluate(k => localStorage.getItem(k), keys[0]) : null;
  ok('an unreadable journal is copied, once, to a key of its own; the original is untouched', keys.length === 1 && copy === RAW && (await p.evaluate(k => localStorage.getItem(k), J)) === RAW, keys);
  await panel(p);
  ok('the panel says so and names the copy', (await p.textContent('#jNotice')).includes('Nothing was deleted') && (await p.textContent('#jNotice')).includes(keys[0]));
  const x = await exported(p);
  ok('export includes the unreadable text', x.unreadable === RAW);
  await p.click('#input'); await p.keyboard.type('fresh start'); await save(p);
  ok('with the copy kept, saving starts a readable journal; the copy stays', (await stored(p)).entries[0].text === 'fresh start' && (await p.evaluate(k => localStorage.getItem(k), keys[0])) === RAW);
  await p.close(); }
{ const p = await open(browser, errors, { init: () => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k.startsWith('tmr-journal-unreadable-')) throw new DOMException('full', 'QuotaExceededError'); return o.call(this, k, v); }; } });
  const RAW = 'not json at all';
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), [J, RAW]); await p.reload(); await p.waitForTimeout(300);
  await p.keyboard.type('careful'); await save(p);
  ok('unreadable and no room for a copy: saving pauses rather than write over it', (await status(p)).includes('writing is paused') && (await p.evaluate(k => localStorage.getItem(k), J)) === RAW && (await p.inputValue('#input')) === 'careful');
  await panel(p); const x = await exported(p);
  ok('…and export carries both the unreadable data and the unsaved page', x.unreadable === RAW && x.unsaved.text === 'careful');
  await p.close(); }

// ── other saved records are never touched; a second tab's saves are kept ───────────────────────────────────
{ const p = await open(browser, errors);
  const OTHER = { 'tmr-best': '120', 'tmr-sprint-best': '55', 'tmr-sprint-far': '30', 'tmr-sprint-ghost': '[0,1,2,3]', 'tmr-duel': '{"w":1,"l":2,"d":0,"giant":34}',
                  'tmr-ghost': JSON.stringify({ v: 1, d: Array.from({ length: 25 }, (_, i) => i*200), acc: 0.9, at: '2026-10-01' }), 'tmr-lab': JSON.stringify({ v: 1, consent: { at: '2026-10-01T00:00:00Z' }, sessions: [] }) };
  await p.evaluate(o => { for (const [k, v] of Object.entries(o)) localStorage.setItem(k, v); }, OTHER); await p.reload(); await p.waitForTimeout(300);
  await p.keyboard.type('one'); await save(p); await panel(p); await p.click('#jNew'); await p.keyboard.type('two'); await save(p);
  await p.click('#feel [data-feel="after"]'); await p.click('[data-chip="calm"]'); await p.click('#feelDone');
  const id = (await stored(p)).entries[0].id;
  await panel(p); await p.click(`[data-del="${id}"]`); await p.click(`[data-del-yes="${id}"]`); await exported(p);
  const now = await p.evaluate(ks => Object.fromEntries(ks.map(k => [k, localStorage.getItem(k)])), Object.keys(OTHER));
  ok('saves, edits, feelings, deletes and export leave game, duel, ghost and lab records byte for byte', JSON.stringify(now) === JSON.stringify(OTHER), now);
  await p.click('button[data-mode="game"]');
  ok('…and the game shows that earlier best apart, not as the best for the new rules', (await p.textContent('#gameCard')).includes('earlier best, 120') && (await p.textContent('#gBest')) === '0');
  await p.click('button[data-mode="free"]');
  const q = await p.context().newPage(); await q.goto(p.url()); await q.waitForTimeout(300);
  await q.keyboard.type('from the second tab'); await save(q);
  await p.click('#jNew'); await p.keyboard.type('from the first tab, after'); await save(p);
  const texts = (await stored(p)).entries.map(e => e.text).sort();
  ok('two tabs saving in turn: neither overwrites the other', JSON.stringify(texts) === JSON.stringify(['from the first tab, after', 'from the second tab', 'two']), texts);
  await q.close(); await p.close(); }

// ── review fixes: no silent overwrite or loss of unsaved words; feelings across tabs; counts; honest copy ──
{ const p = await open(browser, errors);
  await p.keyboard.type('yesterday, kept'); await save(p);
  ok('after a save the page says it is editing that entry, with its date', /editing .*\d{4}/.test(await p.textContent('#feel')));
  await p.keyboard.press('Control+a'); await p.keyboard.press('Backspace');
  ok('clearing the field starts a new page and says so', (await status(p)).startsWith('a new page') && (await p.textContent('#feel')).includes('Before writing'));
  await p.keyboard.type('today, a new page'); await save(p);
  let texts = (await stored(p)).entries.map(e => e.text);
  ok('…so the next save is a new entry and never replaces the last one', JSON.stringify(texts) === JSON.stringify(['yesterday, kept', 'today, a new page']), texts);
  await p.keyboard.type(' plus words not saved yet');
  const cur = (await stored(p)).entries[1].id;
  await panel(p); await p.click(`[data-open="${cur}"]`);
  ok('open on the entry already in the field asks before discarding its unsaved words', (await p.isVisible(`[data-open-yes="${cur}"]`)) && (await p.inputValue('#input')).endsWith('not saved yet'));
  await p.click(`[data-del-no="${cur}"]`);
  await p.click(`[data-del="${cur}"]`); await p.click(`[data-del-yes="${cur}"]`); await p.waitForTimeout(60);
  ok('deleting the entry in the field keeps its unsaved text there as a new page', (await p.inputValue('#input')) === 'today, a new page plus words not saved yet' && (await status(p)).includes('stays in the field') && (await stored(p)).entries.length === 1);
  await p.click('#input'); await save(p);
  texts = (await stored(p)).entries.map(e => e.text);
  ok('…which saves as a new entry; the deleted one stays deleted', texts.length === 2 && texts[1] === 'today, a new page plus words not saved yet' && !(await stored(p)).entries.some(e => e.id === cur), texts);
  await p.close(); }
{ const p = await open(browser, errors);   // undo, typing over, a leftover newline, the list mark, delete keeping typing
  await p.keyboard.type('an entry with a feeling'); await save(p);
  await p.click('#feel [data-feel="after"]'); await p.click('[data-chip="calm"]'); await p.click('#feelDone');
  await p.click('#input'); await p.keyboard.press('End'); await typeAt(p, ', edited slowly', 120);
  await p.keyboard.press('Control+a'); await p.keyboard.press('Backspace');
  ok('clearing by mistake starts a new page…', (await status(p)).startsWith('a new page'));
  await p.keyboard.press('Control+z'); await p.waitForTimeout(60);
  ok('…and undo brings back the entry, with its feeling and the edit', (await p.inputValue('#input')) === 'an entry with a feeling, edited slowly' && (await p.textContent('#feel')).includes('after: calm') && (await p.textContent('#feel')).includes('editing'));
  await save(p);
  let s = await stored(p);
  ok('…so saving updates that entry rather than adding a copy', s.entries.length === 1 && s.entries[0].text === 'an entry with a feeling, edited slowly' && s.entries[0].feelings.after.labels[0] === 'calm' && s.entries[0].typing, s.entries);
  await panel(p);
  await p.click('#input'); await p.keyboard.press('Control+a'); await p.keyboard.type('typed over the whole page');
  ok('typing over the whole page starts a new page, and the list no longer marks the entry as open', (await status(p)).startsWith('a new page') && (await p.locator('#jList .jitem.here').count()) === 0);
  await save(p);
  ok('…and saves as a new entry, the first kept', JSON.stringify((await stored(p)).entries.map(e => e.text)) === JSON.stringify(['an entry with a feeling, edited slowly', 'typed over the whole page']));
  await p.click('#jNew'); if (await p.isVisible('#journal')) await p.click('#jNew');
  await p.click('#input'); await p.keyboard.type('yesterday'); await p.keyboard.press('Enter'); await save(p);
  await p.evaluate(() => input.setSelectionRange(0, 9)); await p.keyboard.press('Backspace');
  await p.keyboard.type('today, different'); await save(p);
  const texts = (await stored(p)).entries.map(e => e.text);
  ok('clearing the words but leaving a newline also starts a new page', texts.includes('yesterday\n') && texts.includes('today, different\n'), texts);
  const id = (await stored(p)).entries.find(e => e.text === 'today, different\n').id;
  await typeAt(p, ' and more words typed slowly', 120);
  await panel(p); await p.click(`[data-del="${id}"]`); await p.click(`[data-del-yes="${id}"]`); await p.waitForTimeout(60);
  await p.click('#input'); await save(p);
  const kept = (await stored(p)).entries.find(e => e.text === 'today, different and more words typed slowly\n');   // the caret sat before the newline
  ok('the page kept after deleting its entry still carries the typing summary of those words', kept && kept.typing && kept.typing.activeSec >= 1, kept && kept.typing);
  await p.close(); }
{ const a = await open(browser, errors);
  await a.keyboard.type('one entry, two tabs'); await save(a);
  const b = await a.context().newPage(); await b.goto(a.url()); await b.waitForTimeout(300);
  const id = (await stored(a)).entries[0].id;
  await panel(b); await b.click(`[data-open="${id}"]`);
  await b.click('#feel [data-feel="after"]'); await b.click('[data-chip="calm"]'); await b.click('#feelDone'); await b.waitForTimeout(60);
  await a.click('#input'); await a.keyboard.type(', more'); await save(a);
  const e = (await stored(a)).entries[0];
  ok('a feeling named in another tab survives this tab saving the same entry', e.text === 'one entry, two tabs, more' && e.feelings.after && e.feelings.after.labels[0] === 'calm', e.feelings);
  ok('…and this tab shows it', (await a.textContent('#feel')).includes('after: calm'));
  await b.close(); await a.close(); }
{ const p = await open(browser, errors);
  await p.click('#feel [data-feel="before"]');
  for (const l of ['calm', 'content', 'grateful', 'hopeful', 'energised', 'tired', 'restless', 'anxious', 'sad', 'frustrated', 'lonely', 'numb']) await p.click(`[data-chip="${l}"]`);
  await p.fill('#feelNew', 'wistful'); await p.click('#feelAdd'); await p.click('#feelDone');
  await p.click('#input'); await p.keyboard.type('many words'); await save(p);
  const id = (await stored(p)).entries[0].id;
  await panel(p); await p.click(`[data-open="${id}"]`); await p.click('#input'); await p.keyboard.press('End'); await p.keyboard.type('!'); await save(p);
  const l = (await stored(p)).entries[0].feelings.before.labels;
  ok('thirteen chosen words survive reopening and saving', l.length === 13 && l.includes('wistful'), l);
  await p.close(); }
{ const p = await open(browser, errors);
  const ty = (kps, sync, syncSec) => ({ keys: 50, activeSec: 10, kps, syncSec, sync, lab: [0.6, 0.05, 0.05] });
  const seed = { v: 1, labels: [], entries: [0.9, 0.1, null, null, null].map((sy, i) => ({ id: 'c' + i, createdAt: `2026-10-0${i + 1}T09:00:00.000Z`, text: 't', feelings: { before: { labels: ['calm'], intensity: null, skipped: false } }, typing: ty(3, sy, sy == null ? 0 : 10) })) };
  await p.evaluate(([k, v]) => localStorage.setItem(k, v), [J, JSON.stringify(seed)]); await p.reload(); await p.waitForTimeout(300);
  await panel(p);
  const rows = await p.locator('#jPatterns tbody tr').allTextContents();
  ok('a sync value resting on fewer entries than the row shows its own count', rows[1] === 'calm53.050% (2)', rows);
  const t = await p.textContent('#jPatterns'), hint = await p.textContent('#hint');
  ok('the free tab never claims its colours show accuracy', !/speed, rhythm and accuracy/.test(t) && t.includes('accuracy counts only in tabs with text to copy') && !hint.includes('accuracy'), { hint });
  await p.close(); }
{ const p = await open(browser, errors);
  await p.click('#feel [data-feel="before"]'); await p.click('[data-chip="hopeful"]'); await p.click('#feelDone');
  await p.click('#input'); await typeAt(p, 'not saved but exported', 120);
  await panel(p); const x = await exported(p);
  ok('export of an unsaved page carries its chosen feeling and typing summary too', x.unsaved.feelings.before.labels[0] === 'hopeful' && x.unsaved.typing && x.unsaved.typing.activeSec > 0, x.unsaved);
  await p.close(); }

// ── a clear saved or unsaved status, and plain warnings about reloads and import ───────────────────────────
{ const p = await open(browser, errors);
  const cls = () => p.evaluate(() => document.getElementById('jStatus').className);
  ok('an empty page shows no status', (await status(p)) === '');
  await p.keyboard.type('status check');
  ok('typing shows "unsaved"', (await status(p)) === 'unsaved' && (await cls(p)) === 'unsaved');
  await save(p); await p.waitForTimeout(3700);
  ok('after a save, and after the message fades, it shows "saved"', (await status(p)) === 'saved' && (await cls(p)) === 'saved');
  await p.keyboard.type('!');
  ok('an edit turns it back to "unsaved"', (await status(p)) === 'unsaved');
  await p.keyboard.press('Backspace');
  ok('…and undoing the edit by hand shows "saved" again', (await status(p)) === 'saved');
  await panel(p);
  const note = await p.textContent('#journal .small');
  ok('the panel says unsaved text is lost on reload and that an export cannot be imported yet', note.includes('lost if the page reloads') && note.includes('cannot import it back yet'), note);
  await p.click('button[data-mode="about"]');
  const about = await p.textContent('#panelAbout');
  ok('the about tab says the same, and that scoring never touches the journal text', about.includes('Unsaved text is lost if the page reloads') && about.includes('cannot be imported back yet') && about.includes('never touches it'));
  await p.close(); }
{ const a = await open(browser, errors);
  await a.keyboard.type('kept in tab A'); await save(a); await a.waitForTimeout(3700);
  const b = await a.context().newPage(); await b.goto(a.url()); await b.waitForTimeout(300);
  const id = (await stored(a)).entries[0].id;
  await panel(b); await b.click(`[data-open="${id}"]`); await b.click('#input'); await b.keyboard.press('End'); await b.keyboard.type(' and changed in B'); await save(b); await a.waitForTimeout(150);
  ok('another tab rewriting the entry turns this tab to "unsaved", since what is stored is no longer what is here', (await status(a)) === 'unsaved');
  await panel(b); await b.click(`[data-del="${id}"]`); await b.click(`[data-del-yes="${id}"]`); await a.waitForTimeout(150);
  const st8 = await status(a);
  ok('another tab deleting the entry: this tab says so, keeps the text, and a save makes a new entry', st8.includes('deleted in another tab') && (await a.inputValue('#input')) === 'kept in tab A' && (await save(a), (await stored(a)).entries.length === 1 && (await stored(a)).entries[0].id !== id), st8);
  await b.close(); await a.close(); }
{ const p = await open(browser, errors, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.tap('#input'); await p.keyboard.type('in the writing view');
  const kb = () => p.evaluate(() => ({ text: kbSave.textContent, gold: kbSave.classList.contains('gold'), label: kbSave.getAttribute('aria-label') }));
  const a = await kb(); await p.tap('#kbSave'); await p.waitForTimeout(60); const b = await kb();
  await p.keyboard.type('.'); const c = await kb();
  ok('in the writing view, save says when the page has unsaved changes and when it is saved, and keeps the keyboard up',
     a.text === 'save' && a.gold && a.label.includes('unsaved') && b.text === 'saved' && !b.gold && c.text === 'save' && c.gold && (await p.evaluate(() => document.activeElement.id)) === 'input', { a, b, c });
  await p.close(); }

// ── Rhythm Lab: the known k bias is shown beside every fitted k, with no correction applied ────────────────
{ const URL = instrumented('journal-lab.html', [["setMode('free'); booted = true;", "window.__core = LabCore; window.__lmh = labModelHtml; setMode('free'); booted = true;"]]);
  const p = await open(browser, errors, {}, URL);
  const r = await p.evaluate(() => {
    const C = window.__core, T0 = 600, trials = [];
    [-0.10, -0.05, 0.05, 0.10].forEach((q, j) => [0, 1].forEach(n => trials.push({ id: trials.length, cond: q, analysis: C.analyzeTrial(C.synth({ T0, T: Math.round(T0*(1 + q)), k: 4, L: 40, seed: 20 + 2*j + n })) })));
    const c = C.compare({ T0, T0post: T0, trials }), html = window.__lmh(c);
    return { html, sine: c.fits.sine.k, linear: c.fits.linear.k, ready: c.ready };
  });
  ok('every fitted k carries the uncertainty mark, and the value shown is the fitted value (no correction)', r.ready && r.html.includes(`${r.sine.toFixed(2)}<sup>†</sup>`) && r.html.includes(`${r.linear.toFixed(2)}<sup>†</sup>`), { sine: r.sine, linear: r.linear });
  ok('the note beside the table names the upward bias, its size in simulation, and that no correction is applied',
     r.html.includes('k may read high') && r.html.includes('10–20% at 8–20 ms') && r.html.includes('No correction is applied'));
  ok('the k comparison in the checks list carries the mark too', /k \d+\.\d\d† vs \d+\.\d\d† rad\/s/.test(r.html));
  await p.close(); }

ok('no page errors', errors.length === 0, errors);
done();
await browser.close();
