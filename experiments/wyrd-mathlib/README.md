# wyrd-mathlib: our proofs, connected to Mathlib

A sister project to [`../wyrd`](../wyrd). It depends on both
[Mathlib](https://github.com/leanprover-community/mathlib4) (`v4.35.0`, the
same Lean version as `wyrd`) and on `wyrd` itself. `wyrd` stays core-Lean
only, so it builds without the 7 GB Mathlib download.

## What's here

| Theorem | Statement |
|---|---|
| `isPrime_iff` | Our `IsPrime` is exactly Mathlib's `Nat.Prime` |
| `setOf_prime_infinite` | Mathlib's "the primes form an infinite set", proved by **our** Euclid |
| `solution_primes` | The ten pangram primes are `Nat.Prime` |
| `irrational_sqrt_two` | `Irrational (√2)` for the real number, derived from **our** core-Lean descent proof |
| `bertrand` | Bertrand's postulate (a prime between `n` and `2n`) for our `IsPrime`, from Mathlib's `Nat.bertrand` |

Once the bridge exists, anything Mathlib knows about primes applies to our
results, and the reverse.

## The rainbow (`WyrdMathlib/Rainbow/`)

Descartes' theory of the rainbow, proved. Sunlight enters a spherical drop at
angle `i`, bends by Snell's law (`sin i = n sin r`), reflects `k` times inside,
and leaves, turned by `D(i) = kπ + 2i − 2(k+1)r`. The light piles up where `D`
is stationary, and that bright fold is the bow.

| Theorem | Statement |
|---|---|
| `snell` | The refraction angle really satisfies Snell's law |
| `hasDerivAt_dev` | `D'(i) = 2 − 2(k+1) cos i / √(n² − sin² i)` |
| `deriv_dev_eq_zero_iff_eq` | For `1 < n < k+1`, the **only** stationary point on `[0, π/2]` is where `cos² i = (n² − 1)/(k(k+2))` (Newton and Halley's formula) |
| `dev_lt_of_ne`, `dev_isMinOn` | It is the **strict minimum** of the deviation |
| `water_primary`, `water_secondary` | Water (`n = 4/3`): `cos² i = 7/27` (primary) and `7/72` (secondary) |
| `primary_bow_water` | The primary bow is seen between **41° and 43°** from the antisolar point (true value 42.03°) |
| `secondary_bow_water` | The secondary bow between **50° and 52°** (true value 50.98°) |
| `alexander_dark_band` | **No light** with one or two internal reflections leaves between 43° and 50°, which is why the sky between the bows is darker |
| `colour_order` | **Colours**: a larger index (violet) gives a smaller primary bow and a larger secondary bow, so red is outside in the primary and inside in the secondary |
| `primary_red`, `primary_violet` | Real water: primary bow at 42–43° for red (`n = 1.331`) and 40–41° for violet (`n = 1.343`) |
| `secondary_red`, `secondary_violet` | Secondary bow at 50–51° (red) and 53–54° (violet) |
| `primary_spread`, `secondary_spread` | The colours spread over more than 1° (primary) and more than 2° (secondary) |
| `dark_band_of_red_le` | Red governs both edges of the dark band, so it holds for **every** colour from red (`n ≥ 1.331`) up |

The numeric bounds need sin and cos to about four decimal places, and Mathlib's
bounds stop at degree 3, so `TrigBounds.lean` proves Taylor bounds to degree 7
(each from the previous one, by a derivative argument). The colour theorems use
water's index for red (`1.331`, about 663–694 nm) and violet (`1.343`, about
402–410 nm). The ordering needs no calculus in `n`: a larger index bends every
ray more, so the minimum deviation (the bow) grows too.

The "dark" band is *darker*, not black: the theorems exclude refracted light
reflected once or twice, while external reflection, higher-order bows,
diffraction and the sun's disc still put some light there.

## Body water (`WyrdMathlib/BodyWater/`)

The physiology of total body water, as theorems about simple models. These are
**for understanding, not dosing**; every file says what its model leaves out.
Newborn figures come from *Body Composition in the Fetus and Newborn: Effects of
Intrauterine Growth Aberration* (abdominalkey.com).

| Theorem | Statement |
|---|---|
| `dilution_recovers`, `dilution_overestimate` | Indicator dilution `V = I / C` works, and tracer lost before sampling always makes the volume look bigger, by `1/(1 − e)` (e.g. D₂O overstates TBW by about 4%) |
| `water_load_split`, `adult_water_load`, `newborn_water_load` | Free water spreads in proportion to effective osmoles: 2/3 into the cells for an adult, only 34/78 ≈ 43.6% for a term newborn |
| `isotonic_stays_extracellular` | Isotonic fluid whose solute stays out (0.9% saline) leaves cell water unchanged (iso-osmolar dextrose does not) |
| `solute_load_shrinks_cells` | Extra effective solute outside the cells shrinks them |
| `adrogue_madias` | From Edelman's relation: `v` litres at concentration `c` change sodium by `v(c − Na)/(W + v)` |
| `per_litre_scaling_underestimates` | Scaling the per-litre form `(c − Na)/(TBW + 1)` down to a small volume **underestimates** the model change; about 42% for 10 mL in a 3 kg newborn |
| `smaller_body_bigger_change_abs` | The same fluid moves sodium further, in either direction, in a smaller body |
| `free_water_deficit` | `W(Na/140 − 1)` litres of free water bring model sodium to 140 (a total, never a rate) |
| `water_fraction_falls` | Losing extracellular water after birth lowers the body's water fraction |
| `more_water_less_fat` | At equal fat-free-mass hydration, more water means less fat, consistent with term SGA (more water) and LGA (more fat) infants |

## 250 = 37 on the 71-cycle (`WyrdMathlib/Lock.lean`)

The core-Lean proof in [`../wyrd`](../wyrd) (`Wyrd/Lock.lean`) shows that 250
and 37 show the same phase on the 71-cycle, that 71 is prime, and that 3 and
71 are the only prime cycles on which they coincide. Here the same facts are
said in Mathlib's words, and the oscillator becomes a real one.

| Theorem | Statement |
|---|---|
| `zmod_lock`, `key_prime'` | In the ring `ZMod 71`, `250 = 37`; and `Nat.Prime 71` |
| `locked_iff_modEq`, `locked_iff_zmod` | Our `Locked` is `Nat.ModEq`, and equality of casts in `ZMod` |
| `lock_periods'` | `(250 : ZMod T) = 37` iff `T ∈ Nat.divisors 213 = {1, 3, 71, 213}` |
| `prime_lock_iff` | **General**: for a prime `p` and `m < n`, `n ≡ m [MOD p]` iff `p ∈ (n − m).primeFactors` |
| `prime_keys'` | For a prime `p`, `(250 : ZMod p) = 37` iff `p = 3` or `p = 71` |
| `exists_prime_lock'` | Any two numbers at distance ≥ 2 are equal in `ZMod p` for some prime `p` |
| `ring_lock`, `field_lock` | **In any ring**, `250 = 37` iff the characteristic divides 213; in a field, iff it is 3 or 71 |
| `int_ne`, `real_ne` | `(250 : ℤ) ≠ 37` and `(250 : ℝ) ≠ 37`: characteristic 0 does not divide 213 |
| `crt_lock` | **Chinese remainder**: coprime cycles lock jointly iff each locks |
| `osc_eq_iff` | **Phase lock is congruence**: for `T ≠ 0`, `exp (2πi n / T) = exp (2πi m / T)` iff `T ∣ n − m` |
| `osc_lock`, `strobe'` | The period-71 oscillator cannot tell 250 from 37, nor `250 k` from `37 k` |
| `osc_ne_of_gt` | Every oscillator of period above 213 can |
| `sin_lock`, `cos_lock` | `sin (2π · 250/71) = sin (2π · 37/71)`, and the same for `cos` |

Nothing here makes `250 = 37` in `ℕ`, `ℤ` or `ℝ`: the equality lives on the
cycles 1, 3, 71 and 213 and on no other (`lock_periods'`), and
`Wyrd.not_on_the_line`, `int_ne` and `real_ne` say it is not on the line.

### Why 71 is the key (`WyrdMathlib/Key.lean`)

| Theorem | Statement |
|---|---|
| `vonMangoldt_lock_sum`, `log_gap` | **Chebyshev**: `∑ Λ T` over the lock periods is `log (n − m)`; for 250 and 37, `Λ 3 + Λ 71 = log 213` (the terms at 1 and 213 vanish) |
| `one_key_iff`, `two_keys` | A gap has exactly one prime key iff it is a prime power; 213 has two |
| `lucas_71`, `orderOf_seven` | **Lucas's certificate**: `7⁷⁰ = 1` and `7³⁵, 7¹⁴, 7¹⁰ ≠ 1` in `ZMod 71` prove `Nat.Prime 71`, and 7 generates |
| `pow_lock_71`, `pow_lock_37` | Multiplicatively the key refuses: `a²⁵⁰ = a³⁷` in `ZMod 71` only for `a ∈ {0, 1}`; in `ZMod 37` for nonzero `a` iff `a³ = 1` |
| `strobe_iff` | A sampler at rate `T` gets identical samples from the 250 Hz and 37 Hz tones iff `T ∣ 213` |
| `osc_213_eq` | The 213-oscillator is the product of the 3- and 71-oscillators: `1/213 = 2/3 − 47/71` |
| `rotation_eq`, `rotation_period` | On `ℝ/ℤ`, rotating by `250/71` and by `37/71` is one map, with orbits of exactly 71 points |
| `exists_prime_in_phase` | **Dirichlet**: for every `n` there is a prime `p > n` with `(p : ZMod 213) = 37` |
| `dirichletCharacter_lock` | Every Dirichlet character modulo 71 has `χ 250 = χ 37` |
| `adler_37` | The averaged phase equation of `SharedAir/Locking.lean` at detuning `2π · 37` has an equilibrium iff `k ≥ 2π · 37`, a stable one iff `k > 2π · 37` |

Chebyshev's identity, Lucas's test and Dirichlet's theorem are Mathlib's;
the Millennium problems are inspiration only, and nothing here is conditional
on the Riemann Hypothesis or decides anything about P versus NP: Lucas's
certificate is quick to check, while listing every prime key of a general pair
means factoring the gap.

## Running it

```sh
cd experiments/wyrd-mathlib
lake exe cache get          # download Mathlib's prebuilt files (~3 min, ~7 GB)
lake build
lake env lean Audit.lean    # axioms used: no sorry, no native_decide
```

Skipping `cache get` means building Mathlib from source, which takes hours.
