import WyrdMathlib.Rainbow.Bow
import WyrdMathlib.Rainbow.Primary
import WyrdMathlib.Rainbow.Secondary

/-!
# Alexander's dark band

The sky between the two bows looks darker. Alexander of Aphrodisias described
it around 200 AD. These theorems give the geometric part of the explanation,
for water as `n = 4/3`:

* the bow is the *extreme* ray. Every ray that reflects once inside the drop
  has `π - D` at most the primary bow's value, under 43°: that ray family lies
  **inside** the primary bow;
* every ray that reflects twice has `D - π` at least the secondary bow's value,
  over 50°: that family lies **outside** the secondary bow;
* so the once- and twice-reflected ray families leave a gap between 43° and 50°.

The bounds are on the signed angles `π - D` and `D - π`; at `n = 4/3` these are
the angles seen from the antisolar point (numerically; see `Defs.lean`).
Brightness is not modelled. The band is a gap in these two ray families, not an
absence of all light: external reflection, rays reflected three or more times,
diffraction and the sun's disc still reach it.
-/

namespace Wyrd.Rainbow

open Real

/-- **Once-reflected rays lie inside the primary bow**: for `n = 4/3`, every
such ray has `π - D < 43°`. -/
theorem primary_light_inside {i : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) :
    π - dev 1 (4 / 3) i < 43 * π / 180 := by
  -- The bow is the minimum of the deviation, so it is the maximum of `π - D`.
  have hmin := isMinOn_iff.mp
    (dev_isMinOn (n := 4 / 3) (k := 1) (by norm_num) le_rfl (by norm_num)) i hi
  have := primary_bow_water.2
  linarith

/-- **Twice-reflected rays lie outside the secondary bow**: for `n = 4/3`,
every such ray has `D - π > 50°`. -/
theorem secondary_light_outside {i : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) :
    50 * π / 180 < dev 2 (4 / 3) i - π := by
  -- The bow is the minimum of the deviation, so it is the minimum of `D - π`.
  have hmin := isMinOn_iff.mp
    (dev_isMinOn (n := 4 / 3) (k := 2) (by norm_num) (by norm_num) (by norm_num)) i hi
  have := secondary_bow_water.1
  linarith

/-- **Alexander's dark band**: for `n = 4/3`, no ray with one or two internal
reflections has its signed angle (`π - D` or `D - π`) between 43° and 50°. -/
theorem alexander_dark_band {i θ : ℝ} (hi : i ∈ Set.Icc 0 (π / 2))
    (hθ : 43 * π / 180 ≤ θ ∧ θ ≤ 50 * π / 180) :
    π - dev 1 (4 / 3) i ≠ θ ∧ dev 2 (4 / 3) i - π ≠ θ := by
  have h1 := primary_light_inside hi
  have h2 := secondary_light_outside hi
  constructor <;> intro h <;> linarith [hθ.1, hθ.2]

end Wyrd.Rainbow
