// Shared browser harness for the typing mood ring checks. Playwright is not a dependency of the
// repository: it is taken from a local install if there is one, else from PLAYWRIGHT_MODULE, else
// from the global npm root. Screenshots go to TMR_OUT (default: <tmp>/tmr-tests), never the repo.
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

async function loadPlaywright() {
  try { return await import('playwright'); } catch {}
  if (process.env.PLAYWRIGHT_MODULE) return import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
  const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
  return import(pathToFileURL(path.join(root, 'playwright', 'index.mjs')).href);
}
export const { chromium } = await loadPlaywright();

const here = path.dirname(fileURLToPath(import.meta.url));
// TMR_PAGE points the checks at another copy of the page, e.g. an older commit, to compare.
export const PAGE_FILE = process.env.TMR_PAGE ? path.resolve(process.env.TMR_PAGE) : path.join(here, '..', 'index.html');
export const PAGE = pathToFileURL(PAGE_FILE).href;
export const OUT = process.env.TMR_OUT || path.join(tmpdir(), 'tmr-tests');
mkdirSync(OUT, { recursive: true });
export const shot = name => path.join(OUT, name);

// A copy of the page with test-only instrumentation spliced in. Each anchor must occur exactly once
// in index.html, so a change to the page breaks the instrumentation loudly instead of silently.
export function instrumented(name, edits) {
  let s = readFileSync(PAGE_FILE, 'utf8');
  for (const [a, b] of edits) {
    const n = s.split(a).length - 1;
    if (n !== 1) throw new Error(`instrumentation anchor found ${n} times: ${a.slice(0, 60)}`);
    s = s.replace(a, b);
  }
  const f = path.join(OUT, name); writeFileSync(f, s);
  return pathToFileURL(f).href;
}

export function checks(label) {
  const results = [];
  const ok = (name, cond, info = '') => {
    results.push({ name, pass: !!cond });
    console.log((cond ? 'PASS ' : 'FAIL ') + name + (info !== '' ? '  — ' + JSON.stringify(info) : ''));
  };
  const done = () => {
    const pass = results.filter(r => r.pass).length;
    console.log(`\n${label}: ${pass}/${results.length} passed`);
    if (pass !== results.length) process.exitCode = 1;
  };
  return { ok, done };
}

export async function fresh(browser, errors, opts = {}, url = PAGE) {
  const { gate, init, ...ctxOpts } = opts;
  const ctx = await browser.newContext({ viewport: { width: 600, height: 1000 }, acceptDownloads: true, ...ctxOpts });
  if (gate) await ctx.addInitScript(RAF_GATE);
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(url); await page.waitForTimeout(300);
  return page;
}
export const txt = (p, s) => p.evaluate(s => document.querySelector(s).textContent, s);
export const stats = p => p.evaluate(() => ({ kps: sKps.textContent, wpm: sWpm.textContent, sync: sSync.textContent, acc: sAcc.textContent, mood: moodWord.textContent, sub: moodSub.textContent }));
export const typeAt = async (p, s, ms, jitter = 0) => { for (const ch of s) { await p.keyboard.type(ch); await p.waitForTimeout(ms + (jitter ? (Math.random()*2 - 1)*jitter : 0)); } };
// Emulated page visibility. Headless Chromium never hides a page and keeps running animation frames
// even when frozen over CDP, so a background tab is emulated: document.hidden flips, visibilitychange
// fires, and (for pages opened with { gate: true }) requestAnimationFrame callbacks are held until the
// page is shown again, as a real background tab does. Timers keep running, as they do in a real one.
const RAF_GATE = () => {
  const raf = window.requestAnimationFrame.bind(window); let held = [];
  window.__rafHold = false;
  window.requestAnimationFrame = cb => { if (window.__rafHold) { held.push(cb); return 0; } return raf(cb); };
  window.__rafRelease = () => { window.__rafHold = false; const q = held; held = []; for (const cb of q) raf(cb); };
};
export async function hide(p, on) {
  await p.evaluate(on => {
    Object.defineProperty(document, 'hidden', { get: () => on, configurable: true });
    Object.defineProperty(document, 'visibilityState', { get: () => on ? 'hidden' : 'visible', configurable: true });
    if (on && '__rafHold' in window) window.__rafHold = true;
    document.dispatchEvent(new Event('visibilitychange'));
    if (!on && window.__rafRelease) window.__rafRelease();
  }, on);
}

// A stand-in for the claude.ai preview: the page as an artifact (no document wrapper of its own) inside the exact
// skeleton claude.ai served for it (captured from the published version), framed under a host header the way a
// phone shows it. Emulation only: the real host page, its scripts and its keyboard handling are not reproduced.
const HOST_HEAD = '<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n';
export function previewReplica(name, header = 56) {
  const src = readFileSync(PAGE_FILE, 'utf8');
  const head = src.slice(src.indexOf('<title>'), src.indexOf('</head>'));
  const body = src.slice(src.indexOf('>', src.indexOf('<body')) + 1, src.indexOf('</body>'));
  const inner = path.join(OUT, name + '-artifact.html'), outer = path.join(OUT, name + '.html');
  writeFileSync(inner, HOST_HEAD + head.replace(/\n+$/, '') + '\n' + body.replace(/^\n+|\n+$/g, '') + '\n\n\n</body></html>');
  writeFileSync(outer, `<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;height:100%;background:#1f1e1d}header{height:${header}px;background:#262624;color:#ccc;font:14px sans-serif;display:flex;align-items:center;padding:0 14px}iframe{display:block;width:100%;height:calc(100% - ${header}px);border:0}</style><header>claude.ai preview (stand-in)</header><iframe id="f" src="${pathToFileURL(inner).href}"></iframe>`);
  return pathToFileURL(outer).href;
}
