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
* **Sampling** (`strobe_iff`): a sampler at rate `T` receives identical sample
  sequences from the 250 Hz and the 37 Hz tone iff `T ∣ 213`; and the
  213-oscillator is the product of the 3- and 71-oscillators (`osc_213_eq`),
  because `1/213 = 2/3 − 47/71`.
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
