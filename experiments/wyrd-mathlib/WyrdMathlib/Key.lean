import Mathlib.NumberTheory.ArithmeticFunction.VonMangoldt
import Mathlib.NumberTheory.LucasPrimality
import Mathlib.NumberTheory.LSeries.PrimesInAP
import Mathlib.NumberTheory.DirichletCharacter.Basic
import Mathlib.Topology.Instances.AddCircle.Defs
import Mathlib.Tactic
import WyrdMathlib.Lock
import WyrdMathlib.SharedAir.Locking

/-!
# Why 71 is the key

`Lock.lean` says where `250 = 37` holds: on the cycles whose length divides
`213 = 3 · 71`, in `ZMod 71`, and in every ring whose characteristic divides
213. This file says why the two prime keys are the ones that matter, and what
else the key 71 does.

* **Chebyshev's identity** (`vonMangoldt_lock_sum`, `log_gap`): summed over
  the lock periods, the von Mangoldt function gives the logarithm of the gap:
  `Λ 1 + Λ 3 + Λ 71 + Λ 213 = log 213`, and `Λ 1 = Λ 213 = 0`, so the two
  prime keys carry the whole `log 213 = log 3 + log 71`. A gap has exactly one
  prime key iff it is a prime power (`one_key_iff`); 213 has two (`two_keys`).
* **A certificate that the key is prime** (`lucas_71`): `7 ^ 70 = 1` and
  `7 ^ 35 ≠ 1`, `7 ^ 14 ≠ 1`, `7 ^ 10 ≠ 1` in `ZMod 71` prove `Nat.Prime 71` by
  Lucas's test (1876), and make 7 a generator (`orderOf_seven`). The
  certificate is short to check; finding every prime key of a general pair
  means factoring the gap. That gap between checking and finding is the shape
  of the P versus NP question; nothing about it is decided here.
* **Multiplicatively the key refuses** (`pow_lock_71`): in `ZMod 71`,
  `a ^ 250 = a ^ 37` only for `a = 0` and `a = 1`, because `gcd 213 70 = 1`;
  in `ZMod 37`, where `gcd 213 36 = 3`, it holds exactly for the cube roots of
  1 (`pow_lock_37`, `cube_roots_37`).
* **Sampling** (`strobe_iff`, `strobe_iff_phase`): sampling the complex tone
  `exp (2πi f t)` at the times `n / T` for every integer `n`, both tones at
  phase 0 at time 0 (or at any common phase), the 250 Hz and the 37 Hz samples
  agree iff `T ∣ 213`. The real cosine is different (`cos_strobe_iff`): its
  samples agree iff `T ∣ 213` or `T ∣ 287 = 250 + 37 = 7 · 41`, because a
  cosine is two counter-rotating phasors and a rate dividing 287 folds 250 Hz
  onto −37 Hz; the real sine (`sin_strobe_iff`) agrees iff `T ∣ 213` or
  `T = 2`, where both are sampled at their zeros. The 213-oscillator is the
  product of the 3- and 71-oscillators (`osc_213_eq`), because
  `1/213 = 2/3 − 47/71`.
* **Rotations** (`rotation_eq`, `rotation_period`): on the circle `ℝ/ℤ`,
  rotating by `250/71` and by `37/71` is the same map, and every orbit has
  exactly 71 points.
* **Infinitely many primes in phase** (`exists_prime_in_phase`): for every `n`
  there is a prime `p > n` with `(p : ZMod 213) = 37`, which is `250` there.
  This is Dirichlet's theorem on primes in arithmetic progressions, a theorem
  of this Mathlib.
* **Every Dirichlet character modulo 71 agrees** (`dirichletCharacter_lock`):
  `χ 250 = χ 37`, so every `L`-function modulo 71 weighs the two alike.
* **Adler's equation at detuning 37** (`adler_37`): the averaged phase
  equation of `SharedAir/Locking.lean`, `φ' = Δ − k sin φ`, with
  `Δ = 2π · 37` (a 250 Hz oscillator against the third harmonic of a 71 Hz
  reference, `250 − 3 · 71 = 37`) has an equilibrium iff `k ≥ 2π · 37` and a
  stable one iff `k > 2π · 37`.

Nothing here is conditional on the Riemann Hypothesis or on any other open
problem; Dirichlet's theorem and Lucas's test are theorems in Mathlib.
-/

namespace Wyrd.Lock

open Complex Real ArithmeticFunction

/-! ## Chebyshev: the prime keys carry the logarithm of the gap -/

/-- The lock periods of `n` and `m` (for `m < n`) are the divisors of `n − m`. -/
theorem mem_divisors_iff_locked {n m : ℕ} (hmn : m < n) (T : ℕ) :
    T ∈ (n - m).divisors ↔ Locked T n m := by
  rw [Nat.mem_divisors, locked_iff_dvd hmn.le]
  exact ⟨fun h => h.1, fun h => ⟨h, by omega⟩⟩

/-- **Chebyshev's identity on the lock periods**: `∑ Λ T` over the lock periods
`T` of `n` and `m` is `log (n − m)`. -/
theorem vonMangoldt_lock_sum {n m : ℕ} (hmn : m < n) :
    ∑ T ∈ (n - m).divisors, Λ T = Real.log ((n - m : ℕ) : ℝ) := by
  have := hmn
  exact vonMangoldt_sum

/-- **A gap has exactly one prime key iff it is a prime power.** -/
theorem one_key_iff {n m : ℕ} (hmn : m < n) :
    (∃! p : ℕ, p.Prime ∧ Locked p n m) ↔ IsPrimePow (n - m) := by
  rw [isPrimePow_iff_unique_prime_dvd]
  simp only [locked_iff_dvd hmn.le]

/-- 213 has two prime keys, so it is not a prime power. -/
theorem two_keys : ¬ IsPrimePow 213 := by
  rw [isPrimePow_iff_unique_prime_dvd]
  rintro ⟨p, -, huniq⟩
  have h3 := huniq 3 ⟨by norm_num, by norm_num⟩
  have h71 := huniq 71 ⟨by norm_num, by norm_num⟩
  omega

/-- `Λ 213 = 0`. -/
theorem vonMangoldt_213 : Λ 213 = 0 := vonMangoldt_eq_zero_iff.mpr two_keys

/-- **The two prime keys carry the whole logarithm of the gap**:
`Λ 3 + Λ 71 = log 213`, the terms `Λ 1` and `Λ 213` being zero. -/
theorem log_gap : Λ 3 + Λ 71 = Real.log 213 := by
  have h := vonMangoldt_lock_sum (show 37 < 250 by norm_num)
  rw [show (250 : ℕ) - 37 = 213 by norm_num, divisors_213, Finset.sum_insert (by decide),
    Finset.sum_insert (by decide), Finset.sum_insert (by decide), Finset.sum_singleton,
    vonMangoldt_apply_one, vonMangoldt_213] at h
  norm_num at h
  linarith

/-- The same, as logarithms: `log 3 + log 71 = log 213`. -/
theorem log_gap' : Real.log 3 + Real.log 71 = Real.log 213 := by
  rw [show (213 : ℝ) = 3 * 71 by norm_num, Real.log_mul (by norm_num) (by norm_num)]

/-! ## The key is prime, with a certificate -/

theorem primeFactors_70 : Nat.primeFactors 70 = {2, 5, 7} := by
  rw [show (70 : ℕ) = 2 * 5 * 7 by norm_num, Nat.primeFactors_mul (by norm_num) (by norm_num),
    Nat.primeFactors_mul (by norm_num) (by norm_num), Nat.Prime.primeFactors (by norm_num),
    Nat.Prime.primeFactors (by norm_num), Nat.Prime.primeFactors (by norm_num)]
  rfl

/-- **Lucas's certificate for 71 with witness 7**: `7 ^ 70 = 1` in `ZMod 71`, and
`7 ^ (70 / q) ≠ 1` for each prime factor `q ∈ {2, 5, 7}` of 70. -/
theorem lucas_71 : Nat.Prime 71 := by
  refine lucas_primality 71 7 (by decide) ?_
  intro q hq hdvd
  have hmem : q ∈ Nat.primeFactors 70 := Nat.mem_primeFactors.mpr ⟨hq, hdvd, by norm_num⟩
  rw [primeFactors_70] at hmem
  simp only [Finset.mem_insert, Finset.mem_singleton] at hmem
  rcases hmem with rfl | rfl | rfl <;> decide

/-- The witness generates: `7` has order 70 in `ZMod 71`. -/
theorem orderOf_seven : orderOf (7 : ZMod 71) = 70 := by
  refine orderOf_eq_of_pow_and_pow_div_prime (by norm_num) (by decide) ?_
  intro q hq hdvd
  have hmem : q ∈ Nat.primeFactors 70 := Nat.mem_primeFactors.mpr ⟨hq, hdvd, by norm_num⟩
  rw [primeFactors_70] at hmem
  simp only [Finset.mem_insert, Finset.mem_singleton] at hmem
  rcases hmem with rfl | rfl | rfl <;> decide

/-- The witness's own oscillator `k ↦ 7 ^ k` has period 70, coprime to 213, so it does
not lock 250 to 37. -/
theorem seven_no_lock : (7 : ZMod 71) ^ 250 ≠ 7 ^ 37 := by decide

/-! ## Multiplicatively, the key refuses -/

/-- **In `ZMod 71`, `a ^ 250 = a ^ 37` only for `a = 0` and `a = 1`.** -/
theorem pow_lock_71 (a : ZMod 71) : a ^ 250 = a ^ 37 ↔ a = 0 ∨ a = 1 := by
  revert a
  decide

/-- In `ZMod 37`, where `gcd 213 36 = 3`, a nonzero `a` has `a ^ 250 = a ^ 37` iff `a ^ 3 = 1`. -/
theorem pow_lock_37 (a : ZMod 37) (ha : a ≠ 0) : a ^ 250 = a ^ 37 ↔ a ^ 3 = 1 := by
  revert a
  decide

/-- The cube roots of 1 in `ZMod 37` are 1, 10 and 26. -/
theorem cube_roots_37 (a : ZMod 37) : a ^ 3 = 1 ↔ a = 1 ∨ a = 10 ∨ a = 26 := by
  revert a
  decide

/-! ## Sampling -/

/-- **A sampler at rate `T` receives the same samples from the 250 Hz and the 37 Hz
tone iff `T ∣ 213`.** -/
theorem strobe_iff {T : ℕ} (hT : T ≠ 0) :
    (∀ n : ℤ, osc T (250 * n) = osc T (37 * n)) ↔ (T : ℤ) ∣ 213 := by
  constructor
  · intro h
    have h1 := (osc_eq_iff hT 250 37).mp (by simpa using h 1)
    simpa using h1
  · intro h n
    refine (osc_eq_iff hT _ _).mpr ?_
    rw [show (250 * n - 37 * n : ℤ) = 213 * n by ring]
    exact Dvd.dvd.mul_right h n

/-- **With a common initial phase `φ`, the same.** Starting both tones at phase `φ`
multiplies every sample by the same `exp (φ i)`, so nothing changes. -/
theorem strobe_iff_phase {T : ℕ} (hT : T ≠ 0) (φ : ℝ) :
    (∀ n : ℤ, osc T (250 * n) * exp (φ * I) = osc T (37 * n) * exp (φ * I)) ↔
      (T : ℤ) ∣ 213 := by
  simp only [mul_left_inj' (Complex.exp_ne_zero _)]
  exact strobe_iff hT

/-- **Real cosines at zero phase: the rates are those dividing 213 or 287.** A real cosine
is the sum of two counter-rotating phasors, so a rate `T` dividing `287 = 250 + 37 = 7 · 41`
folds the 250 Hz cosine onto the mirror image of the 37 Hz one. The mirror keys 7 and 41
belong to the real cosine only; the complex tone of `strobe_iff` does not have them. -/
theorem cos_strobe_iff {T : ℕ} (hT : T ≠ 0) :
    (∀ n : ℤ, Real.cos (2 * π * (250 * n) / T) = Real.cos (2 * π * (37 * n) / T)) ↔
      (T : ℤ) ∣ 213 ∨ (T : ℤ) ∣ 287 := by
  have hT' : (T : ℝ) ≠ 0 := by exact_mod_cast hT
  constructor
  · intro h
    obtain ⟨k, hk | hk⟩ := Real.cos_eq_cos_iff.mp (h 1)
    · left
      refine ⟨-k, ?_⟩
      have h3 : (37 : ℝ) - (k * T + 250) = 0 := by
        field_simp at hk
        linear_combination hk
      have h4 : ((213 : ℤ) : ℝ) = ((T * (-k) : ℤ) : ℝ) := by
        push_cast
        linarith
      exact_mod_cast h4
    · right
      refine ⟨k, ?_⟩
      have h3 : (37 : ℝ) - (k * T - 250) = 0 := by
        field_simp at hk
        linear_combination hk
      have h4 : ((287 : ℤ) : ℝ) = ((T * k : ℤ) : ℝ) := by
        push_cast
        linarith
      exact_mod_cast h4
  · rintro (⟨c, hc⟩ | ⟨c, hc⟩) n
    · have hc' : (213 : ℝ) = T * c := by exact_mod_cast hc
      have e : 2 * π * (250 * n) / T = 2 * π * (37 * n) / T + ((c * n : ℤ) : ℝ) * (2 * π) := by
        push_cast
        field_simp
        linear_combination n * hc'
      rw [e, Real.cos_add_int_mul_two_pi]
    · have hc' : (287 : ℝ) = T * c := by exact_mod_cast hc
      have e : 2 * π * (250 * n) / T = -(2 * π * (37 * n) / T) + ((c * n : ℤ) : ℝ) * (2 * π) := by
        push_cast
        field_simp
        linear_combination n * hc'
      rw [e, Real.cos_add_int_mul_two_pi, Real.cos_neg]

/-- **Real sines: the rates are those dividing 213, and 2.** At two samples per second
both sines are sampled at their zeros. There is no mirror key here: `sin x = sin y` needs
`x + y` to be an odd multiple of `π`, which `2π · 287 n / T` cannot be for every `n`. -/
theorem sin_strobe_iff {T : ℕ} (hT : T ≠ 0) :
    (∀ n : ℤ, Real.sin (2 * π * (250 * n) / T) = Real.sin (2 * π * (37 * n) / T)) ↔
      (T : ℤ) ∣ 213 ∨ T = 2 := by
  have hT' : (T : ℝ) ≠ 0 := by exact_mod_cast hT
  have hTz : (T : ℤ) ≠ 0 := by exact_mod_cast hT
  constructor
  · intro h
    obtain ⟨k, hk | hk⟩ := Real.sin_eq_sin_iff.mp (h 1)
    · left
      refine ⟨-k, ?_⟩
      have h3 : (37 : ℝ) - (k * T + 250) = 0 := by
        field_simp at hk
        linear_combination hk
      have h4 : ((213 : ℤ) : ℝ) = ((T * (-k) : ℤ) : ℝ) := by
        push_cast
        linarith
      exact_mod_cast h4
    · -- the first sample: `574 = (2k + 1) T`
      have e1 : (574 : ℤ) = (2 * k + 1) * T := by
        have h3 : (574 : ℝ) - (2 * k + 1) * T = 0 := by
          field_simp at hk
          linear_combination hk
        have h4 : ((574 : ℤ) : ℝ) = (((2 * k + 1) * T : ℤ) : ℝ) := by
          push_cast
          linarith
        exact_mod_cast h4
      obtain ⟨k', hk' | hk'⟩ := Real.sin_eq_sin_iff.mp (h 2)
      · -- the second sample on the first branch: `426 = −k' T`, so `T ∣ gcd 574 426 = 2`
        have e2 : (426 : ℤ) = T * (-k') := by
          have h3 : (74 : ℝ) - (k' * T + 500) = 0 := by
            field_simp at hk'
            linear_combination hk'
          have h4 : ((426 : ℤ) : ℝ) = ((T * (-k') : ℤ) : ℝ) := by
            push_cast
            linarith
          exact_mod_cast h4
        have d1 : (T : ℤ) ∣ 574 := ⟨2 * k + 1, by rw [e1]; ring⟩
        have d2 : (T : ℤ) ∣ 426 := ⟨-k', e2⟩
        have d3 : (T : ℤ) ∣ 2 := by
          have hg := Int.dvd_gcd d1 d2
          rw [show Int.gcd 574 426 = 2 by rfl] at hg
          exact_mod_cast hg
        have hle := Int.le_of_dvd (by norm_num) d3
        have hT12 : T = 1 ∨ T = 2 := by omega
        rcases hT12 with rfl | rfl
        · left
          norm_num
        · right
          rfl
      · -- the second sample on the mirror branch: `1148 = (2k' + 1) T`, which with
        -- `574 = (2k + 1) T` makes an odd number even
        exfalso
        have e2 : (1148 : ℤ) = (2 * k' + 1) * T := by
          have h3 : (1148 : ℝ) - (2 * k' + 1) * T = 0 := by
            field_simp at hk'
            linear_combination hk'
          have h4 : ((1148 : ℤ) : ℝ) = (((2 * k' + 1) * T : ℤ) : ℝ) := by
            push_cast
            linarith
          exact_mod_cast h4
        have h5 : ((2 * k' + 1) : ℤ) * T = (2 * (2 * k + 1)) * T := by linarith
        have h6 := mul_right_cancel₀ hTz h5
        omega
  · rintro (⟨c, hc⟩ | rfl) n
    · have hc' : (213 : ℝ) = T * c := by exact_mod_cast hc
      have e : 2 * π * (250 * n) / T = 2 * π * (37 * n) / T + ((c * n : ℤ) : ℝ) * (2 * π) := by
        push_cast
        field_simp
        linear_combination n * hc'
      rw [e, Real.sin_add_int_mul_two_pi]
    · have e1 : 2 * π * (250 * (n : ℝ)) / ((2 : ℕ) : ℝ) = ((250 * n : ℤ) : ℝ) * π := by
        push_cast
        ring
      have e2 : 2 * π * (37 * (n : ℝ)) / ((2 : ℕ) : ℝ) = ((37 * n : ℤ) : ℝ) * π := by
        push_cast
        ring
      rw [e1, e2, Real.sin_int_mul_pi, Real.sin_int_mul_pi]

/-- **The 213-oscillator is the product of the 3- and the 71-oscillator**, because
`1 / 213 = 2 / 3 − 47 / 71` (from `2 · 71 − 47 · 3 = 1`). -/
theorem osc_213_eq (t : ℤ) : osc 213 t = osc 3 (2 * t) * osc 71 (-47 * t) := by
  unfold osc
  rw [← Complex.exp_add]
  congr 1
  push_cast
  field_simp
  ring

/-! ## Rotations of the circle -/

/-- **Rotating the circle `ℝ/ℤ` by `250/71` and by `37/71` is the same map.** -/
theorem rotation_eq :
    ((250 / 71 : ℝ) : AddCircle (1 : ℝ)) = ((37 / 71 : ℝ) : AddCircle (1 : ℝ)) := by
  rw [show (250 / 71 : ℝ) = 37 / 71 + 1 + 1 + 1 by norm_num, AddCircle.coe_add_period,
    AddCircle.coe_add_period, AddCircle.coe_add_period]

/-- **Every orbit of that rotation has exactly 71 points**, since `gcd 37 71 = 1`. -/
theorem rotation_period : addOrderOf ((37 / 71 : ℝ) : AddCircle (1 : ℝ)) = 71 := by
  have h := AddCircle.addOrderOf_div_of_gcd_eq_one (p := (1 : ℝ)) (m := 37) (n := 71)
    (by norm_num) (by norm_num)
  convert h using 3
  push_cast
  ring

/-! ## Infinitely many primes in phase -/

/-- **For every `n` there is a prime `p > n` with `(p : ZMod 213) = 37`**, that is, a prime
in phase with 250 and 37 on the 213-cycle (Dirichlet's theorem). -/
theorem exists_prime_in_phase (n : ℕ) : ∃ p > n, p.Prime ∧ (p : ZMod 213) = 37 := by
  have hu : IsUnit ((37 : ℕ) : ZMod 213) := (ZMod.isUnit_iff_coprime 37 213).mpr (by norm_num)
  obtain ⟨p, hpn, hpp, heq⟩ := Nat.forall_exists_prime_gt_and_eq_mod hu n
  exact ⟨p, hpn, hpp, by simpa using heq⟩

/-- The first few: 37, 463, 1741. -/
example : Nat.Prime 463 ∧ (463 : ZMod 213) = 37 := ⟨by norm_num, by decide⟩

/-! ## Dirichlet characters -/

/-- **Every Dirichlet character modulo 71 agrees on 250 and 37.** -/
theorem dirichletCharacter_lock (χ : DirichletCharacter ℂ 71) : χ 250 = χ 37 := by
  rw [zmod_lock]

/-! ## Adler's equation at detuning 37 -/

/-- **The averaged phase equation with detuning `2π · 37` has an equilibrium iff
`k ≥ 2π · 37`, and a stable one iff `k > 2π · 37`**: `SharedAir.averaged_equilibrium_iff`
and `averaged_stable_equilibrium_iff` at `Δ = 2π · 37`. -/
theorem adler_37 {k : ℝ} (hk : 0 < k) :
    ((∃ φ : ℝ, 2 * π * 37 - k * Real.sin φ = 0) ↔ 2 * π * 37 ≤ k) ∧
      ((∃ φ : ℝ, 2 * π * 37 - k * Real.sin φ = 0 ∧ -(k * Real.cos φ) < 0) ↔ 2 * π * 37 < k) := by
  have h1 := SharedAir.averaged_equilibrium_iff (Δ := 2 * π * 37) hk
  have h2 := SharedAir.averaged_stable_equilibrium_iff (Δ := 2 * π * 37) hk
  rw [abs_of_pos (by positivity)] at h1 h2
  exact ⟨h1, h2⟩

end Wyrd.Lock
