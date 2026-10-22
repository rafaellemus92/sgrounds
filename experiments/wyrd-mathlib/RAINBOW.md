# A Lean formalization of classical rainbow geometry

A one-page map of what is proved, what is assumed and what is left out.

**Status.** The rainbow is 13 Lean files with 73 theorems and lemmas (44 public, 29 private), and none uses `sorry`.
Every one depends only on `propext`, `Classical.choice` and `Quot.sound`. The proofs date from commit `fd0d7a6` (Lean 4.35.0,
Mathlib v4.35.0); only their comments have changed since. The files are already on `main` (PR #46) and are byte-identical on every
branch that has them.

## What Lean proves

The model is one formula, taken as a definition in `Defs.lean`. A ray enters a sphere at angle `i`, refracts to
`r = arcsin(sin i / n)`, reflects `k` times inside, and leaves turned by `D(i) = kπ + 2i − 2(k+1)r`. From that formula:

1. **Snell, checked.** For `n ≥ 1`, `n sin r = sin i` (`snell`). This checks the definition; Snell's law itself is
   assumed.
2. **Slope.** For `n > 1`, `D′(i) = 2 − 2(k+1) cos i / √(n² − sin² i)` (`hasDerivAt_dev`). For `k ≥ 1` and
   `cos i ≥ 0`, the slope is negative, zero or positive exactly when `cos² i` is above, equal to or below
   `(n² − 1)/(k(k+2))` (`deriv_dev_neg_iff`, `deriv_dev_eq_zero_iff`, `deriv_dev_pos_iff`).
3. **The bow ray.** For `k ≥ 1` and `1 < n < k + 1`, the angle with `cos² i = (n² − 1)/(k(k+2))` is the only
   stationary point on `[0, π/2]`. It is also the strict minimum there (`deriv_dev_eq_zero_iff_eq`, `dev_lt_of_ne`,
   `dev_isMinOn`).
4. **Water as n = 4/3.** Here `cos² i = 7/27` and `7/72`. The primary bow lies in (41°, 43°) and the secondary in
   (50°, 52°) (`water_primary`, `water_secondary`, `primary_bow_water`, `secondary_bow_water`).
5. **Alexander's dark band.** At `n = 4/3`, every once-reflected ray has `π − D < 43°` and every twice-reflected ray
   has `D − π > 50°` (`alexander_dark_band`). The same holds for every `1.331 ≤ n < 2` (`dark_band_of_red_le`).
6. **Colour order.** The bow's deviation strictly increases with `n` (`bowDev_strictMonoOn`). So if
   `1 < n_red < n_violet < 2`, violet sits inside red in the primary and outside it in the secondary (`colour_order`).
7. **Spectrum.** There are 1° brackets at `n = 1.331` and `n = 1.343`: 42–43° and 40–41° for the primary, 50–51° and
   53–54° for the secondary. Between them, the bows spread by more than 1° and 2° (`primary_red` … `secondary_spread`).

Two files support the rest. `TrigBounds.lean` has one-sided Taylor bounds for sin and cos, of degree 4 to 7, on `x ≥ 0`.
`MinLemma.lean` has a strict first-derivative test.

## What it assumes

- Ray optics in one plane through a perfect sphere. Snell's law and the law of reflection are built into `D`, not
  derived from anything.
- One real index `n` per colour, relative to air, with no absorption. The values 4/3, 1.331 and 1.343 are inputs.
  Their wavelengths (about 578, 663 and 402 nm at 20 °C, by IAPWS 1997) are not in Lean.
- A point sun, and incidence angles `i` in `[0, π/2]`.
- Sky angles from the antisolar point are read as `π − D` and `D − π`. That reading is right for every ray only when
  `1.18 ≤ n ≤ √2`. Water qualifies, but this is not proved.

## What it leaves out

- Brightness of any kind: neither the caustic's "bright fold" nor the darker sky between the bows.
- Wave optics: Airy theory and supernumerary bows.
- Polarization and Fresnel weights.
- External reflection, and rays reflected three or more times.
- The sun's 0.5° disc, and the drop's shape and size.
- `n` as a function of wavelength.
- Anything for `i` outside `[0, π/2]`.
- The decimal angles (42.03°, 50.98°) and band widths (about 1.7° and 3.1°). These are numerical only.

## Reproducing it

```
git checkout fd0d7a6               # or main, or this branch: the rainbow files are identical
cd experiments/wyrd-mathlib
lake exe cache get                 # Mathlib 56a00585 (v4.35.0); lean-toolchain pins Lean v4.35.0
lake build WyrdMathlib.Rainbow     # about 5 min with cached Mathlib; no sorry warnings
```

**Files.**
- Lean: `WyrdMathlib/Rainbow.lean` and the 12 files under `WyrdMathlib/Rainbow/`.
- Configuration: `lakefile.toml`, `lean-toolchain` and `lake-manifest.json`, plus the config of the `../wyrd` path
  dependency.
- Audit: `Audit.lean` lines 9–29 print the axioms of 21 public theorems. A sweep of all 101 rainbow constants found
  only the three standard axioms.

**Excluded drafts.**
- The WIP commits `7dd4693` and `7406a6a` hold the same statements with `sorry`. Nothing imported them, and every
  statement survived word for word.
- No other branch has a different rainbow file.
- The scripts behind the decimal figures were never committed.
- CI builds only imported files, which is why it also passed on those WIP commits.

## Note on prior work

The mathematics is classical: Descartes (1637) and Newton (1704). A limited search, as of 22 October 2026, found no
earlier machine-checked proof of these results. It covered:
- Lean and Mathlib, Physlib and the large Lean archives;
- Isabelle (the AFP), HOL Light and HOL4;
- Rocq, Mizar, Metamath, ACL2, PVS and Agda;
- the published literature.

The closest formal work:
- **HOL Light:** Siddique, Aravantinos and Tahar's optics library (2012–2017). It handles refraction at plane and
  spherical surfaces, but only paraxially, with no deviation function and no minimum.
- **Lean:** FormalPhysics (2026) derives Snell's law at one flat surface from Fermat's principle. Physlib's optics
  folder is a placeholder.
- **Isabelle:** its AFP "Optics" entry is about lenses in programming, not light.

Limits: GitHub code search was unavailable, and some papers could be read only as abstracts. So the wording stays "to
our knowledge". It is never "the first formal optics" or "the first Snell's law".

## Corrections to the prose

**README.**


- **Dark band, every index.** The `dark_band_of_red_le` row now gives the theorem's range `1.331 ≤ n < 2`; the README
  had dropped `n < 2`. It also says what lies outside the range:
  - redder light (`n < 1.331`, beyond about 663 nm at 20 °C) is not covered;
  - beyond about 726 nm (`n < 1.32962`), twice-reflected light does reach the band in the model;
  - for `n ≥ 1.777`, grazing once-reflected rays reach it too.
- **Dark band at n = 4/3.** The `alexander_dark_band` row now says "no ray" for `n = 4/3` instead of "no light".
  "Why the sky is darker" moved into the prose as interpretation.
- **Numerical values.** "True value 42.03°" now reads "numerically 42.03°", and likewise for 50.98°.
- **Mathlib's bounds.** "Mathlib's bounds stop at degree 3" was wrong: `Real.sin_bound` exists, but applied directly it
  is too loose.
- **Hypotheses and history.** The hypotheses are now spelled out, and the formula is credited to Newton's *Opticks*.
- **Other files.** The ROADMAP rainbow items now match, and the "first" wording in `../THEOREMS.md` is narrowed.

**Lean comments.** Only comments changed: with comments stripped, the code is identical. The build and the axiom
audit pass afterwards.
- `Defs.lean`: the sky-angle convention now separates the signed angle from the angle actually seen. The caustic
  is marked as background, the stale "one refractive index" note is gone, and the formula is credited to Newton.
- `TrigBounds.lean`: Mathlib's bounds are described accurately.
- `DarkBand.lean`: the band is now a gap in the once- and twice-reflected ray families, not proof of a darker sky.
- `VisibleBand.lean`: it gives the range `1.331 ≤ n < 2`, the signed-versus-seen limit near `n ≈ 1.777`, and the
  unproved stretch from 1.3296 to 1.331. The wrong claim "covers essentially all visible light" is removed.
- `Colours.lean`: "bends the ray more" now needs a slanted ray (`sin i > 0`).

## Teaching demo

[`rainbow-lab.html`](rainbow-lab.html) is a single file that runs in a browser with no build step.
- **The drop.** You drag the entry angle and switch between one and two reflections.
- **The index.** By default the index runs from red (1.331) to violet (1.343), the range the colour theorems use. An
  "explore" mode widens it to show where the signed angle and the angle actually seen part ways.
- **Labels.** Every statement is marked proved (naming the theorem), computed, or not modelled.
- **Self-test.** On load, the page checks its own arithmetic against the six proved bow brackets.

It needs no new theorems. A Mathlib contribution is left for later. It would rest on the least distinctive pieces:
the Taylor bounds, which Isabelle's AFP already has as infinite families (Paulson, 2014), and a derivative test that
Mathlib nearly has.
