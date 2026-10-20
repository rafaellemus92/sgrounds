import Mathlib.Data.ZMod.Basic
import Mathlib.Data.Nat.ModEq
import Mathlib.Data.Nat.PrimeFin
import Mathlib.NumberTheory.Divisors
import Mathlib.Algebra.CharP.Basic
import Mathlib.Analysis.SpecialFunctions.Complex.Log
import Mathlib.Analysis.SpecialFunctions.Trigonometric.Basic
import Mathlib.Tactic
import WyrdMathlib.Bridge
import Wyrd.Lock

/-!
# 250 = 37 on the 71-cycle, in Mathlib's words

`../../wyrd/Wyrd/Lock.lean` proves in core Lean that 250 and 37 show the same
phase on the 71-cycle (`Wyrd.lock`), that 71 is prime, and that 3 and 71 are
the only prime cycles on which they coincide. This file says the same things
with Mathlib's vocabulary and adds the parts that need real analysis:

* `zmod_lock` — in the ring `ZMod 71` the numerals `250` and `37` name one element;
* `locked_iff_modEq`, `locked_iff_zmod` — our `Locked` is `Nat.ModEq`, and equality in `ZMod`;
* `lock_periods'`, `prime_keys'` — the lock periods are `Nat.divisors 213` and the
  prime keys are `Nat.primeFactors 213 = {3, 71}`;
* `prime_lock_iff` — the **general theorem**: for a prime `p` and `m < n`,
  `n ≡ m [MOD p]` iff `p` is a prime factor of `n − m`;
* `ring_lock`, `field_lock` — in **any** ring, `250 = 37` iff the characteristic divides
  213; in a field, iff the characteristic is 3 or 71;
* `crt_lock` — coprime cycles lock jointly iff each locks (the Chinese remainder theorem);
* `osc_eq_iff` — for `T ≠ 0`, the sinusoidal oscillator `t ↦ exp (2π i t / T)` shows two
  integer ticks at the same point of the unit circle iff `T` divides their difference
  (at `T = 0` the map is constant), so the
  period-71 oscillator cannot tell 250 from 37 (`osc_lock`), nor `250 k` from `37 k`
  for any `k` (`strobe'`), while every oscillator of period above 213 can (`osc_ne_of_gt`).

Nothing here makes `250 = 37` in `ℕ`, `ℤ` or `ℝ`: `Wyrd.not_on_the_line` (`ℕ`), `int_ne`
(`ℤ`) and `real_ne` (`ℝ`) say so, and for the rings `ℤ` and `ℝ` `ring_lock` says why: their
characteristic, 0, does not divide 213.
-/

namespace Wyrd.Lock

open Complex Real

/-! ## The lock, in `ZMod` -/

/-- **In `ℤ/71ℤ`, 250 = 37.** -/
theorem zmod_lock : (250 : ZMod 71) = 37 := by decide

/-- **The key is prime**, in Mathlib's sense. -/
theorem key_prime' : Nat.Prime 71 := by norm_num

/-- Our `Locked` is Mathlib's `Nat.ModEq`: both say `n % T = m % T`. -/
theorem locked_iff_modEq (T n m : ℕ) : Locked T n m ↔ n ≡ m [MOD T] := Iff.rfl

/-- ... and equality of the casts into `ZMod T`. -/
theorem locked_iff_zmod (T n m : ℕ) : Locked T n m ↔ (n : ZMod T) = m := by
  rw [locked_iff_modEq, ZMod.natCast_eq_natCast_iff]

/-- The divisors of 213. -/
theorem divisors_213 : Nat.divisors 213 = {1, 3, 71, 213} := by decide

/-- **The lock periods are the divisors of 213.** -/
theorem lock_periods' (T : ℕ) : (250 : ZMod T) = 37 ↔ T ∈ Nat.divisors 213 := by
  rw [show (250 : ZMod T) = ((250 : ℕ) : ZMod T) by norm_cast,
    show (37 : ZMod T) = ((37 : ℕ) : ZMod T) by norm_cast, ← locked_iff_zmod, lock_iff_dvd,
    Nat.mem_divisors]
  simp

/-- The prime factors of 213 are 3 and 71. -/
theorem primeFactors_213 : Nat.primeFactors 213 = {3, 71} := by
  rw [show (213 : ℕ) = 3 * 71 by norm_num, Nat.primeFactors_mul (by norm_num) (by norm_num),
    Nat.Prime.primeFactors (by norm_num), Nat.Prime.primeFactors (by norm_num)]
  rfl

/-- **The general theorem.** For a prime `p` and `m < n`: `n ≡ m [MOD p]` iff `p` is a
prime factor of `n − m`. -/
theorem prime_lock_iff {p n m : ℕ} (hp : p.Prime) (hmn : m < n) :
    n ≡ m [MOD p] ↔ p ∈ (n - m).primeFactors := by
  rw [Nat.ModEq.comm, Nat.modEq_iff_dvd' hmn.le, Nat.mem_primeFactors]
  constructor
  · intro h
    exact ⟨hp, h, by omega⟩
  · rintro ⟨-, h, -⟩
    exact h

/-- **The only prime keys are 3 and 71**, for `Nat.Prime`. -/
theorem prime_keys' (p : ℕ) (hp : p.Prime) : (250 : ZMod p) = 37 ↔ p = 3 ∨ p = 71 := by
  have h := prime_lock_iff hp (show 37 < 250 by norm_num)
  rw [show (250 : ℕ) - 37 = 213 by norm_num, primeFactors_213] at h
  rw [show (250 : ZMod p) = ((250 : ℕ) : ZMod p) by norm_cast,
    show (37 : ZMod p) = ((37 : ℕ) : ZMod p) by norm_cast, ZMod.natCast_eq_natCast_iff, h]
  simp

/-- Agrees with the core-Lean statement through the bridge `isPrime_iff`. -/
example (p : ℕ) (hp : IsPrime p) : (250 : ZMod p) = 37 ↔ p = 3 ∨ p = 71 :=
  prime_keys' p ((isPrime_iff p).mp hp)

/-- **Any two numbers at distance at least 2 are equal in `ZMod p` for some prime `p`.** -/
theorem exists_prime_lock' {n m : ℕ} (h : m + 2 ≤ n ∨ n + 2 ≤ m) :
    ∃ p, p.Prime ∧ (n : ZMod p) = m := by
  rcases h with h | h
  · obtain ⟨p, hp, hpd⟩ := Nat.exists_prime_and_dvd (show n - m ≠ 1 by omega)
    exact ⟨p, hp, (locked_iff_zmod p n m).mp ((locked_iff_dvd (by omega)).mpr hpd)⟩
  · obtain ⟨p, hp, hpd⟩ := Nat.exists_prime_and_dvd (show m - n ≠ 1 by omega)
    exact ⟨p, hp, ((locked_iff_zmod p m n).mp ((locked_iff_dvd (by omega)).mpr hpd)).symm⟩

/-! ## Every ring at once -/

/-- **In any ring, `250 = 37` iff the characteristic divides 213.** The numerals agree
exactly when `213 = 0` there, and `ringChar` is the generator of the numbers that vanish. -/
theorem ring_lock (R : Type*) [Ring R] : (250 : R) = 37 ↔ ringChar R ∣ 213 := by
  rw [← sub_eq_zero, show (250 : R) - 37 = ((213 : ℕ) : R) by norm_num, ringChar.spec]

/-- **In a field, `250 = 37` iff the characteristic is 3 or 71.** A field's characteristic
is 0 or a prime; 0 does not divide 213, and the primes dividing it are 3 and 71. -/
theorem field_lock (K : Type*) [Field K] : (250 : K) = 37 ↔ ringChar K = 3 ∨ ringChar K = 71 := by
  rw [ring_lock]
  constructor
  · intro h
    rcases CharP.char_is_prime_or_zero K (ringChar K) with hp | h0
    · have hmem : ringChar K ∈ Nat.primeFactors 213 :=
        Nat.mem_primeFactors.mpr ⟨hp, h, by norm_num⟩
      rw [primeFactors_213] at hmem
      simpa using hmem
    · rw [h0] at h
      norm_num at h
  · rintro (h | h) <;> rw [h] <;> norm_num

/-- `ZMod 71` has characteristic 71, so `ring_lock` gives `zmod_lock` again. -/
example : (250 : ZMod 71) = 37 := by
  rw [ring_lock, ZMod.ringChar_zmod_n]
  norm_num

/-- **On the integer line, `250 ≠ 37`**: `ℤ` has characteristic 0, which does not divide 213. -/
theorem int_ne : (250 : ℤ) ≠ 37 := by norm_num

/-- **On the real line, `250 ≠ 37`**, for the same reason. -/
theorem real_ne : (250 : ℝ) ≠ 37 := by norm_num

/-! ## Chinese remainder: coprime cycles lock jointly iff each locks -/

/-- **Two coprime cycles lock jointly iff each locks on its own.** -/
theorem crt_lock {a b : ℕ} (hab : a.Coprime b) (n m : ℕ) :
    Locked (a * b) n m ↔ Locked a n m ∧ Locked b n m := by
  simp only [locked_iff_modEq]
  exact (Nat.modEq_and_modEq_iff_modEq_mul hab).symm

/-- The instance `3 · 71 = 213`, which `Wyrd.crt_213` checks by enumeration. -/
theorem crt_213' (n m : ℕ) : Locked 213 n m ↔ Locked 3 n m ∧ Locked 71 n m :=
  crt_lock (a := 3) (b := 71) (by norm_num) n m

/-! ## Oscillators -/

/-- A sinusoidal oscillator of period `T`, sampled at the integer tick `n`: its point on
the unit circle, `exp (2π i n / T)`. -/
noncomputable def osc (T : ℕ) (n : ℤ) : ℂ := exp (2 * π * I * n / T)

/-- **Phase lock is congruence.** For `T ≠ 0`, two ticks of the period-`T` oscillator land
on the same point of the circle iff `T` divides their difference. -/
theorem osc_eq_iff {T : ℕ} (hT : T ≠ 0) (n m : ℤ) : osc T n = osc T m ↔ (T : ℤ) ∣ n - m := by
  unfold osc
  have hT' : (T : ℂ) ≠ 0 := by exact_mod_cast hT
  rw [exp_eq_exp_iff_exists_int]
  constructor
  · rintro ⟨k, hk⟩
    refine ⟨k, ?_⟩
    -- clearing the denominator `T` and the common factor `2πi` leaves `n = m + T k`
    field_simp at hk
    have h5 : ((n - m : ℤ) : ℂ) = ((T * k : ℤ) : ℂ) := by
      push_cast
      linear_combination hk
    exact_mod_cast h5
  · rintro ⟨k, hk⟩
    refine ⟨k, ?_⟩
    have h1 : n = m + T * k := by linarith
    have h2 : (n : ℂ) = m + T * k := by exact_mod_cast h1
    rw [h2]
    field_simp

/-- **The period-71 oscillator cannot tell 250 from 37.** -/
theorem osc_lock : osc 71 250 = osc 71 37 :=
  (osc_eq_iff (by norm_num) 250 37).mpr ⟨3, by norm_num⟩

/-- **The stroboscope.** Nor can it tell `250 k` from `37 k`, for any integer `k`. -/
theorem strobe' (k : ℤ) : osc 71 (250 * k) = osc 71 (37 * k) :=
  (osc_eq_iff (by norm_num) _ _).mpr ⟨3 * k, by ring⟩

/-- **Only on the cycle.** Every oscillator of period above 213 tells them apart. -/
theorem osc_ne_of_gt {T : ℕ} (hT : 213 < T) : osc T 250 ≠ osc T 37 := by
  intro h
  have h1 := (osc_eq_iff (by omega) 250 37).mp h
  have h2 : (T : ℤ) ∣ 213 := by simpa using h1
  have := Int.le_of_dvd (by norm_num) h2
  omega

/-- The same lock for the real sine wave: `sin (2π · 250 / 71) = sin (2π · 37 / 71)`. -/
theorem sin_lock : Real.sin (2 * π * 250 / 71) = Real.sin (2 * π * 37 / 71) := by
  have : 2 * π * 250 / 71 = 2 * π * 37 / 71 + (3 : ℤ) * (2 * π) := by
    push_cast
    ring
  rw [this, Real.sin_add_int_mul_two_pi]

/-- ... and for the cosine. -/
theorem cos_lock : Real.cos (2 * π * 250 / 71) = Real.cos (2 * π * 37 / 71) := by
  have : 2 * π * 250 / 71 = 2 * π * 37 / 71 + (3 : ℤ) * (2 * π) := by
    push_cast
    ring
  rw [this, Real.cos_add_int_mul_two_pi]

end Wyrd.Lock
