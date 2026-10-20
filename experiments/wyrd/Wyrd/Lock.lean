import Wyrd.Euclid

/-!
# 250 = 37, on the 71-cycle

On the number line 250 and 37 are different numbers. On a *cycle* they need
not be. A clock with `T` hours shows the tick `n` as the phase `n % T`, and two
ticks show the same phase exactly when `T` divides their difference. For 250
and 37 the difference is `213 = 3 · 71`, so they coincide on the cycles of
length 1, 3, 71 and 213, and on no other. The prime cycles are 3 and 71: those
are the *keys*.

Two oscillators that tick with the same period and start together are *phase
locked*: whatever one shows at tick `n`, the other shows at every tick
`m ≡ n`. So, read on a 71-cycle, 250 *is* 37. Read on the line, it is not
(`not_on_the_line`): the equality lives on the cycle and nowhere else.

Paper proof of `locked_iff_dvd`: if `n % T = m % T` then `(n − m) % T = 0`, so
`T ∣ n − m`. Conversely if `n − m = T · k` then `n = m + T · k`, and adding a
multiple of `T` does not change the remainder. Everything else is this lemma
plus the arithmetic of the number 213.

Core Lean only (no Mathlib). `../wyrd-mathlib/WyrdMathlib/Lock.lean` restates
these facts with `ZMod`, `Nat.ModEq`, the Chinese remainder theorem, and the
complex exponential, where "same phase" means the same point on the unit circle.
-/

namespace Wyrd

/-- An oscillator of period `T` reads the tick `n` as the phase `n % T`. -/
def phase (T n : Nat) : Nat := n % T

/-- Two ticks are *locked* on the `T`-cycle when they show the same phase. -/
def Locked (T n m : Nat) : Prop := phase T n = phase T m

/-! ## The lock -/

/-- **On the 71-cycle, 250 is 37.** Both show the phase 37. -/
theorem lock : Locked 71 250 37 := by
  unfold Locked phase
  decide

/-- **The key is prime.** -/
theorem key_prime : IsPrime 71 := primeB_sound (by decide)

theorem three_prime : IsPrime 3 := primeB_sound (by decide)

theorem thirtyseven_prime : IsPrime 37 := primeB_sound (by decide)

/-- **The division algorithm reads `250 = 3 · 71 + 37`**, and the quotient, the
divisor and the remainder are all prime. -/
theorem three_primes : 250 = 3 * 71 + 37 ∧ IsPrime 3 ∧ IsPrime 71 ∧ IsPrime 37 :=
  ⟨rfl, three_prime, key_prime, thirtyseven_prime⟩

/-! ## Locking is divisibility -/

theorem Locked.symm {T n m : Nat} (h : Locked T n m) : Locked T m n := Eq.symm h

/-- **Phase lock is divisibility**: for `m ≤ n`, the ticks `n` and `m` are locked
on the `T`-cycle iff `T` divides `n − m`. -/
theorem locked_iff_dvd {T n m : Nat} (h : m ≤ n) : Locked T n m ↔ T ∣ n - m := by
  constructor
  · intro hl
    exact Nat.dvd_of_mod_eq_zero (Nat.sub_mod_eq_zero_of_mod_eq hl)
  · rintro ⟨k, hk⟩
    have hn : n = m + T * k := by omega
    unfold Locked phase
    rw [hn, Nat.add_mul_mod_self_left]

/-- The cycles on which 250 and 37 coincide are exactly the divisors of 213. -/
theorem lock_iff_dvd (T : Nat) : Locked T 250 37 ↔ T ∣ 213 :=
  locked_iff_dvd (by decide)

/-- The divisors of 213 are 1, 3, 71 and 213. Any divisor is at most 213, and the
kernel checks every candidate below that. -/
theorem dvd_213 (T : Nat) : T ∣ 213 ↔ T = 1 ∨ T = 3 ∨ T = 71 ∨ T = 213 := by
  constructor
  · intro h
    have hle : T ≤ 213 := Nat.le_of_dvd (by decide) h
    have hmod : 213 % T = 0 := Nat.mod_eq_zero_of_dvd h
    have key : ∀ t, t < 214 → 213 % t = 0 → t = 1 ∨ t = 3 ∨ t = 71 ∨ t = 213 := by
      decide +kernel
    exact key T (by omega) hmod
  · rintro (rfl | rfl | rfl | rfl)
    · exact ⟨213, rfl⟩
    · exact ⟨71, rfl⟩
    · exact ⟨3, rfl⟩
    · exact ⟨1, rfl⟩

/-- **The four cycles.** 250 and 37 are locked on the `T`-cycle iff
`T ∈ {1, 3, 71, 213}`. -/
theorem lock_periods (T : Nat) : Locked T 250 37 ↔ T = 1 ∨ T = 3 ∨ T = 71 ∨ T = 213 := by
  rw [lock_iff_dvd, dvd_213]

/-- **The only prime keys are 3 and 71.** A prime cycle locks 250 to 37 iff it
is one of these. The candidates 1 and 213 are not prime: 1 is too small, and
213 has the divisor 3. -/
theorem prime_keys (p : Nat) (hp : IsPrime p) : Locked p 250 37 ↔ p = 3 ∨ p = 71 := by
  rw [lock_periods]
  constructor
  · rintro (rfl | h | h | rfl)
    · exact absurd hp.1 (by decide)
    · exact Or.inl h
    · exact Or.inr h
    · exfalso
      rcases hp.2 3 ⟨71, rfl⟩ with h | h <;> omega
  · rintro (rfl | rfl)
    · exact Or.inr (Or.inl rfl)
    · exact Or.inr (Or.inr (Or.inl rfl))

/-! ## Honesty: only on the cycle -/

/-- **Not on the line.** `250 ≠ 37`, and no cycle longer than 213 can lock them:
a lock period divides 213, so it is at most 213. -/
theorem not_on_the_line : 250 ≠ 37 ∧ ∀ T, 213 < T → ¬ Locked T 250 37 := by
  refine ⟨by decide, fun T hT hl => ?_⟩
  have := Nat.le_of_dvd (by decide) ((lock_iff_dvd T).mp hl)
  omega

/-! ## Two prime cycles lock together: the Chinese remainder theorem for 3 and 71 -/

/-- Among the phases of the 213-cycle, the pair (phase on 3, phase on 71)
determines the phase. The kernel checks all `213 × 213` pairs. -/
theorem crt_finite :
    ∀ a, a < 213 → ∀ b, b < 213 → a % 3 = b % 3 → a % 71 = b % 71 → a = b := by
  decide +kernel

/-- **Locked on 213 iff locked on 3 and on 71.** Two coprime cycles lock jointly
exactly when each locks on its own. -/
theorem crt_213 (n m : Nat) : Locked 213 n m ↔ Locked 3 n m ∧ Locked 71 n m := by
  unfold Locked phase
  have h3n := Nat.mod_mod_of_dvd n (⟨71, rfl⟩ : 3 ∣ 213)
  have h3m := Nat.mod_mod_of_dvd m (⟨71, rfl⟩ : 3 ∣ 213)
  have h71n := Nat.mod_mod_of_dvd n (⟨3, rfl⟩ : 71 ∣ 213)
  have h71m := Nat.mod_mod_of_dvd m (⟨3, rfl⟩ : 71 ∣ 213)
  constructor
  · intro h
    exact ⟨by rw [← h3n, ← h3m, h], by rw [← h71n, ← h71m, h]⟩
  · rintro ⟨h3, h71⟩
    exact crt_finite _ (Nat.mod_lt n (by decide)) _ (Nat.mod_lt m (by decide))
      (by rw [h3n, h3m]; exact h3) (by rw [h71n, h71m]; exact h71)

/-! ## The stroboscope -/

/-- **A stroboscope flashing 71 times per turn cannot tell 250 from 37.**
Whatever the multiplier `k`, the ticks `250 k` and `37 k` show the same phase
on the 71-cycle, because `250 k − 37 k = 71 · 3 k`. -/
theorem strobe (k : Nat) : Locked 71 (250 * k) (37 * k) :=
  (locked_iff_dvd (Nat.mul_le_mul_right k (by decide))).mpr ⟨3 * k, by omega⟩

/-! ## The general fact: every gap of at least 2 has a key -/

/-- **Any two numbers at distance at least 2 lock on some prime cycle**: a prime
factor of their difference. 250 and 37 are one instance; theirs are 3 and 71. -/
theorem exists_prime_lock {n m : Nat} (h : m + 2 ≤ n) : ∃ p, IsPrime p ∧ Locked p n m := by
  obtain ⟨p, hp, hpd⟩ := exists_prime_dvd (n - m) (by omega)
  exact ⟨p, hp, (locked_iff_dvd (by omega)).mpr hpd⟩

/-- **Neighbours never lock**: no prime cycle shows `n + 1` and `n` as the same
phase, since the only divisor of 1 is 1. -/
theorem consecutive_never_lock (n p : Nat) (hp : IsPrime p) : ¬ Locked p (n + 1) n := by
  intro h
  have h1 : p ∣ 1 := by
    have := (locked_iff_dvd (Nat.le_add_right n 1)).mp h
    rwa [Nat.add_sub_cancel_left] at this
  have := Nat.le_of_dvd (by decide) h1
  have := hp.1
  omega

end Wyrd
