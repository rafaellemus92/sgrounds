# typing mood ring

A mood ring for typing. One sphere, seven aura rings, no build step.
Open `index.html` in a browser and type.

Hue is how fast you type, colour depth is how steady your rhythm is,
brightness is how accurate you are, and the rings carry the last two
seconds of you outward like ripples. The sales pitch: you cannot not
watch it, and watching it is the feedback loop that makes you faster.

## Tabs

- **free** — type anything and watch the ring.
- **faith** — type scripture. Bible (King James Version, 1611) and
  Qur'an (Pickthall, *The Meaning of the Glorious Koran*, 1930); both
  translations are public domain. Verses advance on completion.
- **game** — *breakneck*: type each line before the gold ring drains.
  Every level asks for ~12% more speed (level 10 ≈ 55 wpm, level 15 ≈ 98 wpm).
  Score per line is `chars × (1 + sync) × (0.5 + accuracy/2) × level`.
  Tick **verses** to play with the scripture pool. Best score is kept in
  `localStorage` under `tmr-best`.
- **?** — the colour math, the sync math, and the wager.

**keep this aura ↓** downloads a PNG of the sphere with the mood word and
the numbers.

## The colour math

Colours are computed in OKLCH (perceptually uniform; Björn Ottosson's
OKLab matrices, with chroma reduced until the colour fits in sRGB):

| channel   | driven by          | mapping |
|-----------|--------------------|---------|
| hue       | velocity (keys/s)  | piecewise-linear through 300° (violet, 0 k/s) → 270° → 222° → 150° → 100° → 65° → 38° → 25° (red, 11 k/s) |
| chroma    | sync `r`           | `0.03 + 0.04·a + 0.16·r·a`, where `a = min(1, v/3)` is activity |
| lightness | accuracy           | `0.5 + 0.22·a − 0.22·(1 − acc)`, plus a brief flash on completing a line |
| ring *k*  | time               | the colour from `k × 0.33 s` ago, `k = 1…7`, fading outward |

Velocity is `1000 / (smoothed inter-key interval)`; the interval is
smoothed (EMA, α = 0.3) rather than the rate so bursts do not skew it high.
A gap longer than 2.5 s resets the rhythm; idle velocity decays with a
0.7 s time constant.

## The sync math

One oscillator runs inside the sphere with phase φ and natural frequency ω.
Each keystroke is a pulse that kicks it, the pulse-coupled model of
Mirollo & Strogatz (fireflies) and Peskin (cardiac pacemaker cells), and ω
adapts toward the typing rate:

```
between keys     dφ/dt = ω
on a keystroke   φ ← φ − K·sin φ            K = 0.35
                 ω ← ω + ε·(2π·v − ω)       ε = 0.25,  v = 1 / interval
```

The phase just before each kick is recorded. **sync** is the Kuramoto
order parameter over the last twelve keystrokes:

```
r · e^{iψ} = (1/N) · Σ_j e^{iφ_j}
```

`r = 1`: the oscillator and the typist are one clock. `r → 0`: the kicks
are scattered. A steady 6 keys/s run reads ~100% and "locked in"; the same
text with intervals jittered between 40 ms and 540 ms reads ~20% and
"scattered". The small wobble travelling through the rings is `cos φ`,
delayed ring by ring: the phase propagating outward.

The wager, for anyone who studies coupled oscillators: typing is a
two-oscillator system (the one producing the next letter, the one executing
it), the velocity of thought should show up as phase coherence in the
keystrokes, and a continuous picture of that coherence trains the two to
lock faster. Breakneck speed is not more force; it is better coupling.

## Adding a scripture

`VERSES` in `index.html` is a plain object keyed by scripture id:

```js
{ label: 'Bible · KJV', credit: '…', items: [ { ref: 'Genesis 1:1', text: '…' }, … ] }
```

Add a key, add a `<button data-scr="…">` to `#faithBar`, and it shows up.
Keep to public-domain translations.
