import WyrdMathlib.Rainbow.Colours
import WyrdMathlib.Rainbow.SpectrumPrimary
import WyrdMathlib.Rainbow.SpectrumSecondary

/-!
# Alexander's dark band, across the colours

For every refractive index `1.331 ≤ n < 2`, once-reflected rays have
`π - D < 43°` and twice-reflected rays have `D - π > 50°`
(`dark_band_of_red_le`). Red is the extreme colour at *both* edges: the primary
bow's outer edge and the secondary bow's inner edge are both red. So the red
bounds plus the colour ordering (`bowDev_strictMonoOn`) cover every bluer index.

The indices are inputs, not theorems. Relative to air (IAPWS 1997), `1.331` is
water at about 663 nm at 20 °C (693 nm at 10 °C) and `1.343` at about 402 nm
(410 nm). Redder light has `n < 1.331` and is not covered. Numerically, the 50°
edge fails below `n ≈ 1.3296` (about 726 nm at 20 °C): there, twice-reflected
rays of the deepest red do reach 43°–50°. Between `1.3296` and `1.331` the gap
persists, but no theorem here says so.

The bounds are on the signed angles. Read as angles seen from the antisolar
point, they hold for `1.331 ≤ n < 1.777` (numerically); from `n ≈ 1.777`,
grazing once-reflected rays have `π - D < 0` and are seen at `D - π ≥ 43°`.

The band is a gap in the once- and twice-reflected ray families, not an absence
of all light (geometric optics, point-like sun, brightness not modelled). Light
reflected off the outside of the drop, rays reflected three or more times,
diffraction and the sun's 0.5° disc all put some light there.
-/

namespace Wyrd.Rainbow

open Real

/-- **Red governs both edges**: for every index `1.331 ≤ n < 2`, once-reflected
rays have `π - D < 43°` and twice-reflected rays have `D - π > 50°` (signed
angles; as angles seen in the sky this holds for `n < 1.777`, numerically). -/
theorem dark_band_of_red_le {n i : ℝ} (hred : 1331 / 1000 ≤ n) (hn2 : n < 2)
    (hi : i ∈ Set.Icc 0 (π / 2)) :
    π - dev 1 n i < 43 * π / 180 ∧ 50 * π / 180 < dev 2 n i - π := by
  have hn1 : 1 < n := by linarith
  constructor
  · -- the primary bow is the minimum of the deviation at index `n`
    have hmin := isMinOn_iff.mp
      (dev_isMinOn (n := n) (k := 1) hn1 le_rfl (by push_cast; linarith)) i hi
    -- the bow's deviation is smallest for red, the smallest index
    have hmono : dev 1 (1331 / 1000) (bowIncidence 1 (1331 / 1000)) ≤
        dev 1 n (bowIncidence 1 n) :=
      (bowDev_strictMonoOn (k := 1) le_rfl).monotoneOn
        ⟨by norm_num, by norm_num⟩ ⟨hn1, by push_cast; linarith⟩ hred
    -- and red's primary bow is under 43°
    have := primary_red.2
    linarith
  · -- the secondary bow is the minimum of the deviation at index `n`
    have hmin := isMinOn_iff.mp
      (dev_isMinOn (n := n) (k := 2) hn1 (by norm_num) (by push_cast; linarith)) i hi
    -- the bow's deviation is smallest for red, the smallest index
    have hmono : dev 2 (1331 / 1000) (bowIncidence 2 (1331 / 1000)) ≤
        dev 2 n (bowIncidence 2 n) :=
      (bowDev_strictMonoOn (k := 2) (by norm_num)).monotoneOn
        ⟨by norm_num, by norm_num⟩ ⟨hn1, by push_cast; linarith⟩ hred
    -- and red's secondary bow is over 50°
    have := secondary_red.1
    linarith

/-- **Alexander's dark band, red to violet**: for every index from `1.331` (red)
to `1.343` (violet), the once- and twice-reflected ray families leave a gap
between 43° and 50°. -/
theorem dark_band_visible {n i : ℝ} (hn : n ∈ Set.Icc (1331 / 1000) (1343 / 1000))
    (hi : i ∈ Set.Icc 0 (π / 2)) :
    π - dev 1 n i < 43 * π / 180 ∧ 50 * π / 180 < dev 2 n i - π :=
  dark_band_of_red_le hn.1 (by linarith [hn.2]) hi

/-- At the indices `1.331` (red) and `1.343` (violet), red lies outside violet
in the primary bow and inside it in the secondary bow. -/
theorem water_colour_order :
    π - dev 1 (1343 / 1000) (bowIncidence 1 (1343 / 1000)) <
        π - dev 1 (1331 / 1000) (bowIncidence 1 (1331 / 1000)) ∧
      dev 2 (1331 / 1000) (bowIncidence 2 (1331 / 1000)) - π <
        dev 2 (1343 / 1000) (bowIncidence 2 (1343 / 1000)) - π :=
  -- red `1.331` < violet `1.343`, both in `(1, 2)`
  colour_order (by norm_num) (by norm_num) (by norm_num)

/-- **The primary bow's colours spread over more than 1°** (red outside violet). -/
theorem primary_spread :
    π / 180 < (π - dev 1 (1331 / 1000) (bowIncidence 1 (1331 / 1000))) -
      (π - dev 1 (1343 / 1000) (bowIncidence 1 (1343 / 1000))) := by
  -- red is above 42°, violet below 41°
  linarith [primary_red.1, primary_violet.2]

/-- **The secondary bow's colours spread over more than 2°** (violet outside red). -/
theorem secondary_spread :
    2 * π / 180 < (dev 2 (1343 / 1000) (bowIncidence 2 (1343 / 1000)) - π) -
      (dev 2 (1331 / 1000) (bowIncidence 2 (1331 / 1000)) - π) := by
  -- violet is above 53°, red below 51°
  linarith [secondary_violet.1, secondary_red.2]

end Wyrd.Rainbow
