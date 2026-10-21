# typing mood ring

A mood ring for typing. One sphere, seven aura rings, no build step.
Open `index.html` in a browser and type.

Hue is how fast you type, colour depth is how steady your rhythm is,
brightness is how accurate you are, and the rings carry the last two
seconds of you outward like ripples. The sales pitch: you cannot not
watch it, and watching it is the feedback loop that makes you faster.

## Tabs

- **free**: type anything and watch the ring. Saving is optional: **save**
  keeps the page in a private journal in this browser, and **entries** holds
  everything else (see [Journal](#journal)).
- **faith**: type scripture. Bible (King James Version, 1611; public
  domain everywhere except the UK, where it is under Crown letters
  patent) and Qur'an (Pickthall, *The Meaning of the Glorious Koran*,
  1930, first-edition text). Keep typing past the end of a verse and the
  next verse starts with what you typed.
- **game**: *breakneck*. Type each line before the gold ring drains.
  Every level asks for ~12% more speed (level 10 ≈ 55 wpm, level 15 ≈ 98 wpm).
  Score per line is `chars × (1 + sync) × (0.5 + accuracy/2) × level`.
- **sprint**: one word at a time (the NextWord Sprint idea). No spaces;
  the word clears when the last letter lands. The arc is fuel, refilled by
  `letters × 1000 / pace` ms per word (cap 6 s), and its colour is the pace
  you must hold: `pace(w) = 1.5 + 0.05·w` keys/s. Score per word is
  `letters × (1 + sync) × combo × (rune ? 2 : 1)`, combo grows ×0.5 every
  five clean words up to ×4, and one word in ten after the tenth is a gold
  rune. Your best run is replayed as a ghost (words per second).
- **duel**: Bifrost. You against a jötunn bot or Urðr, the keystroke
  timing of your own last duel. See below.
- **lab**: the Rhythm Lab, an exploratory tapping prototype that asks whether a
  phase-locking model describes how a person taps along with a steady beat. Audio
  only, with a static tap target. See [RHYTHM_LAB.md](RHYTHM_LAB.md) for the
  protocol, the single clock, the analysis rules, the held-out model test and
  what would count against the model. It makes no claim about mood, empathy,
  intelligence, health or typing.
- **?**: the colour math, the sync math, the duel physics, and the wager.

Enter starts or restarts game, sprint and duel. **keep this aura ↓** (in the
free tab it sits under **entries**)
re-renders the canvas at 720 px into a PNG with the mood word and the numbers.
Opened as a plain file it downloads; published as a claude.ai artifact it is
offered through the viewer's `downloads` capability, and without that the
image is shown on the page to save by hand.

The page also follows the claude.ai artifact contract (safe-area gutters,
a deliberate dark scheme, no external requests beyond Google Fonts), so it
can be published as is after removing the document wrapper tags.

## The colour math

Colours are computed in OKLCH (Björn Ottosson's OKLab matrices):

| channel   | driven by          | mapping |
|-----------|--------------------|---------|
| hue       | velocity (keys/s)  | piecewise-linear through 300° (violet, 0 k/s) → 270° → 222° → 150° → 100° → 65° → 38° → 25° (red, 11 k/s) |
| chroma    | sync `r`           | `Cmax(L, H) · (0.12 + 0.13·a + 0.75·r·a)`, where `a = min(1, v/3)` is activity and `Cmax` is the most vivid in-gamut chroma at that lightness and hue, so full sync reaches full colour at every speed |
| lightness | recent accuracy    | `0.5 + 0.22·a − 0.24·min(1, (1 − acc₂₀)/0.15)`, where `acc₂₀` is accuracy over the last 20 characters, plus a brief flash on completing a line |
| ring *k*  | time               | the colour from `k × 0.33 s` ago, `k = 1…7`, fading outward |

Velocity is `1000 / (smoothed inter-key interval)`; the interval is
smoothed (EMA, α = 0.3) rather than the rate so bursts do not skew it high.

## The sync math

One oscillator runs inside the sphere with phase φ and natural frequency ω.
Each keystroke kicks it. It is a cousin of the pulse-coupled models of
Mirollo & Strogatz (fireflies) and Peskin (cardiac pacemaker cells): a phase
oscillator with a sinusoidal phase-response curve, driven by the keystrokes,
whose frequency adapts toward the typing rate:

```
between keys     dφ/dt = ω
on a keystroke   φ ← φ − K·sin φ
                 ω ← ω + ε·(2π·f − ω)

K = 0.35   ε = 0.25   f = 1 / interval   ω ∈ [2π·0.5, 2π·25]
```

The phase is a function of time, `φ(t) = φ₀ + ω·(t − t₀)`, read at the
keystroke event's own timestamp, so the reading does not depend on the
frame rate. **sync** is the mean resultant length (vector strength) of the
phase at the last twelve keystrokes, the same formula Kuramoto uses for
his order parameter:

```
r · e^{iψ} = (1/N) · Σ_j e^{iφ_j}
```

Rests and resets: an interval longer than `max(600 ms, 3 × smoothed
interval)` is a rest, so the phase is re-seeded and ω is left alone. A
gap of 2.5 s or more starts the rhythm over. Key auto-repeat (`keydown.repeat`)
is not a keystroke, and neither are pastes, drops, or swipe-typed words.

## The duel: Snell's law at Bifrost

Each typist is a medium; the index is the interval in breakneck units,
`n = interval / 83 ms`. Only the ratio of speeds matters:

```
critical angle   sin θc = v_slow / v_fast
through          T(s→r) = min(1, ṽ_s / ṽ_r)²        ṽ = v + 0.5 keys/s
intensity        I = (1 + r)/2 · acc₂₀
push             dp/dt = 0.9 · (I_you·T_you − I_them·T_them)     p ∈ [−7, 7]
```

`T` is the escape fraction of a Lambertian sphere into a faster or slower
medium (`sin²θc`, the n² brightness theorem); it has no cusp at equal
speeds, so noise does not decide close duels. The floor `ṽ` makes two idle
typists a draw. `⌊|p|⌋` of the loser's rings are drawn in the winner's
colour; seven rings, or the 45 s clock, ends the duel. The rays drawn on
the canvas are decoration that follows the same law (refracted with
`sin θ₂ = (ṽ_r/ṽ_s)·sin θ₁`, or turned back past the critical angle).

- **Opposite colour wheel**: you own hues 300° → 90° (violet, red, gold),
  the opponent 120° → 270° (green, cyan, blue), with speed as the
  thermometer within each half; at equal speeds the hues are 180° apart.
- **Loki**: light that turns back charges a meter (`0.33 · I · (1 − T)`
  per second). Full, it fires for 2 s: your light passes, theirs does not.
- **Opponents**: a jötunn types `wpm` with ±35 ms jitter and 97% accuracy,
  and gains 4 wpm when you win, loses 3 when you lose (15–160). Urðr
  replays your last duel's keystroke offsets.

An honest note, also in the about tab: typing speed is a rate, not the
speed of light, so the duel is a picture. The law that governs two coupled
typists is Adler's: they lock iff `|Δω| ≤ 2K`, at `sin ψ = Δω / 2K`;
beyond that the phases slip, which is its total internal reflection.
Snell's law is proved in Lean as `snell` in
[`../wyrd-mathlib/WyrdMathlib/Rainbow/Defs.lean`](../wyrd-mathlib/WyrdMathlib/Rainbow/Defs.lean).

## Journal

The free tab can keep what you write, if you want it to. Nothing is stored
until you press **save** (or Ctrl/⌘+S); typing, switching tabs and choosing a
feeling write nothing. The page you are writing waits for you while you visit
other tabs, but an unsaved page is not stored anywhere and is gone on reload.

- **Exactly as typed.** The text is saved character for character: typos,
  double spaces, tabs, blank lines and trailing spaces included. Nothing is
  corrected, and nothing has to be corrected to carry on.
- **entries** opens a dated list, newest first: **open** puts an entry back
  in the field to edit (saving updates it in place, and the page says
  "editing" with its date), **delete** asks before it deletes, **new entry**
  and **open** ask before they discard unsaved text, and **export** saves
  everything as a JSON file, with an unsaved page alongside. Clearing the
  field also starts a new page, so the next save never replaces the last
  entry; deleting the entry in the field keeps any unsaved text there.
- **Feelings are yours to name, and optional.** On an empty page a quiet
  line offers to name how you feel before writing; after a save it offers
  the same for after. Choose any of twelve plain words, add your own (they
  are remembered, and × forgets one), rate how strong it is from 1 to 5 or
  not at all, or skip. Skips are recorded as skips.
- **Typing is stored apart from feelings.** Each entry keeps a summary of
  the typing that wrote it: active seconds, keys, mean keys/s, mean sync and
  the mean colour of the sphere (in OKLab). The colours reflect typing
  mechanics, speed and rhythm (accuracy counts only in tabs with text to
  copy), and nothing else.
- **Patterns** describe your own entries: how many there are, how many have
  a feeling you chose, how often each word appears, before-and-after
  intensity, and the median typing beside each word used in at least two
  entries. Every line carries the number of entries it rests on (a sync
  value resting on fewer shows its own count in brackets). Nothing
  infers a feeling from a colour, diagnoses anything or calls a pattern a
  cause.
- **Private.** Entries stay in this browser on this device. Clearing
  browsing or site data, a private window, or the browser freeing space can
  erase them; export is the backup. There is no account, upload, analytics
  or AI. There is no import yet: an export can be read but not loaded back.
- **Separate from the Rhythm Lab.** The journal has its own key and never
  touches the lab's recordings, the game records or anything else.

When storage fails, save says why (full, blocked, or a write the browser
silently dropped) and the text stays in the field. A journal that cannot be
read is copied to `tmr-journal-unreadable-<time>` before anything is written
over it, and if that copy cannot be made, saving pauses for the session.
Entries of the wrong shape are left as they are and counted, not shown.

## Phones

Below 520 px the sphere is 200 px and pinned to the top. A tab switch on a
touch phone opens no keyboard: the start bar, verse or field is scrolled
into view under the sphere, and the keyboard opens when you tap the field or
press start. The page does not scroll at load.

**The writing view.** On a touch phone, in either orientation, touching the
field turns the page into one fixed view the size of the visual viewport, the
part actually on screen above the keyboard and between the browser bars. It
holds a small sphere, the verse or word to type, and the field, which
scrolls on its own; **done** closes the keyboard and **save** (free tab)
saves without closing it. The view follows the visual viewport's size and
offset on every `resize` and `scroll` (iOS pans it to reveal the field), and
re-reads after a turn. The sphere comes in a few fixed sizes, so browser bars
coming and going do not move the field. When the visible area is wide and
short (a phone held sideways), the sphere moves to the left of the field.
Zoom is never disabled: while pinch-zoomed the view keeps its last layout,
and touching the field while zoomed in leaves the page as it is. Readings no
screen has (zero height, negative offsets) are ignored. When a run ends the
keyboard closes so the result card shows. Field and inputs use 16 px text,
so iOS does not zoom on focus.

**In a frame** (claude.ai shows the page in an iframe) the frame's
visual viewport does not see the keyboard, and iOS pans the whole host page
to reveal the field. Unless the frame itself shrinks, the view keeps to the
top 45% of the frame upright and the top 26% sideways, where the keyboard is
least likely to reach, with the field directly under the sphere. Those shares
are guesses from typical keyboard heights; if the host does shrink the frame,
the view uses all of it.

**What is tested, and what is not.** `tests/keyboard.mjs` is emulation:
desktop Chromium with phone viewports and a stand-in `visualViewport` moved by
hand. Chromium has no iOS keyboard, no reveal pan and no safe-area insets.
Before calling the layout done, check on a real iPhone (name the iOS version
and model), in Safari and in the claude.ai preview:

1. Tap an empty field, a long entry with the caret at the end, and low in a
   long entry: the sphere and the caret stay visible, nothing jumps.
2. Type twenty lines: the field scrolls, the page does not.
3. Predictive bar on and off, emoji keyboard, dictation, a hardware keyboard.
4. Turn the phone both ways with the keyboard open.
5. Pinch-zoom with the keyboard open; no zoom on focus.
6. Safari's bars collapsing and expanding; landscape notch insets.
7. **done** and **save**: does save keep the keyboard up, as intended?
8. Close the keyboard and check fixed elements return (iOS 26 has a known
   `offsetTop` regression after dismissal).
9. In the claude.ai preview: is the 45% / 26% share too much or too little,
   and does the sphere stay on screen after iOS pans to the field?

## Storage

`localStorage`. Every read and write is wrapped in try/catch, so storage
that is blocked or throws (private windows, blocked site data) reads as the
defaults and skips writes; the page still plays.

| key | holds | on load |
|-----|-------|---------|
| `tmr-best` | game best score | must be a finite, nonnegative number (fractions kept); anything else, such as `1e999` (Infinity), a negative, a string or unparsable text, is removed and read as 0 |
| `tmr-sprint-best` | sprint best score | same rule as `tmr-best` |
| `tmr-sprint-far` | most sprint words | same rule as `tmr-best` |
| `tmr-sprint-ghost` | words per second of the best sprint | an array of at most 1000 integers in 0–100000, else ignored; the next best run replaces it |
| `tmr-duel` | `{w, l, d, giant}` | each field is used only if it is a finite number; `giant` is rounded and clamped to 15–160 wpm. `w`, `l` and `d` are not otherwise range-checked |
| `tmr-ghost` | `{v: 1, d: [ms offsets], acc, at}`, the last duel | used only if `v` is 1 and `d` holds 20–6000 non-decreasing integers up to 600000; `acc` outside 0–1 becomes 0.95; otherwise ignored |
| `tmr-lab` | Rhythm Lab: `{v: 1, consent: {at}, sessions: [...]}` with cue and tap times per trial | written only after consent; a store of the wrong shape is removed; sessions whose trials are malformed are dropped; at most 20 sessions; reset in the lab deletes the key |
| `tmr-journal` | the journal: `{v: 1, entries: [{id, createdAt, updatedAt, text, feelings: {before, after}, typing}], labels: [your words]}`; a feeling is `{labels, intensity 1–5 or null, skipped}` | written only by save, a feeling for a saved entry, or delete; every change starts from what is stored now, so two tabs do not overwrite each other; entries of the wrong shape are kept untouched and not shown; an unreadable journal is copied aside first (below) |
| `tmr-journal-unreadable-<time>` | a copy of a journal that could not be read | made once per distinct unreadable journal, never deleted by the page |

A record is replaced only by a greater value, so the three best-score keys
are checked strictly: a corrupt Infinity would otherwise outrank every
future record, and a corrupt sprint best would also stop the ghost from
ever being replaced.

## Tests

Browser checks drive the page in Chromium through Playwright. Playwright is
not a dependency of the repository: the harness uses a local install if
there is one, then `PLAYWRIGHT_MODULE` (a path to its `index.mjs`), then the
global npm root. Run everything with

```
node experiments/typing-mood-ring/tests/run.mjs
```

or one file at a time:

| file | checks |
|------|--------|
| `suite.mjs` | 42: sync and rests, auto-repeat, faith navigation and carry-over, smart quotes, game, sprint, duel, phone layout, reduced motion, snapshots |
| `regress.mjs` | 14: the review of the sprint and duel tabs (hidden count-ins and the run clock after them, duel reset, desktop and phone focus, sprint whitespace) |
| `records.mjs` | 14: corrupt saved records recover (twelve corrupt forms), valid ones survive weaker runs that score, new bests save, the sprint ghost is replaced only by a better run, all of it across reloads, blocked storage |
| `lab-core.mjs` | Rhythm Lab analysis in Node, no browser: the integrator against the analytic slip period and locked offset, the regimes, synthetic locked and slipping trials against ground truth, missed, extra and duplicate taps, jitter, slow slips that nearest-beat scoring would hide, parameter recovery, the held-out comparison on phase, linear and no-coupling data, and the coupling bound |
| `lab.mjs` | Rhythm Lab in Chromium: consent first, baseline, duplicate and repeat taps, one clock for clicks and taps (taps placed 30 ms after each mapped click read back at +30 ms), interrupted trials flagged and re-queued, a full session with the redo rule, export, reset, simulation regimes, a clock step flagged as drift, and touch taps on a phone viewport |
| `interaction.mjs` | 24: count-in, background and resume (clocks, no opponent burst), caret locking, Loki's HUD and rays frame by frame, phone portrait layout (the caret's line clear of the pinned sphere), landscape usability and result cards, focus in a short desktop window |
| `keyboard.mjs` | 38, all emulated: the writing view with a stand-in visual viewport, portrait and landscape keyboards, the reveal pan, an 80-line entry scrolling inside the field with the page still, a caret away from the end kept in view, no movement while typing or when the keyboard arrives or grows (upright and sideways), save keeping focus, pinch zoom, impossible readings, done restoring the page, every mode, turning with the keyboard open and then closing it, opening an entry sideways, the verse window after done, the iframe fallback and a host that shrinks the frame, duel labels on a narrow phone, no writing view without touch |
| `journal.mjs` | 78: text saved exactly, nothing stored before save, drafts across tabs, Ctrl+S, the dated list, open and edit in place, confirmed delete and new entry, clearing the field starting a new page, unsaved words never discarded by open or delete, feelings before and after with skip, own words, intensity and clearing, more than twelve words, the typing summary kept apart, damaged and missing feelings, injected colours, descriptive patterns with counts (including the sync count), export with the unsaved page and its feelings, storage full, dropped writes and blocked storage, unreadable journals copied aside, other records untouched, two tabs saving entries and feelings, the Rhythm Lab's k note |

Phones are emulated (desktop Chromium with a phone viewport, touch and
device scale), not real devices. A background tab is emulated too: the
harness flips `document.hidden`, fires `visibilitychange` and holds animation
frames while hidden. Screenshots go to `TMR_OUT` (default `<tmp>/tmr-tests`).
`TMR_PAGE=path/to/other.html` runs the checks against another copy of the
page, for example an older commit, to compare. Timing-based checks type at
fixed intervals, so a heavily loaded machine can make a sync reading flaky.

## Adding a scripture

`VERSES` in `index.html` is a plain object keyed by scripture id:

```js
{ label: 'Bible · KJV', items: [ { ref: 'Genesis 1:1', text: '…' }, … ] }
```

Add a key, add a `<button data-scr="…">` to `#faithBar`, and it shows up.
Keep to public-domain translations.
