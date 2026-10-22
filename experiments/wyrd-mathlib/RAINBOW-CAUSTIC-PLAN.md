# Plan: the weighted-fold (caustic) theorem for the bow

Prepared against `/home/user/sgrounds/experiments/wyrd-mathlib` (Lean 4.35.0, Mathlib v4.35.0 = commit `56a00585`). No Lean file was written. All Mathlib paths below are relative to `.lake/packages/mathlib/Mathlib/`.

## 1. Statement

**Setting.** `f : ℝ → ℝ`, interior point `i₀`, window `U = Ioo (i₀−δ) (i₀+δ)`. Hypotheses (C²-window form, the one the constants need): `f` differentiable on `U`, `f'(i₀) = 0`; `f'` differentiable on `U` with `0 < m ≤ f''(x) ≤ M` on `U`; `w` continuous on `U`, `w₀ := w(i₀) > 0`, `|w(x) − w₀| ≤ η < w₀` on `U`. With a modulus of continuity `ω` for `f''` and `ω_w` for `w`, take `m = f''(i₀) − ω(δ)`, `M = f''(i₀) + ω(δ)`, `η = ω_w(δ)`. Incident measure `μ = (λ|_U).withDensity w`; fold value `D₀ = f(i₀)`; bin mass `mass(h) = μ(f⁻¹[D₀, D₀+h]) = ∫_{x∈U, f x ∈ [D₀,D₀+h]} w`.

**(0) Sandwich.** On `U`: `(m/2)(x−i₀)² ≤ f(x) − D₀ ≤ (M/2)(x−i₀)²`.

**(a) Finite-bin mass.** For `0 < h` with `√(2h/m) < δ`:
`2(w₀−η)√(2h/M) ≤ mass(h) ≤ 2(w₀+η)√(2h/m)`, i.e. `c₁ = 2(w₀−η)√(2/M)`, `c₂ = 2(w₀+η)√(2/m)`. Also `μ(f⁻¹[D₀−h, D₀)) = 0`: a minimum fills only `D ≥ D₀`.

**(b) Asymptotics.** Integrated form (needs only continuity of `f''`, `w` at `i₀`): `mass(h)/√h → 2w₀√(2/f''(i₀))` as `h → 0⁺`. Density form: with `g₊`, `g₋` the inverses of the increasing branch on `[i₀, i₀+δ)` and the decreasing branch on `(i₀−δ, i₀]`, `ρ(D) = w(g₋D)/|f'(g₋D)| + w(g₊D)/|f'(g₊D)|` satisfies `μ.map f (Icc a b) = ∫_a^b ρ` for `D₀ < a ≤ b` inside both branch images, and `ρ(D)·√(D−D₀) → 2w₀/√(2f''(i₀))`, i.e. `ρ(D) ~ 2w₀/√(2|f''(i₀)|(D−D₀))`. Consistency: `∫₀^h 2w₀/√(2f''t) dt = 2w₀√(2h/f'')`, matching (a) at `m = M = f''`.

**Sides.** `f'' > 0`: mass only in `D ≥ D₀`, approach `D → D₀⁺`. `f'' < 0`: apply to `−f`; mass only in `D ≤ D₀`, approach `D → D₀⁻`. Both bows are minimum-case in `D` (`dev_isMinOn`, `Bow.lean`, for every `k` with `1 < n < k+1`): primary `D ≥ D₀ ≈ 138°`, secondary `D ≥ D₀ ≈ 231°`. In the signed readings this flips sign once: `π − D ≤ 42.0°` (the primary is a *maximum* of `π − D`; rays fill the sky *inside* the bow) and `D − π ≥ 51.0°` (the secondary is a *minimum* of `D − π`; rays fill *outside*). Alexander's band gets neither family, consistent with `alexander_dark_band`.

**Lean sketch** (not a file):

```
import Mathlib.MeasureTheory.Function.JacobianOneDim
import WyrdMathlib.Rainbow.Bow
namespace Wyrd.Rainbow
open MeasureTheory Set Filter Topology Real

structure FoldMin (f w : ℝ → ℝ) (i₀ δ m M η : ℝ) : Prop where
  δ_pos : 0 < δ
  m_pos : 0 < m
  m_le_M : m ≤ M
  hf'  : ∀ x ∈ Ioo (i₀ - δ) (i₀ + δ), HasDerivAt f (deriv f x) x
  hf'₀ : deriv f i₀ = 0
  hf'' : ∀ x ∈ Ioo (i₀ - δ) (i₀ + δ), HasDerivAt (deriv f) (deriv (deriv f) x) x
  hm   : ∀ x ∈ Ioo (i₀ - δ) (i₀ + δ), m ≤ deriv (deriv f) x
  hM   : ∀ x ∈ Ioo (i₀ - δ) (i₀ + δ), deriv (deriv f) x ≤ M
  hw   : ContinuousOn w (Ioo (i₀ - δ) (i₀ + δ))
  hw₀  : 0 < w i₀
  hη   : η < w i₀
  hwη  : ∀ x ∈ Ioo (i₀ - δ) (i₀ + δ), |w x - w i₀| ≤ η

noncomputable def incident (w : ℝ → ℝ) (i₀ δ : ℝ) : Measure ℝ :=
  (volume.restrict (Ioo (i₀ - δ) (i₀ + δ))).withDensity fun x => ENNReal.ofReal (w x)

noncomputable def binMass (f w : ℝ → ℝ) (i₀ δ h : ℝ) : ℝ :=
  ∫ x in {x ∈ Ioo (i₀ - δ) (i₀ + δ) | f x ∈ Icc (f i₀) (f i₀ + h)}, w x

theorem fold_sandwich (H : FoldMin f w i₀ δ m M η) {x} (hx : x ∈ Ioo (i₀ - δ) (i₀ + δ)) :
    m / 2 * (x - i₀) ^ 2 ≤ f x - f i₀ ∧ f x - f i₀ ≤ M / 2 * (x - i₀) ^ 2

theorem binMass_sqrt_bounds (H : FoldMin f w i₀ δ m M η) {h} (h0 : 0 < h)
    (hh : √(2 * h / m) < δ) :
    2 * (w i₀ - η) * √(2 * h / M) ≤ binMass f w i₀ δ h ∧
      binMass f w i₀ δ h ≤ 2 * (w i₀ + η) * √(2 * h / m)

theorem binMass_below_eq_zero (H : FoldMin f w i₀ δ m M η) (h : ℝ) :
    ∫ x in {x ∈ Ioo (i₀ - δ) (i₀ + δ) | f x ∈ Ico (f i₀ - h) (f i₀)}, w x = 0

theorem binMass_asymptotic (H : FoldMin f w i₀ δ m M η)
    (hc : ContinuousAt (deriv (deriv f)) i₀) (hwc : ContinuousAt w i₀) :
    Tendsto (fun h => binMass f w i₀ δ h / √h) (𝓝[>] 0)
      (𝓝 (2 * w i₀ * √(2 / deriv (deriv f) i₀)))

noncomputable def gR (f : ℝ → ℝ) (i₀ δ : ℝ) : ℝ → ℝ := Function.invFunOn f (Ico i₀ (i₀ + δ))
noncomputable def gL (f : ℝ → ℝ) (i₀ δ : ℝ) : ℝ → ℝ := Function.invFunOn f (Ioc (i₀ - δ) i₀)
noncomputable def foldDensity (f w : ℝ → ℝ) (i₀ δ D : ℝ) : ℝ :=
  w (gL f i₀ δ D) / |deriv f (gL f i₀ δ D)| + w (gR f i₀ δ D) / |deriv f (gR f i₀ δ D)|

theorem incident_map_Icc (H : FoldMin f w i₀ δ m M η) {a b : ℝ} (ha : f i₀ < a) (hab : a ≤ b)
    (hb : b ∈ f '' Ioo (i₀ - δ) i₀) (hb' : b ∈ f '' Ioo i₀ (i₀ + δ)) :
    (incident w i₀ δ).map f (Icc a b) = ENNReal.ofReal (∫ D in a..b, foldDensity f w i₀ δ D)

theorem foldDensity_asymptotic (H : FoldMin f w i₀ δ m M η)
    (hc : ContinuousAt (deriv (deriv f)) i₀) (hwc : ContinuousAt w i₀) :
    Tendsto (fun D => foldDensity f w i₀ δ D * √(D - f i₀)) (𝓝[>] f i₀)
      (𝓝 (2 * w i₀ / √(2 * deriv (deriv f) i₀)))
```

## 2. Why (a) first, and what it already buys

(a) needs no inverse function, no change of variables and no measure pushforward: it is the sandwich (0) plus "the bin's preimage is squeezed between two intervals" plus integrating `w₀ ± η` over intervals. Everything is a Bochner set-integral over an explicit set. (b) needs the two branches as functions, their continuity and derivative, change of variables on each, and a limit argument; the integrated form of (b) is a corollary of (a) by letting `δ → 0`, so proving (a) with explicit `m, M, η` makes (b) a limit of already-proved inequalities instead of a fresh argument.

The demo (`rainbow-lab.html`, line 457) samples `i = asin((j+½)/2000)`, i.e. uniform in `b/R = sin i`, so its bars are exactly `2000 × mass` with `w = cos i`, binned by viewing angle in 1° bins. For water, `i₀ = arccos √(7/27)`, `w₀ = √(7/27) ≈ 0.509`, and `D''(i₀) = 2(k+1)(n²−1) sin i₀/(n²−sin²i₀)^{3/2} = 4·(7/9)·√(20/27)/(28/27)^{3/2} ≈ 2.5355 rad⁻¹` (secondary: `≈ 5.417`). The 42° bar straddles the fold (`θ_max ≈ 42.03°`), so its filled part is `D ∈ [D₀, D₀ + 0.53°]`; (a) predicts `≈ 2·0.509·√(2·0.00925/2.5355)·2000 ≈ 174` rays there, versus about 8 per degree far from the bow. Numerical check this session (400,000 rays, `w = cos i`): mass in `[D₀, D₀+1°]` = 0.1204 against `2w₀√(2h/D'')` = 0.1195 (0.7% off; `h = 0.5°`: 0.0848 vs 0.0845). So (a) alone makes the bar heights a theorem up to the explicit `[c₁, c₂]` band.

## 3. Weighting, and three things not to confuse

*The physics in this section (impact-parameter weighting, Fresnel factors, the Brewster remark, the sun's disc, Airy 1838) is standard textbook material stated from memory; it was not checked against sources in this session and is not part of any theorem.*

A parallel beam over a sphere of radius `R` is uniform in the impact parameter `b = R sin i`. In the plane through the drop's centre (the model `dev` describes), `db = R cos i di`: the planar fan has weight `cos i di` — the demo's sampling, and the `w` for the bow analysis. Over the full disk, the annulus at `b` has area `2πb db = 2πR² sin i cos i di`: weight `∝ sin i cos i di`. The 3-D rainbow is the planar fan swept round the sun–drop axis: rays at deviation `D` form a cone of half-angle `θ = π − D` (primary), so per unit solid angle the 3-D weight is `sin i cos i / sin θ(i) di`, which at the bow is the planar `cos i` times the smooth, nonzero factor `sin i₀/sin θ₁` (`≈ 0.861/0.669`). The `1/√(D−D₀)` fold is therefore the same in 2-D and 3-D; only `w₀` changes.

Three different quantities: (i) **ray count per unit angle** — what the fold theorem gives; its only inputs are `f` and a positive weight. (ii) **Transmitted power** — multiply `w` by the Fresnel factor `T_in(i)·R(r)^k·T_out(r)` for each polarization; not in the model. As long as that factor is continuous and positive at `i₀` (for water's primary the internal reflection is near, not at, Brewster's angle, which is why the bow is strongly polarized), the same theorem applies with a new `w`. (iii) **Observed brightness** — radiance: power per solid angle (`sin θ dθ dφ`), summed over the drop-size distribution, convolved with the sun's 0.5° disc (which caps the `1/√` peak), plus diffraction (Airy 1838: finite, shifted peak and supernumeraries). Each step is a further assumption on top of (i); none is proved by it.

## 4. Mathlib inventory (v4.35.0)

Inverse function: `HasStrictDerivAt.localInverse` (abbrev), `.eventually_left_inverse`, `.eventually_right_inverse`, `.map_nhds_eq`, `.to_localInverse`, `.to_local_left_inverse` — `Analysis/Calculus/InverseFunctionTheorem/Deriv.lean` (≈ lines 30–50); `HasStrictFDerivAt.toOpenPartialHomeomorph`/`.localInverse` — `.../FDeriv.lean:118,150`; `ContDiffAt.localInverse` — `.../ContDiff.lean:55`; `HasDerivAt.of_local_left_inverse`, `HasStrictDerivAt.of_local_left_inverse` — `Analysis/Calculus/Deriv/Inverse.lean:86,58`. All need `f' ≠ 0`, so they serve at branch points `i ≠ i₀`, never at the fold. Note this Mathlib uses `OpenPartialHomeomorph`, not `PartialHomeomorph`, for the IFT. `hasStrictDerivAt_of_hasDerivAt_of_continuousAt` — `Analysis/Calculus/MeanValue.lean:829`.

Taylor: `taylor_mean_remainder_lagrange` — `Analysis/Calculus/Taylor.lean:331` (in `uIcc`/`iteratedDerivWithin` form; for `n = 1` the hypotheses `ContDiffOn ℝ 1 f (uIcc x₀ x)` plus differentiability of `iteratedDerivWithin 1 f` are heavier than the MVT route); `taylor_mean_remainder` (302), `_cauchy` (372), `taylor_mean_remainder_bound` (391), `exists_taylor_mean_remainder_bound` (431).

MVT/monotone/convex: `Convex.mul_sub_le_image_sub_of_le_deriv` (`Analysis/Calculus/Deriv/MeanValue.lean:310`), `Convex.image_sub_le_mul_sub_of_deriv_le` (356), strict forms (286, 336), `strictMonoOn_of_deriv_pos` (377), `monotoneOn_of_deriv_nonneg` (412), `strictAntiOn_of_deriv_neg` (445), `antitoneOn_of_deriv_nonpos` (481), `exists_hasDerivAt_eq_slope` (124), `exists_deriv_eq_slope` (154); `convexOn_of_deriv2_nonneg`, `strictConvexOn_of_deriv2_pos` (`Analysis/Convex/Deriv.lean:215,267`, primed forms 291, 309); second-derivative test `isLocalMin_of_deriv_deriv_pos`, `isLocalMax_of_deriv_deriv_neg` (`Analysis/Calculus/DerivativeTest.lean:404,409`); `IsLocalMin.deriv_eq_zero` (`LocalExtr/Basic.lean:241`).

Change of variables: `integral_image_eq_integral_abs_deriv_smul`, `lintegral_image_eq_lintegral_abs_deriv_mul`, `integrableOn_image_iff_integrableOn_abs_deriv_smul` — `MeasureTheory/Function/JacobianOneDim.lean:66,44,56` (hypotheses `MeasurableSet s`, `HasDerivWithinAt f (f' x) s x` on `s`, `InjOn f s`); the measure-level form `map_withDensity_abs_det_fderiv_eq_addHaar` — `Function/Jacobian.lean:1127`, which is `incident_map_Icc` in disguise; interval forms `intervalIntegral.integral_comp_mul_deriv'` (`Integral/IntervalIntegral/IntegrationByParts.lean:502`), `integral_comp_mul_deriv` (512), and the monotone forms `integral_comp_mul_deriv_of_deriv_nonneg`/`_nonpos` (520 ff.), which fit the two branches directly; `integral_eq_sub_of_hasDerivAt` (`FundThmCalculus.lean:1148`).

Measures: `Measure.map_apply` (`Measure/Map.lean:170`), `map_apply_of_aemeasurable` (166); `withDensity_apply`, `withDensity_apply'`, `restrict_withDensity`, `lintegral_withDensity_eq_lintegral_mul` (`Measure/WithDensity.lean:44,77,233,416`); `Measure.restrict_apply` (`Measure/Restrict.lean:75`); `Real.volume_Icc/Ioo/Ioc/Ico` (`Measure/Lebesgue/Basic.lean:87,97,111,77`); `Measure.ext_of_Ioc` (`Constructions/BorelSpace/Order.lean:514`); `setIntegral_mono_set`, `setIntegral_mono_on`, `setIntegral_const`, `setIntegral_ge_of_const_le_real`, `norm_setIntegral_le_of_norm_le_const` (`Integral/Bochner/Set.lean:733,757,520,794,609`).

Branches: `ContinuousOn.image_Ioo_of_strictMonoOn`/`_strictAntiOn` (`Topology/Order/IntermediateValue.lean:922,926`), `intermediate_value_Icc` (587); `Function.invFunOn`, `Function.invFunOn_eq`, `Set.InjOn.leftInvOn_invFunOn`, `Set.InjOn.invFunOn_image` (`Data/Set/Function.lean:950,963,984,987`); `StrictMonoOn.continuousAt_of_image_mem_nhds` (`Topology/Order/MonotoneContinuity.lean:217`); `𝓝[>]` is `nhdsWithin x (Ioi x)` (`Topology/Defs/Filter.lean:155`); `Real.sqrt_le_sqrt` etc. in `Analysis/Real/Sqrt.lean`.

Missing: no modulus-of-continuity object (the phrase is only a docstring in `MeanValue.lean`), so `m, M, η` are passed by hand; no "second-order sandwich from `f''` bounds" lemma (two uses of `Convex.mul_sub_le_image_sub_of_le_deriv`); no "two-to-one fold has density `Σ w/|f'|`" lemma; no interval-level "inverse of a strictly monotone `C¹` function is `C¹` with derivative `1/f'`" packaged for `invFunOn`; `taylor_mean_remainder_lagrange` is awkward at `n = 1`. (`StrictMonoOn.injOn` exists but its file was not pinned down by my grep.)

## 5. Staged plan, difficulty, risks, rainbow hook

Lemmas in order: L1 `fold_sandwich` via `Convex.mul_sub_le_image_sub_of_le_deriv`/`image_sub_le_mul_sub_of_deriv_le` on `f'` (each side), then once more on `x ↦ f x − (m/2)(x−i₀)²` with `monotoneOn_of_deriv_nonneg`. L2 set inclusions `Icc (i₀−√(2h/M)) (i₀+√(2h/M)) ⊆ bin ⊆ Icc (i₀−√(2h/m)) (i₀+√(2h/m))` and `MeasurableSet bin` (`Continuous.measurable`, `measurableSet_Icc`). L3 `binMass_sqrt_bounds` from L2 with `setIntegral_mono_set`, `setIntegral_ge_of_const_le_real`, `Real.volume_Icc`. L4 `binMass_below_eq_zero` (bin is empty by L1). L5 `binMass_asymptotic` by squeezing with `δ → 0`. L6 branches: `strictMonoOn_of_deriv_pos`/`strictAntiOn_of_deriv_neg` on each side, `invFunOn` inverses, continuity (`StrictMonoOn.continuousAt_of_image_mem_nhds`), derivative `1/f'` at branch points (`HasDerivAt.of_local_left_inverse`). L7 `incident_map_Icc` via `map_withDensity_abs_det_fderiv_eq_addHaar` or the monotone `integral_comp_mul_deriv_of_deriv_*` on each branch, then add. L8 `foldDensity_asymptotic` from L1 and `f'(g±D) = f''(i₀)(g±D − i₀) + o(·)`. L9 rainbow instance.

Difficulty: L1–L4 one to two days (comparable to `MinLemma.lean`); L5 half a day; L6–L8 three to five days, mostly bookkeeping over `invFunOn`, `ENNReal.ofReal`, and interval endpoints; L9 one to two days.

Risks: (1) the measure-theory API (`withDensity`, `map`, `ENNReal`) is the project's first use of it and may dominate the proof length; (2) `invFunOn` branch functions are defined on all of `ℝ` with junk outside the image, so every lemma carries domain side-conditions; (3) the `o(·)` step in L8 is a limit of quotients with `√` and `|·|`, where `Tendsto` bookkeeping with `𝓝[>]` is fiddly.

Rainbow hook (L9): `f = dev 1 n`, `i₀ = bowIncidence 1 n`; `hf'` from `hasDerivAt_dev` (`Deriv.lean`); `hf'₀` is `deriv_dev_bowIncidence` (`Bow.lean`); `w = cos i`, `w₀ = √(7/27)` at water from `cos_bowIncidence_sq`. **Not yet proved in the project:** the second derivative `D''(i) = 2(k+1)(n²−1) sin i/(n²−sin²i)^{3/2}` (a new `hasDerivAt_deriv_dev`, differentiating `cos i/√(n²−sin²i)`), its positivity on `(0, π/2]` for `n > 1` (hence `f''(i₀) > 0` and strict convexity of `D`), and explicit `m, M` on a window (TrigBounds-style estimates, or continuity only, which suffices for L5 and L8). Expect `D''(i₀) ≈ 2.5355` (primary, water) and `≈ 5.417` (secondary).