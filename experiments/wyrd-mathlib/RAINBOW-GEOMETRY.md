# Rainbow: what is still assumed, and a plan to derive `dev` from geometry

Scope: `WyrdMathlib/Rainbow/Defs.lean` and `Viewing.lean` at the commit after `45663a9`, Lean v4.35.0, Mathlib tag `v4.35.0` (`56a0058`). All Mathlib paths below are under `.lake/packages/mathlib/Mathlib/`. Markdown only; no Lean file was written and nothing was built.

## 1. Assumed, not formalized

`dev k n i := k·π + 2i − 2(k+1)·arcsin (sin i / n)` is a definition. Everything that makes it *the* rainbow deviation is outside Lean. Only three theorems touch the physics at all: `snell` (Defs: `n·sin (refr n i) = sin i` for `n ≥ 1`, a check that the definition is consistent with Snell, not a derivation), `refr_le_self` (Viewing: bending towards the normal for `n ≥ 1`), and `viewAngle` plus `viewAngle_dev_one/two` (Viewing: the observed-angle bridge). `experiments/THEOREMS.md:1259` already records "geometric optics, a perfect sphere, one index n" as caveat.

| # | Assumption | Where it hides in `dev` | Lean touches it? | If false |
|---|---|---|---|---|
| A1 | The drop is a sphere; the ray path lies in one plane through the centre (the radius at every contact point lies in that plane, so reflection/refraction keep the ray in it). | The whole formula; also `b = sin i` as impact parameter. | No. | Non-spherical drops change `D` with shape (flattened large drops really do distort the bow). |
| A2 | Law of reflection at a circle: angle in = angle out, measured from the radius. | Each term `π − 2r`. | No. | Chain breaks; no fixed per-bounce turning. |
| A3 | Equal chords: every internal chord meets the circle at the same angle `r` (isosceles triangle with the centre), so the exit incidence is `r` and the exit angle is `i`. | The *same* `r` in all `k+2` events; the second `i − r`. | No. | Exit angle ≠ `i`; `D` would need a different `r` per bounce. |
| A4 | Snell with outside index exactly 1, inside `n`, in the form `sin i = n sin r`, principal (non-TIR) branch `r ∈ [−π/2, π/2]`. | `refr n i := arcsin (sin i / n)`. | `snell` checks the identity for `n ≥ 1`; `arcsin` fixes the branch. For `n < 1`, `arcsin` silently clamps and no theorem applies. | Different `r`, hence different bow angles. |
| A5 | No total internal reflection at exit. | Implicit: the exit term is always `i − r`. | No (it follows from A3 + `snell`: `sin(exit) = n sin r = sin i ≤ 1`, but that lemma does not exist). | Some rays would not exit after `k` bounces. |
| A6 | Each refraction turns the ray by `i − r`, each reflection by `π − 2r`, **all in the same rotational sense**, so turnings add. | The signs in `kπ + 2i − 2(k+1)r`. | No, but load-bearing for `Viewing.lean`: `viewAngle` reduces `D` mod `2π`, so a wrong sign convention would give a wrong observed angle. | A different sum, e.g. `i − r − (π − 2r) + …`. |
| A7 | `i ∈ [0, π/2]`; the mirror ray `−i` is its reflection in the sun–centre axis. | Every hypothesis `hi : i ∈ Set.Icc 0 (π/2)`. | No lemma states `dev k n (−i) = 2kπ − dev k n i` (3 lines via `Real.arcsin_neg`, `Real.sin_neg`); `viewAngle (−D) = viewAngle D` is proved (`viewAngle_neg`, Viewing.lean). | Nothing: it is a true symmetry, just unproved. |
| A8 | Parallel incident rays (point sun at infinity); the observer is far away, so only exit *directions* matter; the antisolar point is the direction `−d_in`; the bow is the cone of half-angle `viewAngle` by rotational symmetry about the sun–observer axis (3-D). | `viewAngle D = |π − (D mod 2π)|`. | `viewAngle` defines the planar reading; the 3-D cone and far-field identification are not in Lean. | Sun's 0.5° disc smears the bow; near drops have parallax. |
| A9 | Geometric optics (wavelength ≪ drop), one real index per colour, homogeneous drop with a sharp surface, no absorption, no Fresnel weights, no polarization, no external reflection. | `n` is a bare real; brightness absent. | No. | Supernumeraries, intensities, band darkness all outside the model. |
| A10 | "The `k`-bow ray" is the one that exits at the `(k+1)`-th contact: a choice of ray, not a law. | The parameter `k`. | No. | Nothing false; just a reminder that `k` indexes a family, not a physical outcome. |

What Lean does prove about `dev` is calculus on a real function: derivative, stationary point, minimum, numerical brackets, monotonicity in `n`, and the mod-`2π` bridge to `viewAngle`.

## 2. Derivation plan

**Setting.** Use `ℂ` as the plane and the unit circle as the drop (`EuclideanGeometry.Sphere ℂ := ⟨0, 1⟩`, `Geometry/Euclidean/Sphere/Basic.lean:54`, or simply `‖p‖ = 1`). The outward unit normal at a boundary point `p` is `p` itself; the inward normal is `−p`. Real inner product: `Complex.inner` (`Analysis/InnerProductSpace/Basic.lean:990`, `⟪w, z⟫_ℝ = (z * conj w).re`); the 2-D "cross product" is `Complex.areaForm` (`Analysis/InnerProductSpace/TwoDim.lean:510`, `= (conj w * z).im`). Oriented angles: `Complex.oangle` (`Geometry/Euclidean/Angle/Oriented/Basic.lean:525`, `Complex.orientation.oangle w z = Complex.arg (conj w * z)`), valued in `Real.Angle` (`Analysis/SpecialFunctions/Trigonometric/Angle.lean:32`, `AddCircle (2π)`). Working in `ℂ` avoids the `Fact (finrank ℝ V = 2)` / `Module.Oriented` plumbing that the `∡` notation needs (`Angle/Oriented/Affine.lean:16–20`).

**Definitions to add** (one new file, say `Rainbow/Geometry.lean`, importing `Defs`):

1. `reflTangent (q d : ℂ) : ℂ := d − 2 ⟪q, d⟫ • q` — reflection of a direction across the tangent line at unit `q`; for `‖q‖ = 1` this is `−q² · conj d`. Optional cross-check against Mathlib's `Submodule.reflection` on `(ℝ ∙ q)ᗮ` (`Analysis/InnerProductSpace/Projection/Reflection.lean:49`, `reflection_apply` :64) or the affine `EuclideanGeometry.reflection` (`Geometry/Euclidean/Projection.lean:418`); the tangent line itself is `Sphere.orthRadius` (`Sphere/OrthRadius.lean:41`), tangency is `Sphere.IsTangentAt` (`Sphere/Tangent.lean:64`).
2. `refractIn n N d` / `refractOut n N d`: keep the tangential component scaled by `1/n` (resp. `n`), choose the normal component by `√(1 − ·)` so the ray continues through the surface. This is vector Snell `n₁ (d × N) = n₂ (d' × N)`.
3. `inc (N d : ℂ) : Real.Angle := Complex.orientation.oangle (−N) d` — signed incidence, from the inward normal to the direction.
4. The next contact point: `Sphere.secondInter p d` (`Sphere/SecondInter.lean:44`; `secondInter_mem` :69, `secondInter_dist` :60).
5. The chain `path k n p₀ d₀ : Fin (k+3) → ℂ × ℂ` by recursion: refract in, then `k` times (`secondInter`, `reflTangent`), then refract out.
6. `turn d d' := Complex.orientation.oangle d d'`.

**Lemmas, in order.**

| # | Statement | Mathlib pieces |
|---|---|---|
| L1 | `reflTangent`, `refractIn`, `refractOut` preserve `‖·‖ = 1` (exit needs the no-TIR radicand `≥ 0`). | `Complex.norm_eq_abs`, `Real.sq_sqrt`. |
| L2 | Vector Snell: `n * areaForm N (refractIn n N d) = areaForm N d`; same side of the normal. | `Complex.areaForm`. |
| L3 | Refracted ray continues inward: `⟪N, refractIn n N d⟫ < 0`. | `Complex.inner`. |
| L4 | Entry turning: if `d₀ = −p · exp(θ·I)` with `θ ∈ [0, π/2]`, then `refractIn n p d₀ = −p · exp(θ'·I)` with `θ' = refr n θ`, and `turn d₀ d₁ = ↑(θ' − θ)`. | `Complex.arg_cos_add_sin_mul_I` (`Complex/Arg.lean:110`), `Complex.arg_mul_coe_angle` (:488), `Real.arcsin`/`Real.sin_arcsin`, `Real.Angle.coe_sub` (`Angle.lean:78`). |
| L5 | Equal chords: for unit `p`, `q = secondInter p d`, unit `d`: `d² = −p·q` (one-line identity `(q−p)² = −pq·|q−p|²`), hence `oangle (−p) d = oangle d q` and the outgoing chord after reflection is `−q · exp(r·I)` again. Alternative: pons asinorum `EuclideanGeometry.oangle_eq_oangle_of_dist_eq` (`Angle/Oriented/Affine.lean:308`) and the apex angle `oangle_eq_pi_sub_two_zsmul_oangle_of_dist_eq` (:316), or unoriented `angle_eq_angle_of_dist_eq` (`Geometry/Euclidean/Triangle.lean:280`). | as listed |
| L6 | Reflection turning: `turn d (reflTangent q d) = ↑(π + 2r) = −↑(π − 2r)` when `oangle d q = r`. | `Complex.arg_neg_coe_angle` (`Arg.lean:449`), `arg_mul_coe_angle`, `Real.Angle.coe_pi_add_coe_pi` (`Angle.lean:139`). |
| L7 | Self-similar chain: by induction every internal chord is `−q_j · exp(r·I)`; at the exit point the incidence is `r`, so `sin(exit) = sin i ≤ 1` (no TIR, uses `snell`) and the exit turning is `↑(r − i)`. | L4–L6, `snell`. |
| L8 | Turnings add: `turn d_in d_out = Σ_j turn d_j d_{j+1}` (all directions nonzero by L1). | `Orientation.oangle_add` (`Angle/Oriented/Basic.lean:445`), induction on `k`. |
| L9 | **Target.** `(dev k n i : Real.Angle) = turn d_out d_in` (equivalently `turn d_in d_out = −↑(dev k n i)`), with `i := (inc p d₀).toReal`. | `Real.Angle.coe_add`/`coe_nsmul`/`coe_zsmul` (`Angle.lean:70, 81, 84`). |
| L10 | Unwrapped real version: `dev k n i = −Σ_j (turn d_j d_{j+1}).toReal`, because each per-event turning lies in `(−π, π]`. | `Real.Angle.toReal_coe_eq_self_iff` (`Angle.lean:436`). |
| L11 | Glue to `Viewing.lean`: `(D : Real.Angle) = (D' : Real.Angle) → viewAngle D = viewAngle D'` (`viewAngle (−D) = viewAngle D` already exists as `viewAngle_neg`); so L9 alone justifies the observed angle. | `Real.Angle.angle_eq_iff_two_pi_dvd_sub` (`Angle.lean:99`), `viewAngle_add_two_pi`. |

Hand-checked sign bookkeeping (not Lean): with `inc` measured from the inward normal, entry gives `r − i`, each reflection `π + 2r ≡ −(π − 2r)`, exit `r − i`; total `≡ −D (mod 2π)`. So the sum is consistent and the formula's `D` is the turning in the opposite orientation. Because `viewAngle` is even (`viewAngle_neg`), the sign does not affect any observed-angle theorem, but it must be fixed before L9 is stated.

**Size.** One file, 10–12 public lemmas plus about 15 private ones, 500–650 lines; comparable to `Viewing.lean` plus `Bow.lean`. The `ℂ`-coordinate route (directions as `−q · exp(θ·I)`) is shorter than the affine `∡` route and needs no `Fact`/`Oriented` instances.

**Hardest steps.** (a) The orientation bookkeeping in L4/L6: `arcsin`'s branch must match `Complex.arg`'s range `(−π, π]`, and entry and reflection turnings must come out with the same sign. (b) L8's induction: the chain must be defined so that `p_{j+1} = secondInter p_j d_j` and `d_{j+1} = reflTangent p_{j+1} d_j` are definitional, and every `secondInter` output must be shown unit and distinct from `p_j` (it is, for `⟪p_j, d_j⟫ < 0`; cf. `Sphere.secondInter_eq_self_iff`, `SecondInter.lean:80`). (c) The exit radicand (no TIR) via L7. Not covered by this plan: the 3-D reduction (A1), brightness, and anything about which rays are seen.

Prior-art note (Mathlib only): `grep -rli "snell\|refract"` over the pinned Mathlib finds no optics; the geometric ingredients above all exist, the optical composition does not. This does not say anything about other libraries.

## 3. What may be claimed

Until L1–L9 exist and pass the axiom audit, "the geometry is formalized" must not be said. What is formalized today is the calculus of a given formula (derivative, minimum, brackets, monotonicity in `n`) plus the mod-`2π` bridge from that formula to a planar viewing angle. The sphere, the law of reflection, equal chords, the sign convention of the turnings and the no-TIR exit are assumptions A1–A6 above, each with zero Lean statements behind it except the consistency check `snell`. After L9 the honest claim becomes: "for a planar ray through the unit circle with these vector reflection and refraction maps, the oriented turning equals `dev k n i` mod `2π`" — still with A1 (planar reduction), A8 (far-field, 3-D cone) and A9 (geometric optics, one index, no brightness) assumed.
