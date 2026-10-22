# Teaching note: `Wyrd.Rainbow.dev_lt_of_ne` — the bow ray is the strict minimum of the turning angle

**What this is.** A line-by-line walk through one theorem of the rainbow formalization, written so that you can check it yourself. It was produced by an AI assistant (Claude, running as a workflow subagent) on 2026-10-22. It is **not** a human review, and nothing below should be cited as one. Everything quoted was read from the files listed here; everything marked *checked* was run against the built project. Judgement calls (what the theorem "means") are mine and are the part you should distrust most.

**Where things are.** Project `experiments/wyrd-mathlib`, Lean `4.35.0` (`lean-toolchain`; `lean --version` prints commit `eb6cafb`), Mathlib `v4.35.0` (`lakefile.toml` line 8; `lake-manifest.json` line 16 pins it to `56a005855ea17e0b0958f73ec801ae140b0a1679`). **Pinned to commit `6f60278`** on `claude/prime-proof-250-37-uysci8`, the commit that adds `Viewing.lean` (this guide's own later corrections are in the commit after it, which changes no Lean file). The second column gives each cited file's git blob hash at that commit, from `git rev-parse 6f60278:experiments/wyrd-mathlib/<path>`, so that a citation can still be checked after the files move. Files, all under `WyrdMathlib/Rainbow/` unless marked:

| File | Blob at `6f60278` | What it holds (lines cited below) |
|---|---|---|
| `Defs.lean` | `516f5f0a583f` | `refr`, `dev`, `bowIncidence`, `snell` (44, 47, 52, 55) |
| `Deriv.lean` | `7adaf4b7088e` | `hasDerivAt_refr` (20), `hasDerivAt_dev` (44), `continuous_dev` (54), `deriv_dev_neg_iff` / `_pos_iff` / `_eq_zero_iff` (96, 104, 112) |
| `MinLemma.lean` | `3fd2486f82e2` | `lt_of_deriv_sign` (13), `isMinOn_of_deriv_sign` (33) |
| `Bow.lean` | `0157e7e69fa2` | the `bow_aux_*` lemmas (18–40, 80–103), `cos_bowIncidence_sq` (43), `bowIncidence_mem` (49), `deriv_dev_eq_zero_iff_eq` (64), **`dev_lt_of_ne` (106)**, `dev_isMinOn` (115) |
| `Viewing.lean` | `616e64025922` | `viewAngle` (50), `viewAngle_of_mem_Icc_zero_pi` / `_pi_two_pi` (99, 108), `dev_one_nonneg` (143), `dev_one_le_pi` (155), `viewAngle_dev_one` (190), `viewAngle_dev_one_iff` (217), `viewAngle_dev_two` (293), `dark_band_viewAngle` (309), `viewAngle_lt_bow_one` (359), `bow_two_lt_viewAngle` (370), `dev_one_grazing_gt_pi` (383), `viewAngle_ne_signed_primary` (399), `forall_mem_band_exists_once_reflected_seen` (446), `signed_gap_holds_but_ray_seen_in_band` (481) |
| `DarkBand.lean`, `Colours.lean`, `VisibleBand.lean` | `34d1b01a0b28`, `e33ffa1d2fa9`, `e98b27790013` | the uses of `dev_isMinOn` (36, 46; 55; 48, 59) |
| `Audit.lean` (project root) | `5467ff825503` | `#print axioms` for `deriv_dev_eq_zero_iff_eq` (13) and `dev_lt_of_ne` (14) |

Line numbers are from `cat -n` at commit `6f60278`. `Bow.lean`, `Deriv.lean`, `MinLemma.lean`, `DarkBand.lean` and `Colours.lean` are byte-identical to their versions at the earlier head `45663a9` (same blob hashes), so the citations drafted against that head stand unchanged. `Defs.lean` and `VisibleBand.lean` had comment-only edits in `6f60278`, `Audit.lean` gained lines, and `Viewing.lean` gained theorems after the first draft; every citation to those four files was re-checked against `6f60278` on 2026-10-22. Mathlib line numbers are from the pinned `56a00585` checkout under `.lake/packages/mathlib/`.

---

## 1. The statement

Quoted exactly from `Bow.lean` lines 105–108:

```lean
/-- **The bow is the strict minimum of the deviation.** -/
theorem dev_lt_of_ne {n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1)
    {i : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) (hne : i ≠ bowIncidence k n) :
    dev k n (bowIncidence k n) < dev k n i := by
```

As Lean elaborates it (`#check @Wyrd.Rainbow.dev_lt_of_ne`, *checked*):

```
∀ {n : ℝ} {k : ℕ}, 1 < n → 1 ≤ k → n < ↑k + 1 →
  ∀ {i : ℝ}, i ∈ Set.Icc 0 (Real.pi / 2) → i ≠ Wyrd.Rainbow.bowIncidence k n →
    Wyrd.Rainbow.dev k n (Wyrd.Rainbow.bowIncidence k n) < Wyrd.Rainbow.dev k n i
```

Note the `↑k`: in `n < k + 1` the natural number `k` is cast to a real. When you apply the theorem at `k = 1` you have to supply `n < ((1 : ℕ) : ℝ) + 1`, which is why `water_primary` (Bow.lean 128) writes it out that way and why `Viewing.lean` uses `(by push_cast; linarith)` in `colour_order_viewAngle`.

**In plain English.** Fix

- a refractive index `n` (a real number) with **`1 < n`** (`hn`): the drop is optically denser than the air;
- a number of internal reflections `k` (a natural number) with **`1 ≤ k`** (`hk`): at least one bounce inside the drop (`k = 1` primary bow, `k = 2` secondary);
- the window **`n < k + 1`** (`hnk`): the index is below `2` for the primary, below `3` for the secondary. Water (`n ≈ 4/3`) satisfies this for every `k ≥ 1`;
- an incidence angle `i` (a real number) with **`0 ≤ i ≤ π/2`** (`hi`): from the central ray that hits the drop head-on (`i = 0`) to the grazing ray (`i = π/2`);
- and **`i ≠ bowIncidence k n`** (`hne`): `i` is any such angle *other than* the bow's own incidence angle `i₀`.

Then the total turning angle at `i₀` is **strictly less** than the total turning angle at `i`: `D(i₀) < D(i)`. Put the other way round: on the closed interval `[0, π/2]`, the function `D` attains its minimum exactly once, at `i₀`, and nowhere else.

The hypotheses are not decoration. Section 6 asks you to find where each is used; the short answers are: `hn` makes the derivative exist (`Deriv.lean` 16–17, 24–27) and makes `q > 0` (`Bow.lean` 23); `hk` makes `k(k+2) > 0` so that the division defining `q` is honest (`Deriv.lean` 72, `Bow.lean` 21); `hnk` makes `q < 1` and so puts `i₀` strictly inside `(0, π/2)` (`Bow.lean` 24, 49–53); `hi` places `i` in the closed interval on which the monotonicity from `lt_of_deriv_sign` holds (`MinLemma.lean` 28, 30); the `cos ≥ 0` that the squaring step needs (`Deriv.lean` 74, 78) is derived inside the sign lemmas from their own open-interval memberships (`Bow.lean` 89, 98), not from `hi`; `hne` is what makes the inequality strict rather than `≤`.

---

## 2. Definitions, and what the model assumes

All three definitions are in `Defs.lean`. Quoted exactly.

**Refraction angle** (lines 43–44):

```lean
/-- Refraction angle inside the drop, from Snell's law `sin i = n · sin r`. -/
noncomputable def refr (n i : ℝ) : ℝ := arcsin (sin i / n)
```

*Meaning:* `r = refr n i` is the angle the ray makes with the normal once inside the drop, obtained by solving Snell's law `sin i = n sin r` for `r`. It is a definition, so Snell's law is *assumed*; the theorem `snell` (line 55) only confirms that the definition satisfies the equation when `n ≥ 1`. `arcsin` is Mathlib's real arcsine, which clamps outside `[-1, 1]`; with `n ≥ 1` and real `i` the argument never leaves `[-1, 1]`, so no clamping happens here.

**Total deviation** (lines 46–47):

```lean
/-- Total deviation of a ray entering at incidence `i` and reflecting `k` times inside. -/
noncomputable def dev (k : ℕ) (n i : ℝ) : ℝ := k * π + 2 * i - 2 * (k + 1) * refr n i
```

*Meaning:* `D(i) = kπ + 2i − 2(k+1)r` is the signed total angle through which the ray has turned by the time it leaves: `i − r` on entry, `π − 2r` at each of the `k` internal reflections, `i − r` on exit. The module docstring (lines 16–17) says plainly: "This formula is the model: it is a definition here, not derived from the geometry of the drop." So the sphere, the law of reflection and the bookkeeping of the turns are all *assumed* in this one line. `D` is not reduced modulo `2π` (lines 21–22); it is the raw accumulated turning, always in the same rotational sense.

**Bow incidence** (lines 49–52):

```lean
/-- The incidence angle of the `k`-th bow: where `cos² i = (n² - 1) / (k(k+2))`.
Meaningful for `1 < n < k + 1` (see `cos_bowIncidence_sq`). Outside that range
the formula clamps to `0` or `π / 2`. -/
noncomputable def bowIncidence (k : ℕ) (n : ℝ) : ℝ := arccos (√((n ^ 2 - 1) / (k * (k + 2))))
```

*Meaning:* `i₀` is the angle whose cosine is `√q`, where `q = (n² − 1)/(k(k+2))`. This is Newton's closed form for the stationary point of `D` (Defs.lean 33–35). Two Lean-specific warnings that the docstring hints at, and that need more care than the docstring gives them, because in the definition `n` is an arbitrary real and `k` an arbitrary natural number. All five cases below were *checked* by compiling them as `example`s against `Defs.lean` and `Bow.lean` (scratch files `Clamping.lean` and `ClampingNeg.lean`, outside the repository):

- *Division by zero.* Real division by zero is `0` in Lean, so for `k = 0` the radicand is `(n² − 1)/0 = 0` and `bowIncidence 0 n = arccos 0 = π/2` for **every** real `n`, including `n ≥ 1`.
- *Clamping to `0`.* For `k ≥ 1` and `n ≥ k + 1`, `q ≥ 1`, so `√q ≥ 1` and `arccos` clamps: `bowIncidence k n = 0`. The same holds for `n ≤ −(k + 1)`, since only `n²` enters. The statement "`n ≥ k + 1` gives `0`" is therefore true only with `k ≥ 1`; at `k = 0` the same `n` gives `π/2`.
- *Clamping to `π/2`.* For `k ≥ 1` and `n² ≤ 1`, the radicand is `≤ 0`, Mathlib's `√` of a nonpositive real is `0`, and `bowIncidence k n = arccos 0 = π/2`.
- *No clamping for negative `n`.* Only `n²` enters, so `bowIncidence k (−n) = bowIncidence k n`; for `k ≥ 1` and `1 < |n| < k + 1` with `n` negative the formula returns the genuine angle of `|n|`, in `(0, π/2)` (e.g. `bowIncidence 1 (−4/3) ∈ (0, π/2)`), although a negative `n` is no refractive index.

So any sentence about the formula outside `1 < n < k + 1` has to say which of these cases it is in. That is why `hk` and `hnk` are in the statement.

**What the model assumes, in one list** (all of this is upstream of the theorem, none of it is proved):

1. *Ray optics.* Light is a family of rays; no wave effects, no polarization, no Fresnel weighting, no absorption.
2. *A perfect sphere, in one plane.* The ray stays in the plane through the drop's centre, and every surface it meets is a circle of the same radius. This is what makes the angle of incidence equal at every internal bounce and gives the `i − r` / `π − 2r` bookkeeping — but the bookkeeping is asserted in `dev`, not derived.
3. *Snell's law* as the formula `sin i = n sin r` with one real `n` per colour; `refr` is its inverse.
4. *A point sun at infinity*: the incoming rays are parallel, and `i ∈ [0, π/2]` parametrizes them (the impact parameter is `sin i` in units of the drop's radius).
5. *Signed angles.* `D` is a real number, not a direction in the sky. Which direction a given `D` corresponds to is a separate question — Section 5.

---

## 3. Geometric interpretation

**The fan.** Think of a sheaf of parallel sunrays hitting the drop, labelled by `i` from `0` (dead centre) to `π/2` (grazing the edge). Each ray leaves turned by `D(i)`. The proof shows that as `i` sweeps from `0` to `π/2`, `D` first falls and then rises (that is literally the content of the two private lemmas `bow_aux_deriv_neg` and `bow_aux_deriv_pos`), and the theorem records the consequence: `D(i₀) < D(i)` for every other `i`, so `D` bottoms out at `i₀` and *only* there (the "only" is the strict `<`). The statement alone does not say that `D` is monotone on either side; that is in the proof, not the theorem.

**Why that is a bow.** A sweep that falls then rises *folds* the fan of exit directions. Every exit direction slightly above `D(i₀)` is reached twice (once from each side of `i₀`), and no exit direction below `D(i₀)` is reached at all. The edge of the fold, `D(i₀)`, is where the outgoing rays bunch up — this is the direction Descartes found by tracing rays by hand in 1637, and it is where the bright arc appears. For water at `n = 4/3` and `k = 1`, Lean proves `cos² i₀ = 7/27` (`water_primary`, Bow.lean 123); numerically (not proved) `i₀ ≈ 59.4°` and `D(i₀) ≈ 138°`, seen at about `42°` from the antisolar point. For `k = 2`, `cos² i₀ = 7/72`, `D ≈ 231°`, seen at about `51°`.

A useful way to read the hypothesis `n < k + 1`: from the derivative formula (Section 4.4) one gets `D'(0) = 2 − 2(k+1)/n` — I compiled this identity in a scratch file (*checked*; see Section 6, Q1). So `n < k + 1` is *exactly* the statement `D'(0) < 0`: the central rays start by turning *less* as `i` grows, which is what makes a fold possible. At the other end `D'(π/2) = 2 > 0` for every `n > 1` (the derivative formula is only established for `n > 1`; at `n = 1`, `refr` has a corner at `π/2`). The sign change in between is forced; `i₀` is where it happens.

**What the theorem does not say.**

- *Nothing about brightness.* The fold is bright because exit directions pile up there: at an exit angle `θ` just above `D(i₀)`, the density of exit directions is the sum, over the inverse branches (the two rays `i` with `D(i) = θ`, one on each side of `i₀`), of the incident weight `w(i)` divided by `|D'(i)|`; it blows up at the fold because `D'(i₀) = 0`. What `w` is depends on how the incoming rays are sampled (uniform in `i`, or uniform in the impact parameter `sin i`, which is what uniform illumination gives in the planar model; over the whole disc of the drop the weight is proportional to `sin i cos i`; `RAINBOW-CAUSTIC-PLAN.md` §3 keeps ray counts, power and brightness apart, and the density form `ρ` in its §1(b) is exactly this branch sum). None of this is in the formal proof: no density, weight, or intensity is defined anywhere in these files (Defs.lean 17–19 says so). "Bow = bright arc" is an interpretation you bring, not something Lean proves.
- *Nothing about the angle you see — until bridged.* `D(i₀) < D(i)` is an inequality between signed turning angles. Whether a smaller `D` means a ray seen further from or closer to the antisolar point depends on where `D` sits relative to `π` and `2π`. Section 5 covers the bridge; it holds for `1 < n ≤ √2` (primary) and fails at, say, `n = 1.9`.
- *Nothing outside `[0, π/2]`.* The function `dev k n` is defined for every real `i`, but the theorem is silent there. Negative `i` is physically the mirror image; `i > π/2` is no ray at all.
- *Nothing about which `k` dominates, three-dimensional geometry, the sun's half-degree disc, or `n` as a function of wavelength.* Each theorem fixes one `n`; the colour theorems compare two.

Also note for context: the strict theorem `dev_lt_of_ne` is consumed only by `Viewing.lean` (`viewAngle_lt_bow_one`, line 365, and `bow_two_lt_viewAngle`, line 377; `grep -rn dev_lt_of_ne WyrdMathlib/ Audit.lean` finds those two uses, the two docstring mentions just above them (Viewing.lean 358, 369), its definition, and the audit line `Audit.lean` 14). The earlier downstream files (`DarkBand.lean` 36, 46; `VisibleBand.lean` 48, 59; `Colours.lean` 55) use the non-strict `dev_isMinOn` (Bow.lean 115), which is proved from the same two sign lemmas via `isMinOn_of_deriv_sign`.

---

## 4. The proof, line by line

Notation for this section: `i₀ := bowIncidence k n`; `q := (n² − 1)/(k(k+2))`; `s := √(n² − sin² i)`. **Warning:** the docstrings reuse the letter `q` for two different things — `Bow.lean` line 16 uses it for `(n²−1)/(k(k+2))`, `Deriv.lean` line 58 for `√(n² − sin² i)`. I use `q` and `s` as above throughout.

### 4.1 `dev_lt_of_ne` (Bow.lean 106–112)

```lean
theorem dev_lt_of_ne {n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1)
    {i : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) (hne : i ≠ bowIncidence k n) :
    dev k n (bowIncidence k n) < dev k n i := by
  -- falling on `(0, i₀)`, rising on `(i₀, π/2)`: the calculus lemma does the rest
  have hmem := bowIncidence_mem hn hk hnk
  exact lt_of_deriv_sign hmem.1.le hmem.2.le (continuous_dev hn k).continuousOn
    (bow_aux_deriv_neg hn hk hnk) (bow_aux_deriv_pos hn hk hnk) i hi hne
```

- **Line 110** `have hmem := bowIncidence_mem hn hk hnk`. Introduces `hmem : bowIncidence k n ∈ Set.Ioo 0 (π / 2)`, i.e. the pair `0 < i₀` and `i₀ < π/2`. This is where `n < k + 1` first enters; it enters again on lines 111–112, where both sign lemmas take `hn hk hnk` (each re-derives `bowIncidence_mem` and uses `cos_bowIncidence_sq`). The goal is unchanged.
- **Lines 111–112** `exact lt_of_deriv_sign … i hi hne`. One application of the calculus lemma closes the goal. Lean infers `f := dev k n`, `a := 0`, `b := π/2`, `c := i₀` from the arguments. Reading the arguments in order against the signature of `lt_of_deriv_sign` (Section 4.2): `hmem.1.le : 0 ≤ i₀` is `hac`; `hmem.2.le : i₀ ≤ π/2` is `hcb`; `(continuous_dev hn k).continuousOn : ContinuousOn (dev k n) (Set.Icc 0 (π/2))` is `hf` (continuity everywhere, from `Deriv.lean` 54, restricted to the interval); `bow_aux_deriv_neg hn hk hnk` says `D' < 0` on `(0, i₀)` and is `hneg`; `bow_aux_deriv_pos hn hk hnk` says `0 < D'` on `(i₀, π/2)` and is `hpos`; then `i`, `hi`, `hne` instantiate the final `∀ x ∈ Set.Icc a b, x ≠ c → f c < f x`, whose conclusion is exactly `dev k n i₀ < dev k n i`.

That is the whole proof. Everything substantive is in the three ingredients.

### 4.2 `lt_of_deriv_sign` (MinLemma.lean 13–30)

```lean
theorem lt_of_deriv_sign {f : ℝ → ℝ} {a b c : ℝ} (hac : a ≤ c) (hcb : c ≤ b)
    (hf : ContinuousOn f (Set.Icc a b))
    (hneg : ∀ x ∈ Set.Ioo a c, deriv f x < 0) (hpos : ∀ x ∈ Set.Ioo c b, 0 < deriv f x) :
    ∀ x ∈ Set.Icc a b, x ≠ c → f c < f x := by
  -- On `[a, c]` the function falls strictly (negative derivative inside).
  have hanti : StrictAntiOn f (Set.Icc a c) :=
    strictAntiOn_of_deriv_neg (convex_Icc a c) (hf.mono (Set.Icc_subset_Icc_right hcb))
      (fun x hx => hneg x (by simpa [interior_Icc] using hx))
  -- On `[c, b]` the function rises strictly (positive derivative inside).
  have hmono : StrictMonoOn f (Set.Icc c b) :=
    strictMonoOn_of_deriv_pos (convex_Icc c b) (hf.mono (Set.Icc_subset_Icc_left hac))
      (fun x hx => hpos x (by simpa [interior_Icc] using hx))
  intro x hx hxc
  rcases lt_or_gt_of_ne hxc with hlt | hgt
  -- Left of `c`: falling from `x` down to `c`.
  · exact hanti ⟨hx.1, hlt.le⟩ ⟨hac, le_rfl⟩ hlt
  -- Right of `c`: rising from `c` up to `x`.
  · exact hmono ⟨le_rfl, hcb⟩ ⟨hgt.le, hx.2⟩ hgt
```

This is a general first-derivative test, with no rainbow in it. The real analysis — the mean value theorem — lives inside the two Mathlib lemmas it calls.

- **Lines 18–20** `have hanti : StrictAntiOn f (Set.Icc a c) := strictAntiOn_of_deriv_neg …`. Mathlib's `strictAntiOn_of_deriv_neg` (`.lake/packages/mathlib/Mathlib/Analysis/Calculus/Deriv/MeanValue.lean` line 445) needs a convex set, continuity on it, and `deriv f < 0` on its *interior*. `convex_Icc a c` supplies convexity. `hf.mono (Set.Icc_subset_Icc_right hcb)` shrinks continuity from `[a, b]` to `[a, c]`, using `c ≤ b`. The third argument takes `x ∈ interior (Icc a c)`, rewrites with `interior_Icc` (Mathlib `Topology/Order/DenselyOrdered.lean` 104: the interior is `Ioo a c`) and hands it to `hneg`. Result: `f` is strictly decreasing on the closed interval `[a, c]`.
- **Lines 22–24** `have hmono : StrictMonoOn f (Set.Icc c b) := strictMonoOn_of_deriv_pos …`. Mirror image (Mathlib line 377), using `Set.Icc_subset_Icc_left hac` (`a ≤ c`) to shrink continuity to `[c, b]`, and `hpos` on the interior. Result: `f` strictly increasing on `[c, b]`.
- **Line 25** `intro x hx hxc`. Takes an arbitrary `x`, `hx : x ∈ Set.Icc a b` (so `hx.1 : a ≤ x`, `hx.2 : x ≤ b`), and `hxc : x ≠ c`. Goal: `f c < f x`.
- **Line 26** `rcases lt_or_gt_of_ne hxc with hlt | hgt`. `x ≠ c` splits into `hlt : x < c` or `hgt : c < x` (Mathlib `Order/Defs/LinearOrder.lean` 109). Two goals.
- **Line 28** `exact hanti ⟨hx.1, hlt.le⟩ ⟨hac, le_rfl⟩ hlt`. `StrictAntiOn f s` unfolds to "`u ∈ s → v ∈ s → u < v → f v < f u`". Here `u := x` (in `[a, c]` because `a ≤ x` and `x ≤ c`), `v := c` (in `[a, c]` because `a ≤ c ≤ c`), and `x < c`, giving `f c < f x`. Done.
- **Line 30** `exact hmono ⟨le_rfl, hcb⟩ ⟨hgt.le, hx.2⟩ hgt`. `StrictMonoOn f s` unfolds to "`u ∈ s → v ∈ s → u < v → f u < f v`" with `u := c`, `v := x`, both in `[c, b]`, and `c < x`, giving `f c < f x`. Done.

Note the endpoint handling: the sign hypotheses are only on the *open* intervals, but the monotonicity conclusions are on the *closed* ones, because continuity on the closed interval is supplied. That is why `i = 0` and `i = π/2` are covered by the theorem without any separate argument.

### 4.3 The two sign lemmas (Bow.lean 79–103)

```lean
/-- Left of the bow, `D` falls: for `i ∈ (0, i₀)`, `cos i > cos i₀ = √q ≥ 0`, so `cos² i > q`. -/
private lemma bow_aux_deriv_neg {n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) :
    ∀ x ∈ Set.Ioo 0 (bowIncidence k n), deriv (dev k n) x < 0 := by
  intro x hx
  have hmem := bowIncidence_mem hn hk hnk
  have hc0 : 0 ≤ cos (bowIncidence k n) := by
    rw [bow_aux_cos hn hk hnk]; exact Real.sqrt_nonneg _
  -- cosine is strictly decreasing on `[0, π]`
  have hlt : cos (bowIncidence k n) < cos x :=
    cos_lt_cos_of_nonneg_of_le_pi hx.1.le (by linarith [pi_pos, hmem.2]) hx.2
  have hcx : 0 ≤ cos x := hc0.trans hlt.le
  rw [deriv_dev_neg_iff hn hk hcx, ← cos_bowIncidence_sq hn hk hnk]
  exact pow_lt_pow_left₀ hlt hc0 two_ne_zero
```

- **Line 82** `intro x hx`. `hx : x ∈ Set.Ioo 0 i₀`, i.e. `hx.1 : 0 < x`, `hx.2 : x < i₀`. Goal: `deriv (dev k n) x < 0`.
- **Line 83** `have hmem := bowIncidence_mem hn hk hnk`. As before: `0 < i₀ < π/2`.
- **Lines 84–85** `have hc0 : 0 ≤ cos i₀`. Rewrite `cos i₀` as `√q` (`bow_aux_cos`, line 33) and use that square roots are nonnegative. Needed twice below: to get `cos x ≥ 0` and as the nonnegativity side condition when squaring.
- **Lines 87–88** `have hlt : cos i₀ < cos x`. Mathlib's `cos_lt_cos_of_nonneg_of_le_pi` (`Trigonometric/Basic.lean` 583) says: if `0 ≤ u`, `v ≤ π` and `u < v` then `cos v < cos u`. With `u := x`, `v := i₀`: `0 ≤ x` from `hx.1.le`; `i₀ ≤ π` by `linarith` from `i₀ < π/2` and `π > 0`; `x < i₀` is `hx.2`. So cosine, decreasing on `[0, π]`, is larger at the smaller angle.
- **Line 89** `have hcx : 0 ≤ cos x := hc0.trans hlt.le`. Chain `0 ≤ cos i₀ ≤ cos x`. This is the `cos x ≥ 0` that `deriv_dev_neg_iff` demands.
- **Line 90** `rw [deriv_dev_neg_iff hn hk hcx, ← cos_bowIncidence_sq hn hk hnk]`. First rewrite turns the goal `D'(x) < 0` into `q < cos x ^ 2` (Section 4.4). Second rewrite, right-to-left, replaces `q` by `cos i₀ ^ 2` using `cos_bowIncidence_sq` (line 43). Goal: `cos i₀ ^ 2 < cos x ^ 2`.
- **Line 91** `exact pow_lt_pow_left₀ hlt hc0 two_ne_zero`. Mathlib (`Algebra/Order/GroupWithZero/Basic.lean` 589): `a < b`, `0 ≤ a`, `m ≠ 0` give `a ^ m < b ^ m`. With `a := cos i₀`, `b := cos x`, `m := 2`. Closes the goal.

```lean
/-- Right of the bow, `D` rises: for `i ∈ (i₀, π/2)`, `0 ≤ cos i < cos i₀ = √q`, so `cos² i < q`. -/
private lemma bow_aux_deriv_pos {n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) :
    ∀ x ∈ Set.Ioo (bowIncidence k n) (π / 2), 0 < deriv (dev k n) x := by
  intro x hx
  have hmem := bowIncidence_mem hn hk hnk
  have hcx : 0 ≤ cos x := bow_aux_cos_nonneg ⟨(hmem.1.trans hx.1).le, hx.2.le⟩
  -- cosine is strictly decreasing on `[0, π]`
  have hlt : cos x < cos (bowIncidence k n) :=
    cos_lt_cos_of_nonneg_of_le_pi hmem.1.le (by linarith [pi_pos, hx.2]) hx.1
  rw [deriv_dev_pos_iff hn hk hcx, ← cos_bowIncidence_sq hn hk hnk]
  exact pow_lt_pow_left₀ hlt hcx two_ne_zero
```

- **Line 96** `intro x hx`. `hx.1 : i₀ < x`, `hx.2 : x < π/2`. Goal: `0 < deriv (dev k n) x`.
- **Line 98** `have hcx : 0 ≤ cos x`. This time nonnegativity of `cos x` comes directly from `x ∈ [0, π/2]` (`bow_aux_cos_nonneg`, line 39), with `0 ≤ x` assembled as `0 < i₀ < x`.
- **Lines 100–101** `have hlt : cos x < cos i₀`. Same Mathlib lemma with `u := i₀`, `v := x`: `0 ≤ i₀`, `x ≤ π`, `i₀ < x`.
- **Line 102** `rw [deriv_dev_pos_iff hn hk hcx, ← cos_bowIncidence_sq hn hk hnk]`. Goal becomes `cos x ^ 2 < q`, then `cos x ^ 2 < cos i₀ ^ 2`.
- **Line 103** `exact pow_lt_pow_left₀ hlt hcx two_ne_zero`. Now the nonnegative lower term is `cos x`. Closes the goal.

The asymmetry between the two lemmas (where `cos ≥ 0` comes from) is worth noticing: left of `i₀` it is inherited from `cos i₀ = √q ≥ 0`; right of `i₀` it comes from the interval.

### 4.4 Down to the derivative formula (Deriv.lean)

**`hasDerivAt_refr` (lines 20–41).** `r'(i) = cos i / √(n² − sin² i)`.

- Lines 22–27: from `1 < n`, `−1 < sin i / n < 1` (two `nlinarith` calls with `|sin i| ≤ 1`). This is why `n > 1` is needed here: at `n = 1` and `i = π/2` the argument of `arcsin` would be `1`, where `arcsin` has no finite derivative.
- Line 29: the chain rule. `hasDerivAt_arcsin` (Mathlib `Trigonometric/InverseDeriv.lean` 51) needs `x ≠ −1` and `x ≠ 1` and gives slope `1/√(1 − x²)`; `.comp` with `(hasDerivAt_sin i).div_const n` (slope `cos i / n`) gives `arcsin ∘ (sin · / n)` with slope `(1/√(1 − (sin i/n)²)) · (cos i / n)`.
- Lines 31–36: pure algebra, `n · √(1 − (sin i/n)²) = √(n² − sin² i)` (pull `n²` out of the root; `√(n²) = n` because `n > 0`), and the root is positive.
- Lines 38–41: `convert h using 1` reduces the goal to "same function" (closed by `rfl`, since `refr n` *is* that composite by definition) and "same slope" (closed by rewriting with `key` and `field_simp`).

**`hasDerivAt_dev` (lines 44–51).** `D'(i) = 2 − 2(k+1) · cos i / √(n² − sin² i)`.

- Lines 47–48: build the derivative of `kπ + 2·id − 2(k+1)·refr n` term by term: `hasDerivAt_id` (slope 1), `.const_mul 2`, `.const_add (k π)`, `.sub` of `(hasDerivAt_refr hn i).const_mul (2(k+1))`. The resulting slope is `2·1 − 2(k+1)·(cos i/√…)`.
- Lines 49–51: `convert h using 1` leaves two goals: the functions agree (`ext x; simp [dev]` unfolds `dev` and matches), and the slopes agree (`ring`). I ran a *mutation test* (Section 6, Q11): the same proof with `3 −` instead of `2 −` in the statement fails at `ring` with the unsolved goal `3 − … = 2 − …`. So the `convert` is not hiding anything — the slope really is pinned down.

**`continuous_dev` (line 54).** Differentiable everywhere, hence continuous everywhere. Only `hn` is needed.

**`deriv_aux_formula` (lines 59–64).** Rewrites the slope as a single fraction, `D'(i) = 2(s − (k+1) cos i)/s` with `s = √(n² − sin² i) > 0`. `rw [(hasDerivAt_dev hn k i).deriv]` turns `deriv (dev k n) i` into the slope from `hasDerivAt_dev` (this is how a `HasDerivAt` statement becomes a statement about Mathlib's `deriv` function); `field_simp` clears the denominator.

**`deriv_aux_lt_iff` (lines 68–79).** `s < (k+1) cos i ↔ q < cos² i`, assuming `cos i ≥ 0`. This is the squaring step.

- Line 74: `hKc : 0 ≤ (k+1) cos i` — this is the *only* use of `hi : 0 ≤ cos i`, and it is essential.
- Line 78: `rw [div_lt_iff₀ hkk, ← pow_lt_pow_iff_left₀ hq0 hKc two_ne_zero, hsq]`. `div_lt_iff₀` (needs `k(k+2) > 0`, which needs `k ≥ 1`) turns the right side into `n² − 1 < cos² i · k(k+2)`. `pow_lt_pow_iff_left₀` says, for two *nonnegative* reals, `a² < b² ↔ a < b`; used right-to-left it turns the left side into `s² < ((k+1) cos i)²`. `hsq` replaces `s²` by `n² − sin² i`.
- Line 79: both directions by `nlinarith`, using `sin² i + cos² i = 1`: `n² − sin² i < (k+1)² cos² i` is the same as `n² − 1 + cos² i < (k² + 2k + 1) cos² i`, i.e. `n² − 1 < k(k+2) cos² i`.

**`deriv_dev_neg_iff` (lines 96–101).** `D'(i) < 0 ↔ q < cos² i`, for `cos i ≥ 0`.

- Line 100: `rw [deriv_aux_formula hn k i, div_lt_iff₀ hq, zero_mul, ← deriv_aux_lt_iff hn hk hi]`. The fraction `2(s − (k+1)c)/s < 0` becomes `2(s − (k+1)c) < 0 · s`, then `… < 0`; the right side `q < cos² i` is rewritten back into `s < (k+1) cos i`.
- Line 101: `2(s − (k+1)c) < 0 ↔ s < (k+1)c`, both directions by `linarith`.

`deriv_dev_pos_iff` (104–109) is the mirror image with `deriv_aux_gt_iff`.

### 4.5 `deriv_dev_eq_zero_iff_eq` (Bow.lean 64–77) — a sibling, not a dependency

The task description listed this as a direct dependency of `dev_lt_of_ne`. **It is not.** `grep -rn deriv_dev_eq_zero_iff_eq WyrdMathlib/ Audit.lean` finds only its own definition (Bow.lean 64) and the audit line (`Audit.lean` 13); the proof in 4.1 never mentions it, and neither do the sign lemmas. It is the *uniqueness of the stationary point*, the other half of the module docstring's sentence (lines 7–9): "exactly one stationary point … and it is the strict minimum". `dev_lt_of_ne` implies uniqueness of the *minimum*; this theorem says uniqueness of the *zero of the derivative*, which is a different (and here, stronger-looking but equally easy) fact. Briefly:

```lean
theorem deriv_dev_eq_zero_iff_eq {n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1)
    {i : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) :
    deriv (dev k n) i = 0 ↔ i = bowIncidence k n := by
  have hc := bow_aux_cos_nonneg hi
  constructor
  · intro h
    -- stationary means `cos² i = q`; with `cos i ≥ 0` this is `cos i = √q`
    have hsq := (deriv_dev_eq_zero_iff hn hk hc).1 h
    have hcos : cos i = √((n ^ 2 - 1) / (k * (k + 2))) := by
      rw [← hsq, Real.sqrt_sq hc]
    -- and `arccos` undoes `cos` on `[0, π]`
    rw [bowIncidence, ← hcos, arccos_cos hi.1 (by linarith [pi_pos, hi.2])]
  · rintro rfl
    exact deriv_dev_bowIncidence hn hk hnk
```

- Line 67: `cos i ≥ 0` from the interval. Line 68: split the `↔`.
- Lines 69–71: assume `D'(i) = 0`; `deriv_dev_eq_zero_iff` (Deriv.lean 112, proved by trichotomy from the two sign lemmas) gives `cos² i = q`.
- Lines 72–73: goal `cos i = √q`. Rewrite `q` backwards into `cos² i`, so the goal reads `cos i = √(cos² i)`; `Real.sqrt_sq hc` (`√(a²) = a` for `a ≥ 0`) closes it. This is where `cos i ≥ 0` matters: without it `√(cos² i) = |cos i|`.
- Line 75: unfold `bowIncidence` to `arccos √q`, replace `√q` by `cos i`, and use `arccos_cos` (valid for `0 ≤ i ≤ π`) to get `i = i`.
- Lines 76–77: the converse: substitute `i := i₀` and use `deriv_dev_bowIncidence` (line 56), which is `deriv_dev_eq_zero_iff` applied to `cos_bowIncidence_sq`.

### 4.6 The small lemmas about `i₀` (Bow.lean 16–53)

- `bow_aux_q_mem` (18–24): `0 < q < 1`. `0 < n² − 1` from `n > 1`; `n² − 1 < k(k+2) = (k+1)² − 1` from `n < k+1` (and `n > 0`). **This is where `hnk` does its real work**: it is the `q < 1` half.
- `bow_aux_sqrt_mem` (27–30): hence `0 < √q < 1`.
- `bow_aux_cos` (33–36): `cos i₀ = √q`, by `cos_arccos`, which needs `−1 ≤ √q ≤ 1`.
- `bow_aux_cos_nonneg` (39–40): `cos ≥ 0` on `[0, π/2]`, from Mathlib's `cos_nonneg_of_neg_pi_div_two_le_of_le`.
- `cos_bowIncidence_sq` (43–46): `cos² i₀ = q`, squaring `bow_aux_cos` with `Real.sq_sqrt` (needs `q ≥ 0`).
- `bowIncidence_mem` (49–53): `i₀ ∈ (0, π/2)`: `arccos x > 0 ↔ x < 1` and `arccos x < π/2 ↔ 0 < x` (Mathlib `Trigonometric/Inverse.lean` 292, 372) applied to `0 < √q < 1`.

---

## 5. From the signed angle to the angle seen: `viewAngle_dev_one`

`dev_lt_of_ne` compares two real numbers `D(i₀)` and `D(i)`. To say something about the sky you need to know how `D` maps to a direction. `Viewing.lean` defines:

```lean
noncomputable def viewAngle (D : ℝ) : ℝ := |π - toIcoMod Real.two_pi_pos 0 D|
```

the angular distance from the antisolar point, after reducing `D` modulo `2π` into `[0, 2π)`. Two facts turn it into something you can compute with: for `0 ≤ D ≤ π`, `viewAngle D = π − D` (`viewAngle_of_mem_Icc_zero_pi`); for `π ≤ D ≤ 2π`, `viewAngle D = D − π` (`viewAngle_of_mem_Icc_pi_two_pi`). The bridge theorem for the primary bow (`viewAngle_dev_one`) is

```lean
theorem viewAngle_dev_one {n i : ℝ} (hn : 1 ≤ n) (hn2 : n ≤ √2) (hi : i ∈ Set.Icc 0 (π / 2)) :
    viewAngle (dev 1 n i) = π - dev 1 n i :=
  viewAngle_of_mem_Icc_zero_pi (dev_one_nonneg hn hi) (dev_one_le_pi hn hn2 hi)
```

It needs `0 ≤ D₁ ≤ π` for *every* `i ∈ [0, π/2]`: the lower bound holds for all `n ≥ 1` (`dev_one_nonneg`, from `r ≤ i`), the upper bound only for `n ≤ √2` (`dev_one_le_pi`; the proof reduces `i ≤ 2r` to `n ≤ 2 cos(i/2)`, tightest at grazing incidence, and `viewAngle_dev_one_iff` shows `√2` is exact). Outside that window the reading breaks: at `n = 1.9` the grazing ray has `D₁ > π` (`dev_one_grazing_gt_pi`), so `π − D₁ < 0` is not an angle seen (`viewAngle_ne_signed_primary`), and every angle of the band `[43°, 50°]` is the viewing angle of some once-reflected ray (`forall_mem_band_exists_once_reflected_seen`).

**Putting the two together.** On the overlap `1 < n ≤ √2` (both `dev_lt_of_ne` at `k = 1`, which needs `n < 2`, and `viewAngle_dev_one` apply), `D₁(i₀) < D₁(i)` becomes `π − D₁(i₀) > π − D₁(i)`, i.e.

> among all once-reflected rays, the bow ray is seen at the **largest** angle from the antisolar point; every other once-reflected ray lands strictly inside it.

That is the outer edge of the primary bow, and the reason there is no once-reflected light just outside it (one side of Alexander's dark band). This corollary is now in the repository as `viewAngle_lt_bow_one` (`Viewing.lean` 359–365) with exactly this statement (*checked*: it was first compiled in a scratch file, then added to `Viewing.lean` in commit `6f60278` and rebuilt). The repository proof differs from the scratch version below in one line: it takes `√2 < 2` from the private lemma `viewing_aux_sqrt_two_lt_two` (line 301) instead of proving it inline:

```lean
example {n i : ℝ} (hn : 1 < n) (hn2 : n ≤ √2) (hi : i ∈ Set.Icc 0 (π / 2))
    (hne : i ≠ bowIncidence 1 n) :
    viewAngle (dev 1 n i) < viewAngle (dev 1 n (bowIncidence 1 n)) := by
  have hnk : n < ((1 : ℕ) : ℝ) + 1 := by
    have : √2 < 2 := by rw [Real.sqrt_lt' (by norm_num)]; norm_num
    push_cast; linarith
  have hmem := Set.Ioo_subset_Icc_self (bowIncidence_mem (k := 1) hn le_rfl hnk)
  rw [viewAngle_dev_one hn.le hn2 hi, viewAngle_dev_one hn.le hn2 hmem]
  linarith [dev_lt_of_ne hn le_rfl hnk hi hne]
```

Re-deriving this yourself, and then the mirror statement for the secondary bow (`bow_two_lt_viewAngle`, via `viewAngle_dev_two` on the window `1.331 ≤ n < 2`, where `viewAngle D₂ = D₂ − π` and so the bow ray is seen at the **smallest** angle among twice-reflected rays — the inner edge of the secondary, the other side of the dark band), is the best single exercise for seeing what the signed theorem does and does not say.

---

## 6. Before you say you checked it

Twelve questions. Each names the file and lines to look at. Do not take my answers (where I give any) on trust; the point is that you can produce them.

**Q1. Where is `n < k + 1` used, and what breaks without it?** Look at `Bow.lean` 18–24 (`bow_aux_q_mem`, second conjunct: `q < 1`), 49–53 (`bowIncidence_mem`), and line 110 of the main proof. Then compute `D'(0)` from `Deriv.lean` 44–45 (`sin 0 = 0`, `cos 0 = 1`, `√(n²) = n`): you should get `2 − 2(k+1)/n`, so `hnk` is exactly `D'(0) < 0`. Now ask: at `n ≥ k + 1`, what is `bowIncidence k n` (Defs.lean 49–52, `arccos` clamps; Section 2 lists the cases)? Which line of the proof fails first? Does the *statement* survive, and if so, does it still describe a bow?

**Q2. Where is `1 < n` used, and what happens at `n = 1`?** `Deriv.lean` 16–17 (`n² − sin² i > 0`), 24–27 (`|sin i / n| < 1`, so `arcsin` is differentiable), `Bow.lean` 23 (`q > 0`). At `n = 1`, `i = π/2`: what is `refr 1 (π/2)`, and why does `hasDerivAt_arcsin` (Mathlib `Trigonometric/InverseDeriv.lean` 51) refuse? Physically, what does `n = 1` mean?

**Q3. Why `1 ≤ k`?** `k(k+2) > 0` is needed at `Deriv.lean` 72 (for `div_lt_iff₀` on line 78) and at `Bow.lean` 21 (for `div_pos` and `div_lt_one` on lines 23–24). In Lean `x / 0 = 0`; so what is `bowIncidence 0 n`? Compute `D'` for `k = 0` from the formula: is it ever negative for `n > 1`? Is the theorem's conclusion true or false at `k = 0`?

**Q4. Why does `deriv_dev_neg_iff` need `0 ≤ cos i`?** `Deriv.lean` 68–79: line 74 builds `0 ≤ (k+1) cos i`, and line 78's `pow_lt_pow_iff_left₀` (Mathlib `Algebra/Order/GroupWithZero/Basic.lean` 685) requires both sides nonnegative before squaring. Find an `i` with `cos i < 0` and `cos² i > q` and compute the sign of `D'(i)` directly (try `i = π`). Does the `↔` hold there?

**Q5. What happens at the endpoints `i = 0` and `i = π/2`?** They are inside `hi` (closed interval) but outside both sign hypotheses (`MinLemma.lean` 15, open intervals). Trace how `lt_of_deriv_sign` still covers them: `strictAntiOn_of_deriv_neg` (Mathlib `MeanValue.lean` 445) concludes on the closed set from continuity on it plus derivative on the interior; `interior_Icc` (Mathlib `Topology/Order/DenselyOrdered.lean` 104). Also compute `D(0)` (it is `kπ`, since `refr n 0 = arcsin 0 = 0`) and `D'(π/2)` (it is `2`).

**Q6. Why is the minimum strict, and where does the mean value theorem enter?** `MinLemma.lean` 18–24 call `strictAntiOn_of_deriv_neg` and `strictMonoOn_of_deriv_pos`. Open the Mathlib file at lines 377 and 445 and follow them to the mean value theorem. Then compare with `dev_isMinOn` (Bow.lean 115) and `isMinOn_of_deriv_sign` (MinLemma 33): which of the two would you need to claim "there is exactly one bow direction"? Which one do the later files actually use (`DarkBand.lean` 36, 46; `VisibleBand.lean` 48, 59; `Colours.lean` 55), and which one does `Viewing.lean` use (365, 377)?

**Q7. Is `deriv_dev_eq_zero_iff_eq` used by `dev_lt_of_ne`?** Run `grep -n deriv_dev_eq_zero_iff_eq WyrdMathlib/Rainbow/*.lean`. Then explain, in your own words, the difference between "the unique stationary point" (Bow.lean 64) and "the unique minimum" (Bow.lean 106), and why the second proof does not need the first.

**Q8. Does each docstring match its statement?** Bow.lean 105 says "The bow is the strict minimum of the deviation." Check: "the bow" is `bowIncidence k n`; "strict" is the `<` together with `i ≠ …`; the domain `[0, π/2]` and the window `1 < n < k+1` are *not* in the docstring — decide whether that is acceptable. Do the same for the module docstring (Bow.lean 7–9: map "exactly one stationary point" and "strict minimum" to theorem names) and for `bowIncidence` (Defs.lean 49–51: verify the two clamping claims, `0` and `π/2`, against Mathlib's `arccos`, Mathlib's `√` of a negative number, and Lean's division by zero; which value you get depends on `k` as well as `n`, see Section 2). Note the two meanings of `q` in the docstrings (Bow.lean 16 vs Deriv.lean 58).

**Q9. Confirm the axiom dependencies yourself.** From `experiments/wyrd-mathlib`, with `$HOME/.elan/bin` on `PATH`, run `lake env lean Audit.lean` (line 14 is `#print axioms Wyrd.Rainbow.dev_lt_of_ne`), or put `#print axioms Wyrd.Rainbow.dev_lt_of_ne` in any file that imports `WyrdMathlib.Rainbow.Bow`. The expected line is exactly

```
'Wyrd.Rainbow.dev_lt_of_ne' depends on axioms: [propext, Classical.choice, Quot.sound]
```

(*checked* today for this theorem and for `deriv_dev_eq_zero_iff_eq`, `lt_of_deriv_sign`, `hasDerivAt_dev`, `deriv_dev_neg_iff`, `viewAngle_dev_one`). Read the result against the Lean reference manual's page on validating proofs, <https://lean-lang.org/doc/reference/latest/ValidatingProofs/>, which is the current authority on what the command does and does not tell you:

- `#print axioms` lists every axiom used by the theorem **and by everything it depends on**, Mathlib included. That transitivity is what makes it the check that matters.
- `propext` (propositional extensionality), `Classical.choice` (choice, which is how `Real`, `arcsin` and `√` are built) and `Quot.sound` (quotient soundness) are Lean's standard axioms; the page calls them benign.
- `sorryAx` means the theorem or one of its dependencies is incomplete.
- **Any axiom whose name contains `_native`** means a result was admitted from native evaluation (`decide +native`, `bv_decide`). Since Lean 4.29 each such use adds its own dedicated axiom, and the older `Lean.ofReduceBool` / `trustCompiler` route was removed in 4.35, so looking only for the old name finds nothing even when native evaluation was used.
- Any other axiom is a custom one, and the theorem holds only relative to it.

Grepping the source (`grep -rn "sorry\|native_decide\|^axiom" WyrdMathlib/Rainbow/`, which does return nothing) is a supplement, not a substitute: it sees only this project's text, while an axiom can enter through an imported lemma or a tactic, and only `#print axioms` follows the dependencies. Two more points from the same page. If a `_native` axiom appears, the trusted base grows to include the Lean compiler and every `implemented_by` / `@[extern]` replacement; the page says those uses do show up in `#print axioms`, so with only the three standard axioms, as here, no compiled code took part in the proof. What `#print axioms` does not re-check is the kernel's own work; that needs an external checker (`lean4checker`, or `comparator` replaying with `nanoda`). None was run on this project (`RAINBOW-AUDIT.md`).

**Q10. Build it from scratch.** `lean --version` should say `4.35.0`; `lake-manifest.json` line 16 should say `56a005855ea17e0b0958f73ec801ae140b0a1679`. Then `lake exe cache get` and `lake build` (README lines 148–153 give the full-project sequence; `lake build WyrdMathlib.Rainbow` builds just the rainbow closure). `WyrdMathlib/Rainbow.lean` imports the nine top-level rainbow files, `Viewing` on line 9, and those pull in `Defs`, `Deriv`, `MinLemma` and `TrigBounds`, so this builds everything the note touches. Watch for *warnings* as well as errors: a `declaration uses 'sorry'` warning does not stop the build.

**Q11. The mutation test.** Copy the proof of `hasDerivAt_dev` (Deriv.lean 44–51) into a scratch file outside the repository, as an `example`, and change the `2 -` in the statement to `3 -`. Run `lake env lean` on it. It should fail at `ring` with an unsolved goal of the form `3 − … = 2 − …` (*checked*). This tells you `convert … using 1` is not hiding an unproved equation. Try the same with the sign of the second term.

**Q12. Where do the windows overlap?** `dev_lt_of_ne` at `k = 1` needs `1 < n < 2`; `viewAngle_dev_one` needs `1 ≤ n ≤ √2`; `viewAngle_dev_two` needs `1.331 ≤ n < 2`; `dark_band_viewAngle` (Viewing.lean) needs `1.331 ≤ n ≤ √2`. Write down the intersection for each physical claim you intend to make and check that `1.331` and `1.343` (the water indices in `VisibleBand.lean`) are inside it. Then read `signed_gap_holds_but_ray_seen_in_band` (Viewing.lean) and say in one sentence why the signed theorem is true at `n = 1.9` and yet says nothing about the sky there.

---

## 7. Provenance

This note was written by an AI assistant (Claude) as a subagent of a workflow run on 2026-10-22, from a direct reading of the files cited and the runs marked *checked* (`#print axioms` on the six-theorem chain; compilation of the scratch corollary and of `D'(0) = 2 − 2(k+1)/n`; the mutation test; the four clamping cases of `bowIncidence`). No human has reviewed it. It is not a review of the formalization in any formal sense; it is a guide for you to produce your own. The scratch files (`AxiomsBow.lean`, `BridgeCorollary.lean`, `Mutation.lean`, `Clamping.lean`, `ClampingNeg.lean`) live outside the repository; this revision's checks modified nothing in the repository. Revised on 2026-10-22 after the owner's reading: Q9 now checks actual axiom dependencies including `_native` names, the clamping cases are qualified by `k`, the density sentence is the branch sum, and the note is pinned to commit `6f60278`. The revision was then checked by three further AI verifiers (citations, mathematics, tooling claims), whose findings are folded in; that is still not a human review.