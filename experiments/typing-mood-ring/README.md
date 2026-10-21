# typing mood ring

A mood ring for typing. One sphere, seven aura rings, no build step.
Open `index.html` in a browser and type.

Hue is how fast you type, colour depth is how steady your rhythm is,
brightness is how accurate you are, and the rings carry the last two
seconds of you outward like ripples. The sales pitch: you cannot not
watch it, and watching it is the feedback loop that makes you faster.

## Tabs

- **free**: type anything and watch the ring.
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

Enter starts or restarts game, sprint and duel. **keep this aura ↓**
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

## Phones

Below 520 px the sphere is 200 px and pinned to the top, and the field is
scrolled so the sphere, the verse or word, and the field share the space
above the keyboard. Long verses show as a two-line window that follows the
caret. On intro and result cards the mode bar (start, opponents) is kept in
view instead. The page does not scroll at load, since a focus at load opens
no keyboard.

Landscape phones (a touch screen 500 px tall or less) get only the
alignment: the line to type and the field are scrolled into view, and result
cards stay on screen, but the sphere stays at desktop size and is off-screen
while typing. A landscape layout is not designed yet. Short desktop windows
are left alone, so the field is still focused at load there.

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
