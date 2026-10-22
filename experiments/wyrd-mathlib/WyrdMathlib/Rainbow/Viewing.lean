import Mathlib.Algebra.Order.ToIntervalMod
import Mathlib.Analysis.Real.Pi.Bounds
import WyrdMathlib.Rainbow.VisibleBand

/-!
# The rainbow: the angle actually seen

`dev k n i` is the signed total turning of a ray, not reduced mod `2π`. The
other files bound the signed quantities `π - D` (once reflected) and `D - π`
(twice reflected). This file defines the angle at which a ray with total
turning `D` is seen from the antisolar point (the shadow of your head), in the
planar model: reduce `D` mod `2π` into `[0, 2π)`, then take the distance from
`π`. That is `viewAngle D = |π - (D mod 2π)|`.

It then proves when the signed quantities *are* the viewing angle:

* `π - D₁ = viewAngle D₁` for every incidence `i ∈ [0, π/2]` when
  `1 ≤ n ≤ √2` (`viewAngle_dev_one`);
* `D₂ - π = viewAngle D₂` for every `i ∈ [0, π/2]` when `1.331 ≤ n < 2`
  (`viewAngle_dev_two`; the lower bound is inherited from
  `dark_band_of_red_le`, not the sharp threshold);

and restates the dark band and the colour order for `viewAngle`
(`dark_band_viewAngle`, `colour_order_viewAngle`), proved for
`1.331 ≤ n ≤ √2`, the intersection of the two bridges. The water indices used
in `VisibleBand.lean` (`1.331 ≤ n ≤ 1.343`) lie inside every domain used. The
primary bridge's domain is exact (`viewAngle_dev_one_iff`): numerically (not
proved) the gap in viewing angle itself persists up to `n ≈ 1.777`, where grazing
once-reflected rays reach `43°` on the far side of the antisolar point.

Finally it shows, at explicit indices, that the signed reading fails outside
those domains: at `n = 1.9` the grazing once-reflected ray has `D₁ > π`, so
`π - D₁ < 0` is not an angle seen, and some once-reflected ray is in fact seen
at `43°` — inside the band that the signed theorem still clears
(`signed_gap_holds_but_ray_seen_in_band`); at `n = 1.1` the grazing
twice-reflected ray has `D₂ < π`, so `D₂ - π < 0`.

Nothing here models brightness, the sun's disc, or three-dimensional geometry;
`viewAngle` is a definition about real numbers, read through the same planar
model as `dev`.
-/

namespace Wyrd.Rainbow

open Real

/-- The angle at which a ray with total turning `D` is seen from the antisolar
point, in the planar model: reduce `D` mod `2π` into `[0, 2π)`, then take the
distance from `π`. -/
noncomputable def viewAngle (D : ℝ) : ℝ := |π - toIcoMod Real.two_pi_pos 0 D|

/-! ### Basic range and wrapping -/

/-- The viewing angle is never negative. -/
theorem viewAngle_nonneg (D : ℝ) : 0 ≤ viewAngle D := abs_nonneg _

/-- The viewing angle is at most `π`. The value `π` is the undeviated ray `D ≡ 0`
(the drop seen in the direction of the sun); the value `0` is `D ≡ π` (the drop at
the antisolar point). -/
theorem viewAngle_le_pi (D : ℝ) : viewAngle D ≤ π := by
  -- `D mod 2π ∈ [0, 2π)`, so `π - (D mod 2π) ∈ (-π, π]`
  have h := toIcoMod_mem_Ico' two_pi_pos D
  rw [viewAngle, abs_le]
  constructor <;> linarith [h.1, h.2, pi_pos]

/-- Turning a full extra circle changes nothing seen. -/
theorem viewAngle_add_two_pi (D : ℝ) : viewAngle (D + 2 * π) = viewAngle D := by
  rw [viewAngle, viewAngle, toIcoMod_add_right]

/-- The viewing angle does not depend on the rotational sense of the turning: a ray
turned by `-D` (the mirror-image path, entering the other half of the drop) is seen
at the same angle. This is what makes an unsigned `viewAngle` the right quantity for
both ray families. -/
theorem viewAngle_neg (D : ℝ) : viewAngle (-D) = viewAngle D := by
  have hpi := pi_pos
  obtain ⟨hmem, z, hz⟩ := (toIcoMod_eq_iff two_pi_pos).1 (rfl : toIcoMod two_pi_pos 0 D = _)
  set x := toIcoMod two_pi_pos 0 D with hx
  rcases hmem.1.eq_or_lt with h0 | h0
  · -- `x = 0`: `D` is a multiple of `2π`, hence so is `-D`
    have h1 : toIcoMod two_pi_pos 0 (-D) = 0 := by
      rw [toIcoMod_eq_iff]
      refine ⟨⟨le_rfl, by linarith⟩, -z, ?_⟩
      rw [hz, ← h0]; simp only [zsmul_eq_mul, Int.cast_neg]; ring
    unfold viewAngle
    rw [h1, ← hx, ← h0]
  · -- `0 < x < 2π`: `-D ≡ 2π - x`, and `|π - (2π - x)| = |π - x|`
    have h1 : toIcoMod two_pi_pos 0 (-D) = 2 * π - x := by
      rw [toIcoMod_eq_iff]
      refine ⟨⟨by linarith [hmem.2], by linarith⟩, -z - 1, ?_⟩
      rw [hz]; simp only [zsmul_eq_mul, Int.cast_sub, Int.cast_neg, Int.cast_one]; ring
    unfold viewAngle
    rw [h1, ← hx, show π - (2 * π - x) = -(π - x) by ring, abs_neg]

/-! ### The two signed readings -/

/-- For `0 ≤ D ≤ π`, the viewing angle is `π - D` (the signed primary reading).
Which side of the antisolar point the ray is seen on is not expressed by
`viewAngle`, which is unsigned; see `viewAngle_neg`. -/
theorem viewAngle_of_mem_Icc_zero_pi {D : ℝ} (h0 : 0 ≤ D) (hπ : D ≤ π) :
    viewAngle D = π - D := by
  -- `D` is already in `[0, 2π)`, so reduction does nothing, and `π - D ≥ 0`
  have hmem : D ∈ Set.Ico 0 (0 + 2 * π) := ⟨h0, by linarith [pi_pos]⟩
  rw [viewAngle, (toIcoMod_eq_self two_pi_pos).2 hmem, abs_of_nonneg (by linarith)]

/-- For `π ≤ D ≤ 2π`, the viewing angle is `D - π` (the signed secondary reading):
the ray has turned past `D = π`, the antisolar point itself. At `D = 2π` both
readings give `π`. -/
theorem viewAngle_of_mem_Icc_pi_two_pi {D : ℝ} (hπ : π ≤ D) (h2 : D ≤ 2 * π) :
    viewAngle D = D - π := by
  rcases h2.lt_or_eq with hlt | heq
  · -- `D ∈ [π, 2π)`: reduction does nothing, and `π - D ≤ 0`
    have hmem : D ∈ Set.Ico 0 (0 + 2 * π) := ⟨by linarith [pi_pos], by linarith⟩
    rw [viewAngle, (toIcoMod_eq_self two_pi_pos).2 hmem, abs_of_nonpos (by linarith)]
    ring
  · -- `D = 2π`: it reduces to `0`, and `|π - 0| = π = 2π - π`
    subst heq
    have h0 : toIcoMod two_pi_pos 0 (2 * π) = 0 := by
      have h := toIcoMod_apply_right two_pi_pos 0
      rwa [zero_add] at h
    rw [viewAngle, h0, sub_zero, abs_of_pos pi_pos]
    ring

/-- If `D` has turned past `π`, the signed primary reading `π - D` is negative,
so it is not the angle seen. -/
theorem viewAngle_ne_of_pi_lt {D : ℝ} (h : π < D) : viewAngle D ≠ π - D := by
  have := viewAngle_nonneg D
  intro heq
  linarith

/-! ### The once-reflected ray: `0 ≤ D₁ ≤ π` when `1 ≤ n ≤ √2` -/

/-- Refraction into a denser medium bends the ray towards the normal:
`r ≤ i` for `n ≥ 1` and `i ∈ [0, π/2]`. -/
theorem refr_le_self {n i : ℝ} (hn : 1 ≤ n) (hi : i ∈ Set.Icc 0 (π / 2)) : refr n i ≤ i := by
  have hs : 0 ≤ sin i := sin_nonneg_of_nonneg_of_le_pi hi.1 (by linarith [hi.2, pi_pos])
  -- `sin i / n ≤ sin i`, and `arcsin` is monotone and undoes `sin` on `[-π/2, π/2]`
  calc refr n i = arcsin (sin i / n) := rfl
    _ ≤ arcsin (sin i) := arcsin_le_arcsin (div_le_self hs hn)
    _ = i := arcsin_sin (by linarith [hi.1, pi_pos]) hi.2

/-- A once-reflected ray never turns backwards: `D₁ ≥ 0` for `n ≥ 1` and
`i ∈ [0, π/2]`. -/
theorem dev_one_nonneg {n i : ℝ} (hn : 1 ≤ n) (hi : i ∈ Set.Icc 0 (π / 2)) :
    0 ≤ dev 1 n i := by
  -- `D₁ = π + 2i - 4r ≥ π + 2i - 4i = π - 2i ≥ 0`
  have h := refr_le_self hn hi
  unfold dev
  push_cast
  linarith [hi.2]

/-- A once-reflected ray turns at most half a circle when `1 ≤ n ≤ √2`:
`D₁ ≤ π`, i.e. `i ≤ 2r`. The proof reduces `i ≤ 2r` to `n ≤ 2 cos (i/2)`, which
at grazing incidence reads `n ≤ √2`; `dev_one_grazing_gt_pi` shows the failure
at `n = 1.9`. -/
theorem dev_one_le_pi {n i : ℝ} (hn : 1 ≤ n) (hn2 : n ≤ √2) (hi : i ∈ Set.Icc 0 (π / 2)) :
    dev 1 n i ≤ π := by
  have hn0 : 0 < n := by linarith
  have hpi := pi_pos
  -- the half angle `i/2 ∈ [0, π/4]` has `sin ≥ 0` and `cos ≥ cos (π/4) = √2/2`
  have hs0 : 0 ≤ sin (i / 2) :=
    sin_nonneg_of_nonneg_of_le_pi (by linarith [hi.1]) (by linarith [hi.2])
  have hc : cos (π / 4) ≤ cos (i / 2) :=
    cos_le_cos_of_nonneg_of_le_pi (by linarith [hi.1]) (by linarith) (by linarith [hi.2])
  rw [cos_pi_div_four] at hc
  -- `sin i = 2 sin (i/2) cos (i/2)`
  have hsin : sin i = 2 * sin (i / 2) * cos (i / 2) := by
    have h := sin_two_mul (i / 2)
    rwa [show 2 * (i / 2) = i by ring] at h
  -- so `n sin (i/2) ≤ 2 cos (i/2) sin (i/2) = sin i`, using `n ≤ √2 ≤ 2 cos (i/2)`
  have hkey : sin (i / 2) ≤ sin i / n := by
    rw [le_div_iff₀ hn0, hsin]
    have h2 : n ≤ 2 * cos (i / 2) := by linarith
    calc sin (i / 2) * n ≤ sin (i / 2) * (2 * cos (i / 2)) := mul_le_mul_of_nonneg_left h2 hs0
      _ = 2 * sin (i / 2) * cos (i / 2) := by ring
  -- hence `i/2 ≤ arcsin (sin i / n) = r`
  have hr : i / 2 ≤ refr n i := by
    rw [refr]
    refine (le_arcsin_iff_sin_le ⟨by linarith [hi.1], by linarith [hi.2]⟩ ⟨?_, ?_⟩).2 hkey
    · have : 0 ≤ sin i / n :=
        div_nonneg (sin_nonneg_of_nonneg_of_le_pi hi.1 (by linarith [hi.2])) hn0.le
      linarith
    · rw [div_le_iff₀ hn0]; nlinarith [sin_le_one i]
  -- `D₁ = π + 2i - 4r ≤ π`
  unfold dev
  push_cast
  linarith

/-- **The signed primary reading is the viewing angle** for every incidence
when `1 ≤ n ≤ √2`: `viewAngle D₁ = π - D₁`. -/
theorem viewAngle_dev_one {n i : ℝ} (hn : 1 ≤ n) (hn2 : n ≤ √2) (hi : i ∈ Set.Icc 0 (π / 2)) :
    viewAngle (dev 1 n i) = π - dev 1 n i :=
  viewAngle_of_mem_Icc_zero_pi (dev_one_nonneg hn hi) (dev_one_le_pi hn hn2 hi)

/-- For every `n > √2`, the grazing once-reflected ray has `D₁ > π`: the hypothesis
`n ≤ √2` of `dev_one_le_pi` cannot be weakened. -/
theorem dev_one_grazing_gt_pi_of_sqrt_two_lt {n : ℝ} (hn : √2 < n) : π < dev 1 n (π / 2) := by
  have hpi := pi_pos
  have h2 : (1 : ℝ) < √2 := by rw [Real.lt_sqrt (by norm_num)]; norm_num
  have hs : √2 * √2 = 2 := Real.mul_self_sqrt (by norm_num)
  have hn0 : 0 < n := by linarith
  have hm1 : -1 ≤ 1 / n := by rw [le_div_iff₀ hn0]; linarith
  have hle1 : 1 / n ≤ 1 := by rw [div_le_one hn0]; linarith
  have h : arcsin (1 / n) < π / 4 := by
    rw [arcsin_lt_iff_lt_sin ⟨hm1, hle1⟩ ⟨by linarith, by linarith⟩, sin_pi_div_four,
      div_lt_iff₀ hn0]
    have h' : √2 / 2 * √2 < √2 / 2 * n := mul_lt_mul_of_pos_left hn (by positivity)
    have h'' : √2 / 2 * √2 = 1 := by rw [div_mul_eq_mul_div, hs]; norm_num
    linarith
  have hr : refr n (π / 2) = arcsin (1 / n) := by rw [refr, sin_pi_div_two]
  unfold dev
  rw [hr]
  push_cast
  linarith

/-- **Exact domain of the primary bridge**: for `n ≥ 1`, the signed primary reading
`π - D₁` is the viewing angle at every incidence if and only if `n ≤ √2`. -/
theorem viewAngle_dev_one_iff {n : ℝ} (hn : 1 ≤ n) :
    (∀ i ∈ Set.Icc 0 (π / 2), viewAngle (dev 1 n i) = π - dev 1 n i) ↔ n ≤ √2 := by
  constructor
  · intro h
    by_contra hlt
    exact viewAngle_ne_of_pi_lt (dev_one_grazing_gt_pi_of_sqrt_two_lt (not_le.1 hlt))
      (h (π / 2) ⟨by linarith [pi_pos], le_rfl⟩)
  · intro hn2 i hi
    exact viewAngle_dev_one hn hn2 hi

/-! ### The twice-reflected ray: `π ≤ D₂ ≤ 2π` when `1.331 ≤ n < 2` -/

/-- A twice-reflected ray turns at most a full circle when `1 ≤ n ≤ 2`:
`D₂ ≤ 2π`, i.e. `i ≤ 3r`. -/
theorem dev_two_le_two_pi {n i : ℝ} (hn : 1 ≤ n) (hn2 : n ≤ 2) (hi : i ∈ Set.Icc 0 (π / 2)) :
    dev 2 n i ≤ 2 * π := by
  have hn0 : 0 < n := by linarith
  have hpi := pi_pos
  -- the third angle `i/3 ∈ [0, π/6]` has `0 ≤ sin (i/3) ≤ sin (π/6) = 1/2`
  have hs0 : 0 ≤ sin (i / 3) :=
    sin_nonneg_of_nonneg_of_le_pi (by linarith [hi.1]) (by linarith [hi.2])
  have hs1 : sin (i / 3) ≤ sin (π / 6) :=
    sin_le_sin_of_le_of_le_pi_div_two (by linarith [hi.1]) (by linarith) (by linarith [hi.2])
  rw [sin_pi_div_six] at hs1
  -- `sin i = 3 sin (i/3) - 4 sin³ (i/3)`
  have hsin : sin i = 3 * sin (i / 3) - 4 * sin (i / 3) ^ 3 := by
    have h := sin_three_mul (i / 3)
    rwa [show 3 * (i / 3) = i by ring] at h
  -- so `n sin (i/3) ≤ (3 - 4 sin² (i/3)) sin (i/3) = sin i`, since `4 sin² (i/3) ≤ 1`
  have hkey : sin (i / 3) ≤ sin i / n := by
    rw [le_div_iff₀ hn0, hsin]
    have h4 : 4 * sin (i / 3) ^ 2 ≤ 1 := by nlinarith [mul_nonneg hs0 (sub_nonneg.2 hs1)]
    have h2 : n ≤ 3 - 4 * sin (i / 3) ^ 2 := by linarith
    calc sin (i / 3) * n ≤ sin (i / 3) * (3 - 4 * sin (i / 3) ^ 2) :=
          mul_le_mul_of_nonneg_left h2 hs0
      _ = 3 * sin (i / 3) - 4 * sin (i / 3) ^ 3 := by ring
  -- hence `i/3 ≤ arcsin (sin i / n) = r`
  have hr : i / 3 ≤ refr n i := by
    rw [refr]
    refine (le_arcsin_iff_sin_le ⟨by linarith [hi.1], by linarith [hi.2]⟩ ⟨?_, ?_⟩).2 hkey
    · have : 0 ≤ sin i / n :=
        div_nonneg (sin_nonneg_of_nonneg_of_le_pi hi.1 (by linarith [hi.2])) hn0.le
      linarith
    · rw [div_le_iff₀ hn0]; nlinarith [sin_le_one i]
  -- `D₂ = 2π + 2i - 6r ≤ 2π`
  unfold dev
  push_cast
  linarith

/-- For every `n > 2`, the grazing twice-reflected ray has `D₂ > 2π`: the hypothesis
`n ≤ 2` of `dev_two_le_two_pi` cannot be weakened. -/
theorem dev_two_grazing_gt_two_pi_of_two_lt {n : ℝ} (hn : 2 < n) :
    2 * π < dev 2 n (π / 2) := by
  have hpi := pi_pos
  have hn0 : 0 < n := by linarith
  have hm1 : -1 ≤ 1 / n := by rw [le_div_iff₀ hn0]; linarith
  have hle1 : 1 / n ≤ 1 := by rw [div_le_one hn0]; linarith
  have h : arcsin (1 / n) < π / 6 := by
    rw [arcsin_lt_iff_lt_sin ⟨hm1, hle1⟩ ⟨by linarith, by linarith⟩, sin_pi_div_six,
      div_lt_iff₀ hn0]
    linarith
  have hr : refr n (π / 2) = arcsin (1 / n) := by rw [refr, sin_pi_div_two]
  unfold dev
  rw [hr]
  push_cast
  linarith

/-- For `1.331 ≤ n < 2`, every twice-reflected ray has `D₂ ≥ π`
(it is the second half of `dark_band_of_red_le`, weakened). -/
theorem pi_le_dev_two_of_red_le {n i : ℝ} (hred : 1331 / 1000 ≤ n) (hn2 : n < 2)
    (hi : i ∈ Set.Icc 0 (π / 2)) : π ≤ dev 2 n i := by
  have := (dark_band_of_red_le hred hn2 hi).2
  linarith [pi_pos]

/-- **The signed secondary reading is the viewing angle** for every incidence
when `1.331 ≤ n < 2`: `viewAngle D₂ = D₂ - π`. -/
theorem viewAngle_dev_two {n i : ℝ} (hred : 1331 / 1000 ≤ n) (hn2 : n < 2)
    (hi : i ∈ Set.Icc 0 (π / 2)) : viewAngle (dev 2 n i) = dev 2 n i - π :=
  viewAngle_of_mem_Icc_pi_two_pi (pi_le_dev_two_of_red_le hred hn2 hi)
    (dev_two_le_two_pi (by linarith) hn2.le hi)

/-! ### The physical conclusions, for the angle seen -/

/-- `√2 < 2`. -/
private lemma viewing_aux_sqrt_two_lt_two : √2 < 2 := by
  rw [Real.sqrt_lt' (by norm_num)]; norm_num

/-- **Alexander's dark band, for the angle seen**: for `1.331 ≤ n ≤ √2`, every
once-reflected ray is seen below `43°` and every twice-reflected ray above `50°`.
The range `n ≤ √2` is where the primary bridge holds, not where the gap closes
(numerically `n ≈ 1.777`). It is a gap in these two ray families; brightness is
not modelled. -/
theorem dark_band_viewAngle {n i : ℝ} (hred : 1331 / 1000 ≤ n) (hn2 : n ≤ √2)
    (hi : i ∈ Set.Icc 0 (π / 2)) :
    viewAngle (dev 1 n i) < 43 * π / 180 ∧ 50 * π / 180 < viewAngle (dev 2 n i) := by
  have hn1 : 1 ≤ n := by linarith
  have hlt2 : n < 2 := hn2.trans_lt viewing_aux_sqrt_two_lt_two
  -- both signed readings are the viewing angle on this range of indices
  rw [viewAngle_dev_one hn1 hn2 hi, viewAngle_dev_two hred hlt2 hi]
  exact dark_band_of_red_le hred hlt2 hi

/-- **Colour order, for the angle seen**: if `1.331 ≤ nRed < nViolet ≤ √2`, the
violet primary bow is seen inside the red one, and the violet secondary bow
outside the red one. -/
theorem colour_order_viewAngle {nRed nViolet : ℝ} (hred : 1331 / 1000 ≤ nRed)
    (h2 : nRed < nViolet) (h3 : nViolet ≤ √2) :
    viewAngle (dev 1 nViolet (bowIncidence 1 nViolet)) <
        viewAngle (dev 1 nRed (bowIncidence 1 nRed)) ∧
      viewAngle (dev 2 nRed (bowIncidence 2 nRed)) <
        viewAngle (dev 2 nViolet (bowIncidence 2 nViolet)) := by
  have hr1 : 1 < nRed := by linarith
  have hv1 : 1 < nViolet := hr1.trans h2
  have hv2 : nViolet < 2 := h3.trans_lt viewing_aux_sqrt_two_lt_two
  have hr2 : nRed < 2 := h2.trans hv2
  have hrs : nRed ≤ √2 := h2.le.trans h3
  have hvred : 1331 / 1000 ≤ nViolet := hred.trans h2.le
  -- the four bow incidences are genuine angles in `(0, π/2) ⊆ [0, π/2]`
  have hR1 := Set.Ioo_subset_Icc_self (bowIncidence_mem (k := 1) hr1 le_rfl (by push_cast; linarith))
  have hV1 := Set.Ioo_subset_Icc_self (bowIncidence_mem (k := 1) hv1 le_rfl (by push_cast; linarith))
  have hR2 := Set.Ioo_subset_Icc_self
    (bowIncidence_mem (k := 2) hr1 (by norm_num) (by push_cast; linarith))
  have hV2 := Set.Ioo_subset_Icc_self
    (bowIncidence_mem (k := 2) hv1 (by norm_num) (by push_cast; linarith))
  -- so the signed readings are the viewing angles, and `colour_order` applies
  rw [viewAngle_dev_one hr1.le hrs hR1, viewAngle_dev_one hv1.le h3 hV1,
    viewAngle_dev_two hred hr2 hR2, viewAngle_dev_two hvred hv2 hV2]
  exact colour_order hr1 h2 hv2

/-- At the indices `1.331` (red) and `1.343` (violet), violet is seen inside red
in the primary bow and outside red in the secondary bow. -/
theorem water_colour_order_viewAngle :
    viewAngle (dev 1 (1343 / 1000) (bowIncidence 1 (1343 / 1000))) <
        viewAngle (dev 1 (1331 / 1000) (bowIncidence 1 (1331 / 1000))) ∧
      viewAngle (dev 2 (1331 / 1000) (bowIncidence 2 (1331 / 1000))) <
        viewAngle (dev 2 (1343 / 1000) (bowIncidence 2 (1343 / 1000))) :=
  -- `1.343 ≤ √2` since `1.343² = 1.803649 ≤ 2`
  colour_order_viewAngle le_rfl (by norm_num)
    (by rw [Real.le_sqrt' (by norm_num)]; norm_num)

/-- **The primary bow is the outermost once-reflected ray, as seen**: for `1 < n ≤ √2`,
every other once-reflected ray is seen strictly inside the bow ray. This is
`dev_lt_of_ne` read through the primary bridge. -/
theorem viewAngle_lt_bow_one {n i : ℝ} (hn : 1 < n) (hn2 : n ≤ √2) (hi : i ∈ Set.Icc 0 (π / 2))
    (hne : i ≠ bowIncidence 1 n) :
    viewAngle (dev 1 n i) < viewAngle (dev 1 n (bowIncidence 1 n)) := by
  have hnk : n < ((1 : ℕ) : ℝ) + 1 := by push_cast; linarith [viewing_aux_sqrt_two_lt_two]
  have hmem := Set.Ioo_subset_Icc_self (bowIncidence_mem (k := 1) hn le_rfl hnk)
  rw [viewAngle_dev_one hn.le hn2 hi, viewAngle_dev_one hn.le hn2 hmem]
  linarith [dev_lt_of_ne hn le_rfl hnk hi hne]

/-- **The secondary bow is the innermost twice-reflected ray, as seen**: for
`1.331 ≤ n < 2`, every other twice-reflected ray is seen strictly outside the bow ray.
This is `dev_lt_of_ne` read through the secondary bridge. -/
theorem bow_two_lt_viewAngle {n i : ℝ} (hred : 1331 / 1000 ≤ n) (hn2 : n < 2)
    (hi : i ∈ Set.Icc 0 (π / 2)) (hne : i ≠ bowIncidence 2 n) :
    viewAngle (dev 2 n (bowIncidence 2 n)) < viewAngle (dev 2 n i) := by
  have hn1 : 1 < n := by linarith
  have hnk : n < ((2 : ℕ) : ℝ) + 1 := by push_cast; linarith
  have hmem := Set.Ioo_subset_Icc_self (bowIncidence_mem (k := 2) hn1 (by norm_num) hnk)
  rw [viewAngle_dev_two hred hn2 hi, viewAngle_dev_two hred hn2 hmem]
  linarith [dev_lt_of_ne hn1 (by norm_num) hnk hi hne]

/-! ### Where the signed reading fails: explicit indices outside the domains -/

/-- At `n = 1.9`, the grazing once-reflected ray turns more than half a circle:
`D₁(π/2) = 2π - 4 arcsin (10/19) > π`, since `arcsin (10/19) < π/4`. -/
theorem dev_one_grazing_gt_pi : π < dev 1 (19 / 10) (π / 2) := by
  have hpi := pi_pos
  -- `arcsin (10/19) < π/4 ⇔ 10/19 < sin (π/4) = √2/2 ⇔ (20/19)² < 2`
  have h : arcsin (10 / 19) < π / 4 := by
    rw [arcsin_lt_iff_lt_sin ⟨by norm_num, by norm_num⟩ ⟨by linarith, by linarith⟩,
      sin_pi_div_four, lt_div_iff₀ (by norm_num : (0 : ℝ) < 2), Real.lt_sqrt (by norm_num)]
    norm_num
  have hr : refr (19 / 10) (π / 2) = arcsin (10 / 19) := by
    rw [refr, sin_pi_div_two]; norm_num
  unfold dev
  rw [hr]
  push_cast
  linarith

/-- At `n = 1.9`, the signed primary reading `π - D₁` of the grazing ray is
negative, so it is not the angle seen. -/
theorem viewAngle_ne_signed_primary :
    viewAngle (dev 1 (19 / 10) (π / 2)) ≠ π - dev 1 (19 / 10) (π / 2) :=
  viewAngle_ne_of_pi_lt dev_one_grazing_gt_pi

/-- At `n = 1.9`, some once-reflected ray is seen inside the band `[43°, 50°]`
(the proof exhibits one at exactly `43°`; `forall_mem_band_exists_once_reflected_seen`
gives every angle of the band). By the intermediate value theorem: `D₁(0) = π`, and
`D₁(π/2) = 2π - 4 arcsin (10/19) ≥ π + 43π/180`, so `D₁` passes through
`π + 43π/180`, where the viewing angle is `D₁ - π = 43π/180`. -/
theorem exists_once_reflected_seen_in_band :
    ∃ i ∈ Set.Icc 0 (π / 2),
      viewAngle (dev 1 (19 / 10) i) ∈ Set.Icc (43 * π / 180) (50 * π / 180) := by
  have hpi := pi_pos
  have hn : (1 : ℝ) < 19 / 10 := by norm_num
  -- `D₁(0) = π`, since `arcsin 0 = 0`
  have h0 : dev 1 (19 / 10) 0 = π := by simp [dev, refr]
  -- `D₁(π/2) = 2π - 4 arcsin (10/19)`
  have hr : refr (19 / 10) (π / 2) = arcsin (10 / 19) := by
    rw [refr, sin_pi_div_two]; norm_num
  have hhalf : dev 1 (19 / 10) (π / 2) = 2 * π - 4 * arcsin (10 / 19) := by
    unfold dev; rw [hr]; push_cast; ring
  -- `arcsin (10/19) ≤ 137π/720 ⇔ 10/19 ≤ sin (137π/720)`, by `sin y ≥ y - y³/6`
  -- with `y = 137π/720 ∈ (0.5975, 0.5995)` from `3.14 < π < 3.15`
  have ha : arcsin (10 / 19) ≤ 137 * π / 720 := by
    rw [arcsin_le_iff_le_sin ⟨by norm_num, by norm_num⟩ ⟨by linarith, by linarith⟩]
    have hy0 : (0 : ℝ) ≤ 137 * π / 720 := by positivity
    have hcube := Real.sin_ge_sub_cube hy0
    have hp1 := pi_gt_d2
    have hp2 := pi_lt_d2
    have hy2 : 137 * π / 720 < 5995 / 10000 := by linarith
    have hy3 : (137 * π / 720) ^ 3 < (5995 / 10000 : ℝ) ^ 3 :=
      pow_lt_pow_left₀ hy2 hy0 (by norm_num)
    have hc : (5995 / 10000 : ℝ) ^ 3 < 2155 / 10000 := by norm_num
    linarith
  -- the intermediate value theorem on `[0, π/2]`
  have hsub := intermediate_value_Icc (a := 0) (b := π / 2) (by linarith)
    (continuous_dev hn 1).continuousOn
  have hmem : π + 43 * π / 180 ∈ Set.Icc (dev 1 (19 / 10) 0) (dev 1 (19 / 10) (π / 2)) := by
    rw [h0, hhalf]; constructor <;> linarith
  obtain ⟨i, hi, hDi⟩ := hsub hmem
  refine ⟨i, hi, ?_⟩
  -- there `D₁ = π + 43π/180 ∈ [π, 2π]`, so the angle seen is `D₁ - π = 43π/180`
  rw [hDi, viewAngle_of_mem_Icc_pi_two_pi (by linarith) (by linarith)]
  constructor <;> linarith

/-- At `n = 1.9`, **every** angle in `[43°, 50°]` is the viewing angle of some
once-reflected ray (the band is crossed, not merely touched at its edge). -/
theorem forall_mem_band_exists_once_reflected_seen :
    ∀ θ ∈ Set.Icc (43 * π / 180) (50 * π / 180),
      ∃ i ∈ Set.Icc 0 (π / 2), viewAngle (dev 1 (19 / 10) i) = θ := by
  intro θ hθ
  have hpi := pi_pos
  have hn : (1 : ℝ) < 19 / 10 := by norm_num
  have h0 : dev 1 (19 / 10) 0 = π := by simp [dev, refr]
  have hr : refr (19 / 10) (π / 2) = arcsin (10 / 19) := by
    rw [refr, sin_pi_div_two]; norm_num
  have hhalf : dev 1 (19 / 10) (π / 2) = 2 * π - 4 * arcsin (10 / 19) := by
    unfold dev; rw [hr]; push_cast; ring
  have ha : arcsin (10 / 19) ≤ 13 * π / 72 := by
    rw [arcsin_le_iff_le_sin ⟨by norm_num, by norm_num⟩ ⟨by linarith, by linarith⟩]
    have hy0 : (0 : ℝ) ≤ 13 * π / 72 := by positivity
    have hcube := Real.sin_ge_sub_cube hy0
    have hp1 := pi_gt_d2
    have hp2 := pi_lt_d2
    have hy2 : 13 * π / 72 < 5688 / 10000 := by linarith
    have hy3 : (13 * π / 72) ^ 3 < (5688 / 10000 : ℝ) ^ 3 :=
      pow_lt_pow_left₀ hy2 hy0 (by norm_num)
    have hc : (5688 / 10000 : ℝ) ^ 3 < 1841 / 10000 := by norm_num
    linarith
  have hsub := intermediate_value_Icc (a := 0) (b := π / 2) (by linarith)
    (continuous_dev hn 1).continuousOn
  have hmem : π + θ ∈ Set.Icc (dev 1 (19 / 10) 0) (dev 1 (19 / 10) (π / 2)) := by
    rw [h0, hhalf]; constructor <;> linarith [hθ.1, hθ.2]
  obtain ⟨i, hi, hDi⟩ := hsub hmem
  refine ⟨i, hi, ?_⟩
  rw [hDi, viewAngle_of_mem_Icc_pi_two_pi (by linarith [hθ.1]) (by linarith [hθ.2])]
  ring

/-- **The signed dark-band theorem holds at `n = 1.9`, yet a once-reflected ray
is seen inside the band.** Its first half is `dark_band_of_red_le` at `n = 1.9`;
its second half is `exists_once_reflected_seen_in_band`. The signed bound
`π - D₁ < 43°` is true but says nothing about the sky once `D₁ > π`. -/
theorem signed_gap_holds_but_ray_seen_in_band :
    (∀ i ∈ Set.Icc 0 (π / 2), π - dev 1 (19 / 10) i < 43 * π / 180) ∧
      ∃ i ∈ Set.Icc 0 (π / 2),
        viewAngle (dev 1 (19 / 10) i) ∈ Set.Icc (43 * π / 180) (50 * π / 180) :=
  ⟨fun _ hi => (dark_band_of_red_le (by norm_num) (by norm_num) hi).1,
    exists_once_reflected_seen_in_band⟩

/-- At `n = 1.1`, the grazing twice-reflected ray turns less than half a circle:
`D₂(π/2) = 3π - 6 arcsin (10/11) < π`, since `arcsin (10/11) > π/3`. -/
theorem dev_two_grazing_lt_pi : dev 2 (11 / 10) (π / 2) < π := by
  have hpi := pi_pos
  -- `π/3 < arcsin (10/11) ⇔ sin (π/3) = √3/2 < 10/11 ⇔ 3 < (20/11)²`
  have h : π / 3 < arcsin (10 / 11) := by
    rw [lt_arcsin_iff_sin_lt ⟨by linarith, by linarith⟩ ⟨by norm_num, by norm_num⟩,
      sin_pi_div_three, div_lt_iff₀ (by norm_num : (0 : ℝ) < 2), Real.sqrt_lt' (by norm_num)]
    norm_num
  have hr : refr (11 / 10) (π / 2) = arcsin (10 / 11) := by
    rw [refr, sin_pi_div_two]; norm_num
  unfold dev
  rw [hr]
  push_cast
  linarith

/-- At `n = 1.1`, the signed secondary reading `D₂ - π` of the grazing ray is
negative, so it is not the angle seen. Below the proved domain the signed secondary
colour order can even reverse in viewing angle (numerically, not proved: at
`nRed = 1.1`, `nViolet = 1.15` violet is seen at `13.7°` and red at `41.3°`). -/
theorem viewAngle_ne_signed_secondary :
    viewAngle (dev 2 (11 / 10) (π / 2)) ≠ dev 2 (11 / 10) (π / 2) - π := by
  have := viewAngle_nonneg (dev 2 (11 / 10) (π / 2))
  have := dev_two_grazing_lt_pi
  intro heq
  linarith

end Wyrd.Rainbow
