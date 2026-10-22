# Theorems in the sgrounds Lean project

For every theorem the project proves, this file gives the exact Lean statement, its meaning in plain English, and the
closest known result. Each theorem is sorted into one of three groups: established mathematics, new formalizations,
and genuinely unresolved claims. A separate section lists the computer searches.

**Scope.** The file covers two lines of work. Both build with green CI.

- `claude/prime-proof-250-37-uysci8` at `2a1daf2` (this branch): the core Lean project `experiments/wyrd`, the
  Mathlib project `experiments/wyrd-mathlib`, and the 250 = 37 files (`Wyrd/Lock.lean`, `WyrdMathlib/Lock.lean`,
  `WyrdMathlib/Key.lean`).
- `claude/new-session-sbrl43` at `dcc29e2` (not merged): Periodic Navier–Stokes, Limits, the full Shared Air
  development and `experiments/ns-phase-audit`.

Entries marked "new-session branch only" give paths on that branch. Entries marked "both branches" are byte-identical
on both and are built on both. In the entries, NS abbreviates Navier–Stokes.

**How it was checked** (21–22 October 2026).

- **Build.** The new-session branch was rebuilt from scratch.
- **Axioms.** `#print axioms` was run on every theorem in the four `Audit.lean` files: 136 + 14 on new-session, 81 + 27
  here. They use only `propext`, `Classical.choice` and `Quot.sound`. None uses `sorryAx` or `Lean.ofReduceBool`.
- **Counting.** Every `theorem` and `lemma` declaration was counted by grep: 675 in all. Of these, 654 are proved and
  built. The other 21 are drafts on this branch that still contain `sorry` and are not imported. The new-session branch
  proves all 21 with identical statements.
- **Review.** Each group of files was read by one agent and then re-checked by an independent adversarial reviewer. The
  reviewer checked:
  - that nothing was missed;
  - that statements are verbatim;
  - that the English does not say more than the Lean;
  - a fresh Mathlib search for each theorem;
  - vacuous or trivially satisfiable hypotheses.
- **Audit.** A third pass checked every literature citation (17 were corrected). It also re-tested every
  "unresolved claim" against the README text and the Lean, recomputing numbers where a finding rested on them. One
  finding was refuted and dropped.

**Classification rule.** Each theorem goes in exactly one group, by what the project adds.

- **Established**: Mathlib already has the theorem, or it is a direct instance of Mathlib lemmas or a numeric check
  about standard objects. "In Mathlib" means a grep of the pinned Mathlib (v4.35.0) source found it.
- **New formalization**: proved without `sorry` and not in Mathlib as stated. It is either a known published result
  that Mathlib lacks ("classical"), or a fact about this project's own definitions and models ("project").
- **Unresolved**: not established by a proof. This covers `sorry` drafts, prose with no matching theorem, results
  that rest on numerics, conditions that are never discharged, and English that says more than the Lean.

## The short answer

- **No theorem here is new mathematics.** Every extractor and every adversarial reviewer looked for a statement that
  is neither implied by a known result nor a routine consequence of the definitions. None survived.
- **Established mathematics (171 theorems).** Most are numeric instances and restatements of Mathlib. This includes
  59 of the 62 theorems behind 250 = 37. That identity holds exactly in the sense that 213 = 3 · 71 divides
  250 − 37. Every other reading in those files follows from this: congruence modulo 3, 71 or 213, equality in
  `ZMod 213`, rings of characteristic dividing 213, complex tones sampled at rates dividing 213, and Dirichlet
  characters mod 71.
- **New formalizations (483 theorems).**
  - 58 are known results that Mathlib does not have (section 2a).
  - 425 are facts about the project's own objects (section 2b). 235 of these concern the prime-pangram encoding and its
    kernel-checked minimality search, and 188 of those are generated table rows.
- **Unresolved.** No Lean statement is left open once the two branches are combined: the 21 `sorry` drafts here are
  proved on new-session. What remains open is the prose. Section 3b lists the claims made around the theorems that
  no theorem proves, sorted by kind.

## Where the work adds something beyond known results

1. **A machine-checked theory of the rainbow** (`WyrdMathlib/Rainbow`, both branches). It covers:
   - the deviation of a ray after k internal reflections, its derivative, and the unique stationary ray
     cos² i = (n² − 1)/(k(k+2)), which is a strict global minimum on [0, π/2] (`dev_lt_of_ne`). This is Newton and
     Halley's general rule;
   - the 42° and 51° bows for n = 4/3;
   - Alexander's dark band, for n = 4/3 (`alexander_dark_band`) and for every index from red (1.331) up to 2
     (`dark_band_of_red_le`);
   - Newton's colour order (`colour_order`).

   The mathematics dates from 1637–1704. A web search found no earlier machine-checked proof in any proof assistant.
2. **Small gaps in Mathlib filled.** These are candidates for upstreaming:
   - one-sided Taylor bounds of degree 4–7 for sin and cos on x ≥ 0 (`Rainbow/TrigBounds.lean`);
   - Grönwall's inequality with a variable coefficient (`PeriodicNS/Gronwall.lean`, new-session);
   - the Routh–Hurwitz test for cubics (`Limits/Bistability.lean`: `cubic_hurwitz`, new-session);
   - orthogonality of real trigonometric polynomials on the 3-torus, and the Fourier-orthogonality lemma behind
     first-order resonance averaging (`resonant_average_vanishes`).
3. **A kernel-checked exhaustive search.** 4296 is the smallest sum for which a five-pair prime pangram exists under
   the coupled base-26 naming rule (`smallest_pangram_sum`, with the 188 table theorems). The fact is new because the
   puzzle is new. It is a finite computation, but every candidate list is recomputed inside the proof rather than
   trusted.
4. **Exact values for an explicit Navier–Stokes initial field** (new-session). For the four-mode family u_φ, the
   project proves E = 1, Z = 5/4, D = 7/2 and S = cos φ / 4 (`quantities_vphi`). So the triad phase alone sets the
   vortex stretching while the energy, enstrophy and palinstrophy stay fixed. This is a proved instance of a known
   principle. The same files prove two counterexamples:
   - no exact closure S − νD = Φ(E, Z, D, ν) (`no_closure`);
   - a fitted power law S ≲ Z^0.75 D^0.2 fails at fixed energy (`fitted_law_fails`).

   These are statements about given fields at one instant. None concerns Navier–Stokes solutions, and nothing here
   bears on the Millennium problem.
5. **Clinical and model algebra.**
   - Proved: the Adrogué–Madias sodium formula, the free-water deficit, and the 2/3–1/3 split of a water load
     (`BodyWater`, both branches).
   - For the Shared Air model at zero delay: a unique best coupling g* (`optimal_coupling`) and the stability
     threshold g_c = 15/8 + √2265/24 (`stable_iff`, new-session).

   These are routine mathematics, made exact.

Items 1–3 are the strongest. Items 1 and 2 add formal proofs of known mathematics that did not have them. Item 3 is
a new fact about a new object.

## Corrections this check found in the project's own prose

All are listed in section 3b. The ones that matter most:

- **Limits README: two different equilibria are conflated.**
  - The row says the second state "appears by g = 2.1, and at g = 3 it is linearly stable".
  - The equilibrium that `coarousal_exists_above_two` certifies at g = 2.1 (y ∈ [1.3, 1.4]) is the saddle branch, with
    eigenvalue ≈ +0.0127. The stable state at g = 2.1 (y ≈ 1.726) is not certified, and no theorem links it to the
    stable equilibrium at g = 3.
- **Prime-26: the 2 × 10¹¹ headline is not a total.** The estimate covers only pangrams whose words have at most 5
  letters. Nothing bounds the pangrams that use a 6-letter word.
- **Rainbow: the dark band needs an index condition.** It is proved for n = 4/3 and for 1.331 ≤ n < 2. In the same
  model the secondary bow drops below 50° for n < 1.3296, the deepest visible red, so "no light between 43° and 50°"
  needs that qualifier.
- **250 = 37: some prose outruns the Lean.**
  - Prose about "every L-function mod 71", "7 generates (ZMod 71)ˣ", "orbits of 71 points" and Adler locking goes beyond
    what is proved.
  - The `strobe_iff` docstring still says "tone" without "complex". For real cosines the rates 7, 41 and 287 also work
    (`cos_strobe_iff`).
- **Navier–Stokes: static quantities read as time behaviour.** The ns-phase-audit README lists "zero initial growth
  at φ = π/3" as proved. What Lean proves is that the static quantity S − νD is 0 for that field at t = 0. Reading it
  as dZ/dt(0) = 0 needs the enstrophy balance and local existence of solutions, and neither is formalised.


## Counts by area

Theorem counts (a family entry counts every theorem in it). "Unresolved" Lean entries are drafts that contain `sorry`; unresolved claims without any Lean declaration are counted separately in the last column.

| Area | Established | New formalization | Unresolved (sorry/WIP) | Claims without a proof |
|---|---:|---:|---:|---:|
| Core wyrd: pangram encoding, primes, √2, minimality search; Mathlib bridge | 20 | 235 | 0 | 6 |
| 250 = 37 phase lock and the mirror keys (prime-proof branch) | 59 | 3 | 0 | 12 |
| Rainbow geometry (Descartes, Alexander’s dark band, spectrum) | 21 | 52 | 0 | 11 |
| Body-water physiology models and Limits models | 19 | 64 | 0 | 19 |
| Periodic Navier–Stokes I: the phase family, symmetries, selection rules, averages | 20 | 40 | 0 | 18 |
| Periodic Navier–Stokes II: scaling, blow-up rescalings, sign flip, Galerkin, Grönwall, quantifiers | 24 | 32 | 0 | 13 |
| Shared Air feedback model | 8 | 57 | 0 | 11 |
| Computer searches, numerics and leftover WIP | 0 | 0 | 21 | 9 |
| **Total** | **171** | **483** | **21** | **99** |


## 1. Established mathematics

Known results where this project adds no new formal content: Mathlib already states them, or they are a direct instance or a numeric check about standard objects. They are still worth learning; they are not new.


### 1a. Already in Mathlib

Mathlib proves the same statement or a trivially equivalent one; the project re-proves or restates it.


#### Core wyrd: pangram encoding, primes, √2, minimality search; Mathlib bridge

- **`Wyrd.ofDigits_digits`** · `experiments/wyrd/Wyrd/Encoding.lean:47` · both branches
  - Lean: `(n : Nat) : ofDigits (digits n) = n`
  - Means: For every n ∈ ℕ, writing n in base 26 (least-significant digit first) and reading the digits back gives n.
  - Closest known: Mathlib Nat.ofDigits_digits (b n : ℕ) : ofDigits b (digits b n) = n, at b = 26.
  - In Mathlib: yes: Nat.ofDigits_digits
  - Caveat: Stated for the project's core-Lean reimplementations Wyrd.digits/Wyrd.ofDigits; that these agree with Nat.digits 26/Nat.ofDigits 26 is true but is not proved anywhere in the project (the bridge relates only IsPrime).
- **`Wyrd.digits_lt`** · `experiments/wyrd/Wyrd/Encoding.lean:61` · both branches
  - Lean: `(n : Nat) : ∀ d ∈ digits n, d < 26`
  - Means: Every base-26 digit of n ∈ ℕ is less than 26.
  - Closest known: Mathlib Nat.digits_lt_base (hb : 1 < b) (hd : d ∈ digits b m) : d < b.
  - In Mathlib: yes: Nat.digits_lt_base
  - Caveat: For the project's reimplementation Wyrd.digits (agreement with Nat.digits 26 not proved in the project).
- **`Wyrd.length_digits_le`** · `experiments/wyrd/Wyrd/Encoding.lean:77` · both branches
  - Lean: `{n k : Nat} (h : n < 26 ^ k) : (digits n).length ≤ k`
  - Means: A natural number below 26^k has at most k base-26 digits.
  - Closest known: Mathlib Nat.digits_length_le_iff (hb : 1 < b) n : (b.digits n).length ≤ k ↔ n < b ^ k (one direction, b = 26).
  - In Mathlib: yes: Nat.digits_length_le_iff
  - Caveat: For the project's reimplementation Wyrd.digits; only the ← direction of Mathlib's iff.
- **`Wyrd.IsPrime.odd`** · `experiments/wyrd/Wyrd/Parity.lean:22` · both branches
  - Lean: `{p : Nat} (hp : IsPrime p) (h2 : p ≠ 2) : p % 2 = 1`
  - Means: Every prime p ∈ ℕ other than 2 is odd (p mod 2 = 1).
  - Closest known: Mathlib Nat.Prime.mod_two_eq_one_iff_ne_two (hp : p.Prime) : p % 2 = 1 ↔ p ≠ 2 (Data/Nat/Prime/Basic.lean:121); its .mpr is this statement for Nat.Prime. See also Nat.Prime.eq_two_or_odd (Basic.lean:41) and Nat.Prime.odd_of_ne_two (Basic.lean:103).
  - In Mathlib: yes: Nat.Prime.mod_two_eq_one_iff_ne_two (.mpr), transported via Wyrd.isPrime_iff
  - Caveat: For Wyrd.IsPrime, which Bridge.isPrime_iff proves equivalent to Nat.Prime.
- **`Wyrd.fact_pos`** · `experiments/wyrd/Wyrd/Euclid.lean:24` · both branches
  - Lean: `∀ n, 0 < fact n`
  - Means: The project's factorial fact n is positive for every n ∈ ℕ.
  - Closest known: Mathlib Nat.factorial_pos.
  - In Mathlib: yes: Nat.factorial_pos
  - Caveat: Stated for the project's own Wyrd.fact (same recursion as Nat.factorial); equality with Nat.factorial is not proved in the project.
- **`Wyrd.dvd_fact`** · `experiments/wyrd/Wyrd/Euclid.lean:30` · both branches
  - Lean: `∀ {k n : Nat}, 1 ≤ k → k ≤ n → k ∣ fact n`
  - Means: Every k with 1 ≤ k ≤ n divides n!.
  - Closest known: Mathlib Nat.dvd_factorial : 0 < m → m ≤ n → m ∣ n !.
  - In Mathlib: yes: Nat.dvd_factorial
  - Caveat: For the project's Wyrd.fact (not formally identified with Nat.factorial).
- **`Wyrd.exists_prime_dvd`** · `experiments/wyrd/Wyrd/Euclid.lean:41` · both branches
  - Lean: `∀ m, 2 ≤ m → ∃ p, IsPrime p ∧ p ∣ m`
  - Means: Every natural number m ≥ 2 has a prime divisor.
  - Closest known: Mathlib Nat.exists_prime_and_dvd {n} (hn : n ≠ 1) : ∃ p, Prime p ∧ p ∣ n (slightly stronger: also covers 0).
  - In Mathlib: yes: Nat.exists_prime_and_dvd
  - Caveat: For Wyrd.IsPrime (equivalent to Nat.Prime by isPrime_iff). Re-proved in core Lean by strong induction.
- **`Wyrd.exists_prime_gt`** · `experiments/wyrd/Wyrd/Euclid.lean:64` · both branches
  - Lean: `(n : Nat) : ∃ p, n < p ∧ IsPrime p`
  - Means: For every n ∈ ℕ there is a prime p > n (Euclid's argument via a prime factor of n! + 1).
  - Closest known: Euclid, Elements IX.20; Mathlib Nat.exists_infinite_primes (n ≤ p form, same n!+1 proof).
  - In Mathlib: yes: Nat.exists_infinite_primes
  - Caveat: Mathlib's version has n ≤ p; trivially equivalent (apply at n+1). For Wyrd.IsPrime.
- **`Wyrd.primes_infinite`** · `experiments/wyrd/Wyrd/Euclid.lean:77` · both branches
  - Lean: `¬ ∃ B, ∀ p, IsPrime p → p ≤ B`
  - Means: No natural number B bounds all primes, i.e. there are infinitely many primes.
  - Closest known: Euclid; Mathlib Nat.not_bddAbove_setOfPred_prime : ¬BddAbove {p | Prime p}.
  - In Mathlib: yes: Nat.not_bddAbove_setOfPred_prime
  - Caveat: Core-Lean re-proof for Wyrd.IsPrime.
- **`Wyrd.eq_zero_of_mul_self_eq_two_mul`** · `experiments/wyrd/Wyrd/Sqrt2.lean:26` · both branches
  - Lean: `∀ a b : Nat, a * a = 2 * (b * b) → b = 0`
  - Means: For a, b ∈ ℕ, a² = 2b² forces b = 0 (proved by infinite descent / strong induction on a).
  - Closest known: Irrationality of √2 (Pythagorean; Euclid X / Hardy & Wright Thm 43); Mathlib irrational_sqrt_two.
  - In Mathlib: partial: irrational_sqrt_two, stated for the real √2 rather than as an equation in ℕ; equivalent by clearing denominators
  - Caveat: Whole-number form (ℕ). Mathlib has no ℕ/ℤ equation form: a grep for a²=2b²-style statements and sq_ne_two variants found none. The in_mathlib label rests on a few-line equivalence with irrational_sqrt_two. The project itself proves the ℕ→ℝ direction in WyrdMathlib/Sqrt2 (Wyrd.irrational_sqrt_two); the converse is about five lines in Mathlib.
- **`Wyrd.no_fraction_squares_to_two`** · `experiments/wyrd/Wyrd/Sqrt2.lean:56` · both branches
  - Lean: `¬ ∃ a b : Nat, b ≠ 0 ∧ a * a = 2 * (b * b)`
  - Means: There are no a, b ∈ ℕ with b ≠ 0 and a² = 2b².
  - Closest known: Irrationality of √2; Mathlib irrational_sqrt_two.
  - In Mathlib: partial: irrational_sqrt_two, real-number form; this is the ℕ form
  - Caveat: Only nonnegative numerators/denominators in ℕ (README says 'whole-number form', so no overclaim).
- **`Wyrd.isPrime_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Bridge.lean:21` · both branches
  - Lean: `(n : ℕ) : IsPrime n ↔ n.Prime`
  - Means: For every n ∈ ℕ, the project's core-Lean predicate Wyrd.IsPrime n (2 ≤ n and every divisor is 1 or n) is equivalent to Mathlib's Nat.Prime n.
  - Closest known: Mathlib Nat.prime_def : Prime p ↔ 2 ≤ p ∧ ∀ m, m ∣ p → m = 1 ∨ m = p (Data/Nat/Prime/Defs.lean:98); the proof is Nat.prime_def.symm.
  - In Mathlib: yes: Nat.prime_def
  - Caveat: This is the only core definition the Bridge identifies with a Mathlib one. Wyrd.fact, Wyrd.digits and Wyrd.ofDigits are not proved equal to Nat.factorial, Nat.digits 26 and Nat.ofDigits 26. Core wyrd uses Lean core's Nat, which is Mathlib's ℕ, so no Nat bridge is needed.
- **`Wyrd.setOf_isPrime_infinite`** · `experiments/wyrd-mathlib/WyrdMathlib/Bridge.lean:27` · both branches
  - Lean: `{p | IsPrime p}.Infinite`
  - Means: The set of naturals satisfying Wyrd.IsPrime is infinite (Set.Infinite), derived from the core-Lean primes_infinite.
  - Closest known: Mathlib Nat.infinite_setOfPred_prime (Data/Nat/PrimeFin.lean), proved there by the same Set.infinite_of_not_bddAbove route.
  - In Mathlib: yes: Nat.infinite_setOfPred_prime
  - Caveat: For Wyrd.IsPrime; equivalent via isPrime_iff.
- **`Wyrd.setOf_prime_infinite`** · `experiments/wyrd-mathlib/WyrdMathlib/Bridge.lean:33` · both branches
  - Lean: `{p : ℕ | p.Prime}.Infinite`
  - Means: The set of primes in ℕ (Mathlib's Nat.Prime) is infinite, proved via the project's own core-Lean Euclid argument.
  - Closest known: Euclid; Mathlib Nat.infinite_setOfPred_prime : {p | Prime p}.Infinite (identical statement).
  - In Mathlib: yes: Nat.infinite_setOfPred_prime
  - Caveat: Identical to an existing Mathlib theorem; only the proof route (through the core-Lean proof) differs.
- **`Wyrd.bertrand`** · `experiments/wyrd-mathlib/WyrdMathlib/Bridge.lean:47` · both branches
  - Lean: `{n : ℕ} (hn : n ≠ 0) : ∃ p, IsPrime p ∧ n < p ∧ p ≤ 2 * n`
  - Means: For every n ≥ 1 there is a prime p (Wyrd.IsPrime) with n < p ≤ 2n.
  - Closest known: Bertrand's postulate (Chebyshev 1852; Erdős 1932 proof); Mathlib Nat.exists_prime_lt_and_le_two_mul, alias Nat.bertrand.
  - In Mathlib: yes: Nat.bertrand (alias of Nat.exists_prime_lt_and_le_two_mul)
  - Caveat: All the work is Mathlib's; the project only transports it to Wyrd.IsPrime. ROADMAP lists a core-Lean proof as open.
- **`Wyrd.irrational_sqrt_two`** · `experiments/wyrd-mathlib/WyrdMathlib/Sqrt2.lean:17` · both branches
  - Lean: `Irrational (Real.sqrt 2)`
  - Means: The real number √2 is irrational, derived from the core-Lean ℕ descent lemma eq_zero_of_mul_self_eq_two_mul by clearing the denominator of a putative rational q.
  - Closest known: Classical (Pythagoreans; Euclid); Mathlib irrational_sqrt_two (NumberTheory/Real/Irrational.lean:141), identical statement.
  - In Mathlib: yes: irrational_sqrt_two
  - Caveat: Identical to Mathlib's theorem (the file even has an example checking agreement); only the proof route differs.

#### 250 = 37 phase lock and the mirror keys (prime-proof branch)

- **`Wyrd.Locked.symm`** · `experiments/wyrd/Wyrd/Lock.lean:58` · prime-proof branch only
  - Lean: `{T n m : Nat} (h : Locked T n m) : Locked T m n`
  - Means: If n ≡ m (mod T) in ℕ, then m ≡ n (mod T).
  - Closest known: Symmetry of congruence; Nat.ModEq.symm
  - In Mathlib: yes: Nat.ModEq.symm (Mathlib/Data/Nat/ModEq.lean)
  - Caveat: Not listed in Audit.lean.
- **`Wyrd.locked_iff_dvd`** · `experiments/wyrd/Wyrd/Lock.lean:62` · prime-proof branch only
  - Lean: `{T n m : Nat} (h : m ≤ n) : Locked T n m ↔ T ∣ n - m`
  - Means: For naturals m ≤ n and any T: n % T = m % T if and only if T divides n − m.
  - Closest known: Standard characterisation of congruence (Gauss 1801); Nat.modEq_iff_dvd'
  - In Mathlib: yes: Nat.modEq_iff_dvd' (c ≤ b → (c ≡ b [MOD n] ↔ n ∣ b − c)), trivially equivalent since Locked is Nat.ModEq up to symmetry; the core proof uses Nat.sub_mod_eq_zero_of_mod_eq
  - Caveat: Proved in core Lean without Mathlib. It adds a core-only proof, not new content.
- **`Wyrd.Lock.locked_iff_modEq`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:53` · prime-proof branch only
  - Lean: `(T n m : ℕ) : Locked T n m ↔ n ≡ m [MOD T]`
  - Means: The project's Locked T n m is literally Mathlib's n ≡ m [MOD T]. Both unfold to n % T = m % T, so the proof is Iff.rfl.
  - Closest known: Definition of Nat.ModEq
  - In Mathlib: yes: Nat.ModEq (definition `a % n = b % n`, Mathlib/Data/Nat/ModEq.lean); the proof is definitional
  - Caveat: Shows that Locked duplicates Nat.ModEq. Every Locked theorem is a Nat.ModEq theorem.
- **`Wyrd.Lock.locked_iff_zmod`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:56` · prime-proof branch only
  - Lean: `(T n m : ℕ) : Locked T n m ↔ (n : ZMod T) = m`
  - Means: For all T, n, m ∈ ℕ: n % T = m % T iff the casts of n and m into ZMod T are equal. The case T = 0 (ZMod 0 = ℤ) is included.
  - Closest known: ZMod.natCast_eq_natCast_iff
  - In Mathlib: yes: ZMod.natCast_eq_natCast_iff (Mathlib/Data/ZMod/Basic.lean)
- **`Wyrd.Lock.crt_lock`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:143` · prime-proof branch only
  - Lean: `{a b : ℕ} (hab : a.Coprime b) (n m : ℕ) : Locked (a * b) n m ↔ Locked a n m ∧ Locked b n m`
  - Means: For coprime a, b ∈ ℕ and any n, m: n ≡ m (mod ab) iff n ≡ m (mod a) and n ≡ m (mod b).
  - Closest known: Chinese remainder theorem
  - In Mathlib: yes: Nat.modEq_and_modEq_iff_modEq_mul (the proof is its .symm)
- **`Wyrd.Lock.vonMangoldt_lock_sum`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:76` · prime-proof branch only
  - Lean: `{n m : ℕ} (hmn : m < n) : ∑ T ∈ (n - m).divisors, Λ T = Real.log ((n - m : ℕ) : ℝ)`
  - Means: The von Mangoldt function summed over the divisors of the natural number n − m equals log(n − m).
  - Closest known: log n = Σ_{d|n} Λ(d) (Apostol, Introduction to Analytic Number Theory, 1976, Thm 2.10)
  - In Mathlib: yes: ArithmeticFunction.vonMangoldt_sum (the proof is `exact vonMangoldt_sum`)
  - Caveat: The hypothesis m < n is never used. The sum is over Nat.divisors; its reading as 'lock periods' comes from mem_divisors_iff_locked.
- **`Wyrd.Lock.one_key_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:82` · prime-proof branch only
  - Lean: `{n m : ℕ} (hmn : m < n) : (∃! p : ℕ, p.Prime ∧ Locked p n m) ↔ IsPrimePow (n - m)`
  - Means: For m < n in ℕ: there is exactly one prime p with n ≡ m (mod p) iff n − m is a prime power.
  - Closest known: n is a prime power iff it has exactly one prime divisor
  - In Mathlib: yes: isPrimePow_iff_unique_prime_dvd (after Locked ↔ dvd via Nat.modEq_iff_dvd')

#### Rainbow geometry (Descartes, Alexander’s dark band, spectrum)

- **`Wyrd.Rainbow.bow_aux_cos_nonneg`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:39` · both branches
  - Lean: `{i : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) : 0 ≤ cos i`
  - Means: For real i ∈ [0, π/2], cos i ≥ 0. (Private.)
  - Closest known: Standard.
  - In Mathlib: yes: Real.cos_nonneg_of_mem_Icc (on [−π/2, π/2], which contains [0, π/2]); the proof uses Real.cos_nonneg_of_neg_pi_div_two_le_of_le

#### Body-water physiology models and Limits models

- **`Wyrd.BodyWater.dilution_recovers`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Compartments.lean:65` · both branches
  - Lean: `{I V : ℝ} (hI : 0 < I) (hV : 0 < V) : I / (I / V) = V`
  - Means: For real I > 0 and V > 0, I / (I / V) = V.
  - Closest known: Indicator-dilution principle V = dose / concentration (standard tracer methodology).
  - In Mathlib: yes: div_div_cancel₀ (a ≠ 0 → a / (a / b) = b)
  - Caveat: hV is not needed. The physical content (complete mixing in one compartment, no tracer loss, so C = I/V) is the modelling assumption, not part of the theorem.
- **`Wyrd.Limits.lt_rpow_inv_of_pow_lt' (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Values.lean:27` · new-session branch only
  - Lean: `{a x : ℝ} {n : ℕ} (ha : 0 ≤ a) (hn : n ≠ 0) (h : a ^ n < x) : a < x ^ ((n : ℝ)⁻¹)`
  - Means: For real a ≥ 0 and natural n ≠ 0, a^n < x implies a < x^(1/n).
  - Closest known: Monotonicity of n-th roots.
  - In Mathlib: yes: Real.lt_rpow_inv_iff_of_pos (with Real.rpow_natCast)
- **`Wyrd.Limits.rpow_inv_lt_of_lt_pow' (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Values.lean:33` · new-session branch only
  - Lean: `{a x : ℝ} {n : ℕ} (hx : 0 ≤ x) (ha : 0 ≤ a) (hn : n ≠ 0) (h : x < a ^ n) : x ^ ((n : ℝ)⁻¹) < a`
  - Means: For real x, a ≥ 0 and natural n ≠ 0, x < a^n implies x^(1/n) < a.
  - Closest known: Monotonicity of n-th roots.
  - In Mathlib: yes: Real.rpow_inv_lt_iff_of_pos (with Real.rpow_natCast)

#### Periodic Navier–Stokes II: scaling, blow-up rescalings, sign flip, Galerkin, Grönwall, quantifiers

- **`Wyrd.PeriodicNS.coreScaling_rpow_sq`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/CoreScaling.lean:20` · new-session branch only
  - Lean: `{τ : ℝ} (hτ : 0 ≤ τ) (a : ℝ) : (τ ^ a) ^ 2 = τ ^ (a * 2)`
  - Means: For real τ ≥ 0 and real a, (τ^a)² = τ^(2a) (real power).
  - Closest known: Real.rpow_mul_natCast
  - In Mathlib: yes: Real.rpow_mul_natCast (with n = 2)
  - Caveat: A private theorem.
- **`Wyrd.PeriodicNS.swirl_speed_blowup`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Blowup.lean:67` · new-session branch only
  - Lean: `{h : ℝ} (hh : -(1 / 2) < h) : Tendsto (fun τ : ℝ => τ ^ (-((1 : ℝ) / 2 + h))) (𝓝[>] 0) atTop`
  - Means: For h > −1/2, τ^{−(1/2+h)} → +∞ as τ → 0⁺.
  - Closest known: tendsto_rpow_neg_nhdsGT_zero
  - In Mathlib: yes: tendsto_rpow_neg_nhdsGT_zero (with y = −(1/2 + h))
  - Caveat: Exponent arithmetic; no velocity of an actual flow is involved.

### 1b. Direct instances and numeric checks

Specialisations of Mathlib lemmas, and decide or norm_num facts about standard numbers.


#### Core wyrd: pangram encoding, primes, √2, minimality search; Mathlib bridge

- **`Wyrd.length_flatMap_le_five`** · `experiments/wyrd/Wyrd/Pangram.lean:101` · both branches
  - Lean: `{α : Type} (l : List α) (f : α → List Nat) (h : ∀ x ∈ l, (f x).length ≤ 5) : (l.flatMap f).length ≤ 5 * l.length`
  - Means: If every block f x (x ∈ l) has length at most 5, the concatenation of all blocks has length at most 5·|l|.
  - Closest known: Core List.length_flatMap (length = sum of block lengths) plus Mathlib List.sum_le_length_nsmul.
  - In Mathlib: partial: List.length_flatMap + List.sum_le_length_nsmul, the constant-5 bound follows directly
  - Caveat: Generic list fact specialised to the constant 5.
- **`Wyrd.nodup_of_nodup_flatMap`** · `experiments/wyrd/Wyrd/Distinct.lean:39` · both branches
  - Lean: `{α β : Type} (f : α → List β) : ∀ (l : List α), (∀ x ∈ l, f x ≠ []) → (l.flatMap f).Nodup → l.Nodup`
  - Means: For any types α, β, list l and function f with every block f x non-empty, if concatenating the blocks gives a duplicate-free list then l itself is duplicate-free.
  - Closest known: Folklore list lemma; Mathlib List.nodup_flatMap (Data/List/Nodup.lean) gives pairwise disjointness of blocks, from which this follows in a few lines.
  - In Mathlib: partial: a three-line corollary of List.nodup_flatMap (Mathlib Data/List/Nodup.lean:300) and core List.Pairwise.imp_of_mem (Init/Data/List/Pairwise.lean:68), since Nodup = Pairwise (· ≠ ·); not stated verbatim
  - Caveat: Generic list lemma (α β : Type) used to get distinctness of the ten primes. It is a short corollary of Mathlib's List.nodup_flatMap, is not literature-level mathematics, and adds nothing beyond Mathlib except the exact phrasing.
- **`Wyrd.mul_self_mod_two`** · `experiments/wyrd/Wyrd/Sqrt2.lean:22` · both branches
  - Lean: `{a : Nat} (h : a % 2 = 1) : (a * a) % 2 = 1`
  - Means: The square of an odd natural number is odd.
  - Closest known: Mathlib Nat.odd_mul_odd (Data/Nat/ModEq.lean:579) with n = m = a; Odd-predicate form Nat.odd_mul (Algebra/Ring/Parity.lean:301).
  - In Mathlib: yes: Nat.odd_mul_odd {n m : ℕ} : n % 2 = 1 → m % 2 = 1 → n * m % 2 = 1 (Mathlib/Data/Nat/ModEq.lean:579), at n = m = a, in the same % 2 form
- **`Wyrd.solution_primes`** · `experiments/wyrd-mathlib/WyrdMathlib/Bridge.lean:37` · both branches
  - Lean: `∀ pq ∈ solution, pq.1.Prime ∧ pq.2.Prime`
  - Means: The ten specific numbers 1187, 3109, 53, 4243, 349, 3947, 293, 4003, 659, 3637 are primes in Mathlib's sense.
  - Closest known: Numeric primality facts (norm_num/decide could check them directly).
  - In Mathlib: no (searched: specific numbers; numeric check, not a library statement)
  - Caveat: Numeric check about specific integers, transported from the kernel trial division in solution_isPangram via isPrime_iff.

#### 250 = 37 phase lock and the mirror keys (prime-proof branch)

- **`Wyrd.lock`** · `experiments/wyrd/Wyrd/Lock.lean:39` · prime-proof branch only
  - Lean: `: Locked 71 250 37`
  - Means: In ℕ, 250 % 71 = 37 % 71 (both are 37), i.e. 250 ≡ 37 (mod 71). This congruence is the only sense in which this theorem makes '250 = 37'.
  - Closest known: Elementary congruence (Gauss, Disquisitiones Arithmeticae, 1801); Mathlib Nat.ModEq
  - In Mathlib: partial: Nat.ModEq (Locked T n m is definitionally Nat.ModEq T n m); no lemma for these constants, but `decide` proves it
  - Caveat: Kernel `decide` check. The README's 'phase lock' just means equal remainders mod 71. It is not dynamical phase locking.
- **`Wyrd.key_prime`** · `experiments/wyrd/Wyrd/Lock.lean:44` · prime-proof branch only
  - Lean: `: IsPrime 71`
  - Means: 71 is prime in the project's core sense: 2 ≤ 71 and its only divisors are 1 and 71. It is proved by kernel trial division (primeB_sound).
  - Closest known: Nat.Prime 71 (norm_num); Wyrd.isPrime_iff identifies IsPrime with Mathlib's Nat.Prime via Nat.prime_def
  - In Mathlib: partial: Nat.prime_def (IsPrime is its right-hand side); Mathlib proves Nat.Prime 71 with norm_num
  - Caveat: Kernel computation (decide on trial division).
- **`Wyrd.three_prime`** · `experiments/wyrd/Wyrd/Lock.lean:46` · prime-proof branch only
  - Lean: `: IsPrime 3`
  - Means: 3 is prime, in the core IsPrime sense, proved by kernel trial division.
  - Closest known: Nat.prime_three
  - In Mathlib: partial: Nat.prime_three (for Nat.Prime; IsPrime ↔ Nat.Prime via Nat.prime_def)
  - Caveat: Kernel computation. Not listed in Audit.lean.
- **`Wyrd.thirtyseven_prime`** · `experiments/wyrd/Wyrd/Lock.lean:48` · prime-proof branch only
  - Lean: `: IsPrime 37`
  - Means: 37 is prime, in the core IsPrime sense, proved by kernel trial division.
  - Closest known: Nat.Prime 37 by norm_num
  - In Mathlib: partial: Nat.prime_def plus norm_num's primality extension
  - Caveat: Kernel computation. Not listed in Audit.lean.
- **`Wyrd.three_primes`** · `experiments/wyrd/Wyrd/Lock.lean:52` · prime-proof branch only
  - Lean: `: 250 = 3 * 71 + 37 ∧ 250 / 71 = 3 ∧ 250 % 71 = 37 ∧ IsPrime 3 ∧ IsPrime 71 ∧ IsPrime 37`
  - Means: In ℕ, 250 = 3·71 + 37, so dividing 250 by 71 gives quotient 3 and remainder 37. All three of 3, 71 and 37 are prime.
  - Closest known: Division algorithm (Euclid, Elements VII); Nat.div_add_mod
  - In Mathlib: partial: Nat.div_add_mod (the general identity); the specific values follow by decide/norm_num
  - Caveat: That the quotient, divisor and remainder are all prime is a numerical coincidence. No theorem uses it.
- **`Wyrd.lock_iff_dvd`** · `experiments/wyrd/Wyrd/Lock.lean:72` · prime-proof branch only
  - Lean: `(T : Nat) : Locked T 250 37 ↔ T ∣ 213`
  - Means: For every T ∈ ℕ: 250 ≡ 37 (mod T) iff T divides 213 = 250 − 37.
  - Closest known: Nat.modEq_iff_dvd' at 37 ≤ 250
  - In Mathlib: partial: Nat.modEq_iff_dvd' (general form)
- **`Wyrd.dvd_213`** · `experiments/wyrd/Wyrd/Lock.lean:77` · prime-proof branch only
  - Lean: `(T : Nat) : T ∣ 213 ↔ T = 1 ∨ T = 3 ∨ T = 71 ∨ T = 213`
  - Means: The natural divisors of 213 are exactly 1, 3, 71 and 213.
  - Closest known: 213 = 3·71; Mathlib Nat.divisors with decide (cf. Wyrd.Lock.divisors_213)
  - In Mathlib: partial: Nat.mem_divisors plus decide on Nat.divisors 213
  - Caveat: Kernel computation (`decide +kernel` over every t < 214).
- **`Wyrd.lock_periods`** · `experiments/wyrd/Wyrd/Lock.lean:93` · prime-proof branch only
  - Lean: `(T : Nat) : Locked T 250 37 ↔ T = 1 ∨ T = 3 ∨ T = 71 ∨ T = 213`
  - Means: For T ∈ ℕ, 250 % T = 37 % T holds exactly for T ∈ {1, 3, 71, 213}. T = 0 is excluded because n % 0 = n.
  - Closest known: Congruence ↔ divisibility, plus the divisors of 213
  - In Mathlib: partial: Nat.modEq_iff_dvd' + Nat.mem_divisors
  - Caveat: This is the full list of moduli on which '250 = 37' holds as a congruence.
- **`Wyrd.prime_keys`** · `experiments/wyrd/Wyrd/Lock.lean:99` · prime-proof branch only
  - Lean: `(p : Nat) (hp : IsPrime p) : Locked p 250 37 ↔ p = 3 ∨ p = 71`
  - Means: For a prime p (core IsPrime): 250 ≡ 37 (mod p) iff p = 3 or p = 71.
  - Closest known: The prime factors of 213 = 3·71; Nat.primeFactors
  - In Mathlib: partial: Nat.modEq_iff_dvd' + Nat.mem_primeFactors (see Wyrd.Lock.prime_keys')
- **`Wyrd.not_on_the_line`** · `experiments/wyrd/Wyrd/Lock.lean:116` · prime-proof branch only
  - Lean: `: 250 ≠ 37 ∧ ∀ T, 213 < T → ¬ Locked T 250 37`
  - Means: In ℕ, 250 ≠ 37. For every modulus T > 213, 250 ≢ 37 (mod T).
  - Closest known: A positive divisor of 213 is at most 213 (Nat.le_of_dvd)
  - In Mathlib: partial: Nat.le_of_dvd + Nat.modEq_iff_dvd'
  - Caveat: This is the honest disclaimer: '250 = 37' is false in ℕ.
- **`Wyrd.crt_213`** · `experiments/wyrd/Wyrd/Lock.lean:126` · prime-proof branch only
  - Lean: `(n m : Nat) : Locked 213 n m ↔ Locked 3 n m ∧ Locked 71 n m`
  - Means: For all n, m ∈ ℕ: n ≡ m (mod 213) iff n ≡ m (mod 3) and n ≡ m (mod 71).
  - Closest known: Chinese remainder theorem (Sunzi; Gauss 1801); Nat.modEq_and_modEq_iff_modEq_mul
  - In Mathlib: partial: Nat.modEq_and_modEq_iff_modEq_mul at m = 3, n = 71
  - Caveat: Proved by omega with fixed moduli.
- **`Wyrd.strobe`** · `experiments/wyrd/Wyrd/Lock.lean:136` · prime-proof branch only
  - Lean: `(k : Nat) : Locked 71 (250 * k) (37 * k)`
  - Means: For every k ∈ ℕ, 250k ≡ 37k (mod 71).
  - Closest known: Congruences are preserved by multiplication; Nat.ModEq.mul_right
  - In Mathlib: partial: Nat.ModEq.mul_right applied to 250 ≡ 37 [MOD 71]
  - Caveat: The stroboscope and wheel are an interpretation. The Lean statement is a congruence of naturals.
- **`Wyrd.exists_prime_lock`** · `experiments/wyrd/Wyrd/Lock.lean:143` · prime-proof branch only
  - Lean: `{n m : Nat} (h : m + 2 ≤ n ∨ n + 2 ≤ m) : ∃ p, IsPrime p ∧ Locked p n m`
  - Means: If n, m ∈ ℕ differ by at least 2, then some prime p (core IsPrime) has n ≡ m (mod p).
  - Closest known: Every integer ≥ 2 has a prime factor (Euclid, Elements VII.31); Nat.exists_prime_and_dvd
  - In Mathlib: partial: Nat.exists_prime_and_dvd + Nat.modEq_iff_dvd'
- **`Wyrd.consecutive_never_lock`** · `experiments/wyrd/Wyrd/Lock.lean:153` · prime-proof branch only
  - Lean: `(n p : Nat) (hp : IsPrime p) : ¬ Locked p (n + 1) n`
  - Means: For every n ∈ ℕ and prime p, n + 1 ≢ n (mod p).
  - Closest known: A prime does not divide 1; Nat.Prime.not_dvd_one
  - In Mathlib: partial: Nat.Prime.not_dvd_one + Nat.modEq_iff_dvd'
  - Caveat: Primality is used only through p ≥ 2. The statement holds for every modulus ≥ 2.
- **`Wyrd.Lock.zmod_lock`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:47` · prime-proof branch only
  - Lean: `: (250 : ZMod 71) = 37`
  - Means: In the ring ℤ/71ℤ, the numerals 250 and 37 are the same element.
  - Closest known: ZMod.natCast_eq_natCast_iff (equality in ZMod is congruence)
  - In Mathlib: partial: ZMod.natCast_eq_natCast_iff; the instance is by decide
  - Caveat: Kernel decide. Equality holds in ZMod 71, not in ℕ, ℤ or ℝ.
- **`Wyrd.Lock.key_prime'`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:50` · prime-proof branch only
  - Lean: `: Nat.Prime 71`
  - Means: 71 is prime in Mathlib's sense.
  - Closest known: norm_num primality extension
  - In Mathlib: partial: Mathlib's norm_num extension proves it; no named lemma for 71
- **`Wyrd.Lock.divisors_213`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:60` · prime-proof branch only
  - Lean: `: Nat.divisors 213 = {1, 3, 71, 213}`
  - Means: The Finset of divisors of 213 is {1, 3, 71, 213}.
  - Closest known: 213 = 3·71
  - In Mathlib: partial: Nat.divisors (evaluated by decide)
  - Caveat: Kernel decide.
- **`Wyrd.Lock.lock_periods'`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:63` · prime-proof branch only
  - Lean: `(T : ℕ) : (250 : ZMod T) = 37 ↔ T ∈ Nat.divisors 213`
  - Means: For every T ∈ ℕ, the numerals 250 and 37 are equal in ZMod T iff T divides 213, i.e. T ∈ {1, 3, 71, 213}. For T = 0, ZMod 0 = ℤ and both sides are false.
  - Closest known: ZMod.natCast_eq_natCast_iff + Nat.modEq_iff_dvd'; equivalently ring_lock with ZMod.ringChar_zmod_n
  - In Mathlib: partial: ZMod.natCast_eq_natCast_iff, Nat.modEq_iff_dvd', Nat.mem_divisors
- **`Wyrd.Lock.primeFactors_213`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:70` · prime-proof branch only
  - Lean: `: Nat.primeFactors 213 = {3, 71}`
  - Means: The set of prime factors of 213 is {3, 71}.
  - Closest known: 213 = 3·71
  - In Mathlib: partial: Nat.primeFactors_mul, Nat.Prime.primeFactors
- **`Wyrd.Lock.prime_lock_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:77` · prime-proof branch only
  - Lean: `{p n m : ℕ} (hp : p.Prime) (hmn : m < n) : n ≡ m [MOD p] ↔ p ∈ (n - m).primeFactors`
  - Means: For a prime p and naturals m < n: n ≡ m (mod p) iff p is a prime factor of n − m.
  - Closest known: Congruence ↔ divisibility, plus the definition of prime factors
  - In Mathlib: partial: Nat.modEq_iff_dvd' + Nat.mem_primeFactors (the proof is these two rewrites)
  - Caveat: The README calls this 'the general theorem'. It is a direct rewrite of two Mathlib lemmas.
- **`Wyrd.Lock.prime_keys'`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:87` · prime-proof branch only
  - Lean: `(p : ℕ) (hp : p.Prime) : (250 : ZMod p) = 37 ↔ p = 3 ∨ p = 71`
  - Means: For a prime p, the numerals 250 and 37 are equal in ZMod p iff p = 3 or p = 71.
  - Closest known: Prime factors of 213
  - In Mathlib: partial: ZMod.natCast_eq_natCast_iff + Nat.mem_primeFactors
- **`Wyrd.Lock.exists_prime_lock'`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:99` · prime-proof branch only
  - Lean: `{n m : ℕ} (h : m + 2 ≤ n ∨ n + 2 ≤ m) : ∃ p, p.Prime ∧ (n : ZMod p) = m`
  - Means: If n, m ∈ ℕ differ by at least 2, then n and m are equal in ZMod p for some prime p.
  - Closest known: Existence of a prime factor of |n − m| ≥ 2
  - In Mathlib: partial: Nat.exists_prime_and_dvd + ZMod.natCast_eq_natCast_iff
- **`Wyrd.Lock.ring_lock`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:111` · prime-proof branch only
  - Lean: `(R : Type*) [Ring R] : (250 : R) = 37 ↔ ringChar R ∣ 213`
  - Means: In any ring R, the numerals 250 and 37 are equal iff the characteristic of R divides 213. The trivial ring (characteristic 1) is included.
  - Closest known: Characterisation of the characteristic: (n : R) = 0 ↔ char R ∣ n
  - In Mathlib: partial: ringChar.spec (∀ x : ℕ, (x : R) = 0 ↔ ringChar R ∣ x) at x = 213, with sub_eq_zero
  - Caveat: This is the most general sense in which '250 = 37' is proved: in rings of characteristic 1, 3, 71 or 213.
- **`Wyrd.Lock.field_lock`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:116` · prime-proof branch only
  - Lean: `(K : Type*) [Field K] : (250 : K) = 37 ↔ ringChar K = 3 ∨ ringChar K = 71`
  - Means: In any field K, 250 = 37 iff K has characteristic 3 or 71.
  - Closest known: A field's characteristic is 0 or prime (CharP.char_is_prime_or_zero)
  - In Mathlib: partial: CharP.char_is_prime_or_zero + ringChar.spec
- **`Wyrd.Lock.int_ne`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:135` · prime-proof branch only
  - Lean: `: (250 : ℤ) ≠ 37`
  - Means: In ℤ, 250 ≠ 37.
  - Closest known: norm_num
  - In Mathlib: partial: decidable equality / norm_num
  - Caveat: Proved by norm_num, not through the characteristic argument the docstring mentions.
- **`Wyrd.Lock.real_ne`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:138` · prime-proof branch only
  - Lean: `: (250 : ℝ) ≠ 37`
  - Means: In ℝ, 250 ≠ 37.
  - Closest known: norm_num
  - In Mathlib: partial: norm_num
  - Caveat: Proved by norm_num.
- **`Wyrd.Lock.crt_213'`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:149` · prime-proof branch only
  - Lean: `(n m : ℕ) : Locked 213 n m ↔ Locked 3 n m ∧ Locked 71 n m`
  - Means: For all n, m ∈ ℕ: n ≡ m (mod 213) iff n ≡ m (mod 3) and n ≡ m (mod 71).
  - Closest known: Chinese remainder theorem for 3 and 71
  - In Mathlib: partial: Nat.modEq_and_modEq_iff_modEq_mul at 3, 71
  - Caveat: Duplicates Wyrd.crt_213.
- **`Wyrd.Lock.osc_eq_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:160` · prime-proof branch only
  - Lean: `{T : ℕ} (hT : T ≠ 0) (n m : ℤ) : osc T n = osc T m ↔ (T : ℤ) ∣ n - m`
  - Means: For T ∈ ℕ with T ≠ 0 and integers n, m: exp(2πi n/T) = exp(2πi m/T) in ℂ iff T divides n − m.
  - Closest known: exp(2πi/T) is a primitive T-th root of unity, so ζ^n = ζ^m iff n ≡ m (mod T). In Mathlib this is the injectivity of the standard additive character ZMod T → ℂ, j ↦ exp(2πij/T) (ZMod.stdAddChar, ZMod.injective_stdAddChar).
  - In Mathlib: partial (a few rewrites from Mathlib): osc T n is exactly Mathlib's standard additive character, ZMod.stdAddChar_coe : stdAddChar (j : ZMod N) = exp (2 * π * I * j / N) (Mathlib/Analysis/SpecialFunctions/Complex/CircleAddChar.lean), and ZMod.injective_stdAddChar plus ZMod.intCast_eq_intCast_iff_dvd_sub give osc_eq_iff for T ≠ 0. The same holds with ZMod.toCircle_intCast + ZMod.injective_toCircle. Alternatively Complex.isPrimitiveRoot_exp + IsPrimitiveRoot.zpow_eq_one_iff_dvd. The project's proof uses Complex.exp_eq_exp_iff_exists_int.
  - Caveat: osc is the complex exponential, not a real sinusoid. At T = 0, osc is constantly 1.
- **`Wyrd.Lock.osc_lock`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:181` · prime-proof branch only
  - Lean: `: osc 71 250 = osc 71 37`
  - Means: exp(2πi·250/71) = exp(2πi·37/71) in ℂ.
  - Closest known: Periodicity of exp(2πi·)
  - In Mathlib: partial: Complex.exp_eq_exp_iff_exists_int
- **`Wyrd.Lock.strobe'`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:185` · prime-proof branch only
  - Lean: `(k : ℤ) : osc 71 (250 * k) = osc 71 (37 * k)`
  - Means: For every integer k, exp(2πi·250k/71) = exp(2πi·37k/71).
  - Closest known: Periodicity of exp(2πi·), since 250k − 37k = 71·3k
  - In Mathlib: partial: Complex.exp_eq_exp_iff_exists_int
- **`Wyrd.Lock.osc_ne_of_gt`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:189` · prime-proof branch only
  - Lean: `{T : ℕ} (hT : 213 < T) : osc T 250 ≠ osc T 37`
  - Means: For every T > 213, exp(2πi·250/T) ≠ exp(2πi·37/T).
  - Closest known: osc_eq_iff with Int.le_of_dvd
  - In Mathlib: partial: Complex.exp_eq_exp_iff_exists_int + Int.le_of_dvd
- **`Wyrd.Lock.sin_lock`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:197` · prime-proof branch only
  - Lean: `: Real.sin (2 * π * 250 / 71) = Real.sin (2 * π * 37 / 71)`
  - Means: In ℝ, sin(2π·250/71) = sin(2π·37/71), because the arguments differ by 3·2π.
  - Closest known: 2π-periodicity of sine
  - In Mathlib: partial: Real.sin_add_int_mul_two_pi
- **`Wyrd.Lock.cos_lock`** · `experiments/wyrd-mathlib/WyrdMathlib/Lock.lean:204` · prime-proof branch only
  - Lean: `: Real.cos (2 * π * 250 / 71) = Real.cos (2 * π * 37 / 71)`
  - Means: In ℝ, cos(2π·250/71) = cos(2π·37/71).
  - Closest known: 2π-periodicity of cosine
  - In Mathlib: partial: Real.cos_add_int_mul_two_pi
- **`Wyrd.Lock.mem_divisors_iff_locked`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:69` · prime-proof branch only
  - Lean: `{n m : ℕ} (hmn : m < n) (T : ℕ) : T ∈ (n - m).divisors ↔ Locked T n m`
  - Means: For naturals m < n and any T: T is a divisor of n − m iff n ≡ m (mod T).
  - Closest known: Congruence ↔ divisibility
  - In Mathlib: partial: Nat.mem_divisors + Nat.modEq_iff_dvd'
- **`Wyrd.Lock.two_keys`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:88` · prime-proof branch only
  - Lean: `: ¬ IsPrimePow 213`
  - Means: 213 is not a prime power, because both 3 and 71 divide it.
  - Closest known: 213 = 3·71
  - In Mathlib: partial: isPrimePow_iff_unique_prime_dvd
- **`Wyrd.Lock.vonMangoldt_213`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:96` · prime-proof branch only
  - Lean: `: Λ 213 = 0`
  - Means: The von Mangoldt function vanishes at 213.
  - Closest known: Λ(n) = 0 unless n is a prime power
  - In Mathlib: partial: ArithmeticFunction.vonMangoldt_eq_zero_iff
- **`Wyrd.Lock.log_gap`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:100` · prime-proof branch only
  - Lean: `: Λ 3 + Λ 71 = Real.log 213`
  - Means: In ℝ, Λ(3) + Λ(71) = log 213. Equivalently, log 3 + log 71 = log 213.
  - Closest known: log n = Σ_{d|n} Λ(d) at n = 213 (Apostol 1976, Thm 2.10)
  - In Mathlib: partial: ArithmeticFunction.vonMangoldt_sum at 213, vonMangoldt_apply_one
  - Caveat: Since Λ(p) = log p, this is the same fact as log_gap' (log of a product).
- **`Wyrd.Lock.log_gap'`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:109` · prime-proof branch only
  - Lean: `: Real.log 3 + Real.log 71 = Real.log 213`
  - Means: In ℝ, log 3 + log 71 = log 213.
  - Closest known: log(xy) = log x + log y
  - In Mathlib: partial: Real.log_mul
- **`Wyrd.Lock.primeFactors_70`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:114` · prime-proof branch only
  - Lean: `: Nat.primeFactors 70 = {2, 5, 7}`
  - Means: The prime factors of 70 are 2, 5 and 7.
  - Closest known: 70 = 2·5·7
  - In Mathlib: partial: Nat.primeFactors_mul, Nat.Prime.primeFactors
  - Caveat: Not listed in Audit.lean.
- **`Wyrd.Lock.lucas_71`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:122` · prime-proof branch only
  - Lean: `: Nat.Prime 71`
  - Means: 71 is prime. The proof uses Lucas's test with witness 7: 7^70 = 1 and 7^35, 7^14, 7^10 ≠ 1 in ZMod 71.
  - Closest known: Lucas's primality test (É. Lucas, 1876/1878; converse of Fermat as refined by D. H. Lehmer, 1927)
  - In Mathlib: partial: lucas_primality (Mathlib/NumberTheory/LucasPrimality.lean) applied with the numeric checks by decide
  - Caveat: The statement is only Nat.Prime 71, the same as key_prime'. The certificate is the proof method, not part of the statement.
- **`Wyrd.Lock.orderOf_seven`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:131` · prime-proof branch only
  - Lean: `: orderOf (7 : ZMod 71) = 70`
  - Means: The multiplicative order of 7 in ZMod 71 is 70. So 7 is a primitive root mod 71.
  - Closest known: 7 is the least primitive root mod 71 (standard tables; I re-checked by computation)
  - In Mathlib: partial: orderOf_eq_of_pow_and_pow_div_prime
  - Caveat: The README says '7 generates'. That also needs |(ZMod 71)ˣ| = 70, which is not stated but is routine (ZMod.card_units_eq_totient).
- **`Wyrd.Lock.seven_no_lock`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:141` · prime-proof branch only
  - Lean: `: (7 : ZMod 71) ^ 250 ≠ 7 ^ 37`
  - Means: In ZMod 71, 7^250 ≠ 7^37. By computation they are 20 and 22. The Lean statement says only that they differ.
  - Closest known: 7 has order 70 and 70 ∤ 213
  - In Mathlib: partial: pow_eq_pow_iff_modEq (orderOf form); the instance is by decide
  - Caveat: Kernel decide.
- **`Wyrd.Lock.pow_lock_71`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:146` · prime-proof branch only
  - Lean: `(a : ZMod 71) : a ^ 250 = a ^ 37 ↔ a = 0 ∨ a = 1`
  - Means: For a ∈ ZMod 71, a^250 = a^37 iff a = 0 or a = 1.
  - Closest known: In the cyclic group (ZMod 71)ˣ of order 70, a^213 = 1 iff a^gcd(213,70) = a = 1 (Fermat's little theorem plus cyclicity)
  - In Mathlib: partial: ZMod.pow_card_sub_one_eq_one, pow_eq_pow_iff_modEq; this instance is by decide
  - Caveat: Kernel computation (decide over all 71 residues). The README's 'multiplicatively the key refuses' is an interpretation.
- **`Wyrd.Lock.pow_lock_37`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:151` · prime-proof branch only
  - Lean: `(a : ZMod 37) (ha : a ≠ 0) : a ^ 250 = a ^ 37 ↔ a ^ 3 = 1`
  - Means: For nonzero a ∈ ZMod 37, a^250 = a^37 iff a^3 = 1.
  - Closest known: In the cyclic group of order 36, a^213 = 1 iff a^gcd(213,36) = a^3 = 1
  - In Mathlib: partial: ZMod.pow_card_sub_one_eq_one; this instance is by decide
  - Caveat: Kernel computation over all 37 residues.
- **`Wyrd.Lock.cube_roots_37`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:156` · prime-proof branch only
  - Lean: `(a : ZMod 37) : a ^ 3 = 1 ↔ a = 1 ∨ a = 10 ∨ a = 26`
  - Means: The cube roots of 1 in ZMod 37 are exactly 1, 10 and 26.
  - Closest known: 37 ≡ 1 (mod 3), so there are 3 cube roots of unity mod 37
  - In Mathlib: partial: none for this instance; by decide
  - Caveat: Kernel computation.
- **`Wyrd.Lock.strobe_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:164` · prime-proof branch only
  - Lean: `{T : ℕ} (hT : T ≠ 0) : (∀ n : ℤ, osc T (250 * n) = osc T (37 * n)) ↔ (T : ℤ) ∣ 213`
  - Means: For T ∈ ℕ, T ≠ 0: exp(2πi·250n/T) = exp(2πi·37n/T) for every integer n iff T divides 213. Read as sampling the complex tones e^{2πi f t} with f = 250 and f = 37 at t = n/T.
  - Closest known: Aliasing of complex exponentials: sampled at rate T, e^{2πi f n/T} and e^{2πi f' n/T} coincide iff f ≡ f' (mod T) (Oppenheim & Schafer, Discrete-Time Signal Processing, sampling chapter)
  - In Mathlib: partial: osc T k = ZMod.stdAddChar (k : ZMod T) (ZMod.stdAddChar_coe), and ZMod.injective_stdAddChar + ZMod.intCast_eq_intCast_iff_dvd_sub then give it, after reducing ∀ n to n = 1. No lemma is phrased as sampling or aliasing (searched: nyquist, aliasing, sampling theorem).
  - Caveat: The forward direction uses only n = 1. 'Hz' and 'sample rate' are readings of f and T. Complex tone only.
- **`Wyrd.Lock.strobe_iff_phase`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:177` · prime-proof branch only
  - Lean: `{T : ℕ} (hT : T ≠ 0) (φ : ℝ) : (∀ n : ℤ, osc T (250 * n) * exp (φ * I) = osc T (37 * n) * exp (φ * I)) ↔ (T : ℤ) ∣ 213`
  - Means: This is strobe_iff with both sample sequences multiplied by the same nonzero factor e^{iφ}: they agree for all n iff T ∣ 213.
  - Closest known: Same as strobe_iff
  - In Mathlib: partial: ZMod.stdAddChar_coe + ZMod.injective_stdAddChar + ZMod.intCast_eq_intCast_iff_dvd_sub (via strobe_iff), plus mul_left_inj' and Complex.exp_ne_zero to cancel the common phase
  - Caveat: The common phase cancels trivially, so this adds nothing to strobe_iff. Different initial phases are not covered.
- **`Wyrd.Lock.osc_213_eq`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:309` · prime-proof branch only
  - Lean: `(t : ℤ) : osc 213 t = osc 3 (2 * t) * osc 71 (-47 * t)`
  - Means: For every integer t, exp(2πi t/213) = exp(2πi·2t/3)·exp(2πi·(−47t)/71). This holds because 1/213 = 2/3 − 47/71.
  - Closest known: Bézout/CRT decomposition of roots of unity: for coprime a, b with u·b + v·a = 1, we have 1/(ab) = u/a + v/b, so ζ_ab = ζ_a^u · ζ_b^v (μ_ab ≅ μ_a × μ_b). Here a = 3, b = 71, u = 2, v = −47, which gives ζ_213 = ζ_3^2 · ζ_71^(−47).
  - In Mathlib: partial: Complex.exp_add; no lemma for this decomposition at specific moduli
  - Caveat: Proved by field_simp and ring: an algebraic identity of exponents.
- **`Wyrd.Lock.rotation_eq`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:320` · prime-proof branch only
  - Lean: `: ((250 / 71 : ℝ) : AddCircle (1 : ℝ)) = ((37 / 71 : ℝ) : AddCircle (1 : ℝ))`
  - Means: In the circle ℝ/ℤ, the classes of 250/71 and 37/71 are the same point, since they differ by 3.
  - Closest known: Quotient by ℤ
  - In Mathlib: partial: AddCircle.coe_add_period
  - Caveat: The Lean states equality of two points. That the rotation maps are equal is immediate but not stated.
- **`Wyrd.Lock.rotation_period`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:326` · prime-proof branch only
  - Lean: `: addOrderOf ((37 / 71 : ℝ) : AddCircle (1 : ℝ)) = 71`
  - Means: The point 37/71 of ℝ/ℤ has additive order 71.
  - Closest known: m/n with gcd(m, n) = 1 has order n in ℝ/ℤ
  - In Mathlib: partial: AddCircle.addOrderOf_div_of_gcd_eq_one (direct specialisation)
  - Caveat: The README's 'every orbit has exactly 71 points' is not stated. Only the additive order is (see unresolved claims).
- **`Wyrd.Lock.exists_prime_in_phase`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:337` · prime-proof branch only
  - Lean: `(n : ℕ) : ∃ p > n, p.Prime ∧ (p : ZMod 213) = 37`
  - Means: For every n there is a prime p > n with p ≡ 37 (mod 213). Since 250 ≡ 37 (mod 213), such p are also ≡ 250.
  - Closest known: Dirichlet's theorem on primes in arithmetic progressions (Dirichlet, 1837)
  - In Mathlib: partial: Nat.forall_exists_prime_gt_and_eq_mod (Mathlib/NumberTheory/LSeries/PrimesInAP.lean), applied with q = 213, a = 37 (a unit since gcd(37, 213) = 1)
  - Caveat: The list '37, 463, 1741, …' is numerical. Lean has only an unnamed `example` for 463.
- **`Wyrd.Lock.dirichletCharacter_lock`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:348` · prime-proof branch only
  - Lean: `(χ : DirichletCharacter ℂ 71) : χ 250 = χ 37`
  - Means: Every complex Dirichlet character χ modulo 71 takes the same value at 250 and at 37.
  - Closest known: Dirichlet characters are periodic mod their modulus
  - In Mathlib: partial: follows by rewriting with (250 : ZMod 71) = 37
  - Caveat: Vacuous as a statement about characters: it holds for any function on ZMod 71, because 250 and 37 are the same element there (proof: rw [zmod_lock]). No property of characters or L-functions is used.

#### Rainbow geometry (Descartes, Alexander’s dark band, spectrum)

- **`Wyrd.Rainbow.deriv_aux_radicand_pos`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Deriv.lean:16` · both branches
  - Lean: `{n : ℝ} (hn : 1 < n) (i : ℝ) : 0 < n ^ 2 - sin i ^ 2`
  - Means: For real n > 1 and every real i, n² − sin² i > 0. (Private.)
  - Closest known: Elementary consequence of sin² i ≤ 1.
  - In Mathlib: partial: Real.sin_sq_le_one gives sin² ≤ 1; the strict inequality with n² > 1 is one nlinarith step
- **`Wyrd.Rainbow.deriv_aux_lt_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Deriv.lean:68` · both branches
  - Lean: `{n : ℝ} (hn : 1 < n) {k : ℕ} (hk : 1 ≤ k) {i : ℝ} (hi : 0 ≤ cos i) : √(n ^ 2 - sin i ^ 2) < (k + 1) * cos i ↔ (n ^ 2 - 1) / (k * (k + 2)) < cos i ^ 2`
  - Means: For real n > 1, natural k ≥ 1 and real i with cos i ≥ 0, √(n² − sin² i) < (k+1) cos i holds iff (n² − 1)/(k(k+2)) < cos² i. (Private.)
  - Closest known: The elementary squaring step of the classical derivation, using sin² + cos² = 1.
  - In Mathlib: partial: pow_lt_pow_iff_left₀ and sin_sq_add_cos_sq do the work; the equivalence itself is not stated
  - Caveat: Routine real algebra about standard functions only.
- **`Wyrd.Rainbow.deriv_aux_gt_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Deriv.lean:82` · both branches
  - Lean: `{n : ℝ} (hn : 1 < n) {k : ℕ} (hk : 1 ≤ k) {i : ℝ} (hi : 0 ≤ cos i) : (k + 1) * cos i < √(n ^ 2 - sin i ^ 2) ↔ cos i ^ 2 < (n ^ 2 - 1) / (k * (k + 2))`
  - Means: For real n > 1, natural k ≥ 1 and real i with cos i ≥ 0, (k+1) cos i < √(n² − sin² i) holds iff cos² i < (n² − 1)/(k(k+2)). (Private.)
  - Closest known: The mirror image of deriv_aux_lt_iff; elementary.
  - In Mathlib: partial: pow_lt_pow_iff_left₀ and sin_sq_add_cos_sq; the equivalence itself is not stated
  - Caveat: Routine real algebra.
- **`Wyrd.Rainbow.lt_of_deriv_sign`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/MinLemma.lean:13` · both branches
  - Lean: 

    ```lean
    {f : ℝ → ℝ} {a b c : ℝ} (hac : a ≤ c) (hcb : c ≤ b) (hf : ContinuousOn f (Set.Icc a b)) (hneg : ∀ x ∈ Set.Ioo a c, deriv f x < 0) (hpos : ∀ x ∈ Set.Ioo c b, 0 < deriv f x) : ∀ x ∈ Set.Icc a b, x ≠ c → f c < f x
    ```

  - Means: For f : ℝ → ℝ continuous on [a, b] with a ≤ c ≤ b, if f' < 0 on (a, c) and f' > 0 on (c, b), then f c < f x for every x ∈ [a, b] with x ≠ c.
  - Closest known: The strict first-derivative test of elementary calculus.
  - In Mathlib: partial: this is strictAntiOn_of_deriv_neg and strictMonoOn_of_deriv_pos combined; Mathlib's isMinOn_Icc_of_deriv (Analysis/Calculus/DerivativeTest.lean) is the non-strict version, with ContinuousAt at the three points plus DifferentiableOn instead of ContinuousOn on [a, b]
- **`Wyrd.Rainbow.isMinOn_of_deriv_sign`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/MinLemma.lean:33` · both branches
  - Lean: 

    ```lean
    {f : ℝ → ℝ} {a b c : ℝ} (hac : a ≤ c) (hcb : c ≤ b) (hf : ContinuousOn f (Set.Icc a b)) (hneg : ∀ x ∈ Set.Ioo a c, deriv f x < 0) (hpos : ∀ x ∈ Set.Ioo c b, 0 < deriv f x) : IsMinOn f (Set.Icc a b) c
    ```

  - Means: Under the same hypotheses as lt_of_deriv_sign, f attains its minimum over [a, b] at c (IsMinOn).
  - Closest known: The first-derivative test.
  - In Mathlib: partial: isMinOn_Icc_of_anti_mono (Order/Filter/Extr.lean) applied to the antitone and monotone pieces from strictAntiOn_of_deriv_neg and strictMonoOn_of_deriv_pos gives it in two lines. isMinOn_Icc_of_deriv (Analysis/Calculus/DerivativeTest.lean) has comparable hypotheses: ContinuousAt at three points, DifferentiableOn, non-strict signs.
  - Caveat: Nearly duplicates Mathlib's DerivativeTest lemmas.
- **`Wyrd.Rainbow.bow_aux_q_mem`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:18` · both branches
  - Lean: `{n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) : 0 < (n ^ 2 - 1) / (k * (k + 2)) ∧ (n ^ 2 - 1) / (k * (k + 2)) < 1`
  - Means: For real n and natural k ≥ 1 with 1 < n < k + 1, the number q = (n² − 1)/(k(k+2)) satisfies 0 < q < 1. (Private.)
  - Closest known: Elementary (n² − 1 < (k+1)² − 1 = k(k+2)). It encodes the classical condition n < k + 1 for the k-th order geometric bow to exist.
  - In Mathlib: no (elementary real inequality, proved with div_pos, div_lt_one and nlinarith)
- **`Wyrd.Rainbow.bow_aux_sqrt_mem`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:27` · both branches
  - Lean: `{n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) : 0 < √((n ^ 2 - 1) / (k * (k + 2))) ∧ √((n ^ 2 - 1) / (k * (k + 2))) < 1`
  - Means: Under the same hypotheses, 0 < √q < 1 with q = (n² − 1)/(k(k+2)). (Private.)
  - Closest known: Elementary.
  - In Mathlib: partial: Real.sqrt_pos and Real.sqrt_lt' applied to bow_aux_q_mem
- **`Wyrd.Rainbow.secondary_a_lo, secondary_b_lo (Secondary.lean) and spectrumSecondary_red_a_lo, spectrumSecondary_red_b_lo, spectrumSecondary_violet_a_lo, spectrumSecondary_violet_b_lo (SpectrumSecondary.lean) (6 private lemmas)`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Secondary.lean:45` · both branches
  - Lean: `: (7928 / 10000 : ℝ) < arcsin (√(65 / 128))`
  - Means: Each states a strict lower bound c < arcsin √q for specific rationals c and q ∈ (0, 1). Example: 0.7928 < arcsin √(65/128); the others are 0.3166 < arcsin √(7/72), 0.7949 < arcsin √(7228439/14172488), 0.3151 < arcsin √(771561/8000000), 0.7836 < arcsin √(7196351/14429192), 0.3218 < arcsin √(803649/8000000).
  - Closest known: Numerical facts about arcsin and √ (true values 0.79321, 0.31709, 0.79543, 0.31578, 0.78413, 0.32251).
  - In Mathlib: partial: Real.lt_arcsin_iff_sin_lt' reduces each to a sin bound. Mathlib's Real.sin_bound (error |x|^5/100, about 0.003 at x ≈ 0.79) is too coarse for these 4-digit brackets, so the project's sin_le_taylor5 is used.
  - Caveat: Numeric checks about standard functions (norm_num on rational Taylor polynomials). Lines: Secondary.lean 45, 67; SpectrumSecondary.lean 49, 71, 137, 161.
- **`Wyrd.Rainbow.secondary_a_hi, secondary_b_hi (Secondary.lean) and spectrumSecondary_red_a_hi, spectrumSecondary_red_b_hi, spectrumSecondary_violet_a_hi, spectrumSecondary_violet_b_hi (SpectrumSecondary.lean) (6 private lemmas)`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Secondary.lean:56` · both branches
  - Lean: `: arcsin (√(65 / 128)) < (7936 / 10000 : ℝ)`
  - Means: Each states a strict upper bound arcsin √q < c for specific rationals. Example: arcsin √(65/128) < 0.7936; the others are bounds by 0.3175, 0.7959, 0.3165, 0.7846 and 0.3232 for the same six arguments as the _lo family.
  - Closest known: Numerical facts about arcsin and √.
  - In Mathlib: partial: Real.arcsin_lt_iff_lt_sin' reduces each to a sin bound; the degree-7 lower bound used (taylor7_le_sin) is not in Mathlib
  - Caveat: Numeric checks about standard functions. Lines: Secondary.lean 56, 78; SpectrumSecondary.lean 60, 82, 149, 172.
- **`Wyrd.Rainbow.trig_aux_nonneg`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/TrigBounds.lean:18` · both branches
  - Lean: `{g g' : ℝ → ℝ} (hg : ∀ x, HasDerivAt g (g' x) x) (h0 : g 0 = 0) (hd : ∀ x, 0 ≤ x → 0 ≤ g' x) {x : ℝ} (hx : 0 ≤ x) : 0 ≤ g x`
  - Means: If g : ℝ → ℝ has derivative g' everywhere, g(0) = 0 and g' ≥ 0 on [0, ∞), then g(x) ≥ 0 for all x ≥ 0. (Private theorem.)
  - Closest known: The mean value theorem / monotonicity from a nonnegative derivative.
  - In Mathlib: partial: monotoneOn_of_deriv_nonneg (this is a direct specialization on Set.Ici 0)

#### Body-water physiology models and Limits models

- **`Wyrd.BodyWater.dilution_overestimate`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Compartments.lean:71` · both branches
  - Lean: `{I V e : ℝ} (hI : 0 < I) (hV : 0 < V) (he0 : 0 < e) (he1 : e < 1) : I / ((1 - e) * I / V) = V / (1 - e) ∧ V < I / ((1 - e) * I / V)`
  - Means: For reals I, V > 0 and 0 < e < 1, I / ((1 - e) I / V) equals V / (1 - e) and is strictly greater than V.
  - Closest known: Tracer loss or non-aqueous exchange inflating a dilution space; e.g. Schoeller et al. 1980 (Am J Clin Nutr 33:2686) found the 2H dilution space about 3% larger than the 18O space.
  - In Mathlib: partial: div_div_cancel₀, lt_div_iff₀ (field identity plus x < x/(1-e)); no named lemma
  - Caveat: Assumes the measured concentration is exactly (1 - e) I / V. The 'about 4%' figure for D2O in the doc and README is a literature value, not proved.
- **`Wyrd.BodyWater.blood_volume`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Compartments.lean:84` · both branches
  - Lean: `{pv hct : ℝ} (hpv : 0 < pv) (h0 : 0 < hct) (h1 : hct < 1) : pv < pv / (1 - hct) ∧ pv / (1 - hct) * (1 - hct) = pv`
  - Means: For real pv > 0 and 0 < hct < 1, pv < pv / (1 - hct), and pv / (1 - hct) * (1 - hct) = pv.
  - Closest known: Textbook relation blood volume = plasma volume / (1 - haematocrit).
  - In Mathlib: partial: div_mul_cancel₀ gives the second conjunct verbatim; the first is lt_div_iff₀ plus positivity
  - Caveat: Does not derive BV = PV/(1 - Hct). It only checks that this quantity exceeds pv and cancels back.
- **`Wyrd.BodyWater.term_and_one_year_add_up`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Newborn.lean:44` · both branches
  - Lean: `: (44 : ℝ) + 34 = 78 ∧ (78 : ℝ) + 22 = 100 ∧ (70 : ℝ) - 42 = 28 ∧ (70 : ℝ) + 30 = 100`
  - Means: Real arithmetic: 44 + 34 = 78, 78 + 22 = 100, 70 - 42 = 28 and 70 + 30 = 100.
  - Closest known: Classic fetal and newborn body-water fractions (Friis-Hansen 1961, Pediatrics 28:169); the file's figures come from an abdominalkey.com chapter.
  - In Mathlib: yes: norm_num arithmetic (no named declaration needed)
  - Caveat: Arithmetic on quoted percentages only. The percentages are empirical inputs that are not checked.
- **`Wyrd.BodyWater.water_fraction_falls`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Newborn.lean:51` · both branches
  - Lean: `{B T x : ℝ} (hx : 0 < x) (hxT : x < T) (hTB : T < B) : (T - x) / (B - x) < T / B`
  - Means: For reals 0 < x < T < B, (T - x)/(B - x) < T/B: removing the same positive amount from the numerator and denominator of a proper fraction lowers it.
  - Closest known: Elementary fraction inequality (equivalent to x(B - T) > 0 after cross-multiplying).
  - In Mathlib: partial: div_lt_div_iff₀ (cross-multiplication); no named lemma found (searched: mediant, sub_div_sub)
  - Caveat: Reading it as extracellular water loss after birth is interpretation. The statement is a pure real inequality.
- **`Wyrd.BodyWater.term_newborn_ten_percent_loss`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Newborn.lean:59` · both branches
  - Lean: `: (78 - 10) / (100 - 10 : ℝ) = 68 / 90 ∧ (68 / 90 : ℝ) < 78 / 100 ∧ (44 - 10) / (100 - 10 : ℝ) = 34 / 90 ∧ (34 / 90 : ℝ) < 44 / 100`
  - Means: Real arithmetic: 68/90 = (78 - 10)/(100 - 10) < 78/100, and 34/90 = (44 - 10)/(100 - 10) < 44/100.
  - Closest known: Physiologic early weight loss of newborns (the source chapter); arithmetic only.
  - In Mathlib: yes: norm_num arithmetic
  - Caveat: Assumes that the whole 10% loss is extracellular water, which the module doc itself says is not physiologically exact.
- **`Wyrd.BodyWater.newborn_scaling_example`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Sodium.lean:138` · both branches
  - Lean: `: (142 : ℝ) / 100 < (2.34 + 1) / (2.34 + 0.01)`
  - Means: Real arithmetic: 1.42 < 3.34/2.35 (about 1.4213).
  - Closest known: Numeric instance of per_litre_scaling_ratio for W = 2.34 L and v = 0.01 L.
  - In Mathlib: yes: norm_num arithmetic
  - Caveat: A numeric check. W = 0.78 × 3 kg is an assumed newborn water volume.
- **`Wyrd.Limits.bist_det3 (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:321` · new-session branch only
  - Lean: 

    ```lean
    (M : Matrix (Fin 3) (Fin 3) ℝ) (s : ℂ) : (s • (1 : Matrix (Fin 3) (Fin 3) ℂ) - M.map (fun r : ℝ => (r : ℂ))).det = s ^ 3 + ((-(M 0 0 + M 1 1 + M 2 2) : ℝ) : ℂ) * s ^ 2 + ((M 0 0 * M 1 1 - M 0 1 * M 1 0 + M 0 0 * M 2 2 - M 0 2 * M 2 0 + M 1 1 * M 2 2 - M 1 2 * M 2 1 : ℝ) : ℂ) * s + ((-M.det : ℝ) : ℂ)
    ```

  - Means: For a real 3×3 matrix M and complex s, det(sI - M) = s³ - tr(M) s² + (sum of principal 2×2 minors) s - det M.
  - Closest known: The coefficients of the characteristic polynomial of a 3×3 matrix.
  - In Mathlib: partial: Matrix.det_fin_three (expanded twice), Matrix.trace_eq_neg_charpoly_coeff, Matrix.det_eq_sign_charpoly_coeff
- **`Wyrd.Limits.lim_term (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:54` · new-session branch only
  - Lean: 

    ```lean
    (k n m : ℕ) (ψ₀ : ℝ) (j : ℕ) : Complex.exp ((((k : ℝ) * (ψ₀ + 2 * π * (m : ℝ) * (j : ℝ) / (n : ℝ)) : ℝ) : ℂ) * I) = Complex.exp (((k * ψ₀ : ℝ) : ℂ) * I) * Complex.exp (((2 * π * ((k * m : ℕ) : ℝ) / (n : ℝ) : ℝ) : ℂ) * I) ^ j
    ```

  - Means: exp(i k(ψ₀ + 2π m j/n)) = exp(i k ψ₀) · (exp(2π i km/n))^j for naturals k, n, m, j and real ψ₀.
  - Closest known: Exponential law.
  - In Mathlib: partial: Complex.exp_nat_mul, Complex.exp_add
- **`Wyrd.Limits.lim_geom_zero (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:63` · new-session branch only
  - Lean: `(p q : ℕ) (hq : 0 < q) (h : ¬ q ∣ p) : ∑ j ∈ Finset.range q, Complex.exp (((2 * π * (p : ℝ) / (q : ℝ) : ℝ) : ℂ) * I) ^ j = 0`
  - Means: For naturals q > 0 and p with q ∤ p, the sum over j < q of exp(2π i p/q)^j is 0.
  - Closest known: The powers of a nontrivial q-th root of unity sum to zero (discrete orthogonality).
  - In Mathlib: yes in substance: geom_sum_eq (x ≠ 1 → Σ_{i<n} x^i = (x^n − 1)/(x − 1)) with Complex.exp_nat_mul_two_pi_mul_I and Complex.exp_eq_one_iff. Equivalent to AddChar.sum_eq_zero_of_ne_one (NumberTheory/LegendreSymbol/AddCharacter.lean) and AddChar.sum_eq_zero_iff_ne_zero (Algebra/Group/AddChar.lean).
  - Caveat: Routine orthogonality of the powers of a root of unity ζ ≠ 1. Mathlib covers it through geom_sum_eq and the AddChar sum lemmas.
- **`Wyrd.Limits.sessions_chebyshev`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Sessions.lean:26` · new-session branch only
  - Lean: 

    ```lean
    {Ω : Type*} [MeasurableSpace Ω] {μ : Measure Ω} [IsProbabilityMeasure μ] {X : ℕ → Ω → ℝ} {m σ2 t : ℝ} {n : ℕ} (hn : 0 < n) (ht : 0 < t) (hX : ∀ i, MemLp (X i) 2 μ) (hind : Pairwise fun i j => IndepFun (X i) (X j) μ) (hmean : ∀ i, μ[X i] = m) (hvar : ∀ i, variance (X i) μ = σ2) : μ {ω | t ≤ |(∑ i ∈ Finset.range n, X i ω) / n - m|} ≤ ENNReal.ofReal (σ2 / (n * t ^ 2))
    ```

  - Means: On a probability space, for pairwise-independent square-integrable real X_i with common mean m and variance σ2, and n > 0, t > 0, the probability that the mean of X_0, ..., X_{n-1} differs from m by at least t is at most σ2/(n t²).
  - Closest known: Chebyshev's inequality for the sample mean (Bienaymé-Chebyshev; the textbook proof of the weak law of large numbers).
  - In Mathlib: partial: ProbabilityTheory.meas_ge_le_variance_div_sq + ProbabilityTheory.IndepFun.variance_sum; the theorem is their direct combination
- **`Wyrd.Limits.sessions_enough`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Sessions.lean:65` · new-session branch only
  - Lean: 

    ```lean
    {Ω : Type*} [MeasurableSpace Ω] {μ : Measure Ω} [IsProbabilityMeasure μ] {X : ℕ → Ω → ℝ} {m σ2 Δ δ : ℝ} {n : ℕ} (hn : 0 < n) (hΔ : 0 < Δ) (hδ : 0 < δ) (hX : ∀ i, MemLp (X i) 2 μ) (hind : Pairwise fun i j => IndepFun (X i) (X j) μ) (hmean : ∀ i, μ[X i] = m) (hvar : ∀ i, variance (X i) μ = σ2) (hN : 4 * σ2 / (δ * Δ ^ 2) ≤ n) : μ {ω | Δ / 2 ≤ |(∑ i ∈ Finset.range n, X i ω) / n - m|} ≤ ENNReal.ofReal δ
    ```

  - Means: Under the same hypotheses with Δ, δ > 0 and n ≥ 4σ2/(δΔ²), the probability that the sample mean differs from m by at least Δ/2 is at most δ.
  - Closest known: Chebyshev sample-size bound n ≥ σ²/(δ ε²) with ε = Δ/2.
  - In Mathlib: partial: ProbabilityTheory.meas_ge_le_variance_div_sq, ProbabilityTheory.IndepFun.variance_sum
  - Caveat: The nearer-mean decision rule is not formalised; its error event is contained in the bounded event. σ2 and Δ are inputs.
- **`Wyrd.Limits.q10_per_degree`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Values.lean:39` · new-session branch only
  - Lean: `: 1.082 < (2.2 : ℝ) ^ (1 / 10 : ℝ) ∧ (2.2 : ℝ) ^ (1 / 10 : ℝ) < 1.0821`
  - Means: The real number 2.2^(1/10) lies in (1.082, 1.0821).
  - Closest known: Q10 temperature coefficient: the rate factor per degree is Q10^(1/10).
  - In Mathlib: partial: Real.pow_rpow_inv_natCast, Real.rpow_lt_rpow
  - Caveat: A numeric check of the model's chosen constant Q10 = 2.2.
- **`Wyrd.Limits.chest_warmth_rate`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Values.lean:47` · new-session branch only
  - Lean: `: 1.0279 < (2.2 : ℝ) ^ (0.035 : ℝ) ∧ (2.2 : ℝ) ^ (0.035 : ℝ) < 1.0281`
  - Means: The real number 2.2^0.035 lies in (1.0279, 1.0281).
  - Closest known: Q10 scaling for a 0.35 °C change.
  - In Mathlib: partial: Real.rpow_natCast, Real.rpow_mul
  - Caveat: A numeric check of model constants.
- **`Wyrd.Limits.chest_warmth_bpm`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Values.lean:58` · new-session branch only
  - Lean: `: 3.9 < 140 * ((2.2 : ℝ) ^ (0.035 : ℝ) - 1) ∧ 140 * ((2.2 : ℝ) ^ (0.035 : ℝ) - 1) < 3.94`
  - Means: 140·(2.2^0.035 - 1) lies in (3.9, 3.94).
  - Closest known: Arithmetic consequence of chest_warmth_rate.
  - In Mathlib: no (linarith on chest_warmth_rate)
  - Caveat: A numeric check of model constants.
- **`Wyrd.Limits.warming_solution`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Values.lean:64` · new-session branch only
  - Lean: `(Tc t : ℝ) : HasDerivAt (fun s => Tc * (1 - Real.exp (-s / 400))) ((Tc - Tc * (1 - Real.exp (-t / 400))) / 400) t ∧ Tc * (1 - Real.exp (-0 / 400)) = 0`
  - Means: For real Tc, T(s) = Tc(1 - e^{-s/400}) has derivative (Tc - T(t))/400 at every t, and T(0) = 0.
  - Closest known: Solution of first-order relaxation (Newton's law of heating).
  - In Mathlib: partial: HasDerivAt.exp, HasDerivAt.const_sub, HasDerivAt.const_mul
  - Caveat: A derivative check. Uniqueness of the solution is not stated.
- **`Wyrd.Limits.warming_after_twelve_minutes`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Values.lean:76` · new-session branch only
  - Lean: `: 0.8346 < 1 - Real.exp (-(720 / 400)) ∧ 1 - Real.exp (-(720 / 400)) < 0.8348`
  - Means: 1 - e^{-1.8} lies in (0.8346, 0.8348).
  - Closest known: Numeric value of 1 - e^{-1.8} (about 0.83470).
  - In Mathlib: partial: Real.exp_bound (10-term Taylor bound, used)
  - Caveat: A numeric check (12 minutes against the model's 400 s time constant).

#### Periodic Navier–Stokes I: the phase family, symmetries, selection rules, averages

- **`Wyrd.PeriodicNS.Example_deriv_sin_const_add (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:21` · new-session branch only
  - Lean: `(c y : ℝ) : deriv (fun s => sin (c + s)) y = cos (c + y)`
  - Means: For real c and y, the derivative of s ↦ sin(c + s) at y is cos(c + y).
  - Closest known: Chain rule for a shifted sine; Mathlib deriv_comp_const_add together with Real.deriv_sin.
  - In Mathlib: partial: deriv_comp_const_add (Analysis/Calculus/Deriv/Shift.lean) composed with Real.deriv_sin
  - Caveat: Private simp helper.
- **`Wyrd.PeriodicNS.Example_deriv_cos_const_add (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:26` · new-session branch only
  - Lean: `(c y : ℝ) : deriv (fun s => cos (c + s)) y = -sin (c + y)`
  - Means: For real c and y, the derivative of s ↦ cos(c + s) at y is −sin(c + y).
  - Closest known: Chain rule for a shifted cosine.
  - In Mathlib: partial: deriv_comp_const_add composed with Real.deriv_cos
  - Caveat: Private simp helper.
- **`Wyrd.PeriodicNS.Averages_I3_add (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:22` · new-session branch only
  - Lean: 

    ```lean
    {f g : ℝ → ℝ → ℝ → ℝ} (hf : Continuous fun p : ℝ × ℝ × ℝ => f p.1 p.2.1 p.2.2) (hg : Continuous fun p : ℝ × ℝ × ℝ => g p.1 p.2.1 p.2.2) : Averages_I3 (fun x y z => f x y z + g x y z) = Averages_I3 f + Averages_I3 g
    ```

  - Means: For jointly continuous f and g on ℝ³, the iterated integral over [0,2π]³ of f + g is the sum of their iterated integrals.
  - Closest known: Linearity of the integral, plus continuity of parametric integrals for the integrability of the inner integrals.
  - In Mathlib: partial: intervalIntegral.integral_add with intervalIntegral.continuous_parametric_intervalIntegral_of_continuous'
  - Caveat: Private helper. Duplicated verbatim as PhaseFamily_I3_add.
- **`Wyrd.PeriodicNS.Averages_int_cos (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:62` · new-session branch only
  - Lean: `(n : ℤ) (d : ℝ) : ∫ t in (0 : ℝ)..2 * π, cos (d + n * t) = if n = 0 then 2 * π * cos d else 0`
  - Means: For an integer n and a real d, ∫₀^{2π} cos(d + n t) dt equals 2π cos d when n = 0 and 0 otherwise.
  - Closest known: Orthogonality of the trigonometric system on a period (any harmonic analysis text, e.g. Katznelson, An Introduction to Harmonic Analysis, ch. I).
  - In Mathlib: partial: follows directly from intervalIntegral.integral_comp_add_mul, integral_cos and Real.sin_add_int_mul_two_pi; orthonormal_fourier is the complex-exponential L² version on AddCircle
  - Caveat: Private helper. Duplicated as PhaseFamily_int_cos.
- **`Wyrd.PeriodicNS.Averages_int_sin (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:71` · new-session branch only
  - Lean: `(n : ℤ) (d : ℝ) : ∫ t in (0 : ℝ)..2 * π, sin (d + n * t) = if n = 0 then 2 * π * sin d else 0`
  - Means: For an integer n and a real d, ∫₀^{2π} sin(d + n t) dt equals 2π sin d when n = 0 and 0 otherwise.
  - Closest known: Orthogonality of the trigonometric system on a period.
  - In Mathlib: partial: intervalIntegral.integral_comp_add_mul, integral_sin, Real.cos_add_int_mul_two_pi
  - Caveat: Private helper. Duplicated as PhaseFamily_int_sin.
- **`Wyrd.PeriodicNS.Averages_tm_cont (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:129` · new-session branch only
  - Lean: `(m : ℝ × ℝ × ℤ × ℤ × ℤ) : Continuous fun p : ℝ × ℝ × ℝ => Averages_tm m p.1 p.2.1 p.2.2`
  - Means: A single encoded Fourier mode a cos(k·x) + b sin(k·x), with k ∈ ℤ³, is jointly continuous on ℝ³.
  - Closest known: Continuity of sin and cos and closure of continuity under sums and products.
  - In Mathlib: partial: fun_prop over Real.continuous_sin / Real.continuous_cos
  - Caveat: Private helper about the project's encoding of modes. Duplicated as PhaseFamily_tm_cont.
- **`Wyrd.PeriodicNS.Averages_tp_cont (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:133` · new-session branch only
  - Lean: `(L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) : Continuous fun p : ℝ × ℝ × ℝ => Averages_tp L p.1 p.2.1 p.2.2`
  - Means: A finite list-sum of encoded Fourier modes is jointly continuous on ℝ³.
  - Closest known: A finite sum of continuous functions is continuous.
  - In Mathlib: partial: Continuous.add (by induction on the list)
  - Caveat: Private helper. Duplicated as PhaseFamily_tp_cont.
- **`Wyrd.PeriodicNS.Averages_sin_cube (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:187` · new-session branch only
  - Lean: `(t : ℝ) : sin t ^ 3 = sin t - sin t * cos t ^ 2`
  - Means: For real t, sin³ t = sin t − sin t cos² t.
  - Closest known: Pythagorean identity sin² + cos² = 1.
  - In Mathlib: partial: Real.sin_sq_add_cos_sq (one linear_combination step)
  - Caveat: Private normalisation helper. Duplicated as PhaseFamily_sin_cube.
- **`Wyrd.PeriodicNS.PhaseFamily_deriv_cos_mid (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:44` · new-session branch only
  - Lean: `(c d t : ℝ) : deriv (fun s => cos (c + s + d)) t = -sin (c + t + d)`
  - Means: For real c, d and t, the derivative of s ↦ cos(c + s + d) at t is −sin(c + t + d).
  - Closest known: Chain rule.
  - In Mathlib: partial: deriv_comp_add_const / deriv_comp_const_add with Real.deriv_cos
  - Caveat: Private simp helper.
- **`Wyrd.PeriodicNS.PhaseFamily_deriv_sin_mid (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:50` · new-session branch only
  - Lean: `(c d t : ℝ) : deriv (fun s => sin (c + s + d)) t = cos (c + t + d)`
  - Means: For real c, d and t, the derivative of s ↦ sin(c + s + d) at t is cos(c + t + d).
  - Closest known: Chain rule.
  - In Mathlib: partial: deriv_comp_add_const / deriv_comp_const_add with Real.deriv_sin
  - Caveat: Private simp helper.
- **`Wyrd.PeriodicNS.PhaseFamily_I3_add (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:101` · new-session branch only
  - Lean: 

    ```lean
    {f g : ℝ → ℝ → ℝ → ℝ} (hf : Continuous fun p : ℝ × ℝ × ℝ => f p.1 p.2.1 p.2.2) (hg : Continuous fun p : ℝ × ℝ × ℝ => g p.1 p.2.1 p.2.2) : PhaseFamily_I3 (fun x y z => f x y z + g x y z) = PhaseFamily_I3 f + PhaseFamily_I3 g
    ```

  - Means: For jointly continuous f and g, the iterated integral over [0,2π]³ is additive (a duplicate of Averages_I3_add).
  - Closest known: Linearity of the integral.
  - In Mathlib: partial: intervalIntegral.integral_add with intervalIntegral.continuous_parametric_intervalIntegral_of_continuous'
  - Caveat: Verbatim duplicate of the Averages helper.
- **`Wyrd.PeriodicNS.PhaseFamily_int_cos (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:141` · new-session branch only
  - Lean: `(n : ℤ) (d : ℝ) : ∫ t in (0 : ℝ)..2 * π, cos (d + n * t) = if n = 0 then 2 * π * cos d else 0`
  - Means: ∫₀^{2π} cos(d + n t) dt is 2π cos d if n = 0 and 0 otherwise, for n ∈ ℤ (a duplicate).
  - Closest known: Orthogonality of the trigonometric system.
  - In Mathlib: partial: intervalIntegral.integral_comp_add_mul, integral_cos, Real.sin_add_int_mul_two_pi
  - Caveat: Duplicate of Averages_int_cos.
- **`Wyrd.PeriodicNS.PhaseFamily_int_sin (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:150` · new-session branch only
  - Lean: `(n : ℤ) (d : ℝ) : ∫ t in (0 : ℝ)..2 * π, sin (d + n * t) = if n = 0 then 2 * π * sin d else 0`
  - Means: ∫₀^{2π} sin(d + n t) dt is 2π sin d if n = 0 and 0 otherwise, for n ∈ ℤ (a duplicate).
  - Closest known: Orthogonality of the trigonometric system.
  - In Mathlib: partial: intervalIntegral.integral_comp_add_mul, integral_sin, Real.cos_add_int_mul_two_pi
  - Caveat: Duplicate of Averages_int_sin.
- **`Wyrd.PeriodicNS.PhaseFamily_tm_cont (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:208` · new-session branch only
  - Lean: `(m : ℝ × ℝ × ℤ × ℤ × ℤ) : Continuous fun p : ℝ × ℝ × ℝ => PhaseFamily_tm m p.1 p.2.1 p.2.2`
  - Means: One encoded Fourier mode is jointly continuous on ℝ³ (a duplicate).
  - Closest known: Continuity of sin and cos.
  - In Mathlib: partial: fun_prop over Real.continuous_sin / Real.continuous_cos
  - Caveat: Duplicate of Averages_tm_cont.
- **`Wyrd.PeriodicNS.PhaseFamily_tp_cont (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:212` · new-session branch only
  - Lean: `(L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) : Continuous fun p : ℝ × ℝ × ℝ => PhaseFamily_tp L p.1 p.2.1 p.2.2`
  - Means: A finite list-sum of encoded modes is jointly continuous on ℝ³ (a duplicate).
  - Closest known: A finite sum of continuous functions is continuous.
  - In Mathlib: partial: Continuous.add
  - Caveat: Duplicate of Averages_tp_cont.
- **`Wyrd.PeriodicNS.PhaseFamily_sin_cube (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:267` · new-session branch only
  - Lean: `(t : ℝ) : sin t ^ 3 = sin t - sin t * cos t ^ 2`
  - Means: For real t, sin³ t = sin t − sin t cos² t (a duplicate).
  - Closest known: sin² + cos² = 1.
  - In Mathlib: partial: Real.sin_sq_add_cos_sq
  - Caveat: Duplicate of Averages_sin_cube.
- **`Wyrd.PeriodicNS.PhaseFamily_dx_smul (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:357` · new-session branch only
  - Lean: `(A : ℝ) (f : ℝ → ℝ → ℝ → ℝ) : dx (fun x y z => A * f x y z) = fun x y z => A * dx f x y z`
  - Means: The project's x-partial derivative commutes with multiplication by a real constant A, with no differentiability assumption.
  - Closest known: Linearity of the derivative.
  - In Mathlib: partial: deriv_const_mul_field (applied in one coordinate through the project's dx)
  - Caveat: Private helper.
- **`Wyrd.PeriodicNS.PhaseFamily_dy_smul (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:362` · new-session branch only
  - Lean: `(A : ℝ) (f : ℝ → ℝ → ℝ → ℝ) : dy (fun x y z => A * f x y z) = fun x y z => A * dy f x y z`
  - Means: The project's y-partial derivative commutes with multiplication by a constant.
  - Closest known: Linearity of the derivative.
  - In Mathlib: partial: deriv_const_mul_field
  - Caveat: Private helper.
- **`Wyrd.PeriodicNS.PhaseFamily_dz_smul (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:367` · new-session branch only
  - Lean: `(A : ℝ) (f : ℝ → ℝ → ℝ → ℝ) : dz (fun x y z => A * f x y z) = fun x y z => A * dz f x y z`
  - Means: The project's z-partial derivative commutes with multiplication by a constant.
  - Closest known: Linearity of the derivative.
  - In Mathlib: partial: deriv_const_mul_field
  - Caveat: Private helper.
- **`Wyrd.PeriodicNS.PhaseFamily_avg_eq_mul (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:378` · new-session branch only
  - Lean: `{f g : ℝ → ℝ → ℝ → ℝ} (c : ℝ) (h : ∀ x y z, f x y z = c * g x y z) : avg f = c * avg g`
  - Means: If f = c·g pointwise, then avg f = c · avg g, with no integrability assumption.
  - Closest known: Homogeneity of the integral.
  - In Mathlib: partial: intervalIntegral.integral_const_mul (applied three times)
  - Caveat: Private helper.

#### Periodic Navier–Stokes II: scaling, blow-up rescalings, sign flip, Galerkin, Grönwall, quantifiers

- **`Wyrd.PeriodicNS.Scaling_I3_add`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:95` · new-session branch only
  - Lean: 

    ```lean
    {f g : ℝ → ℝ → ℝ → ℝ} (hf : Continuous fun p : ℝ × ℝ × ℝ => f p.1 p.2.1 p.2.2) (hg : Continuous fun p : ℝ × ℝ × ℝ => g p.1 p.2.1 p.2.2) : Scaling_I3 (fun x y z => f x y z + g x y z) = Scaling_I3 f + Scaling_I3 g
    ```

  - Means: For f, g : ℝ→ℝ→ℝ→ℝ jointly continuous on ℝ³, the iterated interval integral of f + g over [0,2π]³ is the sum of the two iterated integrals.
  - Closest known: Linearity of the integral.
  - In Mathlib: partial: intervalIntegral.integral_add with intervalIntegral.continuous_parametric_intervalIntegral_of_continuous', applied at each of the three levels of the iterated integral
  - Caveat: A private helper. Scaling_I3 is a private abbreviation for the unnormalised iterated integral. It is a verbatim copy, with the prefix renamed, of the private Averages_I3_add (Averages.lean:22, Averages group): Scaling.lean lines 87–262 duplicate Averages.lean lines 14–189 exactly. It adds nothing beyond that group and should get the same classification there.
- **`Wyrd.PeriodicNS.Scaling_int_cos`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:135` · new-session branch only
  - Lean: `(n : ℤ) (d : ℝ) : ∫ t in (0 : ℝ)..2 * π, cos (d + n * t) = if n = 0 then 2 * π * cos d else 0`
  - Means: For n ∈ ℤ and d ∈ ℝ, ∫₀^{2π} cos(d + n t) dt is 2π cos d when n = 0 and 0 otherwise.
  - Closest known: One-dimensional trigonometric orthogonality, as in any Fourier-series text (e.g. Katznelson, An Introduction to Harmonic Analysis, ch. I).
  - In Mathlib: partial: intervalIntegral.integral_comp_add_mul and integral_cos, with sin_add_int_mul_two_pi for periodicity
  - Caveat: A private helper. It is a verbatim renamed copy of Averages_int_cos (Averages.lean:62) and adds nothing beyond the Averages group.
- **`Wyrd.PeriodicNS.Scaling_int_sin`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:144` · new-session branch only
  - Lean: `(n : ℤ) (d : ℝ) : ∫ t in (0 : ℝ)..2 * π, sin (d + n * t) = if n = 0 then 2 * π * sin d else 0`
  - Means: For n ∈ ℤ and d ∈ ℝ, ∫₀^{2π} sin(d + n t) dt is 2π sin d when n = 0 and 0 otherwise.
  - Closest known: One-dimensional trigonometric orthogonality.
  - In Mathlib: partial: intervalIntegral.integral_comp_add_mul and integral_sin, with cos_add_int_mul_two_pi for periodicity
  - Caveat: A private helper. It is a verbatim renamed copy of Averages_int_sin (Averages.lean:71) and adds nothing beyond the Averages group.
- **`Wyrd.PeriodicNS.Scaling_I3_cos`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:155` · new-session branch only
  - Lean: `(p q r : ℤ) : Scaling_I3 (fun x y z => cos (p * x + q * y + r * z)) = if (p, q, r) = (0, 0, 0) then (2 * π) ^ 3 else 0`
  - Means: For integers p, q, r, the iterated integral of cos(px + qy + rz) over [0,2π]³ is (2π)³ when (p,q,r) = (0,0,0) and 0 otherwise.
  - Closest known: Orthogonality of the Fourier modes on the 3-torus.
  - In Mathlib: partial: UnitAddTorus.orthonormal_mFourier (L² orthonormality of complex exponentials on the unit torus; a different normalisation and form, not iterated interval integrals of real cosines)
  - Caveat: A private helper, proved by applying Scaling_int_cos three times plus sin_int_mul_pi. It is a verbatim renamed copy of Averages_I3_cos (Averages.lean:82) and adds nothing beyond the Averages group.
- **`Wyrd.PeriodicNS.Scaling_I3_sin`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:174` · new-session branch only
  - Lean: `(p q r : ℤ) : Scaling_I3 (fun x y z => sin (p * x + q * y + r * z)) = 0`
  - Means: For all integers p, q, r, the iterated integral of sin(px + qy + rz) over [0,2π]³ is 0.
  - Closest known: Orthogonality of the Fourier modes on the 3-torus.
  - In Mathlib: partial: UnitAddTorus.orthonormal_mFourier (different form and normalisation)
  - Caveat: A private helper. It is a verbatim renamed copy of Averages_I3_sin (Averages.lean:101) and adds nothing beyond the Averages group.
- **`Wyrd.PeriodicNS.Scaling_sin_cube`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:260` · new-session branch only
  - Lean: `(t : ℝ) : sin t ^ 3 = sin t - sin t * cos t ^ 2`
  - Means: For real t, sin³t = sin t − sin t · cos²t.
  - Closest known: Pythagorean identity sin² + cos² = 1.
  - In Mathlib: partial: Real.sin_sq_add_cos_sq (a one-line consequence)
  - Caveat: A private helper. It is a verbatim renamed copy of Averages_sin_cube (Averages.lean:187).
- **`Wyrd.PeriodicNS.core_volume`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/CoreScaling.lean:26` · new-session branch only
  - Lean: `{τ h : ℝ} (hτ : 0 < τ) : (τ ^ ((1 : ℝ) / 2)) ^ 2 * τ ^ ((1 : ℝ) / 2 - h) = τ ^ ((3 : ℝ) / 2 - h)`
  - Means: For τ > 0 and real h, (τ^{1/2})² · τ^{1/2−h} = τ^{3/2−h}.
  - Closest known: The exponent law for real powers. Physically it is the volume ℓ_r²ℓ_z of an anisotropic core.
  - In Mathlib: partial: Real.rpow_add, Real.rpow_mul_natCast (the identity is their direct combination)
  - Caveat: Exponent arithmetic only. No core, field or solution is defined.
- **`Wyrd.PeriodicNS.core_energy`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/CoreScaling.lean:34` · new-session branch only
  - Lean: `{τ h : ℝ} (hτ : 0 < τ) : τ ^ ((3 : ℝ) / 2 - h) * (τ ^ (-((1 : ℝ) / 2 + h))) ^ 2 = τ ^ ((1 : ℝ) / 2 - 3 * h)`
  - Means: For τ > 0 and real h, τ^{3/2−h} · (τ^{−(1/2+h)})² = τ^{1/2−3h}.
  - Closest known: The exponent law for real powers.
  - In Mathlib: partial: Real.rpow_add, Real.rpow_mul_natCast
  - Caveat: Exponent arithmetic only. The reading 'core kinetic energy' is prose.
- **`Wyrd.PeriodicNS.energy_vanishes_speed_blows`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/CoreScaling.lean:43` · new-session branch only
  - Lean: 

    ```lean
    {h : ℝ} (h1 : h < 1 / 6) (h0 : -(1 / 2) < h) : Tendsto (fun τ : ℝ => τ ^ ((1 : ℝ) / 2 - 3 * h)) (𝓝[>] 0) (𝓝 0) ∧ Tendsto (fun τ : ℝ => τ ^ (-((1 : ℝ) / 2 + h))) (𝓝[>] 0) atTop
    ```

  - Means: For real h with −1/2 < h < 1/6, τ^{1/2−3h} → 0 and τ^{−(1/2+h)} → +∞ as τ → 0⁺.
  - Closest known: Mathlib's real-power limits. Physically: kinetic energy is supercritical for the Navier–Stokes scaling u_λ(x,t) = λu(λx, λ²t), so an energy bound does not control local speed. For Leray's (1934) self-similar ansatz the energy in the shrinking core likewise tends to 0 while the speed blows up.
  - In Mathlib: partial: tendsto_rpow_neg_nhdsGT_zero (the second conjunct exactly); Real.continuousAt_rpow_const with Real.zero_rpow (the first conjunct)
  - Caveat: Exponent arithmetic only, as the file says. The README's 'a shrinking core can carry vanishing energy while its speed blows up' is not a Lean statement about any field or solution.
- **`Wyrd.PeriodicNS.radial_reynolds_const`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Blowup.lean:34` · new-session branch only
  - Lean: `{τ : ℝ} (hτ : 0 < τ) : τ ^ ((1 : ℝ) / 2) * τ ^ (-(1 : ℝ) / 2) = 1`
  - Means: For τ > 0, τ^{1/2} · τ^{−1/2} = 1.
  - Closest known: The Reynolds number ul/ν is invariant under the Navier–Stokes scaling u_λ(x,t) = λu(λx, λ²t). The matching blow-up form is Leray's (1934) self-similar ansatz u ~ (T−t)^{−1/2} U(x/√(T−t)).
  - In Mathlib: partial: Real.rpow_add (with Real.rpow_zero)
  - Caveat: A trivial real-power identity. The 'radial Reynolds number' reading is prose.
- **`Wyrd.PeriodicNS.swirl_reynolds_eq`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Blowup.lean:41` · new-session branch only
  - Lean: `{τ h : ℝ} (hτ : 0 < τ) : τ ^ ((1 : ℝ) / 2 - h) * τ ^ (-((1 : ℝ) / 2 + h)) = τ ^ (-2 * h)`
  - Means: For τ > 0 and real h, τ^{1/2−h} · τ^{−(1/2+h)} = τ^{−2h}.
  - Closest known: The exponent law for real powers.
  - In Mathlib: partial: Real.rpow_add
  - Caveat: Exponent arithmetic. The scalings come from slides that are not in the repo.
- **`Wyrd.PeriodicNS.swirl_reynolds_blowup`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Blowup.lean:49` · new-session branch only
  - Lean: `{h : ℝ} (hh : 0 < h) : Tendsto (fun τ : ℝ => τ ^ ((1 : ℝ) / 2 - h) * τ ^ (-((1 : ℝ) / 2 + h))) (𝓝[>] 0) atTop`
  - Means: For h > 0, τ^{1/2−h} · τ^{−(1/2+h)} → +∞ as τ → 0⁺.
  - Closest known: tendsto_rpow_neg_nhdsGT_zero applied to τ^{−2h}. Physically: u_r ~ τ^{−1/2} is Leray's (1934) minimal blow-up rate ‖u(t)‖_∞ ≳ (T − t)^{−1/2}, while u_θ ~ τ^{−(1/2+h)} with h > 0 is a Type II (faster than self-similar) rate. That rate is not excluded by the axisymmetric Type I results of Chen–Strain–Yau–Tsai (IMRN 2008) and Chen–Strain–Tsai–Yau (Comm. PDE 34, 2009) and Koch–Nadirashvili–Seregin–Šverák (Acta Math. 203, 2009), nor by the exclusion of Leray self-similar profiles by Nečas–Růžička–Šverák (Acta Math. 1996) and Tsai (ARMA 1998).
  - In Mathlib: partial: tendsto_rpow_neg_nhdsGT_zero (after rewriting with swirl_reynolds_eq)
  - Caveat: Exponent arithmetic. The file says explicitly that the reading 'viscosity cannot keep pace with the swirl' is not proved and that no solution with these scalings is constructed.
- **`Wyrd.PeriodicNS.swirl_length_shrinks`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Blowup.lean:57` · new-session branch only
  - Lean: `{h : ℝ} (hh : h < 1 / 2) : Tendsto (fun τ : ℝ => τ ^ ((1 : ℝ) / 2 - h)) (𝓝[>] 0) (𝓝 0)`
  - Means: For h < 1/2, τ^{1/2−h} → 0 as τ → 0⁺.
  - Closest known: Continuity of x ↦ x^p at 0 for p > 0.
  - In Mathlib: partial: Real.continuousAt_rpow_const with Real.zero_rpow
  - Caveat: Exponent arithmetic; no length scale of an actual flow is involved.
- **`Wyrd.PeriodicNS.vorticity_not_integrable`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Blowup.lean:73` · new-session branch only
  - Lean: `{tb : ℝ} (htb : 0 < tb) : ¬ IntervalIntegrable (fun t : ℝ => 1 / (tb - t)) MeasureTheory.volume 0 tb`
  - Means: For t_b > 0, the function t ↦ 1/(t_b − t) is not interval-integrable on [0, t_b].
  - Closest known: Mathlib's intervalIntegrable_sub_inv_iff. Physically: the Beale–Kato–Majda criterion (Beale, Kato & Majda 1984, Comm. Math. Phys. 94) says a smooth solution breaks down at T only if ∫₀^T ‖ω‖_∞ dt = ∞.
  - In Mathlib: partial: intervalIntegrable_sub_inv_iff (for (x − c)⁻¹; here 1/(t_b − t) = −(t − t_b)⁻¹ with c = t_b an endpoint)
  - Caveat: A fact about 1/(t_b − t) only. The BKM criterion is cited in the docstring but not formalised, and no vorticity appears in the statement. The docstring takes ω ~ u_r/l_r = 1/τ. If the swirl varies across the radial core scale ℓ_r ~ τ^{1/2}, as CoreScaling's core volume ℓ_r² ℓ_z suggests, the axial vorticity would scale as u_θ/ℓ_r ~ τ^{−(1+h)}, which is faster than 1/τ. That rate is also non-integrable, but Lean does not state it. BKM is necessary for blow-up, so this non-integrability is consistency with BKM, not evidence of blow-up.
- **`Wyrd.PeriodicNS.SignFlip_dx_smul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:29` · new-session branch only
  - Lean: `(A : ℝ) (f : ℝ → ℝ → ℝ → ℝ) : dx (fun x y z => A * f x y z) = fun x y z => A * dx f x y z`
  - Means: For any real A and any f : ℝ→ℝ→ℝ→ℝ, the project's ∂/∂x (Lean deriv in the first argument) of A·f is A times ∂f/∂x, with no differentiability hypothesis.
  - Closest known: deriv_const_mul_field
  - In Mathlib: partial: deriv_const_mul_field, applied pointwise in one coordinate through the project's dx wrapper
  - Caveat: A private helper.
- **`Wyrd.PeriodicNS.SignFlip_dy_smul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:34` · new-session branch only
  - Lean: `(A : ℝ) (f : ℝ → ℝ → ℝ → ℝ) : dy (fun x y z => A * f x y z) = fun x y z => A * dy f x y z`
  - Means: The same as SignFlip_dx_smul, for ∂/∂y.
  - Closest known: deriv_const_mul_field
  - In Mathlib: partial: deriv_const_mul_field (pointwise, through the dy wrapper)
  - Caveat: A private helper.
- **`Wyrd.PeriodicNS.SignFlip_dz_smul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:39` · new-session branch only
  - Lean: `(A : ℝ) (f : ℝ → ℝ → ℝ → ℝ) : dz (fun x y z => A * f x y z) = fun x y z => A * dz f x y z`
  - Means: The same as SignFlip_dx_smul, for ∂/∂z.
  - Closest known: deriv_const_mul_field
  - In Mathlib: partial: deriv_const_mul_field (pointwise, through the dz wrapper)
  - Caveat: A private helper.
- **`Wyrd.PeriodicNS.SignFlip_avg_eq_mul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:50` · new-session branch only
  - Lean: `{f g : ℝ → ℝ → ℝ → ℝ} (c : ℝ) (h : ∀ x y z, f x y z = c * g x y z) : avg f = c * avg g`
  - Means: If f = c·g everywhere on ℝ³, then the normalised average of f over [0,2π]³ is c times that of g. No integrability is needed.
  - Closest known: Linearity of the integral in a constant factor.
  - In Mathlib: partial: intervalIntegral.integral_const_mul (applied at three levels)
  - Caveat: A private helper.
- **`Wyrd.PeriodicNS.SignFlip_coeff_const_mul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:91` · new-session branch only
  - Lean: `(c : ℝ) (f : ℝ → ℝ → ℝ → ℝ) (k : ℤ × ℤ × ℤ) : coeff (fun x y z => c * f x y z) k = (c : ℂ) * coeff f k`
  - Means: For real c, any f and any wave vector k ∈ ℤ³, the project's Fourier coefficient of c·f on [0,2π]³ is c times that of f.
  - Closest known: Linearity of Fourier coefficients.
  - In Mathlib: partial: intervalIntegral.integral_const_mul with Complex.ofReal_mul (the project's coeff is not Mathlib's mFourierCoeff)
  - Caveat: A private helper.
- **`Wyrd.PeriodicNS.cutoff_bound`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Galerkin.lean:16` · new-session branch only
  - Lean: `{ι : Type*} (s : Finset ι) (k2 a : ι → ℝ) {K : ℝ} (hk : ∀ i ∈ s, k2 i ≤ K ^ 2) (ha : ∀ i ∈ s, 0 ≤ a i) : ∑ i ∈ s, k2 i * a i ≤ K ^ 2 * ∑ i ∈ s, a i`
  - Means: For a finite set s and reals with k2 i ≤ K² and a i ≥ 0 for every i ∈ s, Σ k2 i·a i ≤ K²·Σ a i.
  - Closest known: The Bernstein-type inverse inequality ‖∇P_K u‖₂² ≤ K²‖P_K u‖₂² for Fourier-truncated fields (e.g. Constantin & Foias 1988, Navier–Stokes Equations).
  - In Mathlib: partial: Finset.sum_le_sum and Finset.mul_sum (the proof is exactly these two lemmas)
  - Caveat: A generic weighted-sum inequality; no Fourier modes or fields appear.
- **`Wyrd.PeriodicNS.galerkin_enstrophy_bound`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Galerkin.lean:25` · new-session branch only
  - Lean: 

    ```lean
    {ι : Type*} (s : Finset ι) (k2 : ι → ℝ) {K : ℝ} (a a₀ : ι → ℝ) (hk : ∀ i ∈ s, k2 i ≤ K ^ 2) (ha : ∀ i ∈ s, 0 ≤ a i) (henergy : ∑ i ∈ s, a i ≤ ∑ i ∈ s, a₀ i) : (∑ i ∈ s, k2 i * a i) / 2 ≤ K ^ 2 * ((∑ i ∈ s, a₀ i) / 2)
    ```

  - Means: Under the hypotheses of cutoff_bound plus Σ a i ≤ Σ a₀ i, (Σ k2 i·a i)/2 ≤ K²·(Σ a₀ i)/2.
  - Closest known: The energy inequality for Fourier–Galerkin truncations (Temam 1977, Navier–Stokes Equations: Theory and Numerical Analysis; Constantin & Foias 1988), combined with the Bernstein bound.
  - In Mathlib: partial: Finset.sum_le_sum, Finset.mul_sum, mul_le_mul_of_nonneg_left
  - Caveat: The energy non-increase of the Galerkin system is an assumed hypothesis (henergy). No Galerkin ODE is defined, so this is a finite-sum inequality, not a theorem about Galerkin solutions.
- **`Wyrd.PeriodicNS.stretching_estimate_step`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Gronwall.lean:49` · new-session branch only
  - Lean: `{S D Zv a ν δ : ℝ} (hν : 0 ≤ ν) (hδ : 0 ≤ δ) (hD : 0 ≤ D) (h : S ≤ (1 - δ) * ν * D + a * Zv) : S - ν * D ≤ a * Zv`
  - Means: For reals with ν, δ, D ≥ 0, S ≤ (1 − δ)νD + aZ implies S − νD ≤ aZ.
  - Closest known: Elementary arithmetic.
  - In Mathlib: partial: mul_nonneg plus linear arithmetic (no named lemma; closed by nlinarith)
  - Caveat: The hypothesis S ≤ (1 − δ)νD + aZ, with a controlled independently and ∫a < ∞, is exactly the missing uniform estimate, which is open. The step itself is trivial arithmetic about real numbers.

#### Shared Air feedback model

- **`Wyrd.SharedAir.Optimal_P_cont (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Optimal.lean:32` · new-session branch only
  - Lean: `(a b d c h g : ℝ) : Continuous (P a b d c h g)`
  - Means: For fixed real coefficients, s ↦ P(s, g) is continuous on ℝ.
  - Closest known: Polynomials are continuous.
  - In Mathlib: partial: Polynomial.continuous (for Polynomial.eval; here P is a function expression and the proof is fun_prop)
  - Caveat: Private helper.
- **`Wyrd.SharedAir.averaged_equilibrium_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Locking.lean:26` · both branches
  - Lean: `{Δ k : ℝ} (hk : 0 < k) : (∃ φ : ℝ, Δ - k * Real.sin φ = 0) ↔ |Δ| ≤ k`
  - Means: For real Δ and k > 0, there is a real φ with Δ = k·sin φ (an equilibrium of φ' = Δ − k sin φ) exactly when |Δ| ≤ k.
  - Closest known: Adler's locking condition for φ' = Δ − k sin φ (R. Adler, 'A study of locking phenomena in oscillators', Proc. IRE 34, 1946). As a statement it is the range of sine.
  - In Mathlib: partial: Real.range_sin (range sin = Icc (-1) 1), Real.sin_arcsin; this is the rescaled restatement
  - Caveat: The averaging step from the forced population model to this scalar equation is not formalised.
- **`Wyrd.SharedAir.averaged_stable_equilibrium_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Locking.lean:45` · both branches
  - Lean: `{Δ k : ℝ} (hk : 0 < k) : (∃ φ : ℝ, Δ - k * Real.sin φ = 0 ∧ -(k * Real.cos φ) < 0) ↔ |Δ| < k`
  - Means: For real Δ and k > 0, there is a φ with Δ = k sin φ and −k cos φ < 0 (an equilibrium with negative linearised slope) exactly when |Δ| < k.
  - Closest known: Adler (1946) locking condition |Δ| < k for the stable fixed point of the Adler equation.
  - In Mathlib: partial: Real.sin_arcsin, Real.cos_arcsin (the proof takes φ = arcsin(Δ/k); Adler's equation itself is not in Mathlib)
  - Caveat: 'Stable' is encoded as the sign of the derivative −k cos φ, not proved as dynamical stability of an ODE. The equation is the first-order averaged model; the averaging from the full noisy, modulated model is not formalised.
- **`Wyrd.SharedAir.two_to_one_moments`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Locking.lean:77` · both branches
  - Lean: `: (exp ((0 : ℝ) * I) + exp (Real.pi * I)) / 2 = 0 ∧ (exp (2 * (0 : ℝ) * I) + exp (2 * Real.pi * I)) / 2 = 1`
  - Means: For the two phases 0 and π (a perfect 2:1 lock sampled twice), the first circular moment (e^{0i} + e^{πi})/2 is 0 and the second moment (e^{0} + e^{2πi})/2 is 1.
  - Closest known: n:m phase-locking indices built on generalised phase differences (Tass et al., 'Detection of n:m phase locking from noisy data', Phys. Rev. Lett. 81, 1998); a two-cluster distribution has a vanishing first circular moment.
  - In Mathlib: yes: Complex.exp_pi_mul_I, Complex.exp_two_pi_mul_I (the statement follows immediately)
  - Caveat: Two-sample check at offset ψ₀ = 0 (phases 0 and π only); nothing here concerns the source's index implementation. The README cites this theorem for 'a perfect 2:1 lock has first moment 0 and second moment 1'. That general reading (any offset, a full n:m cycle) is proved elsewhere in the project, in Limits/Ratios.lean (lockIndex_eq_zero and lockIndex_eq_one with n = 2, m = 1), not by this theorem.
- **`Wyrd.SharedAir.hasDerivAt_norm_of_real_pos`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:174` · new-session branch only
  - Lean: `{Z : ℝ → ℂ} {Z' : ℂ} {t r : ℝ} (hZ : HasDerivAt Z Z' t) (hr : 0 < r) (hval : Z t = r) : HasDerivAt (fun s => ‖Z s‖) Z'.re t`
  - Means: If Z : ℝ → ℂ has derivative Z' at t and Z(t) is a positive real number r, then ‖Z‖ has derivative Re Z' at t.
  - Closest known: Derivative of the norm, d‖Z‖ = Re(conj(Z) Z')/‖Z‖; standard calculus.
  - In Mathlib: partial: HasDerivAt.norm_sq and HasDerivAt.sqrt (the proof composes them); DifferentiableAt.norm exists, but no HasDerivAt formula for ‖·‖ was found
  - Caveat: Generic calculus lemma, specialised to Z(t) real and positive.
- **`Wyrd.SharedAir.c_sharedAir`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:28` · new-session branch only
  - Lean: `: (1 / 25 : ℝ) * (1 / 10) = 1 / 250`
  - Means: In ℝ, (1/25)·(1/10) = 1/250.
  - Closest known: Arithmetic.
  - In Mathlib: no (searched: norm_num arithmetic fact; no declaration needed)
  - Caveat: Numeric check by norm_num.
- **`Wyrd.SharedAir.dissipation_nonpos`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/WaterGradient.lean:67` · new-session branch only
  - Lean: `{m : ℕ} {K n : Fin m → ℝ} {nE W : ℝ} (v : Fin m → ℝ) (hK : ∀ i, 0 ≤ K i) : -(∑ i, K i * (n i / v i - nE / VE W v) ^ 2) ≤ 0`
  - Means: If all transport coefficients K_i ≥ 0, the dissipation rate −Σ K_i(n_i/v_i − n_E/V_E)² is ≤ 0.
  - Closest known: A nonnegative-weighted sum of squares is nonnegative.
  - In Mathlib: instance: Finset.sum_nonneg applied with mul_nonneg and sq_nonneg (the proof is that one line)
  - Caveat: Trivial.
- **`Wyrd.SharedAir.dissipation_eq_zero_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/WaterGradient.lean:75` · new-session branch only
  - Lean: `{m : ℕ} {K n : Fin m → ℝ} {nE W : ℝ} (v : Fin m → ℝ) (hK : ∀ i, 0 < K i) : (∑ i, K i * (n i / v i - nE / VE W v) ^ 2) = 0 ↔ ∀ i, n i / v i = nE / VE W v`
  - Means: If all K_i > 0, the dissipation sum is zero exactly when every cell's osmolality n_i/v_i equals the outside osmolality n_E/V_E.
  - Closest known: A positive-weighted sum of squares vanishes iff each term does.
  - In Mathlib: instance: Finset.sum_eq_zero_iff_of_nonneg with mul_eq_zero and pow_eq_zero_iff
  - Caveat: Trivial.

## 2. New formalizations

Proved without `sorry` and not in Mathlib as stated. "Classical" means known mathematics, newly formalized here as far as a grep of the pinned Mathlib shows. "Project" means a true fact about this project's own definitions or models: new as a statement, routine as mathematics.


### 2a. Known results, not in Mathlib

The mathematics is published; the Lean proof is the new part.


#### Rainbow geometry (Descartes, Alexander’s dark band, spectrum)

- **`Wyrd.Rainbow.hasDerivAt_refr`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Deriv.lean:20` · both branches
  - Lean: `{n : ℝ} (hn : 1 < n) (i : ℝ) : HasDerivAt (refr n) (cos i / √(n ^ 2 - sin i ^ 2)) i`
  - Means: For real n > 1, the map i ↦ arcsin(sin i / n) on ℝ has derivative cos i / √(n² − sin² i) at every real i.
  - Closest known: The textbook step dr/di = cos i / (n cos r) in the calculus derivation of the rainbow angle (Stewart, Calculus, Applied Project 'The Calculus of Rainbows'; J. A. Adam, Phys. Rep. 356 (2002) 229–365).
  - In Mathlib: partial: Real.hasDerivAt_arcsin composed with Real.hasDerivAt_sin (chain rule); the composite formula is not stated
  - Caveat: A routine chain-rule computation.
- **`Wyrd.Rainbow.hasDerivAt_dev`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Deriv.lean:44` · both branches
  - Lean: `{n : ℝ} (hn : 1 < n) (k : ℕ) (i : ℝ) : HasDerivAt (dev k n) (2 - 2 * (k + 1) * (cos i / √(n ^ 2 - sin i ^ 2))) i`
  - Means: For real n > 1, natural k and every real i, the deviation D(i) = kπ + 2i − 2(k+1)·refr n i has derivative 2 − 2(k+1)·cos i / √(n² − sin² i).
  - Closest known: The classical derivative of the k-reflection deviation, dD/di = 2 − 2(k+1) dr/di (J. D. Walker, Am. J. Phys. 44 (1976) 421–433; Adam, Phys. Rep. 356 (2002); Stewart's calculus project for k = 1, 2).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: Geometric-optics model (sphere, one index n); a routine derivative.
- **`Wyrd.Rainbow.deriv_dev_neg_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Deriv.lean:96` · both branches
  - Lean: `{n : ℝ} (hn : 1 < n) {k : ℕ} (hk : 1 ≤ k) {i : ℝ} (hi : 0 ≤ cos i) : deriv (dev k n) i < 0 ↔ (n ^ 2 - 1) / (k * (k + 2)) < cos i ^ 2`
  - Means: For real n > 1, natural k ≥ 1 and real i with cos i ≥ 0, the deviation is decreasing at i (D'(i) < 0) iff cos² i > (n² − 1)/(k(k+2)).
  - Closest known: The classical sign analysis of D'(i) around the minimum-deviation ray (Walker 1976; Adam 2002).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
- **`Wyrd.Rainbow.deriv_dev_pos_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Deriv.lean:104` · both branches
  - Lean: `{n : ℝ} (hn : 1 < n) {k : ℕ} (hk : 1 ≤ k) {i : ℝ} (hi : 0 ≤ cos i) : 0 < deriv (dev k n) i ↔ cos i ^ 2 < (n ^ 2 - 1) / (k * (k + 2))`
  - Means: For real n > 1, natural k ≥ 1 and real i with cos i ≥ 0, D'(i) > 0 iff cos² i < (n² − 1)/(k(k+2)).
  - Closest known: Classical sign analysis of D'(i) (Walker 1976; Adam 2002).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
- **`Wyrd.Rainbow.deriv_dev_eq_zero_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Deriv.lean:112` · both branches
  - Lean: `{n : ℝ} (hn : 1 < n) {k : ℕ} (hk : 1 ≤ k) {i : ℝ} (hi : 0 ≤ cos i) : deriv (dev k n) i = 0 ↔ cos i ^ 2 = (n ^ 2 - 1) / (k * (k + 2))`
  - Means: For real n > 1, natural k ≥ 1 and real i with cos i ≥ 0, the deviation is stationary at i iff cos² i = (n² − 1)/(k(k+2)).
  - Closest known: The classical minimum-deviation condition for the k-th order bow. The file attributes it to Newton and Halley (c. 1700; Halley, 'De iride…', Phil. Trans. 22 no. 267, 1700). Newton states it for every k in Opticks (1704), Book I Part II, Prop. IX, where the numbers 3, 8, 15, 24, … are k(k+2), and Adam (2002) credits Newton as the first to do this; Halley's paper, by its title, gives a direct method for the diameters of both bows, and I did not verify that it states the general-k form. Modern statements: Walker, Am. J. Phys. 44 (1976); Adam, Phys. Rep. 356 (2002).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
- **`Wyrd.Rainbow.deriv_dev_bowIncidence`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:56` · both branches
  - Lean: `{n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) : deriv (dev k n) (bowIncidence k n) = 0`
  - Means: For real n and natural k ≥ 1 with 1 < n < k + 1, the deviation dev k n is stationary at bowIncidence k n.
  - Closest known: The classical stationary-deviation (rainbow) ray (Descartes 1637 numerically; closed form c. 1700; Adam 2002).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
- **`Wyrd.Rainbow.deriv_dev_eq_zero_iff_eq`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:64` · both branches
  - Lean: `{n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) {i : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) : deriv (dev k n) i = 0 ↔ i = bowIncidence k n`
  - Means: For real n and natural k ≥ 1 with 1 < n < k + 1, and i ∈ [0, π/2], the derivative of dev k n vanishes at i iff i = bowIncidence k n. So the bow angle is the unique stationary point on [0, π/2].
  - Closest known: The classical k-th order rainbow condition cos² i = (n²−1)/(k(k+2)) and its uniqueness on [0, π/2] (Walker 1976; Adam 2002; attributed in the file to Newton and Halley c. 1700: Newton states it for every k in Opticks (1704), Book I Part II, Prop. IX, where the numbers 3, 8, 15, 24, … are k(k+2); I did not verify that Halley's 1700 paper gives the general-k form).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: Model: geometric optics in a sphere with one index n; incidence restricted to [0, π/2].
- **`Wyrd.Rainbow.bow_aux_deriv_neg`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:80` · both branches
  - Lean: `{n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) : ∀ x ∈ Set.Ioo 0 (bowIncidence k n), deriv (dev k n) x < 0`
  - Means: For 1 < n < k + 1 with k ≥ 1, the derivative of dev k n is negative at every x strictly between 0 and the bow angle. (Private.)
  - Closest known: Classical: the deviation decreases up to the rainbow ray.
  - In Mathlib: no (project definitions)
- **`Wyrd.Rainbow.bow_aux_deriv_pos`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:94` · both branches
  - Lean: `{n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) : ∀ x ∈ Set.Ioo (bowIncidence k n) (π / 2), 0 < deriv (dev k n) x`
  - Means: For 1 < n < k + 1 with k ≥ 1, the derivative of dev k n is positive at every x strictly between the bow angle and π/2. (Private.)
  - Closest known: Classical: the deviation increases after the rainbow ray.
  - In Mathlib: no (project definitions)
- **`Wyrd.Rainbow.dev_lt_of_ne`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:106` · both branches
  - Lean: 

    ```lean
    {n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) {i : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) (hne : i ≠ bowIncidence k n) : dev k n (bowIncidence k n) < dev k n i
    ```

  - Means: For real n and natural k ≥ 1 with 1 < n < k + 1, every incidence i ∈ [0, π/2] other than bowIncidence k n has strictly larger deviation than the bow angle. So the bow is the strict global minimum on [0, π/2].
  - Closest known: Descartes' minimum-deviation construction (Les Météores, Discourse 8, 1637), with the closed form of Newton and Halley (c. 1700) and the modern treatments of Walker 1976 and Adam 2002.
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: Geometric optics, a perfect sphere, one index n. The physical claim that light concentrates here is not formalized.
- **`Wyrd.Rainbow.dev_isMinOn`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:115` · both branches
  - Lean: `{n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) : IsMinOn (dev k n) (Set.Icc 0 (π / 2)) (bowIncidence k n)`
  - Means: For real n and natural k ≥ 1 with 1 < n < k + 1, dev k n attains its minimum over [0, π/2] at bowIncidence k n.
  - Closest known: Same as dev_lt_of_ne (non-strict form).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
- **`Wyrd.Rainbow.water_primary`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:123` · both branches
  - Lean: `: cos (bowIncidence 1 (4 / 3)) ^ 2 = 7 / 27 ∧ IsMinOn (dev 1 (4 / 3)) (Set.Icc 0 (π / 2)) (bowIncidence 1 (4 / 3))`
  - Means: For n = 4/3 and k = 1, cos² of the bow incidence angle is 7/27, and that angle minimises dev 1 (4/3) over [0, π/2].
  - Closest known: The textbook primary-bow incidence angle for n = 4/3: cos² i = (n² − 1)/3 = 7/27, i ≈ 59.4° (e.g. Stewart's rainbow project; Adam 2002).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: n = 4/3 is the conventional approximation for water, a modelling input. This is an instance of cos_bowIncidence_sq and dev_isMinOn.
- **`Wyrd.Rainbow.water_secondary`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:135` · both branches
  - Lean: `: cos (bowIncidence 2 (4 / 3)) ^ 2 = 7 / 72 ∧ IsMinOn (dev 2 (4 / 3)) (Set.Icc 0 (π / 2)) (bowIncidence 2 (4 / 3))`
  - Means: For n = 4/3 and k = 2, cos² of the bow incidence angle is 7/72, and that angle minimises dev 2 (4/3) over [0, π/2].
  - Closest known: The textbook secondary-bow incidence angle for n = 4/3: cos² i = (n² − 1)/8 = 7/72, i ≈ 71.8° (Adam 2002).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: n = 4/3 is a modelling input. This is an instance of the general theorems.
- **`Wyrd.Rainbow.primary_bow_water`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Primary.lean:38` · both branches
  - Lean: `: 41 * π / 180 < π - dev 1 (4 / 3) (bowIncidence 1 (4 / 3)) ∧ π - dev 1 (4 / 3) (bowIncidence 1 (4 / 3)) < 43 * π / 180`
  - Means: For n = 4/3, the primary bow angle π − dev 1 (4/3) (bowIncidence 1 (4/3)) lies strictly between 41π/180 and 43π/180 (41° and 43°).
  - Closest known: The 42° primary rainbow (Descartes, Les Météores, 1637); the n = 4/3 value is ≈ 42.03°.
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: Rigorous interval bounds by hand (project Taylor bounds plus Real.pi_gt_d6 and Real.pi_lt_d6). n = 4/3 is a modelling input. The 'true value 42.03°' is numerical only. Reading π − D as the angle from the antisolar point is prose (I checked numerically that π − D₁ ∈ [0°, 42.03°] on [0, π/2], so no mod-2π issue arises).
- **`Wyrd.Rainbow.secondary_bow_water`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Secondary.lean:89` · both branches
  - Lean: `: 50 * π / 180 < dev 2 (4 / 3) (bowIncidence 2 (4 / 3)) - π ∧ dev 2 (4 / 3) (bowIncidence 2 (4 / 3)) - π < 52 * π / 180`
  - Means: For n = 4/3, the secondary bow angle dev 2 (4/3) (bowIncidence 2 (4/3)) − π lies strictly between 50° and 52° (in radians).
  - Closest known: The ≈ 51° secondary rainbow (Descartes 1637); the n = 4/3 value is ≈ 50.98°.
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: Interval bounds by hand; n = 4/3 is a modelling input; '50.98°' is numerical only.
- **`Wyrd.Rainbow.primary_light_inside`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/DarkBand.lean:27` · both branches
  - Lean: `{i : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) : π - dev 1 (4 / 3) i < 43 * π / 180`
  - Means: For n = 4/3 and every incidence i ∈ [0, π/2], the raw quantity π − dev 1 (4/3) i is less than 43π/180. On the project's convention that π − D₁ is the angle from the antisolar point, once-reflected rays exit less than 43° from it. Lean proves only this upper bound; it does not prove π − D₁ ≥ 0.
  - Closest known: Descartes (1637): light reflected once inside the drop lies inside the primary bow.
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: Covers only refracted rays with exactly one internal reflection, in geometric optics with n = 4/3. Lean bounds the signed quantity π − D₁ from above. Its non-negativity and its identification with the observed angle are checked only numerically (range [0°, 42.03°]).
- **`Wyrd.Rainbow.secondary_light_outside`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/DarkBand.lean:37` · both branches
  - Lean: `{i : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) : 50 * π / 180 < dev 2 (4 / 3) i - π`
  - Means: For n = 4/3 and every incidence i ∈ [0, π/2], dev 2 (4/3) i − π > 50π/180. So twice-reflected rays exit more than 50° from the antisolar point.
  - Closest known: Descartes (1637): twice-reflected light lies outside the secondary bow.
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: Covers only rays with exactly two internal reflections, n = 4/3. Lean bounds D₂ − π from below. That D₂ − π ≤ π, so that it is the true observed angle with no reduction mod 2π, is checked only numerically (range [50.98°, 180°]).
- **`Wyrd.Rainbow.alexander_dark_band`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/DarkBand.lean:47` · both branches
  - Lean: `{i θ : ℝ} (hi : i ∈ Set.Icc 0 (π / 2)) (hθ : 43 * π / 180 ≤ θ ∧ θ ≤ 50 * π / 180) : π - dev 1 (4 / 3) i ≠ θ ∧ dev 2 (4 / 3) i - π ≠ θ`
  - Means: For n = 4/3, every incidence i ∈ [0, π/2] and every angle θ ∈ [43°, 50°] (in radians), neither the once-reflected exit angle π − dev 1 (4/3) i nor the twice-reflected exit angle dev 2 (4/3) i − π equals θ.
  - Closest known: Alexander's dark band (Alexander of Aphrodisias, c. 200 AD), explained geometrically by Descartes (1637); history in C. B. Boyer, The Rainbow: From Myth to Mathematics (1959).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: This is a restatement of primary_light_inside and secondary_light_outside. Brightness ('darker') is not modelled. External reflection, k ≥ 3 bows, diffraction and the solar disc are excluded, as the README itself says. The excluded band 43–50° is narrower than the geometric band (42.03–50.98°).
- **`Wyrd.Rainbow.bowDev_lt`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Colours.lean:48` · both branches
  - Lean: `{k : ℕ} {n n' : ℝ} (hk : 1 ≤ k) (hn : 1 < n) (hnn' : n < n') (hn' : n' < k + 1) : dev k n (bowIncidence k n) < dev k n' (bowIncidence k n')`
  - Means: For natural k ≥ 1 and real 1 < n < n' < k + 1, the minimum deviation of the k-th bow at index n is strictly less than at index n'.
  - Closest known: The classical fact that minimum deviation increases with refractive index, which underlies Newton's explanation of rainbow colours (Opticks, 1704, Book I Part II, Prop. IX).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: The proof uses the minimum property, so it needs no derivative in n. This is a neat proof, but the result is classical.
- **`Wyrd.Rainbow.bowDev_strictMonoOn`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Colours.lean:60` · both branches
  - Lean: `{k : ℕ} (hk : 1 ≤ k) : StrictMonoOn (fun n => dev k n (bowIncidence k n)) (Set.Ioo 1 (k + 1))`
  - Means: For natural k ≥ 1, the map n ↦ dev k n (bowIncidence k n) is strictly increasing on the open interval (1, k + 1).
  - Closest known: As for bowDev_lt.
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
- **`Wyrd.Rainbow.primary_angle_strictAntiOn`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Colours.lean:66` · both branches
  - Lean: `: StrictAntiOn (fun n => π - dev 1 n (bowIncidence 1 n)) (Set.Ioo 1 2)`
  - Means: The primary bow angle n ↦ π − dev 1 n (bowIncidence 1 n) is strictly decreasing on (1, 2).
  - Closest known: Newton (Opticks 1704): violet, with the larger index, forms a smaller primary bow.
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
- **`Wyrd.Rainbow.secondary_angle_strictMonoOn`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Colours.lean:76` · both branches
  - Lean: `: StrictMonoOn (fun n => dev 2 n (bowIncidence 2 n) - π) (Set.Ioo 1 3)`
  - Means: The secondary bow angle n ↦ dev 2 n (bowIncidence 2 n) − π is strictly increasing on (1, 3).
  - Closest known: Newton (Opticks 1704): the colour order is reversed in the secondary bow.
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
- **`Wyrd.Rainbow.colour_order`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Colours.lean:87` · both branches
  - Lean: 

    ```lean
    {nRed nViolet : ℝ} (h1 : 1 < nRed) (h2 : nRed < nViolet) (h3 : nViolet < 2) : π - dev 1 nViolet (bowIncidence 1 nViolet) < π - dev 1 nRed (bowIncidence 1 nRed) ∧ dev 2 nRed (bowIncidence 2 nRed) - π < dev 2 nViolet (bowIncidence 2 nViolet) - π
    ```

  - Means: For any reals 1 < nRed < nViolet < 2, the primary bow angle at nViolet is smaller than at nRed, and the secondary bow angle at nRed is smaller than at nViolet.
  - Closest known: Newton's explanation of rainbow colour order by dispersion (Opticks, 1704, Book I Part II, Prop. IX).
  - In Mathlib: no (searched: rainbow, snell, refract, caustic, descartes)
  - Caveat: Dispersion (red has the smaller index) enters only as the hypothesis nRed < nViolet. The names are labels; the theorem holds for any two indices in (1, 2).
- **`Wyrd.Rainbow.cos_le_taylor4`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/TrigBounds.lean:34` · both branches
  - Lean: `{x : ℝ} (hx : 0 ≤ x) : cos x ≤ 1 - x ^ 2 / 2 + x ^ 4 / 24`
  - Means: For real x ≥ 0, cos x ≤ 1 − x²/2 + x⁴/24.
  - Closest known: The standard Taylor bound for cos (Lagrange remainder or alternating series; e.g. Spivak, Calculus, chapter on Taylor polynomials).
  - In Mathlib: partial: Real.cos_bound (only for |x| ≤ 1: |cos x − (1 − x²/2)| ≤ |x|⁴·5/96) and Real.one_sub_sq_div_two_le_cos (the degree-2 lower bound); taylor_mean_remainder_lagrange could derive it. No hit for x ^ 4 / 24.
  - Caveat: Stated only for x ≥ 0 (it holds for all x since cos is even).
- **`Wyrd.Rainbow.sin_le_taylor5`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/TrigBounds.lean:52` · both branches
  - Lean: `{x : ℝ} (hx : 0 ≤ x) : sin x ≤ x - x ^ 3 / 6 + x ^ 5 / 120`
  - Means: For real x ≥ 0, sin x ≤ x − x³/6 + x⁵/120.
  - Closest known: The standard Taylor bound for sin on [0, ∞).
  - In Mathlib: partial: Real.sin_ge_sub_cube (degree-3 lower bound only) and Real.sin_bound (|x| ≤ 1, error |x|⁵/100); no hit for x ^ 5 / 120
- **`Wyrd.Rainbow.taylor6_le_cos`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/TrigBounds.lean:70` · both branches
  - Lean: `{x : ℝ} (hx : 0 ≤ x) : 1 - x ^ 2 / 2 + x ^ 4 / 24 - x ^ 6 / 720 ≤ cos x`
  - Means: For real x ≥ 0, 1 − x²/2 + x⁴/24 − x⁶/720 ≤ cos x.
  - Closest known: The standard Taylor bound for cos.
  - In Mathlib: no (searched: x ^ 6 / 720, / 720 in Analysis/SpecialFunctions, Analysis/Complex, Data/Complex)
- **`Wyrd.Rainbow.taylor7_le_sin`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/TrigBounds.lean:89` · both branches
  - Lean: `{x : ℝ} (hx : 0 ≤ x) : x - x ^ 3 / 6 + x ^ 5 / 120 - x ^ 7 / 5040 ≤ sin x`
  - Means: For real x ≥ 0, x − x³/6 + x⁵/120 − x⁷/5040 ≤ sin x.
  - Closest known: The standard Taylor bound for sin on [0, ∞).
  - In Mathlib: no (searched: x ^ 7 / 5040, 5040 in Analysis/SpecialFunctions, Analysis/Complex, Data/Complex)

#### Body-water physiology models and Limits models

- **`Wyrd.BodyWater.water_load_split`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Osmotic.lean:61` · both branches
  - Lean: `{W w Oi Oe : ℝ} (hi : 0 < Oi) (he : 0 < Oe) : icwEq (W + w) Oi Oe - icwEq W Oi Oe = w * Oi / (Oi + Oe)`
  - Means: For Oi, Oe > 0 and any W, w, raising total water from W to W + w raises equilibrium intracellular water by w·Oi/(Oi + Oe).
  - Closest known: Textbook rule that free water distributes between ICF and ECF in proportion to their effective osmoles, i.e. their volumes (Rose & Post; Darrow & Yannet 1935).
  - In Mathlib: no (searched: osmotic; linear identity)
  - Caveat: A linear identity in the model. It assumes fixed osmoles and no losses or regulation.
- **`Wyrd.BodyWater.adult_water_load`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Osmotic.lean:70` · both branches
  - Lean: `{W w Oe : ℝ} (he : 0 < Oe) : icwEq (W + w) (2 * Oe) Oe - icwEq W (2 * Oe) Oe = 2 / 3 * w`
  - Means: With intracellular osmoles 2·Oe and Oe > 0, a water load w raises equilibrium intracellular water by exactly (2/3)·w.
  - Closest known: Textbook adult distribution of free water: about 2/3 to ICF and 1/3 to ECF (the 60-40-20 rule).
  - In Mathlib: no (searched: osmotic)
  - Caveat: The 2:1 osmole ratio is an input.
- **`Wyrd.BodyWater.isotonic_stays_extracellular`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Osmotic.lean:95` · both branches
  - Lean: `{W v Oi Oe : ℝ} (hW : 0 < W) (hv : 0 ≤ v) (hi : 0 < Oi) (he : 0 < Oe) : icwEq (W + v) Oi (Oe + v * ((Oi + Oe) / W)) = icwEq W Oi Oe`
  - Means: For W, Oi, Oe > 0 and v ≥ 0, adding v of water together with v·(Oi + Oe)/W extracellular osmoles leaves equilibrium intracellular water unchanged.
  - Closest known: Isotonic saline expands the ECF only (Darrow & Yannet 1935; Rose & Post).
  - In Mathlib: no (searched: osmotic, isotonic)
  - Caveat: 'Isotonic and confined outside cells' is assumed through the form of the added osmoles.
- **`Wyrd.BodyWater.solute_load_shrinks_cells`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Osmotic.lean:110` · both branches
  - Lean: `{W s Oi Oe : ℝ} (hW : 0 < W) (hs : 0 < s) (hi : 0 < Oi) (he : 0 < Oe) : icwEq W Oi (Oe + s) < icwEq W Oi Oe`
  - Means: For W, s, Oi, Oe > 0, adding s extracellular effective osmoles strictly lowers equilibrium intracellular water.
  - Closest known: Hypertonic solute (saline, mannitol) draws water out of cells (Darrow & Yannet 1935; Rose & Post).
  - In Mathlib: partial: div_lt_div_of_pos_left (same numerator, larger denominator)
  - Caveat: A one-step inequality inside the model.
- **`Wyrd.BodyWater.water_load_swells_cells`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Osmotic.lean:119` · both branches
  - Lean: `{W w Oi Oe : ℝ} (hw : 0 < w) (hi : 0 < Oi) (he : 0 < Oe) : icwEq W Oi Oe < icwEq (W + w) Oi Oe`
  - Means: For w, Oi, Oe > 0 and any W, equilibrium intracellular water at W + w exceeds that at W.
  - Closest known: Free water or hypotonic fluid swells cells (textbook; Rose & Post).
  - In Mathlib: no (searched: osmotic)
  - Caveat: An immediate corollary of water_load_split.
- **`Wyrd.BodyWater.adrogue_madias`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Sodium.lean:50` · both branches
  - Lean: `{S W v c : ℝ} (hW : 0 < W) (hv : 0 ≤ v) : serumNa (S + v * c) (W + v) - serumNa S W = v * (c - serumNa S W) / (W + v)`
  - Means: For W > 0, v ≥ 0 and any real S, c, (S + v c)/(W + v) - S/W = v (c - S/W)/(W + v).
  - Closest known: Adrogué-Madias formula (Adrogué & Madias 2000, N Engl J Med 342:1581 'Hyponatremia' and 342:1493 'Hypernatremia'), derived from Edelman et al. 1958 (J Clin Invest 37:1236). The general-volume form ΔNa = V(c − Na)/(TBW + V) and the remark that the per-litre form is exact only for 1 L appear in Chen, Shieh, Chiaramonte & Shey, 'Improving on the Adrogué–Madias Formula', Kidney360 2(2):365–370 (2020).
  - In Mathlib: no (searched: sodium, Edelman; a field identity)
  - Caveat: Model sodium is S/W, which is Edelman's relation without its empirical slope (about 1.11) and intercept (about -25.6), in a closed system. The Lean content is a one-line field identity.
- **`Wyrd.BodyWater.adrogue_madias_one_litre`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Sodium.lean:60` · both branches
  - Lean: `{S W c : ℝ} (hW : 0 < W) : serumNa (S + c) (W + 1) - serumNa S W = (c - serumNa S W) / (W + 1)`
  - Means: For W > 0, adding one unit of volume at concentration c changes S/W by (c - S/W)/(W + 1).
  - Closest known: The per-litre Adrogué-Madias formula ΔNa = (infusate Na + K - serum Na)/(TBW + 1) (Adrogué & Madias 2000).
  - In Mathlib: no (searched: sodium)
  - Caveat: The v = 1 case of adrogue_madias; same model limits.
- **`Wyrd.BodyWater.free_water_deficit`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Sodium.lean:81` · both branches
  - Lean: `{S W : ℝ} (hW : 0 < W) (hNa : 140 < serumNa S W) : serumNa S (W + W * (serumNa S W / 140 - 1)) = 140 ∧ 0 < W * (serumNa S W / 140 - 1)`
  - Means: For W > 0 and S/W > 140, adding W(S/W/140 - 1) of water makes S divided by the new water equal 140, and that amount is positive.
  - Closest known: Free-water deficit = TBW × (Na/140 - 1) (the conventional formula; Adrogué & Madias 2000, Hypernatremia, quote it as TBW × (1 − 140/Na) and do not recommend it, since it underestimates the deficit in hypotonic fluid loss).
  - In Mathlib: no (searched: sodium)
  - Caveat: A model total in a closed system (Edelman without slope or intercept). Rates and ongoing losses are outside the model.
- **`Wyrd.BodyWater.per_litre_scaling_ratio`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Sodium.lean:117` · both branches
  - Lean: `{S W v c : ℝ} (hW : 0 < W) (hv : 0 ≤ v) : serumNa (S + v * c) (W + v) - serumNa S W = (W + 1) / (W + v) * (v * ((c - serumNa S W) / (W + 1)))`
  - Means: For W > 0 and v ≥ 0, the exact model change equals (W + 1)/(W + v) times v times the per-litre figure.
  - Closest known: Chen, Shieh, Chiaramonte & Shey 2020 (Kidney360 2:365–370): the Adrogué–Madias formula is exact only for 1 L, cannot be scaled linearly to other volumes, and must be replaced by the volume-scaled form v(c − Na)/(TBW + v). The identity here is the algebraic content of that observation.
  - In Mathlib: no (searched: sodium)
  - Caveat: A field identity in the model.
- **`Wyrd.BodyWater.per_litre_scaling_underestimates`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Sodium.lean:128` · both branches
  - Lean: `{S W v c : ℝ} (hW : 0 < W) (hv0 : 0 < v) (hv1 : v < 1) (hc : serumNa S W < c) : v * ((c - serumNa S W) / (W + 1)) < serumNa (S + v * c) (W + v) - serumNa S W`
  - Means: For W > 0, 0 < v < 1 and c above model sodium, v·(c - Na)/(W + 1) is strictly less than the exact model change v(c - Na)/(W + v).
  - Closest known: Chen, Shieh, Chiaramonte & Shey 2020 (Kidney360 2:365–370): linear scaling of the per-litre Adrogué–Madias change is wrong for volumes other than 1 L. For v < 1 the factor (W + 1)/(W + v) > 1 gives the underestimate.
  - In Mathlib: no (searched: sodium)
  - Caveat: Only the c > Na direction is stated. The magnitude version for c < Na follows from per_litre_scaling_ratio but is not stated separately. Pure model algebra.
- **`Wyrd.Limits.cubic_hurwitz`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:103` · new-session branch only
  - Lean: `{c₂ c₁ c₀ : ℝ} (h₂ : 0 < c₂) (h₀ : 0 < c₀) (h₂₁ : c₀ < c₂ * c₁) {s : ℂ} (hs : s ^ 3 + c₂ * s ^ 2 + c₁ * s + c₀ = 0) : s.re < 0`
  - Means: For real c₂ > 0, c₀ > 0 with c₀ < c₂ c₁, every complex root of s³ + c₂ s² + c₁ s + c₀ has negative real part.
  - Closest known: Routh-Hurwitz criterion for cubics (Routh 1877; Hurwitz 1895; e.g. Gantmacher, The Theory of Matrices, vol. 2, ch. XV).
  - In Mathlib: no (searched: Routh, Hurwitz; only Hurwitz zeta hits)
  - Caveat: Sufficiency direction only, and degree 3 only.
- **`Wyrd.Limits.xcov_sin`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Direction.lean:46` · new-session branch only
  - Lean: `{ω : ℝ} (hω : 0 < ω) (α β d₁ d₂ h : ℝ) : xcov ω (fun t => α * sin (ω * (t - d₁))) (fun t => β * sin (ω * (t - d₂))) h = α * β / 2 * cos (ω * (h + d₁ - d₂))`
  - Means: For ω > 0 and real α, β, d₁, d₂, h, the one-period average of α sin(ω(t - d₁)) · β sin(ω(t + h - d₂)) is (αβ/2) cos(ω(h + d₁ - d₂)).
  - Closest known: Cross-covariance of two sinusoids of the same frequency (standard signal processing, e.g. Bendat & Piersol, Random Data).
  - In Mathlib: partial: integral_sin_mul_cos₁, intervalIntegral.integral_eq_sub_of_hasDerivAt; no cross-covariance of sinusoids
  - Caveat: Covariance over exactly one period of pure single-frequency sinusoids, not a correlation of measured signals.
- **`Wyrd.Limits.lim_sin_sum (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:92` · new-session branch only
  - Lean: `(θ : ℝ) (p q : ℕ) (hq : 0 < q) (h : ¬ q ∣ p) : ∑ j ∈ Finset.range q, Real.sin (θ + j * (2 * π * (p : ℝ) / (q : ℝ))) = 0`
  - Means: For real θ and naturals q > 0, p with q ∤ p, the sum over j < q of sin(θ + 2π j p/q) is 0.
  - Closest known: Textbook sum of sines at equally spaced angles.
  - In Mathlib: no (searched: sum sin equally spaced); derived from lim_geom_zero
  - Caveat: Routine.
- **`Wyrd.Limits.lim_sin_cos (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:105` · new-session branch only
  - Lean: `(c : ℕ) (hc : 0 < c) (A B : ℝ) : ∫ s in (0 : ℝ)..2 * π, Real.sin (c * s + A) * Real.cos (c * s + B) = π * Real.sin (A - B)`
  - Means: For a natural c > 0 and real A, B, the integral over [0, 2π] of sin(cs + A) cos(cs + B) is π sin(A - B).
  - Closest known: Product-to-sum trigonometric integral (textbook).
  - In Mathlib: partial: integral_sin_mul_cos₁ (only the case sin x cos x)
  - Caveat: Routine calculus.
- **`Wyrd.Limits.resonant_average_vanishes`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:196` · new-session branch only
  - Lean: 

    ```lean
    {P : ℝ → ℝ} (hP : Continuous P) (hper : Function.Periodic P (2 * π)) {l n m : ℕ} (hm : 0 < m) (h : ¬ m ∣ l * n) (a b : ℝ) : ∫ s in (0 : ℝ)..2 * π, Real.sin (l * (n * s + a)) * P (m * s + b) = 0
    ```

  - Means: For a continuous 2π-periodic P : ℝ → ℝ and naturals l, n, m with m > 0 and m ∤ l·n, the integral over [0, 2π] of sin(l(ns + a)) · P(ms + b) is 0 for all real a, b.
  - Closest known: Fourier orthogonality: P(ms + b) contains only frequencies that are multiples of m, so it is orthogonal to frequency ln when m ∤ ln. This is the resonance condition of first-order averaging (Pikovsky, Rosenblum & Kurths 2001, Synchronization; Sanders, Verhulst & Murdock 2007, Averaging Methods).
  - In Mathlib: partial: orthonormal_fourier (Fourier orthonormality on AddCircle), Function.Periodic.intervalIntegral_add_eq; no statement of this form
  - Caveat: Proved neatly by averaging over m shifts and using roots of unity, which avoids Fourier series. The link to actual locking (an averaging theorem) is not formalised. novelty: implied by Fourier orthogonality.
- **`Wyrd.Limits.n_one_average`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:264` · new-session branch only
  - Lean: `{n : ℕ} (hn : 0 < n) (a b : ℝ) : ∫ s in (0 : ℝ)..2 * π, Real.sin (n * s + a) * Real.cos (n * (s + b)) = π * Real.sin (a - n * b)`
  - Means: For a natural n > 0 and real a, b, the integral over [0, 2π] of sin(ns + a) cos(n(s + b)) is π sin(a - nb).
  - Closest known: Product-to-sum trigonometric integral (instance of lim_sin_cos).
  - In Mathlib: partial: integral_sin_mul_cos₁ (case n = 1, a = b = 0 only)
  - Caveat: Uses the test pulse P = cos(n·), not the model's own P.
- **`Wyrd.Limits.second_harmonic_reaches_three_two`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:271` · new-session branch only
  - Lean: `(a b : ℝ) : ∫ s in (0 : ℝ)..2 * π, Real.sin (2 * (3 * s + a)) * Real.cos (3 * (2 * s + b)) = π * Real.sin (2 * a - 3 * b)`
  - Means: For real a, b, the integral over [0, 2π] of sin(2(3s + a)) cos(3(2s + b)) is π sin(2a - 3b).
  - Closest known: Instance of lim_sin_cos with c = 6.
  - In Mathlib: no
  - Caveat: A specific instance with a chosen test pulse, cos 3ψ.
- **`Wyrd.Limits.third_harmonic_reaches_five_three`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:283` · new-session branch only
  - Lean: `(a b : ℝ) : ∫ s in (0 : ℝ)..2 * π, Real.sin (3 * (5 * s + a)) * Real.cos (5 * (3 * s + b)) = π * Real.sin (3 * a - 5 * b)`
  - Means: For real a, b, the integral over [0, 2π] of sin(3(5s + a)) cos(5(3s + b)) is π sin(3a - 5b).
  - Closest known: Instance of lim_sin_cos with c = 15.
  - In Mathlib: no
  - Caveat: A specific instance with a chosen test pulse, cos 5ψ.

#### Periodic Navier–Stokes I: the phase family, symmetries, selection rules, averages

- **`Wyrd.PeriodicNS.Averages_I3_cos (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:82` · new-session branch only
  - Lean: `(p q r : ℤ) : Averages_I3 (fun x y z => cos (p * x + q * y + r * z)) = if (p, q, r) = (0, 0, 0) then (2 * π) ^ 3 else 0`
  - Means: For integers p, q and r, the iterated integral over [0,2π]³ of cos(px + qy + rz) is (2π)³ if (p,q,r) = (0,0,0) and 0 otherwise.
  - Closest known: Orthogonality of characters on the 3-torus.
  - In Mathlib: partial: orthonormal_mFourier / mFourierCoeff (Analysis/Fourier/AddCircleMulti.lean), which covers complex exponentials on UnitAddTorus with Haar measure, not iterated real interval integrals over [0,2π]³
  - Caveat: Private helper with a routine proof that iterates the 1-D lemma. Duplicated as PhaseFamily_I3_cos.
- **`Wyrd.PeriodicNS.Averages_I3_sin (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:101` · new-session branch only
  - Lean: `(p q r : ℤ) : Averages_I3 (fun x y z => sin (p * x + q * y + r * z)) = 0`
  - Means: For all integers p, q and r, the iterated integral over [0,2π]³ of sin(px + qy + rz) is 0.
  - Closest known: Orthogonality of characters on the 3-torus.
  - In Mathlib: partial: orthonormal_mFourier (UnitAddTorus, complex exponentials)
  - Caveat: Private helper. Duplicated as PhaseFamily_I3_sin.
- **`Wyrd.PeriodicNS.Averages_I3_tm (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:141` · new-session branch only
  - Lean: `(m : ℝ × ℝ × ℤ × ℤ × ℤ) : Averages_I3 (Averages_tm m) = (2 * π) ^ 3 * (if m.2.2 = (0, 0, 0) then m.1 else 0)`
  - Means: The iterated integral over [0,2π]³ of one mode a cos(k·x) + b sin(k·x) is (2π)³·a if k = 0 and 0 otherwise.
  - Closest known: Orthogonality of the trigonometric system on the 3-torus.
  - In Mathlib: partial: orthonormal_mFourier (different setting)
  - Caveat: Private helper stated for the project's mode encoding. Routine corollary of I3_cos and I3_sin. Duplicated as PhaseFamily_I3_tm.
- **`Wyrd.PeriodicNS.Averages_I3_tp (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:163` · new-session branch only
  - Lean: `(L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) : Averages_I3 (Averages_tp L) = (2 * π) ^ 3 * Averages_c0 L`
  - Means: The iterated integral over [0,2π]³ of a trigonometric polynomial, encoded as a list of modes, is (2π)³ times its constant coefficient.
  - Closest known: The mean of a trigonometric polynomial over a period is its zeroth Fourier coefficient.
  - In Mathlib: partial: mFourierCoeff / orthonormal_mFourier on UnitAddTorus (complex form, Haar measure)
  - Caveat: Private helper. Duplicated as PhaseFamily_I3_tp.
- **`Wyrd.PeriodicNS.Averages_avg_eq (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:177` · new-session branch only
  - Lean: `{f : ℝ → ℝ → ℝ → ℝ} (L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) (h : ∀ x y z, f x y z = Averages_tp L x y z) : avg f = Averages_c0 L`
  - Means: If f agrees pointwise on ℝ³ with an encoded trigonometric polynomial L, then the normalised average of f over [0,2π]³ equals the constant coefficient of L.
  - Closest known: The mean of a trigonometric polynomial over a period is its zeroth Fourier coefficient.
  - In Mathlib: partial: mFourierCoeff at 0 / orthonormal_mFourier (different setting)
  - Caveat: Private helper. This is the engine behind every exact-average theorem here. Each use supplies the list L by hand and checks the pointwise identity with ring_nf. Duplicated as PhaseFamily_avg_eq.
- **`Wyrd.PeriodicNS.PhaseFamily_I3_cos (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:161` · new-session branch only
  - Lean: `(p q r : ℤ) : PhaseFamily_I3 (fun x y z => cos (p * x + q * y + r * z)) = if (p, q, r) = (0, 0, 0) then (2 * π) ^ 3 else 0`
  - Means: The iterated integral over [0,2π]³ of cos(px+qy+rz), for p, q, r ∈ ℤ, is (2π)³ at the zero frequency and 0 otherwise (a duplicate).
  - Closest known: Orthogonality of characters on the 3-torus.
  - In Mathlib: partial: orthonormal_mFourier (UnitAddTorus, complex exponentials)
  - Caveat: Duplicate of Averages_I3_cos.
- **`Wyrd.PeriodicNS.PhaseFamily_I3_sin (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:180` · new-session branch only
  - Lean: `(p q r : ℤ) : PhaseFamily_I3 (fun x y z => sin (p * x + q * y + r * z)) = 0`
  - Means: The iterated integral over [0,2π]³ of sin(px+qy+rz) is 0 for all integers p, q, r (a duplicate).
  - Closest known: Orthogonality of characters on the 3-torus.
  - In Mathlib: partial: orthonormal_mFourier
  - Caveat: Duplicate of Averages_I3_sin.
- **`Wyrd.PeriodicNS.PhaseFamily_I3_tm (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:220` · new-session branch only
  - Lean: `(m : ℝ × ℝ × ℤ × ℤ × ℤ) : PhaseFamily_I3 (PhaseFamily_tm m) = (2 * π) ^ 3 * (if m.2.2 = (0, 0, 0) then m.1 else 0)`
  - Means: The integral over [0,2π]³ of one mode is (2π)³·a at k = 0 and 0 otherwise (a duplicate).
  - Closest known: Orthogonality of the trigonometric system on the 3-torus.
  - In Mathlib: partial: orthonormal_mFourier
  - Caveat: Duplicate of Averages_I3_tm.
- **`Wyrd.PeriodicNS.PhaseFamily_I3_tp (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:242` · new-session branch only
  - Lean: `(L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) : PhaseFamily_I3 (PhaseFamily_tp L) = (2 * π) ^ 3 * PhaseFamily_c0 L`
  - Means: The integral over [0,2π]³ of an encoded trigonometric polynomial is (2π)³ times its constant coefficient (a duplicate).
  - Closest known: The mean of a trigonometric polynomial is its zeroth Fourier coefficient.
  - In Mathlib: partial: mFourierCoeff / orthonormal_mFourier
  - Caveat: Duplicate of Averages_I3_tp.
- **`Wyrd.PeriodicNS.PhaseFamily_avg_eq (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:257` · new-session branch only
  - Lean: `{f : ℝ → ℝ → ℝ → ℝ} (L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) (h : ∀ x y z, f x y z = PhaseFamily_tp L x y z) : avg f = PhaseFamily_c0 L`
  - Means: If f equals an encoded trigonometric polynomial pointwise, then its normalised average over [0,2π]³ is the constant coefficient (a duplicate).
  - Closest known: The mean of a trigonometric polynomial is its zeroth Fourier coefficient.
  - In Mathlib: partial: mFourierCoeff / orthonormal_mFourier
  - Caveat: Duplicate of Averages_avg_eq. Here the lists have φ-dependent coefficients.

#### Periodic Navier–Stokes II: scaling, blow-up rescalings, sign flip, Galerkin, Grönwall, quantifiers

- **`Wyrd.PeriodicNS.gronwall_variable`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Gronwall.lean:15` · new-session branch only
  - Lean: 

    ```lean
    {Z Z' a : ℝ → ℝ} (ha : Continuous a) (hZ : ∀ t, HasDerivAt Z (Z' t) t) (hle : ∀ t, 0 ≤ t → Z' t ≤ a t * Z t) {t : ℝ} (ht : 0 ≤ t) : Z t ≤ Z 0 * Real.exp (∫ s in (0 : ℝ)..t, a s)
    ```

  - Means: Suppose a : ℝ → ℝ is continuous, Z : ℝ → ℝ has derivative Z'(t) at every t ∈ ℝ, and Z'(t) ≤ a(t)·Z(t) for t ≥ 0. Then Z(t) ≤ Z(0)·exp(∫₀ᵗ a) for every t ≥ 0.
  - Closest known: Grönwall's inequality in differential form with a variable coefficient (Grönwall 1919, Ann. of Math.; Bellman 1943; e.g. Evans, Partial Differential Equations, Appendix B).
  - In Mathlib: partial: le_gronwallBound_of_liminf_deriv_right_le and norm_le_gronwallBound_of_norm_deriv_right_le (constant rate K only); discrete_gronwall_prod_general (discrete, variable coefficient). No continuous variable-rate version was found (searched: gronwall, 'exp (∫', integrating factor, Bellman).
  - Caveat: Requires Z to be differentiable on all of ℝ (gronwall_variable_Icc covers [0, T]). No sign condition on Z is needed. The Navier–Stokes use needs the unproved uniform stretching estimate.
- **`Wyrd.PeriodicNS.gronwall_variable_Icc`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Gronwall.lean:57` · new-session branch only
  - Lean: 

    ```lean
    {Z Z' a : ℝ → ℝ} {T : ℝ} (ha : ContinuousOn a (Set.Icc 0 T)) (hZ : ∀ t ∈ Set.Icc 0 T, HasDerivWithinAt Z (Z' t) (Set.Icc 0 T) t) (hle : ∀ t ∈ Set.Icc 0 T, Z' t ≤ a t * Z t) {t : ℝ} (ht : t ∈ Set.Icc 0 T) : Z t ≤ Z 0 * Real.exp (∫ s in (0 : ℝ)..t, a s)
    ```

  - Means: Suppose a is continuous on [0, T], Z has derivative Z'(t) within [0, T] at each t ∈ [0, T], and Z' ≤ aZ on [0, T]. Then Z(t) ≤ Z(0)·exp(∫₀ᵗ a) for every t ∈ [0, T].
  - Closest known: Grönwall's inequality, variable coefficient, on a compact interval (same references as gronwall_variable).
  - In Mathlib: partial: le_gronwallBound_of_liminf_deriv_right_le (constant K); no variable-rate continuous version found (searched: gronwall, 'exp (∫')
  - Caveat: Written for quantities that exist only up to a maximal time. It is still only the Grönwall step; nothing about Navier–Stokes is proved.

#### Shared Air feedback model

- **`Wyrd.SharedAir.Z1dot_eq`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:61` · new-session branch only
  - Lean: `(K : ℝ) {m : ℕ} (θ : Fin m → ℝ) : Z1dot K θ = K / 2 * (Z1 θ - starRingEnd ℂ (Z1 θ) * Z2 θ)`
  - Means: For m identical mean-field phase oscillators (rotating frame) and any real phases, the rate (1/m)Σ i·vel_j·e^{iθ_j} equals (K/2)(Z1 − conj(Z1)·Z2), where Z2 is the second phase moment. So the first moment's evolution depends on the second.
  - Closest known: First equation of the Kuramoto order-parameter (moment) hierarchy for identical oscillators, dZ_k/dt = (kK/2)(Z1 Z_{k−1} − conj(Z1) Z_{k+1}); see Pérez-Vicente and Ritort, J. Phys. A 30, 8095 (1997), and Ott and Antonsen, Chaos 18, 037113 (2008), where Z2 = Z1² closes it on the OA manifold.
  - In Mathlib: no (searched: kuramoto, order parameter, phase oscillator)
  - Caveat: Algebraic identity for Z1dot (defined as the mean of i·vel·e^{iθ}); hasDerivAt_Z1_vel links it to the time derivative. For m = 0 it holds through Lean's 0/0 = 0 convention.

### 2b. Facts about the project's own definitions and models

New statements about objects this project defines. Their truth is machine-checked; their content is only as meaningful as the definitions.


#### Core wyrd: pangram encoding, primes, √2, minimality search; Mathlib bridge

- **`Wyrd.ofDigits_digitsAux`** · `experiments/wyrd/Wyrd/Encoding.lean:37` · both branches
  - Lean: `∀ fuel n, n ≤ fuel → ofDigits (digitsAux fuel n) = n`
  - Means: For natural numbers n ≤ fuel, reading back (with the project's ofDigits, base 26) the fuel-bounded base-26 digit list digitsAux fuel n returns n.
  - Closest known: Base-b positional round trip; Mathlib Nat.ofDigits_digits (Data/Nat/Digits/Defs.lean).
  - In Mathlib: partial: Nat.ofDigits_digits, stated for Mathlib's Nat.digits/Nat.ofDigits, not the project's fuel-indexed digitsAux
  - Caveat: Helper lemma about the project's fuel-based reimplementation of base-26 digits (written so the kernel can evaluate it); mathematically routine.
- **`Wyrd.digitsAux_lt`** · `experiments/wyrd/Wyrd/Encoding.lean:50` · both branches
  - Lean: `∀ fuel n, ∀ d ∈ digitsAux fuel n, d < 26`
  - Means: Every entry of the fuel-bounded base-26 digit list of n is less than 26.
  - Closest known: Mathlib Nat.digits_lt_base (for Nat.digits).
  - In Mathlib: partial: Nat.digits_lt_base, for Nat.digits b rather than the project's digitsAux
  - Caveat: Helper about the project's fuel-indexed digit function.
- **`Wyrd.length_digitsAux_le`** · `experiments/wyrd/Wyrd/Encoding.lean:63` · both branches
  - Lean: `∀ k fuel n, n < 26 ^ k → (digitsAux fuel n).length ≤ k`
  - Means: If n < 26^k then the fuel-bounded base-26 digit list of n has at most k entries, for any fuel.
  - Closest known: Mathlib Nat.digits_length_le_iff (Data/Nat/Digits/Lemmas.lean).
  - In Mathlib: partial: Nat.digits_length_le_iff, for Nat.digits rather than the project's digitsAux
  - Caveat: Helper about the project's fuel-indexed digit function.
- **`Wyrd.uncouple_couple`** · `experiments/wyrd/Wyrd/Encoding.lean:93` · both branches
  - Lean: `∀ (ds : List Nat) (prev : Nat), prev < 26 → (∀ d ∈ ds, d < 26) → uncouple prev (couple prev ds) = ds`
  - Means: For a list of digits each < 26 and a start value prev < 26, the 'coupling' map a_j = (d_j + d_{j-1}) mod 26 is undone by subtracting the previously recovered digit mod 26.
  - Closest known: Elementary: on (ℤ/26ℤ)^k the adjacent-sum map (d_j) ↦ (d_j + d_{j−1} mod 26) is unipotent lower-bidiagonal and is inverted by forward substitution d_j = a_j − d_{j−1}. No specific citation is needed.
  - In Mathlib: no (searched: couple, delta encoding, digits round trip; coupling step has no Mathlib counterpart)
  - Caveat: About the project's own coupling transform on digit lists; the math is a one-line modular identity per digit.
- **`Wyrd.length_couple`** · `experiments/wyrd/Wyrd/Encoding.lean:103` · both branches
  - Lean: `∀ (ds : List Nat) (prev : Nat), (couple prev ds).length = ds.length`
  - Means: The coupling map preserves list length.
  - Closest known: Trivial structural fact (cf. List.length_map).
  - In Mathlib: no (searched: couple; project definition)
  - Caveat: Trivial structural lemma.
- **`Wyrd.couple_lt`** · `experiments/wyrd/Wyrd/Encoding.lean:107` · both branches
  - Lean: `∀ (ds : List Nat) (prev : Nat), ∀ a ∈ couple prev ds, a < 26`
  - Means: Every entry produced by the coupling map is less than 26.
  - Closest known: Trivial: x mod 26 < 26 (Nat.mod_lt).
  - In Mathlib: no (searched: couple; project definition)
  - Caveat: Trivial.
- **`Wyrd.decode_encode`** · `experiments/wyrd/Wyrd/Encoding.lean:124` · both branches
  - Lean: `(n : Nat) : decode (encode n) = n`
  - Means: For every n ∈ ℕ, decoding the coupled base-26 letter-code name of n returns n.
  - Closest known: Composition of the base-26 round trip (Nat.ofDigits_digits) with the invertible coupling transform; elementary.
  - In Mathlib: partial: Nat.ofDigits_digits covers the plain base-b round trip; no Mathlib counterpart for the coupled encoding
  - Caveat: About the project's own encoding; routine.
- **`Wyrd.encode_injective`** · `experiments/wyrd/Wyrd/Encoding.lean:129` · both branches
  - Lean: `{a b : Nat} (h : encode a = encode b) : a = b`
  - Means: Two natural numbers with the same coupled base-26 name (as lists of letter codes) are equal.
  - Closest known: Immediate from a left inverse (Function.LeftInverse.injective).
  - In Mathlib: no (searched: encode injective; project definition)
  - Caveat: Immediate corollary of decode_encode.
- **`Wyrd.length_encode`** · `experiments/wyrd/Wyrd/Encoding.lean:133` · both branches
  - Lean: `(n : Nat) : (encode n).length = (digits n).length`
  - Means: The coupled name of n has exactly as many letters as n has base-26 digits.
  - Closest known: Trivial (length preserved by coupling and reversal).
  - In Mathlib: no (searched: encode length; project definition)
  - Caveat: Trivial.
- **`Wyrd.encode_lt`** · `experiments/wyrd/Wyrd/Encoding.lean:137` · both branches
  - Lean: `(n : Nat) : ∀ a ∈ encode n, a < 26`
  - Means: Every letter code in the coupled name of n is in 0–25.
  - Closest known: Trivial.
  - In Mathlib: no (searched: encode; project definition)
  - Caveat: Trivial.
- **`Wyrd.length_encode_le_two`** · `experiments/wyrd/Wyrd/Encoding.lean:143` · both branches
  - Lean: `{n : Nat} (h : n < 676) : (encode n).length ≤ 2`
  - Means: Numbers n < 676 = 26² have coupled names of at most two letters.
  - Closest known: Instance of Nat.digits_length_le_iff at b = 26, k = 2.
  - In Mathlib: partial: Nat.digits_length_le_iff, for Nat.digits rather than the project's encode
  - Caveat: Numeric specialisation of length_digits_le.
- **`Wyrd.length_encode_le_three`** · `experiments/wyrd/Wyrd/Encoding.lean:147` · both branches
  - Lean: `{n : Nat} (h : n < 17576) : (encode n).length ≤ 3`
  - Means: Numbers n < 17576 = 26³ have coupled names of at most three letters.
  - Closest known: Instance of Nat.digits_length_le_iff at b = 26, k = 3.
  - In Mathlib: partial: Nat.digits_length_le_iff, for Nat.digits rather than the project's encode
  - Caveat: Numeric specialisation of length_digits_le.
- **`Wyrd.primeB_sound`** · `experiments/wyrd/Wyrd/Pangram.lean:32` · both branches
  - Lean: `{n : Nat} (h : primeB n = true) : IsPrime n`
  - Means: If the project's trial-division checker primeB (n ≥ 2 and no m with 2 ≤ m < n divides n) returns true, then n satisfies the project's IsPrime.
  - Closest known: Correctness of trial division; Mathlib Nat.prime_def_lt' : Prime p ↔ 2 ≤ p ∧ ∀ m, 2 ≤ m → m < p → ¬m ∣ p.
  - In Mathlib: partial: Nat.prime_def_lt', same mathematical content for Nat.Prime rather than the project's Bool checker
  - Caveat: Soundness of a project-defined Bool decision procedure; only the sound direction is proved (completeness not needed).
- **`Wyrd.solution_names`** · `experiments/wyrd/Wyrd/Pangram.lean:65` · both branches
  - Lean: `solution.map (fun pq => (name pq.1, name pq.2)) = [("UKR", "TEP"), ("DB", "NMF"), ("YL", "AQV"), ("SH", "CWZ"), ("IJ", "OGX")]`
  - Means: The coupled base-26 names of the ten specific numbers in the pairs (1187,3109), (53,4243), (349,3947), (293,4003), (659,3637) are UKR/TEP, DB/NMF, YL/AQV, SH/CWZ, IJ/OGX.
  - Closest known: None; a computation about the project's encoding (matches the Python script's output).
  - In Mathlib: no (searched: project-specific encoding; not applicable)
  - Caveat: Kernel computation (decide +kernel) about ten fixed numbers.
- **`Wyrd.solution_isPangram`** · `experiments/wyrd/Wyrd/Pangram.lean:70` · both branches
  - Lean: `IsPangram 4296 solution`
  - Means: The specific list of five pairs (1187,3109), (53,4243), (349,3947), (293,4003), (659,3637) consists of primes, each pair sums to 4296, and the ten coupled names together are a permutation of the 26 letter codes 0–25.
  - Closest known: None; a certificate check for the project's puzzle (found by experiments/coupled_prime26_pangram.py).
  - In Mathlib: no (searched: pangram, Goldbach pairs alphabet; project definitions)
  - Caveat: Kernel computation: primality by kernel-evaluated trial division (primeB, made sound by primeB_sound) and the permutation check by decide +kernel.
- **`Wyrd.pangram_exists`** · `experiments/wyrd/Wyrd/Pangram.lean:82` · both branches
  - Lean: `∃ ps, IsPangram 4296 ps`
  - Means: There exists a five-pair prime pangram (in the project's IsPangram sense) with pair sum N = 4296.
  - Closest known: None; existence witnessed by solution_isPangram.
  - In Mathlib: no (searched: pangram; project definition)
  - Caveat: Witnessed by the kernel-checked certificate solution_isPangram.
- **`Wyrd.pair_short`** · `experiments/wyrd/Wyrd/Pangram.lean:90` · both branches
  - Lean: `{p q N : Nat} (hs : p + q = N) (hN : N < 1352) : (encode p ++ encode q).length ≤ 5`
  - Means: For any p, q ∈ ℕ with p + q = N < 1352, the two coupled names together have at most 5 letters (one number is < 676, so ≤ 2 letters, the other < 17576, so ≤ 3).
  - Closest known: Elementary digit-length counting; no citation.
  - In Mathlib: no (searched: project encoding; not applicable)
  - Caveat: Does not use primality.
- **`Wyrd.lower_bound`** · `experiments/wyrd/Wyrd/Pangram.lean:112` · both branches
  - Lean: `{N : Nat} {ps : List (Nat × Nat)} (h : IsPangram N ps) : 1352 ≤ N`
  - Means: Every five-pair prime pangram (project definition, coupled encoding) has pair sum N ≥ 1352 = 2·26².
  - Closest known: Elementary pigeonhole/letter-counting bound for the project's puzzle; no literature.
  - In Mathlib: no (searched: pangram; project definition)
  - Caveat: Uses only name lengths, not primality; 5 pairs × at most 5 letters = 25 < 26.
- **`Wyrd.nodup_letters`** · `experiments/wyrd/Wyrd/Distinct.lean:26` · both branches
  - Lean: `{N : Nat} {ps : List (Nat × Nat)} (h : IsPangram N ps) : (letters ps).Nodup`
  - Means: In any pangram, the concatenated list of letter codes of the ten names has no repeated entry.
  - Closest known: Core List.Perm.nodup_iff with List.nodup_range.
  - In Mathlib: no (searched: project definition; follows from core List.Perm.nodup_iff, List.nodup_range)
  - Caveat: One-line consequence of the definition (letters is a permutation of range 26).
- **`Wyrd.letters_eq`** · `experiments/wyrd/Wyrd/Distinct.lean:31` · both branches
  - Lean: `(ps : List (Nat × Nat)) : letters ps = (primesOf ps).flatMap encode`
  - Means: The letter list of a list of pairs equals the concatenation of the names of the flattened list [p₁, q₁, p₂, q₂, …].
  - Closest known: Core List.flatMap_assoc.
  - In Mathlib: no (searched: project definitions)
  - Caveat: Definitional unfolding.
- **`Wyrd.encode_ne_nil`** · `experiments/wyrd/Wyrd/Distinct.lean:54` · both branches
  - Lean: `{n : Nat} (hn : 0 < n) : encode n ≠ []`
  - Means: Every positive natural number has a non-empty coupled name.
  - Closest known: Mathlib Nat.digits_ne_nil_iff_ne_zero (for Nat.digits).
  - In Mathlib: partial: Nat.digits_ne_nil_iff_ne_zero, for Nat.digits rather than the project's encode
  - Caveat: Trivial.
- **`Wyrd.mem_primesOf`** · `experiments/wyrd/Wyrd/Distinct.lean:62` · both branches
  - Lean: `{ps : List (Nat × Nat)} {x : Nat} (hx : x ∈ primesOf ps) : ∃ pq ∈ ps, x = pq.1 ∨ x = pq.2`
  - Means: Every element of the flattened list primesOf ps is the first or second component of some pair in ps.
  - Closest known: Core List.mem_flatMap.
  - In Mathlib: no (searched: project definition)
  - Caveat: Definitional.
- **`Wyrd.primes_nodup`** · `experiments/wyrd/Wyrd/Distinct.lean:68` · both branches
  - Lean: `{N : Nat} {ps : List (Nat × Nat)} (h : IsPangram N ps) : (primesOf ps).Nodup`
  - Means: In any five-pair prime pangram, the ten primes p₁, q₁, …, p₅, q₅ are pairwise distinct.
  - Closest known: Immediate from the alphabet condition (no letter repeats) and non-empty names; no literature.
  - In Mathlib: no (searched: pangram; project definition)
  - Caveat: Routine consequence of the definition.
- **`Wyrd.length_primesOf`** · `experiments/wyrd/Wyrd/Distinct.lean:79` · both branches
  - Lean: `{N : Nat} {ps : List (Nat × Nat)} (h : IsPangram N ps) : (primesOf ps).length = 10`
  - Means: A pangram's flattened prime list has exactly 10 entries.
  - Closest known: Trivial (2 × 5).
  - In Mathlib: no (searched: project definition)
  - Caveat: Trivial.
- **`Wyrd.primesOf_cons`** · `experiments/wyrd/Wyrd/Parity.lean:29` · both branches
  - Lean: `(x : Nat × Nat) (xs : List (Nat × Nat)) : primesOf (x :: xs) = x.1 :: x.2 :: primesOf xs`
  - Means: Unfolding equation for primesOf on a cons list.
  - Closest known: Definitional (rfl).
  - In Mathlib: no (searched: project definition)
  - Caveat: Proved by rfl.
- **`Wyrd.pair_ne`** · `experiments/wyrd/Wyrd/Parity.lean:33` · both branches
  - Lean: `∀ (ps : List (Nat × Nat)), (primesOf ps).Nodup → ∀ pq ∈ ps, pq.1 ≠ pq.2`
  - Means: If the flattened list of pair components has no repeats, then within each pair the two components differ.
  - Closest known: Trivial list fact.
  - In Mathlib: no (searched: project definition)
  - Caveat: Trivial.
- **`Wyrd.length_le_one_of_all_two`** · `experiments/wyrd/Wyrd/Parity.lean:43` · both branches
  - Lean: `∀ (ps : List (Nat × Nat)), (primesOf ps).Nodup → (∀ pq ∈ ps, pq.1 = 2 ∨ pq.2 = 2) → ps.length ≤ 1`
  - Means: If the flattened components have no repeats and every pair contains the number 2, then there is at most one pair.
  - Closest known: Trivial pigeonhole.
  - In Mathlib: no (searched: project definition)
  - Caveat: Trivial.
- **`Wyrd.exists_pair_without_two`** · `experiments/wyrd/Wyrd/Parity.lean:61` · both branches
  - Lean: `{N : Nat} {ps : List (Nat × Nat)} (h : IsPangram N ps) : ∃ pq ∈ ps, pq.1 ≠ 2 ∧ pq.2 ≠ 2`
  - Means: Every pangram has a pair in which neither prime is 2.
  - Closest known: Elementary; no citation.
  - In Mathlib: no (searched: project definition)
  - Caveat: Routine.
- **`Wyrd.sum_even`** · `experiments/wyrd/Wyrd/Parity.lean:75` · both branches
  - Lean: `{N : Nat} {ps : List (Nat × Nat)} (h : IsPangram N ps) : N % 2 = 0`
  - Means: Every five-pair prime pangram has an even pair sum N.
  - Closest known: Elementary parity: a sum of two odd primes is even (as in Goldbach partitions).
  - In Mathlib: no (searched: pangram; project definition)
  - Caveat: Routine parity argument about the project's puzzle.
- **`Wyrd.two_not_mem`** · `experiments/wyrd/Wyrd/Parity.lean:83` · both branches
  - Lean: `{N : Nat} {ps : List (Nat × Nat)} (h : IsPangram N ps) : 2 ∉ primesOf ps`
  - Means: No pangram uses the prime 2.
  - Closest known: Elementary parity (N even forces the partner of 2 to be the even prime 2, contradicting distinctness).
  - In Mathlib: no (searched: project definition)
  - Caveat: Routine.
- **`Wyrd.nodupB_iff`** · `experiments/wyrd/Wyrd/Minimal.lean:40` · both branches
  - Lean: `∀ l : List Nat, nodupB l = true ↔ l.Nodup`
  - Means: The project's Bool 'no repeated element' checker on lists of naturals is correct in both directions.
  - Closest known: Core List.nodupDecidable instance / List.nodup_cons.
  - In Mathlib: no (searched: nodupB; project definition, core has List.nodupDecidable)
  - Caveat: Correctness of a project helper function.
- **`Wyrd.rejectB_false`** · `experiments/wyrd/Wyrd/Minimal.lean:54` · both branches
  - Lean: `{n : Nat} (hp : IsPrime n) (h2 : n ≠ 2) (hnd : (encode n).Nodup) : rejectB n = false`
  - Means: An odd prime whose coupled name has no repeated letter is never rejected by the search filter rejectB (n < 3, repeated letter, or a divisor 2 ≤ d ≤ 65 with d < n).
  - Closest known: Trivial: a prime has no proper divisor.
  - In Mathlib: no (searched: project definition)
  - Caveat: Soundness of the candidate filter (it never discards a pangram-eligible prime).
- **`Wyrd.VB_complete`** · `experiments/wyrd/Wyrd/Minimal.lean:67` · both branches
  - Lean: `(List.range 4295).all (fun n => VB.testBit n || rejectB n) = true`
  - Means: For every n < 4295, either bit n of the precomputed bitmask VB is set or n is rejected by rejectB.
  - Closest known: None; a computation about generated data.
  - In Mathlib: no (searched: project data; not applicable)
  - Caveat: Kernel computation (decide +kernel) over 4295 numbers; guarantees VB is a superset of the eligible primes, not that it contains only primes.
- **`Wyrd.testBit_VB`** · `experiments/wyrd/Wyrd/Minimal.lean:70` · both branches
  - Lean: `{n : Nat} (hn : n < 4295) (hp : IsPrime n) (h2 : n ≠ 2) (hnd : (encode n).Nodup) : VB.testBit n = true`
  - Means: Every odd prime n < 4295 with a repeat-free coupled name has its bit set in VB.
  - Closest known: None; combines VB_complete and rejectB_false.
  - In Mathlib: no (searched: project data)
  - Caveat: Rests on the kernel computation VB_complete.
- **`Wyrd.V_eq`** · `experiments/wyrd/Wyrd/Minimal.lean:76` · both branches
  - Lean: `V = (List.range 4295).filter (fun n => VB.testBit n)`
  - Means: The stored candidate list V equals the list of n < 4295 whose bit is set in VB.
  - Closest known: None; data consistency computation.
  - In Mathlib: no (searched: project data)
  - Caveat: Kernel computation (decide +kernel).
- **`Wyrd.mem_V`** · `experiments/wyrd/Wyrd/Minimal.lean:78` · both branches
  - Lean: `{n : Nat} (hn : n < 4295) (hb : VB.testBit n = true) : n ∈ V`
  - Means: Any n < 4295 with bit set in VB is in V.
  - Closest known: None; from V_eq.
  - In Mathlib: no (searched: project data)
- **`Wyrd.nameOf_all`** · `experiments/wyrd/Wyrd/Minimal.lean:96` · both branches
  - Lean: `(List.range 4295).all (fun n => nameOf n == encode n) = true`
  - Means: For every n < 4295 the name unpacked from the precomputed table NT equals encode n.
  - Closest known: None; data consistency computation.
  - In Mathlib: no (searched: project data)
  - Caveat: Kernel computation (decide +kernel) over 4295 numbers.
- **`Wyrd.nameOf_eq`** · `experiments/wyrd/Wyrd/Minimal.lean:100` · both branches
  - Lean: `{n : Nat} (hn : n < 4295) : nameOf n = encode n`
  - Means: For n < 4295, the fast table lookup nameOf n equals the coupled name encode n.
  - Closest known: None; from nameOf_all.
  - In Mathlib: no (searched: project data)
  - Caveat: Rests on the kernel computation nameOf_all.
- **`Wyrd.unblock_pack`** · `experiments/wyrd/Wyrd/Minimal.lean:115` · both branches
  - Lean: `(p q : Nat) : unblock (entry p + 65536 * entry q) = nameOf p ++ nameOf q`
  - Means: Unpacking a candidate packed as entry p + 65536·entry q gives the concatenation of the two table names.
  - Closest known: Trivial base-65536 packing arithmetic.
  - In Mathlib: no (searched: project definitions)
  - Caveat: Routine (omega).
- **`Wyrd.ec_complete`** · `experiments/wyrd/Wyrd/Minimal.lean:146` · both branches
  - Lean: 

    ```lean
    (C : List (List Nat)) : ∀ (k : Nat) (used : List Nat) (S : List (List Nat)), S.length = k → (∀ s ∈ S, s ≠ [] ∧ ∃ c ∈ C, c.Perm s) → (used ++ S.flatten).Perm (List.range 26) → ec C used k = true
    ```

  - Means: If k non-empty blocks S, each a rearrangement of some block of C, together with the already-used letters form a permutation of 0–25, then the exact-cover search ec (always branching on the lowest uncovered letter) returns true.
  - Closest known: Completeness of backtracking exact-cover search that branches on a fixed uncovered item, as in Knuth's Algorithm X (D. E. Knuth, 'Dancing Links', 2000, arXiv cs/0011047).
  - In Mathlib: no (searched: exact cover, ec, Algorithm X; nothing in Mathlib)
  - Caveat: Completeness of the project's specific search function over 26 letters; only completeness (not soundness of a true answer) is proved, which is the direction needed.
- **`Wyrd.mem_cands`** · `experiments/wyrd/Wyrd/Minimal.lean:206` · both branches
  - Lean: 

    ```lean
    {N p q : Nat} (hN : N ≤ 4294) (hs : p + q = N) (hlt : p < q) (hp : IsPrime p) (hq : IsPrime q) (hp2 : p ≠ 2) (hq2 : q ≠ 2) (hnd : (encode p ++ encode q).Nodup) : ∃ x ∈ cands N, unblock x = encode p ++ encode q
    ```

  - Means: For N ≤ 4294 and odd primes p < q with p + q = N whose two names share no letter and have no repeats, the pair appears (packed) in the candidate list cands N.
  - Closest known: None; completeness of the project's candidate generation.
  - In Mathlib: no (searched: project definitions)
  - Caveat: Rests on VB_complete and nameOf_all (kernel computations).
- **`Wyrd.pair_in_cands`** · `experiments/wyrd/Wyrd/Minimal.lean:223` · both branches
  - Lean: 

    ```lean
    {N : Nat} {ps : List (Nat × Nat)} (h : IsPangram N ps) (hN : N ≤ 4294) (pq : Nat × Nat) (hpq : pq ∈ ps) : ∃ x ∈ cands N, (unblock x).Perm (encode pq.1 ++ encode pq.2)
    ```

  - Means: For a pangram with sum N ≤ 4294, every pair's letter block appears (up to order of the two names) among the candidates for N.
  - Closest known: None; project lemma.
  - In Mathlib: no (searched: project definitions)
- **`Wyrd.checkEntry_sound`** · `experiments/wyrd/Wyrd/Minimal.lean:247` · both branches
  - Lean: `{N : Nat} {Lb : List Nat} (hN : N ≤ 4294) (hc : checkEntry (N, Lb) = true) (ps : List (Nat × Nat)) : ¬ IsPangram N ps`
  - Means: For N ≤ 4294, if a table row (N, Lb) passes checkEntry (Lb equals the recomputed cands N and the exact-cover search over them returns false), then no list of pairs is a pangram with sum N.
  - Closest known: None; soundness of a certificate checker (standard proof-by-reflection pattern).
  - In Mathlib: no (searched: project definitions)
  - Caveat: The checker recomputes the candidate list, so the stored data is untrusted.
- **`Wyrd.t0_0_ok … Wyrd.t0_45_ok, Wyrd.table0_ok (47 theorems)`** · `experiments/wyrd/Wyrd/MinimalTable0.lean:19` · both branches
  - Lean: `t0_0_ok : t0_0.all checkEntry = true`
  - Means: Each t0_j_ok asserts that, for each of 8 consecutive even sums N in its chunk (together all even N from 1352 to 2086), the stored packed candidate list equals the kernel-recomputed cands N and the 5-block exact-cover search over those candidates' letter blocks finds nothing; table0_ok (line 519) conjoins the 46 chunks.
  - Closest known: None; generated kernel computations about the project's puzzle.
  - In Mathlib: no (searched: project data; not applicable)
  - Caveat: Kernel computations (decide +kernel) generated by scripts/GenTables.lean; 368 sums, 8791 candidate pairs (11–55 per sum).
- **`Wyrd.t1_0_ok … Wyrd.t1_45_ok, Wyrd.table1_ok (47 theorems)`** · `experiments/wyrd/Wyrd/MinimalTable1.lean:19` · both branches
  - Lean: `t1_0_ok : t1_0.all checkEntry = true`
  - Means: As for table 0, for the 368 even sums N = 2088 … 2822 (46 chunks of 8 rows); table1_ok (line 519) conjoins them.
  - Closest known: None; generated kernel computations.
  - In Mathlib: no (searched: project data; not applicable)
  - Caveat: Kernel computations; 10961 candidate pairs (9–72 per sum).
- **`Wyrd.t2_0_ok … Wyrd.t2_45_ok, Wyrd.table2_ok (47 theorems)`** · `experiments/wyrd/Wyrd/MinimalTable2.lean:19` · both branches
  - Lean: `t2_0_ok : t2_0.all checkEntry = true`
  - Means: As for table 0, for the 368 even sums N = 2824 … 3558; table2_ok (line 519) conjoins them.
  - Closest known: None; generated kernel computations.
  - In Mathlib: no (searched: project data; not applicable)
  - Caveat: Kernel computations; 12930 candidate pairs (13–82 per sum).
- **`Wyrd.t3_0_ok … Wyrd.t3_45_ok, Wyrd.table3_ok (47 theorems)`** · `experiments/wyrd/Wyrd/MinimalTable3.lean:19` · both branches
  - Lean: `t3_0_ok : t3_0.all checkEntry = true`
  - Means: As for table 0, for the 368 even sums N = 3560 … 4294; table3_ok (line 519) conjoins them.
  - Closest known: None; generated kernel computations.
  - In Mathlib: no (searched: project data; not applicable)
  - Caveat: Kernel computations; 14943 candidate pairs (17–89 per sum).
- **`Wyrd.tables_ok`** · `experiments/wyrd/Wyrd/Smallest.lean:24` · both branches
  - Lean: `tables.all checkEntry = true`
  - Means: Every row of the four concatenated tables passes checkEntry.
  - Closest known: None; aggregate of the 4 table theorems.
  - In Mathlib: no (searched: project data)
  - Caveat: Aggregates kernel computations.
- **`Wyrd.tables_cover`** · `experiments/wyrd/Wyrd/Smallest.lean:28` · both branches
  - Lean: `tables.map Prod.fst = (List.range 1472).map (fun i => 1352 + 2 * i)`
  - Means: The table rows are exactly the 1472 even sums 1352, 1354, …, 4294, in order.
  - Closest known: None; coverage computation.
  - In Mathlib: no (searched: project data)
  - Caveat: Kernel computation (decide +kernel).
- **`Wyrd.no_smaller_pangram`** · `experiments/wyrd/Wyrd/Smallest.lean:32` · both branches
  - Lean: `{N : Nat} (hN : N < 4296) (ps : List (Nat × Nat)) : ¬ IsPangram N ps`
  - Means: No five-pair prime pangram (project definition, coupled base-26 names) has pair sum N < 4296.
  - Closest known: None in the literature (project-defined puzzle); agrees with the Python and C searches in experiments/ and experiments/checks/.
  - In Mathlib: no (searched: pangram, prime pairs alphabet; project definitions)
  - Caveat: Computation-backed: lower_bound (N ≥ 1352) + sum_even + tables_cover + tables_ok (1472 kernel-run exact-cover searches) + checkEntry_sound.
- **`Wyrd.smallest_pangram_sum`** · `experiments/wyrd/Wyrd/Smallest.lean:48` · both branches
  - Lean: `(∃ ps, IsPangram 4296 ps) ∧ ∀ N < 4296, ∀ ps, ¬ IsPangram N ps`
  - Means: 4296 is the least N for which a list of five prime pairs (p, q) with p + q = N exists whose ten coupled base-26 names use each letter A–Z exactly once.
  - Closest known: No prior literature found for this puzzle (web search on prime pangrams found only unrelated base-26 'prime word' items such as OEIS A182380); the value matches the project's own Python/C searches.
  - In Mathlib: no (searched: pangram, prime pairs alphabet; project definitions)
  - Caveat: Kernel-checked computation about a project-defined encoding chosen after the plain base-26 search failed (README caveat); does not assert uniqueness of the 4296 solution.

#### 250 = 37 phase lock and the mirror keys (prime-proof branch)

- **`Wyrd.Lock.cos_strobe_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:187` · prime-proof branch only
  - Lean: `{T : ℕ} (hT : T ≠ 0) : (∀ n : ℤ, Real.cos (2 * π * (250 * n) / T) = Real.cos (2 * π * (37 * n) / T)) ↔ (T : ℤ) ∣ 213 ∨ (T : ℤ) ∣ 287`
  - Means: For T ∈ ℕ, T ≠ 0: cos(2π·250n/T) = cos(2π·37n/T) in ℝ for every integer n iff T ∣ 213 or T ∣ 287 (= 250 + 37). The second case is 250 ≡ −37 (mod T), the 'mirror' fold of the real cosine.
  - Closest known: Frequency folding of discrete-time cosines. cos(2πfn/T) depends only on ±f mod T, and for integers f, f', T the sequences agree for all n iff f' ≡ ±f (mod T) (cosine sequences at distinct folded frequencies are linearly independent; see e.g. Oppenheim & Schafer, Discrete-Time Signal Processing, ch. 2 on discrete-time sinusoids). This theorem is the instance f = 250, f' = 37.
  - In Mathlib: partial: Real.cos_eq_cos_iff gives the pointwise condition; no sampling or aliasing statement (searched: alias, aliasing, nyquist, sampling)
  - Caveat: Zero phase only, and only for 250 and 37. The forward direction uses only n = 1. The Lean never states 287 = 7·41 or the list of rates (see unresolved claims). The instance T = 287 is the cosine counterexample to the complex-only criterion of strobe_iff.
- **`Wyrd.Lock.sin_strobe_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:229` · prime-proof branch only
  - Lean: `{T : ℕ} (hT : T ≠ 0) : (∀ n : ℤ, Real.sin (2 * π * (250 * n) / T) = Real.sin (2 * π * (37 * n) / T)) ↔ (T : ℤ) ∣ 213 ∨ T = 2`
  - Means: For T ∈ ℕ, T ≠ 0: sin(2π·250n/T) = sin(2π·37n/T) for every integer n iff T ∣ 213 or T = 2. At T = 2 both sines are sampled at their zeros.
  - Closest known: Discrete-time sines satisfy sin(2πfn/T) = sin(2πf'n/T) for all n iff f ≡ f' (mod T) or both sequences vanish identically (T ∣ 2f and T ∣ 2f'). A mirror fold f' ≡ −f only flips the sign. This is routine from the linear independence of discrete sinusoids (cf. Oppenheim & Schafer, ch. 2). For f = 250, f' = 37 the vanishing case is T ∣ gcd(500, 74) = 2.
  - In Mathlib: partial: Real.sin_eq_sin_iff, Real.sin_int_mul_pi; no sampling statement (searched: alias, aliasing, nyquist, sampling)
  - Caveat: The forward direction uses samples n = 1 and n = 2 (gcd(574, 426) = 2). It is specific to 250 and 37 at zero phase.
- **`Wyrd.Lock.adler_37`** · `experiments/wyrd-mathlib/WyrdMathlib/Key.lean:356` · prime-proof branch only
  - Lean: 

    ```lean
    {k : ℝ} (hk : 0 < k) : ((∃ φ : ℝ, 2 * π * 37 - k * Real.sin φ = 0) ↔ 2 * π * 37 ≤ k) ∧ ((∃ φ : ℝ, 2 * π * 37 - k * Real.sin φ = 0 ∧ -(k * Real.cos φ) < 0) ↔ 2 * π * 37 < k)
    ```

  - Means: For real k > 0: some φ ∈ ℝ has 2π·37 = k sin φ iff 2π·37 ≤ k. Some such φ also has −k cos φ < 0 iff 2π·37 < k.
  - Closest known: Adler's locking condition |Δ| ≤ K (R. Adler, 'A study of locking phenomena in oscillators', Proc. IRE 34, 1946); Strogatz, Nonlinear Dynamics and Chaos, nonuniform oscillator
  - In Mathlib: no (searched: Adler, averaged; no such lemma)
  - Caveat: Purely algebraic: no ODE, averaging or stability theorem is formalised. 'Stable' is the sign condition −k cos φ < 0. The real content is in SharedAir/Locking.lean, another group's file. The reading '250 Hz against the third harmonic of 71 Hz' is prose only.

#### Rainbow geometry (Descartes, Alexander’s dark band, spectrum)

- **`Wyrd.Rainbow.snell`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Defs.lean:47` · both branches
  - Lean: `{n : ℝ} (hn : 1 ≤ n) (i : ℝ) : n * sin (refr n i) = sin i`
  - Means: For real n ≥ 1 and every real i, the project's refraction angle refr n i = arcsin(sin i / n) satisfies n · sin(refr n i) = sin i. This checks that the definition encodes Snell's law.
  - Closest known: Snell's law of refraction (Snell 1621; Descartes, La Dioptrique, 1637). Mathematically it is sin(arcsin x) = x for |x| ≤ 1.
  - In Mathlib: partial: Real.sin_arcsin (sin (arcsin x) = x for -1 ≤ x ≤ 1); snell is that lemma at x = sin i / n followed by field_simp
  - Caveat: Snell's law is built into the definition of refr. The theorem verifies that encoding; it does not derive the physical law.
- **`Wyrd.Rainbow.continuous_dev`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Deriv.lean:54` · both branches
  - Lean: `{n : ℝ} (hn : 1 < n) (k : ℕ) : Continuous (dev k n)`
  - Means: For real n > 1 and natural k, the deviation function dev k n : ℝ → ℝ is continuous.
  - Closest known: Immediate from differentiability (hasDerivAt_dev).
  - In Mathlib: no as stated (dev is a project definition); it follows from HasDerivAt.continuousAt
  - Caveat: Routine.
- **`Wyrd.Rainbow.deriv_aux_formula`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Deriv.lean:59` · both branches
  - Lean: `{n : ℝ} (hn : 1 < n) (k : ℕ) (i : ℝ) : deriv (dev k n) i = 2 * (√(n ^ 2 - sin i ^ 2) - (k + 1) * cos i) / √(n ^ 2 - sin i ^ 2)`
  - Means: For real n > 1, natural k and real i, deriv (dev k n) i equals 2(q − (k+1) cos i)/q with q = √(n² − sin² i). (Private.)
  - Closest known: An algebraic rewrite of hasDerivAt_dev.
  - In Mathlib: no (project definition)
  - Caveat: Routine algebra (field_simp).
- **`Wyrd.Rainbow.bow_aux_cos`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:33` · both branches
  - Lean: `{n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) : cos (bowIncidence k n) = √((n ^ 2 - 1) / (k * (k + 2)))`
  - Means: For 1 < n < k + 1 with k ≥ 1, cos(bowIncidence k n) = √((n² − 1)/(k(k+2))). (Private.)
  - Closest known: cos(arccos x) = x on [−1, 1].
  - In Mathlib: partial: Real.cos_arccos, applied to the project definition bowIncidence
  - Caveat: Definitional unfolding.
- **`Wyrd.Rainbow.cos_bowIncidence_sq`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:43` · both branches
  - Lean: `{n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) : cos (bowIncidence k n) ^ 2 = (n ^ 2 - 1) / (k * (k + 2))`
  - Means: For real n and natural k ≥ 1 with 1 < n < k + 1, cos²(bowIncidence k n) = (n² − 1)/(k(k+2)).
  - Closest known: cos(arccos √q)² = q for q ∈ [0, 1].
  - In Mathlib: partial: Real.cos_arccos and Real.sq_sqrt
  - Caveat: Essentially definitional: bowIncidence is defined as arccos √((n²−1)/(k(k+2))). The content is only that this argument lies in [0, 1]. The classical content (that this angle is the stationary point and minimum) is in deriv_dev_eq_zero_iff_eq and dev_lt_of_ne.
- **`Wyrd.Rainbow.bowIncidence_mem`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Bow.lean:49` · both branches
  - Lean: `{n : ℝ} {k : ℕ} (hn : 1 < n) (hk : 1 ≤ k) (hnk : n < k + 1) : bowIncidence k n ∈ Set.Ioo 0 (π / 2)`
  - Means: For 1 < n < k + 1 with k ≥ 1, the bow incidence angle lies strictly between 0 and π/2.
  - Closest known: arccos maps (0, 1) into (0, π/2).
  - In Mathlib: partial: Real.arccos_pos and Real.arccos_lt_pi_div_two
  - Caveat: Routine fact about a project definition.
- **`Wyrd.Rainbow.primary_bow_water_exact`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Primary.lean:18` · both branches
  - Lean: `: π - dev 1 (4 / 3) (bowIncidence 1 (4 / 3)) = 4 * arcsin (√(5 / 12)) - 2 * arccos (√(7 / 27))`
  - Means: For n = 4/3, the primary bow angle π − D at the bow incidence equals exactly 4·arcsin √(5/12) − 2·arccos √(7/27).
  - Closest known: π − D_min = 4r − 2i at the primary bow, with cos² i = 7/27 and sin² r = 5/12 (classical algebra).
  - In Mathlib: no (project definitions)
  - Caveat: A symbolic computation at a chosen constant.
- **`Wyrd.Rainbow.secondary_bowIncidence`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Secondary.lean:19` · both branches
  - Lean: `: bowIncidence 2 (4 / 3) = arccos (√(7 / 72))`
  - Means: For n = 4/3 and k = 2, the bow incidence angle is arccos √(7/72). (Private.)
  - Closest known: Arithmetic: ((4/3)² − 1)/(2·4) = 7/72.
  - In Mathlib: no (project definition)
  - Caveat: A computation (norm_num).
- **`Wyrd.Rainbow.secondary_refr`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Secondary.lean:27` · both branches
  - Lean: `: refr (4 / 3) (arccos (√(7 / 72))) = arcsin (√(65 / 128))`
  - Means: For n = 4/3, the refraction angle at incidence arccos √(7/72) is arcsin √(65/128). (Private.)
  - Closest known: sin(arccos x) = √(1 − x²) and √(65/72)/(4/3) = √(65/128).
  - In Mathlib: partial: Real.sin_arccos
  - Caveat: A computation.
- **`Wyrd.Rainbow.secondary_bow_water_exact`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Secondary.lean:37` · both branches
  - Lean: `: dev 2 (4 / 3) (bowIncidence 2 (4 / 3)) - π = π + 2 * arccos (√(7 / 72)) - 6 * arcsin (√(65 / 128))`
  - Means: For n = 4/3, the secondary bow angle D − π equals exactly π + 2·arccos √(7/72) − 6·arcsin √(65/128).
  - Closest known: D_min − π = π + 2i − 6r at the secondary bow (classical algebra).
  - In Mathlib: no (project definitions)
  - Caveat: A symbolic computation at a chosen constant.
- **`Wyrd.Rainbow.refr_lt_refr`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Colours.lean:24` · both branches
  - Lean: `{n n' i : ℝ} (hn : 1 ≤ n) (hnn' : n < n') (hi : 0 < sin i) : refr n' i < refr n i`
  - Means: For real 1 ≤ n < n' and real i with sin i > 0, refr n' i < refr n i. A larger index gives a smaller refraction angle.
  - Closest known: Snell's law: a denser medium bends the ray more. Mathematically, arcsin is strictly increasing.
  - In Mathlib: partial: Real.arcsin_lt_arcsin applied to sin i / n' < sin i / n
  - Caveat: Routine monotonicity of the project's encoding.
- **`Wyrd.Rainbow.dev_lt_dev`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/Colours.lean:39` · both branches
  - Lean: `{k : ℕ} {n n' i : ℝ} (hn : 1 ≤ n) (hnn' : n < n') (hi : 0 < sin i) : dev k n i < dev k n' i`
  - Means: For any natural k, real 1 ≤ n < n' and real i with sin i > 0, dev k n i < dev k n' i. At a fixed entry angle the deviation grows with the index.
  - Closest known: Elementary consequence of refr_lt_refr.
  - In Mathlib: no (project definitions)
  - Caveat: Routine.
- **`Wyrd.Rainbow.spectrumPrimary_red_exact`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/SpectrumPrimary.lean:19` · both branches
  - Lean: `: π - dev 1 (1331 / 1000) (bowIncidence 1 (1331 / 1000)) = 4 * arcsin (√(742813 / 1771561)) - 2 * arccos (√(257187 / 1000000))`
  - Means: For n = 1.331, the primary bow angle equals exactly 4·arcsin √(742813/1771561) − 2·arccos √(257187/1000000). (Private theorem.)
  - Closest known: The same classical closed form as primary_bow_water_exact.
  - In Mathlib: no (project definitions)
  - Caveat: A computation at a project-chosen constant.
- **`Wyrd.Rainbow.spectrumPrimary_violet_exact`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/SpectrumPrimary.lean:42` · both branches
  - Lean: `: π - dev 1 (1343 / 1000) (bowIncidence 1 (1343 / 1000)) = 4 * arcsin (√(732117 / 1803649)) - 2 * arccos (√(267883 / 1000000))`
  - Means: For n = 1.343, the primary bow angle equals exactly 4·arcsin √(732117/1803649) − 2·arccos √(267883/1000000). (Private theorem.)
  - Closest known: The classical closed form.
  - In Mathlib: no (project definitions)
  - Caveat: A computation.
- **`Wyrd.Rainbow.primary_red`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/SpectrumPrimary.lean:65` · both branches
  - Lean: `: 42 * π / 180 < π - dev 1 (1331 / 1000) (bowIncidence 1 (1331 / 1000)) ∧ π - dev 1 (1331 / 1000) (bowIncidence 1 (1331 / 1000)) < 43 * π / 180`
  - Means: For n = 1331/1000, the primary bow angle lies strictly between 42° and 43°.
  - Closest known: Newton, Opticks (1704), Book I Part II, Prop. IX, Prob. IV, computes the primary bow's red limit as 42°2′ with sine ratio 108:81 (n = 1.3333). Stewart's Applied Project 'The Calculus of Rainbows' (Calculus, following §4.1 in the 6th ed. ET) asks for the same calculation with red n ≈ 1.3318, giving about 42.3°. The project's n = 1.331 gives 42.37° numerically.
  - In Mathlib: no
  - Caveat: A rigorous numeric computation. Calling 1.331 'red, 663–694 nm' is a modelling input in prose that Lean does not check.
- **`Wyrd.Rainbow.primary_violet`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/SpectrumPrimary.lean:100` · both branches
  - Lean: `: 40 * π / 180 < π - dev 1 (1343 / 1000) (bowIncidence 1 (1343 / 1000)) ∧ π - dev 1 (1343 / 1000) (bowIncidence 1 (1343 / 1000)) < 41 * π / 180`
  - Means: For n = 1343/1000, the primary bow angle lies strictly between 40° and 41°.
  - Closest known: Newton, Opticks (1704), Book I Part II, Prop. IX, computes the primary bow's violet limit as 40°17′ with sine ratio 109:81 (n ≈ 1.3457). Stewart's 'Calculus of Rainbows' project uses violet n ≈ 1.3435, giving about 40.6°. The project's n = 1.343 gives 40.65° numerically.
  - In Mathlib: no
  - Caveat: A computation. Calling 1.343 'violet, 402–410 nm' is a modelling input.
- **`Wyrd.Rainbow.spectrumSecondary_red_exact`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/SpectrumSecondary.lean:23` · both branches
  - Lean: `: dev 2 (1331 / 1000) (bowIncidence 2 (1331 / 1000)) - π = π + 2 * arccos (√(771561 / 8000000)) - 6 * arcsin (√(7228439 / 14172488))`
  - Means: For n = 1.331, the secondary bow angle equals exactly π + 2·arccos √(771561/8000000) − 6·arcsin √(7228439/14172488). (Private theorem.)
  - Closest known: The classical closed form D − π = π + 2i − 6r.
  - In Mathlib: no (project definitions)
  - Caveat: A computation (I checked the constants: (n²−1)/8 = 771561/8000000 and sin² r = 7228439/14172488).
- **`Wyrd.Rainbow.secondary_red`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/SpectrumSecondary.lean:93` · both branches
  - Lean: `: 50 * π / 180 < dev 2 (1331 / 1000) (bowIncidence 2 (1331 / 1000)) - π ∧ dev 2 (1331 / 1000) (bowIncidence 2 (1331 / 1000)) - π < 51 * π / 180`
  - Means: For n = 1331/1000, the secondary bow angle lies strictly between 50° and 51°.
  - Closest known: Newton, Opticks (1704), Book I Part II, Prop. IX: the secondary bow's red limit is 50°57′ for sine ratio 108:81. The project's n = 1.331 gives 50.37° numerically.
  - In Mathlib: no
  - Caveat: A computation. The bracket is fragile: numerically it holds only for n ∈ (≈1.32962, ≈1.33342).
- **`Wyrd.Rainbow.spectrumSecondary_violet_exact`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/SpectrumSecondary.lean:111` · both branches
  - Lean: `: dev 2 (1343 / 1000) (bowIncidence 2 (1343 / 1000)) - π = π + 2 * arccos (√(803649 / 8000000)) - 6 * arcsin (√(7196351 / 14429192))`
  - Means: For n = 1.343, the secondary bow angle equals exactly π + 2·arccos √(803649/8000000) − 6·arcsin √(7196351/14429192). (Private theorem.)
  - Closest known: The classical closed form.
  - In Mathlib: no (project definitions)
  - Caveat: A computation.
- **`Wyrd.Rainbow.secondary_violet`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/SpectrumSecondary.lean:183` · both branches
  - Lean: `: 53 * π / 180 < dev 2 (1343 / 1000) (bowIncidence 2 (1343 / 1000)) - π ∧ dev 2 (1343 / 1000) (bowIncidence 2 (1343 / 1000)) - π < 54 * π / 180`
  - Means: For n = 1343/1000, the secondary bow angle lies strictly between 53° and 54°.
  - Closest known: Newton, Opticks (1704), Book I Part II, Prop. IX: the secondary bow's violet limit is 54°7′ for sine ratio 109:81. The project's n = 1.343 gives 53.48° numerically.
  - In Mathlib: no
  - Caveat: A computation; 1.343 is a modelling input.
- **`Wyrd.Rainbow.dark_band_of_red_le`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/VisibleBand.lean:31` · both branches
  - Lean: `{n i : ℝ} (hred : 1331 / 1000 ≤ n) (hn2 : n < 2) (hi : i ∈ Set.Icc 0 (π / 2)) : π - dev 1 n i < 43 * π / 180 ∧ 50 * π / 180 < dev 2 n i - π`
  - Means: For every real n with 1.331 ≤ n < 2 and every i ∈ [0, π/2], π − dev 1 n i < 43° and dev 2 n i − π > 50°. So once- and twice-reflected rays avoid the 43–50° band for all such indices.
  - Closest known: Newton, Opticks (1704), Book I Part II, Prop. IX: the gap between the bows is bounded by the red limits of both bows (42°2′ inner, 50°57′ outer), and bluer light lies further from the gap. This is Descartes' minimum-deviation argument with dispersion added. The Lean form, uniform over n ∈ [1.331, 2) via bowDev_strictMonoOn, is the project's own packaging of that classical fact.
  - In Mathlib: no
  - Caveat: It combines the red brackets at n = 1.331 with bowDev_strictMonoOn. 'Every colour from red up' rests on identifying colours with n ≥ 1.331, a modelling input; the 726 nm deep-red exception is prose. Lean has the extra hypothesis n < 2, which is harmless for water.
- **`Wyrd.Rainbow.dark_band_visible`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/VisibleBand.lean:61` · both branches
  - Lean: `{n i : ℝ} (hn : n ∈ Set.Icc (1331 / 1000) (1343 / 1000)) (hi : i ∈ Set.Icc 0 (π / 2)) : π - dev 1 n i < 43 * π / 180 ∧ 50 * π / 180 < dev 2 n i - π`
  - Means: For every n ∈ [1.331, 1.343] and i ∈ [0, π/2], π − dev 1 n i < 43° and dev 2 n i − π > 50°.
  - Closest known: A specialization of dark_band_of_red_le to n ∈ [1.331, 1.343]. Classically, this is Newton's account (Opticks, Book I Part II, Prop. IX) of the gap between the red edges of the two bows.
  - In Mathlib: no
  - Caveat: Calling [1.331, 1.343] 'red to violet' is a modelling input.
- **`Wyrd.Rainbow.water_colour_order`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/VisibleBand.lean:68` · both branches
  - Lean: 

    ```lean
    : π - dev 1 (1343 / 1000) (bowIncidence 1 (1343 / 1000)) < π - dev 1 (1331 / 1000) (bowIncidence 1 (1331 / 1000)) ∧ dev 2 (1331 / 1000) (bowIncidence 2 (1331 / 1000)) - π < dev 2 (1343 / 1000) (bowIncidence 2 (1343 / 1000)) - π
    ```

  - Means: At n = 1.343 the primary bow angle is smaller than at n = 1.331, and the secondary bow angle is larger.
  - Closest known: An instance of colour_order (Newton 1704).
  - In Mathlib: no
  - Caveat: An instance at chosen constants.
- **`Wyrd.Rainbow.primary_spread`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/VisibleBand.lean:77` · both branches
  - Lean: `: π / 180 < (π - dev 1 (1331 / 1000) (bowIncidence 1 (1331 / 1000))) - (π - dev 1 (1343 / 1000) (bowIncidence 1 (1343 / 1000)))`
  - Means: The primary bow angle at n = 1.331 exceeds that at n = 1.343 by more than 1° (π/180).
  - Closest known: Newton, Opticks, Book I Part II, Prop. IX gives the breadth of the interior bow as 1°45′ (point sun, red 108:81 to violet 109:81). With the project's endpoints 1.331 and 1.343 the width is 1.72° numerically.
  - In Mathlib: no
  - Caveat: Follows from primary_red and primary_violet by linarith. Reading it as 'the colour spread' rests on taking 1.331 and 1.343 as the ends of the visible spectrum, which is a modelling input. The ~1.7° width is numerical only, and the ROADMAP lists the 0.1° width as open.
- **`Wyrd.Rainbow.secondary_spread`** · `experiments/wyrd-mathlib/WyrdMathlib/Rainbow/VisibleBand.lean:84` · both branches
  - Lean: `: 2 * π / 180 < (dev 2 (1343 / 1000) (bowIncidence 2 (1343 / 1000)) - π) - (dev 2 (1331 / 1000) (bowIncidence 2 (1331 / 1000)) - π)`
  - Means: The secondary bow angle at n = 1.343 exceeds that at n = 1.331 by more than 2°.
  - Closest known: Newton, Opticks, Book I Part II, Prop. IX gives the breadth of the exterior bow as 3°10′ (point sun). With the project's endpoints 1.331 and 1.343 the width is 3.11° numerically.
  - In Mathlib: no
  - Caveat: Follows from secondary_red and secondary_violet. The ~3.1° width is numerical only.

#### Body-water physiology models and Limits models

- **`Wyrd.BodyWater.Body.weight_decomposition`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Compartments.lean:50` · both branches
  - Lean: `(b : Body) : b.weight = b.solids + b.icw + b.interstitial + b.plasma ∧ 0 < b.solids ∧ 0 < b.icw ∧ 0 < b.interstitial ∧ 0 < b.plasma`
  - Means: For any Body record (real weight, tbw, ecw, plasma with 0 < plasma < ecw < tbw < weight built into the structure), weight = solids + icw + interstitial + plasma, where these parts are defined as differences, and all four parts are positive.
  - Closest known: Standard partition of body weight into solids, intracellular water, interstitial fluid and plasma (e.g. Guyton & Hall, Textbook of Medical Physiology, body-fluid compartments chapter).
  - In Mathlib: no (searched: body composition; the content is ring + linarith)
  - Caveat: The identity telescopes by the definitions (icw = tbw - ecw, etc.), and positivity is just the strict chain assumed as structure fields. No physiology is derived.
- **`Wyrd.BodyWater.fatFraction_strictAnti`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Newborn.lean:70` · both branches
  - Lean: `{h : ℝ} (hh : 0 < h) : StrictAnti (fatFraction h)`
  - Means: For h > 0, the function t ↦ 1 - t/h on ℝ is strictly decreasing.
  - Closest known: Two-compartment body-composition model with fixed fat-free-mass hydration (Pace & Rathbun 1945, J Biol Chem 158:685, about 73% in adults; Fomon et al. 1982, Am J Clin Nutr 35:1169, about 80% at birth).
  - In Mathlib: partial: monotonicity of division by a positive constant (gcongr); no statement about this function
  - Caveat: Monotonicity of an affine function. The fixed-hydration assumption carries all the physiological content.
- **`Wyrd.BodyWater.more_water_less_fat`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Newborn.lean:80` · both branches
  - Lean: `{h t₁ t₂ : ℝ} (hh : 0 < h) (ht : t₁ < t₂) : fatFraction h t₂ < fatFraction h t₁`
  - Means: For h > 0 and t₁ < t₂, 1 - t₂/h < 1 - t₁/h.
  - Closest known: Same as fatFraction_strictAnti; the SGA/LGA pattern is empirical (source chapter).
  - In Mathlib: partial: as for fatFraction_strictAnti
  - Caveat: Restates fatFraction_strictAnti pointwise. The SGA/LGA reading assumes equal fat-free-mass hydration, which the file notes may fail for SGA infants.
- **`Wyrd.BodyWater.icwEq_add_ecwEq`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Osmotic.lean:43` · both branches
  - Lean: `{W Oi Oe : ℝ} (hi : 0 < Oi) (he : 0 < Oe) : icwEq W Oi Oe + ecwEq W Oi Oe = W`
  - Means: For Oi, Oe > 0 and any real W, W·Oi/(Oi + Oe) + W·Oe/(Oi + Oe) = W.
  - Closest known: Mass balance of two-compartment osmotic equilibrium (Darrow & Yannet 1935, J Clin Invest 14:266; Rose & Post, Clinical Physiology of Acid-Base and Electrolyte Disorders).
  - In Mathlib: no (searched: osmotic, osmol; the content is field_simp)
  - Caveat: A definitional check of the project's equilibrium split.
- **`Wyrd.BodyWater.equal_osmolality`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Osmotic.lean:51` · both branches
  - Lean: `{W Oi Oe : ℝ} (hW : 0 < W) (hi : 0 < Oi) (he : 0 < Oe) : Oi / icwEq W Oi Oe = (Oi + Oe) / W ∧ Oe / ecwEq W Oi Oe = (Oi + Oe) / W`
  - Means: For W, Oi, Oe > 0, Oi / icwEq = (Oi + Oe)/W and Oe / ecwEq = (Oi + Oe)/W, so both compartments have the same model osmolality.
  - Closest known: Osmotic equilibrium across cell membranes (equal tonicity); Rose & Post textbook.
  - In Mathlib: no (searched: osmotic; field_simp)
  - Caveat: Confirms that the definition encodes equal tonicity. Free water movement and confined solutes are built into icwEq, not derived.
- **`Wyrd.BodyWater.newborn_water_load`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Osmotic.lean:79` · both branches
  - Lean: `{W w : ℝ} (hw : 0 < w) : icwEq (W + w) 34 44 - icwEq W 34 44 = 34 / 78 * w ∧ icwEq (W + w) 34 44 - icwEq W 34 44 < w / 2`
  - Means: With osmole split 34 : 44 and w > 0, a water load w raises equilibrium intracellular water by (34/78)·w, which is less than w/2.
  - Closest known: Same as water_load_split, specialised to term-newborn ICW 34% and ECW 44% of body weight.
  - In Mathlib: no (searched: osmotic)
  - Caveat: The constants 34 and 44 are the quoted newborn percentages. Treating the volume ratio as the osmole ratio holds at equilibrium in this model.
- **`Wyrd.BodyWater.smaller_body_bigger_change`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Sodium.lean:69` · both branches
  - Lean: 

    ```lean
    {S₁ S₂ W₁ W₂ c : ℝ} (h₁ : 0 < W₁) (hW : W₁ < W₂) (hNa : serumNa S₁ W₁ = serumNa S₂ W₂) (hc : serumNa S₁ W₁ < c) : serumNa (S₂ + c) (W₂ + 1) - serumNa S₂ W₂ < serumNa (S₁ + c) (W₁ + 1) - serumNa S₁ W₁
    ```

  - Means: If 0 < W₁ < W₂, both bodies have the same model sodium, and c exceeds it, then one litre at concentration c raises model sodium more in the W₁ body than in the W₂ body.
  - Closest known: Immediate from the Adrogué-Madias denominator TBW + 1.
  - In Mathlib: no (searched: sodium)
  - Caveat: Model statement: a positive numerator over a larger denominator.
- **`Wyrd.BodyWater.smaller_body_bigger_change_abs`** · `experiments/wyrd-mathlib/WyrdMathlib/BodyWater/Sodium.lean:104` · both branches
  - Lean: 

    ```lean
    {S₁ S₂ W₁ W₂ c : ℝ} (h₁ : 0 < W₁) (hW : W₁ < W₂) (hNa : serumNa S₁ W₁ = serumNa S₂ W₂) (hc : c ≠ serumNa S₁ W₁) : |serumNa (S₂ + c) (W₂ + 1) - serumNa S₂ W₂| < |serumNa (S₁ + c) (W₁ + 1) - serumNa S₁ W₁|
    ```

  - Means: Under the same hypotheses as smaller_body_bigger_change, but with c only different from the common model sodium, the absolute change from one litre is larger in the smaller body.
  - Closest known: Immediate from the Adrogué-Madias denominator TBW + 1.
  - In Mathlib: no (searched: sodium)
  - Caveat: Model statement.
- **`Wyrd.Limits.symp_pos_of_gt (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Arousal.lean:36` · new-session branch only
  - Lean: `{A : ℝ} (h : symp 0 < symp A) : 0 < A`
  - Means: If 0.1 + 0.5·max(A, 0) > 0.1 then A > 0.
  - Closest known: Elementary property of max.
  - In Mathlib: partial: max_eq_right
  - Caveat: A trivial helper.
- **`Wyrd.Limits.no_coactivation`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Arousal.lean:43` · new-session branch only
  - Lean: `{V₀ rsa insp A : ℝ} (hV : 0 < V₀) (hr : rsa * insp < 1) (hS : symp 0 < symp A) : vagal V₀ rsa insp A < vagal V₀ rsa insp 0`
  - Means: For V₀ > 0 and rsa·insp < 1, if sympathetic drive 0.1 + 0.5·max(A, 0) is above its value at A = 0, then vagal tone V₀(1 - 0.8A)(1 - rsa·insp) is strictly below its value at A = 0.
  - Closest known: The doctrine of autonomic reciprocity versus 'autonomic space' (Berntson, Cacioppo & Quigley 1991, Psychol Rev 98:459), which documents sympathetic-vagal coactivation that a one-axis model cannot represent.
  - In Mathlib: no (searched: autonomic; nlinarith)
  - Caveat: A property of the model's modelling assumption (both branches are monotone functions of one variable A), not of physiology.
- **`Wyrd.Limits.symp_determines_state`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Arousal.lean:51` · new-session branch only
  - Lean: `{A₁ A₂ : ℝ} (h : symp A₁ = symp A₂) (h0 : symp 0 < symp A₁) : A₁ = A₂`
  - Means: If two real arousal values give the same sympathetic drive and that drive is above rest, they are equal.
  - Closest known: Injectivity of an affine map on A > 0.
  - In Mathlib: partial: max_eq_left
  - Caveat: About the model's encoding.
- **`Wyrd.Limits.vagal_determined_by_symp`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Arousal.lean:59` · new-session branch only
  - Lean: `{V₀ rsa insp A₁ A₂ : ℝ} (h : symp A₁ = symp A₂) (h0 : symp 0 < symp A₁) : vagal V₀ rsa insp A₁ = vagal V₀ rsa insp A₂`
  - Means: Above rest, equal sympathetic drive forces equal vagal tone (for any V₀, rsa, insp).
  - Closest known: Corollary of symp_determines_state.
  - In Mathlib: no (searched: autonomic)
  - Caveat: About the model's encoding.
- **`Wyrd.Limits.hasDerivAt_field_line_at`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:57` · new-session branch only
  - Lean: 

    ```lean
    (g : ℝ) (p v : ℝ × ℝ × ℝ) : HasDerivAt (fun t : ℝ => field g (p + t • v)) ((jac g p).mulVec ![v.1, v.2.1, v.2.2] 0, (jac g p).mulVec ![v.1, v.2.1, v.2.2] 1, (jac g p).mulVec ![v.1, v.2.1, v.2.2] 2) 0
    ```

  - Means: For every g, point p and direction v in ℝ³, the derivative at t = 0 of t ↦ field g (p + t·v) is the hand-written matrix jac g p applied to v.
  - Closest known: The chain rule and Jacobian of a polynomial-rational vector field. Within the project, it generalises SharedAir.hasDerivAt_field_line (and hasFDerivAt_field), which state this only at the origin, to an arbitrary base point.
  - In Mathlib: partial: HasDerivAt.prodMk, HasDerivAt.inv, HasDerivAt.pow (derivative combinators)
  - Caveat: Only a directional derivative along lines, not a Fréchet-derivative statement. It certifies the project's Jacobian formula.
- **`Wyrd.Limits.no_coarousal_without_cap_general`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:133` · new-session branch only
  - Lean: 

    ```lean
    {a b d r q h κ g x y z : ℝ} (ha : 0 < a) (hb : 0 < b) (hd : 0 < d) (hh : 0 ≤ h) (hκ : 0 < κ) (hg : 0 ≤ g) (e₁ : -a * x - z + r * g * y - κ * x ^ 3 = 0) (e₂ : -b * y + q * g * x - κ * y ^ 3 = 0) (e₃ : -d * z + h * g * x = 0) (hne : (x, y) ≠ (0, 0)) : P a b d (r * q) h g 0 < 0
    ```

  - Means: Take a, b, d, κ > 0 and h, g ≥ 0, with r and q arbitrary. If (x, y, z) satisfies the three equilibrium equations of the cap-free system with cubic damping κ in both arousal equations, and (x, y) ≠ (0, 0), then P(0, g) = abd + hbg − (rq)·d·g² < 0. The theorem stops at this sign. It does not state that rest is then linearly unstable. That would follow from SharedAir.det_charMatrix together with SharedAir.delay_unstable at τ = 0, but that combination is not formalised here.
  - Closest known: The supercritical-pitchfork picture: nontrivial equilibria exist only beyond the loss of stability of rest (Strogatz, Nonlinear Dynamics and Chaos, 1994, ch. 3). No exact literature match.
  - In Mathlib: no (searched: equilibrium, bifurcation)
  - Caveat: About the project's model family. It requires the same cubic coefficient κ in both equations.
- **`Wyrd.Limits.only_rest_without_cap`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:170` · new-session branch only
  - Lean: `{g : ℝ} (hg₀ : 0 ≤ g) (hg : g ≤ 3) {p : ℝ × ℝ × ℝ} (hp : fieldNoCap g p = 0) : p = 0`
  - Means: For 0 ≤ g ≤ 3, the only zero of the cap-free model field in ℝ³ is the origin.
  - Closest known: Project-specific instance of no_coarousal_without_cap_general (P(0, g) > 0 on [0, 3]).
  - In Mathlib: no (searched: equilibrium)
  - Caveat: Zero delay, zero noise, zero input. The model's illustrative coefficients.
- **`Wyrd.Limits.bist_f2_pos (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:191` · new-session branch only
  - Lean: 

    ```lean
    {u : ℝ} (hu : 0 ≤ u) : 0 < (0.64 + u) * (1 / 20 + 0.02 * u) / 30 + 0.5 * u * (1 / 20 + 0.02 * u) ^ 3 * (0.64 + u) + 0.384 * (1 / 20 + 0.02 * u) - 0.016 * (0.64 + u)
    ```

  - Means: A specific degree-5 real polynomial in u is positive for all u ≥ 0.
  - Closest known: Polynomial positivity certificate (nlinarith with squares of (u - 2.1)).
  - In Mathlib: no (searched: specific polynomial)
  - Caveat: A computation (positivity certificate) about a project polynomial.
- **`Wyrd.Limits.bist_cap_mul (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:198` · new-session branch only
  - Lean: `(y : ℝ) : cap y * (0.64 + y ^ 2) = 0.64`
  - Means: For every real y, cap y · (0.64 + y²) = 0.64, where cap y = 1/(1 + (y/0.8)²).
  - Closest known: Algebraic identity.
  - In Mathlib: no (field identity)
  - Caveat: A trivial helper.
- **`Wyrd.Limits.bist_cap_pos (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:204` · new-session branch only
  - Lean: `(y : ℝ) : 0 < cap y`
  - Means: cap y > 0 for every real y.
  - Closest known: Positivity.
  - In Mathlib: no (positivity tactic)
  - Caveat: A trivial helper.
- **`Wyrd.Limits.only_rest_upto_two`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:208` · new-session branch only
  - Lean: `{g : ℝ} (hg₀ : 0 ≤ g) (hg : g ≤ 2) {p : ℝ × ℝ × ℝ} (hp : field g p = 0) : p = 0`
  - Means: For 0 ≤ g ≤ 2, the only zero of the model field with the capacity limit in ℝ³ is the origin.
  - Closest known: No specific literature result. The method is elimination plus a polynomial positivity certificate (bist_f2_pos).
  - In Mathlib: no (searched: equilibrium)
  - Caveat: Zero delay, zero noise, zero input, and the model's illustrative coefficients. The algebra is real, but the statement concerns only this specific field.
- **`Wyrd.Limits.bist_field_eq (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:286` · new-session branch only
  - Lean: `{g : ℝ} (hg : g ≠ 0) (y : ℝ) : field g (bistX g y, y, 0.30 * g * bistX g y * cap y) = (bistF g y, 0, 0)`
  - Means: For g ≠ 0, the field at (bistX g y, y, 0.3 g bistX cap y) has second and third components 0 and first component bistF g y.
  - Closest known: Elimination of variables for equilibria.
  - In Mathlib: no
  - Caveat: A helper about project definitions.
- **`Wyrd.Limits.bist_cap_cont (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:295` · new-session branch only
  - Lean: `: Continuous cap`
  - Means: cap is continuous on ℝ.
  - Closest known: Continuity of a rational function with a nonvanishing denominator.
  - In Mathlib: partial: Continuous.div (fun_prop)
  - Caveat: A trivial helper.
- **`Wyrd.Limits.bist_F_cont (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:299` · new-session branch only
  - Lean: `(g : ℝ) : Continuous (bistF g)`
  - Means: For each g, y ↦ bistF g y is continuous.
  - Closest known: Continuity of compositions.
  - In Mathlib: partial: fun_prop
  - Caveat: A trivial helper.
- **`Wyrd.Limits.bistX_pos (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:304` · new-session branch only
  - Lean: `{g y : ℝ} (hg : 0 < g) (hy : 0 < y) : 0 < bistX g y`
  - Means: For g, y > 0, y(1/20 + 0.02y²)/(0.1g) > 0.
  - Closest known: Positivity.
  - In Mathlib: no (positivity tactic)
  - Caveat: A trivial helper.
- **`Wyrd.Limits.coarousal_exists_above_two`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:308` · new-session branch only
  - Lean: `: ∃ p : ℝ × ℝ × ℝ, 0 < p.1 ∧ 0 < p.2.1 ∧ field 2.1 p = 0`
  - Means: At g = 2.1 the model field has a zero p in ℝ³ with both arousal coordinates positive.
  - Closest known: Equilibria created by a fold (saddle-node) bifurcation (e.g. Kuznetsov, Elements of Applied Bifurcation Theory). The fold itself is not proved.
  - In Mathlib: partial: intermediate_value_Icc (used)
  - Caveat: A computation: norm_num signs of bistF at y = 1.3 and 1.4, then intermediate_value_Icc, at g = 2.1 only. Numerically, [1.3, 1.4] contains exactly one root, y ≈ 1.3287 (x ≈ 0.540). A Jacobian computed independently by finite differences shows this equilibrium is a SADDLE, with eigenvalues ≈ +0.0127 and −0.235 ± 0.186i: the lower, unstable branch of the fold. The stable co-arousal equilibrium at g = 2.1 (y ≈ 1.7263, eigenvalues ≈ −0.0167 and −0.272 ± 0.154i) is not certified. Nothing links this point to the stable equilibrium certified at g = 3, so the theorem does not show that the 'second stable state' exists at g = 2.1.
- **`Wyrd.Limits.bist_coeffs (private lemma)`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:331` · new-session branch only
  - Lean: 

    ```lean
    (M : Matrix (Fin 3) (Fin 3) ℝ) {x y c : ℝ} (h00 : M 0 0 = -1 / 30 - 0.06 * x ^ 2) (h01 : M 0 1 = 0.12) (h02 : M 0 2 = -1) (h10 : M 1 0 = 0.3) (h11 : M 1 1 = -1 / 20 - 0.06 * y ^ 2) (h12 : M 1 2 = 0) (h20 : M 2 0 = 0.225 * c) (h21 : M 2 1 = -0.703125 * x * y * c ^ 2) (h22 : M 2 2 = -1 / 4) (hx1 : 1.91 ≤ x) (hx2 : x ≤ 1.92) (hy1 : 2.79 ≤ y) (hy2 : y ≤ 2.792) (hc0 : 0 ≤ c) (hc1 : c ≤ 0.08) : 0 < -(M 0 0 + M 1 1 + M 2 2) ∧ 0 < -M.det ∧ -M.det < -(M 0 0 + M 1 1 + M 2 2) * (M 0 0 * M 1 1 - M 0 1 * M 1 0 + M 0 0 * M 2 2 - M 0 2 * M 2 0 + M 1 1 * M 2 2 - M 1 2 * M 2 1)
    ```

  - Means: For any 3×3 real matrix with these entries and x ∈ [1.91, 1.92], y ∈ [2.79, 2.792], c ∈ [0, 0.08], the three Routh-Hurwitz inequalities for its characteristic cubic hold.
  - Closest known: Interval-arithmetic verification of Routh-Hurwitz conditions.
  - In Mathlib: no
  - Caveat: A computation with crude interval bounds.
- **`Wyrd.Limits.coarousal_stable_at_three`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Bistability.lean:373` · new-session branch only
  - Lean: `: ∃ p : ℝ × ℝ × ℝ, 0 < p.1 ∧ 0 < p.2.1 ∧ field 3 p = 0 ∧ ∀ s : ℂ, (s • (1 : Matrix (Fin 3) (Fin 3) ℂ) - (jac 3 p).map (fun r : ℝ => (r : ℂ))).det = 0 → s.re < 0`
  - Means: At g = 3 the model field has a zero p with both arousal coordinates positive, and every eigenvalue of the Jacobian jac 3 p has negative real part.
  - Closest known: Linear stability by Routh-Hurwitz; bistability as coexistence of two attractors past a fold.
  - In Mathlib: no (searched: Routh, Hurwitz, Lyapunov)
  - Caveat: Linear stability only: every eigenvalue of the hand-written jac has negative real part. Passing to local asymptotic stability of the nonlinear ODE needs Lyapunov's indirect method, which is neither in Mathlib nor formalised here. Zero delay, zero noise. The proof is IVT on [2.79, 2.792] plus interval bounds. The certified equilibrium (y ≈ 2.7908) is the upper branch. It is not shown to be the continuation of the point certified at g = 2.1, which is numerically the saddle branch, and no equilibrium is certified for g strictly between 2.1 and 3. At g = 3 there is also a saddle co-arousal equilibrium at y ≈ 0.555 (eigenvalue ≈ +0.023, numerical).
- **`Wyrd.Limits.mirroring_keeps_lag`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Direction.lean:85` · new-session branch only
  - Lean: 

    ```lean
    {ω κ d : ℝ} (hω : 0 < ω) (hκ : 0 < κ) (hd : 0 < d) (hdπ : d < π / ω) : (∀ h ∈ Set.Ioc (-(π / ω)) (π / ω), xcov ω (fun t => κ * sin (ω * (t - d))) (fun t => 1 * sin (ω * (t - 0))) h ≤ xcov ω (fun t => κ * sin (ω * (t - d))) (fun t => 1 * sin (ω * (t - 0))) (-d)) ∧ (∀ h ∈ Set.Ioc (-(π / ω)) (π / ω), xcov ω (fun t => κ * sin (ω * (t - d))) (fun t => 1 * sin (ω * (t - 0))) h = xcov ω (fun t => κ * sin (ω * (t - d))) (fun t => 1 * sin (ω * (t - 0))) (-d) → h = -d)
    ```

  - Means: For ω, κ, d > 0 with d < π/ω, the cross-covariance of infant κ sin(ω(t - d)) with mom sin(ωt) has its unique maximum over lags in (-π/ω, π/ω] at h = -d.
  - Closest known: Peak lag of the cross-correlation of a delayed copy (standard).
  - In Mathlib: partial: Real.cos_eq_one_iff_of_lt_of_lt (used)
  - Caveat: Pure sinusoids, one period, with the response sign assumed positive.
- **`Wyrd.Limits.calming_reverses_lag`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Direction.lean:122` · new-session branch only
  - Lean: 

    ```lean
    {ω κ d : ℝ} (hω : 0 < ω) (hκ : 0 < κ) (hd : 0 < d) (hdπ : d < π / ω) : 0 < π / ω - d ∧ (∀ h ∈ Set.Ioc (-(π / ω)) (π / ω), xcov ω (fun t => -κ * sin (ω * (t - d))) (fun t => 1 * sin (ω * (t - 0))) h ≤ xcov ω (fun t => -κ * sin (ω * (t - d))) (fun t => 1 * sin (ω * (t - 0))) (π / ω - d)) ∧ (∀ h ∈ Set.Ioc (-(π / ω)) (π / ω), xcov ω (fun t => -κ * sin (ω * (t - d))) (fun t => 1 * sin (ω * (t - 0))) h = xcov ω (fun t => -κ * sin (ω * (t - d))) (fun t => 1 * sin (ω * (t - 0))) (π / ω - d) → h = π / ω - d)
    ```

  - Means: With the same hypotheses but infant -κ sin(ω(t - d)), π/ω - d > 0 and the unique maximum over (-π/ω, π/ω] is at h = π/ω - d, a positive lag.
  - Closest known: Inverting the polarity of a periodic signal equals a half-period shift, so the sign of a peak lag is ambiguous without an assumed response sign (standard signal processing).
  - In Mathlib: partial: Real.cos_sub_pi, Real.cos_eq_one_iff_of_lt_of_lt
  - Caveat: Pure sinusoids, one period. The conclusion depends on the assumed sign of the response, which is the point of the theorem.
- **`Wyrd.Limits.room_leaks_when_unmatched`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Direction.lean:166` · new-session branch only
  - Lean: 

    ```lean
    {ω d₁ d₂ d₃ : ℝ} (hω : 0 < ω) (h0 : 0 < |d₂ - d₃|) (h1 : |d₂ - d₃| < 2 * π / ω) : 0 < xcov ω (fun t => 1 * sin (ω * (t - d₁))) (fun t => 1 * sin (ω * (t - d₂))) (d₂ - d₁) - xcov ω (fun t => 1 * sin (ω * (t - d₁))) (fun t => 1 * sin (ω * (t - d₃))) (d₂ - d₁)
    ```

  - Means: For ω > 0 and 0 < |d₂ - d₃| < 2π/ω, the covariance contrast (infant-mom minus infant-control) for three unit sinusoids with delays d₁, d₂, d₃ is strictly positive at lag d₂ - d₁.
  - Closest known: Timing confounds in correlation-difference contrasts (general; no specific citation).
  - In Mathlib: no
  - Caveat: Pure sinusoids with no bond in the model by construction.
- **`Wyrd.Limits.room_cancels_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Direction.lean:187` · new-session branch only
  - Lean: 

    ```lean
    {ω : ℝ} (hω : 0 < ω) (d₁ d₂ d₃ : ℝ) : (∀ h : ℝ, xcov ω (fun t => 1 * sin (ω * (t - d₁))) (fun t => 1 * sin (ω * (t - d₂))) h - xcov ω (fun t => 1 * sin (ω * (t - d₁))) (fun t => 1 * sin (ω * (t - d₃))) h = 0) ↔ ∃ k : ℤ, ω * (d₂ - d₃) = 2 * π * k
    ```

  - Means: For ω > 0, the covariance contrast vanishes at every lag exactly when ω(d₂ - d₃) is an integer multiple of 2π.
  - Closest known: Periodicity of cosine (Real.cos_eq_one_iff).
  - In Mathlib: partial: Real.cos_eq_one_iff, Real.cos_add_int_mul_two_pi
  - Caveat: Pure sinusoids.
- **`Wyrd.Limits.alike_explains_any_one_condition`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Mixture.lean:62` · new-session branch only
  - Lean: `(r p q : ℝ) (c : Cond) : resp (resp r p q c) 0 0 c = resp r p q c`
  - Means: For any r, p, q and condition c, setting the alike part to the observed response and p = q = 0 reproduces the response in c.
  - Closest known: One equation cannot identify three unknowns.
  - In Mathlib: no
  - Caveat: Tautological: r is chosen to be the observed value.
- **`Wyrd.Limits.two_conditions_never_enough`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Mixture.lean:68` · new-session branch only
  - Lean: `(c₁ c₂ : Cond) : ∃ r p q : ℝ, (r, p, q) ≠ (0, 0, 0) ∧ resp r p q c₁ = 0 ∧ resp r p q c₂ = 0`
  - Means: For any two conditions (real perceived and contact values), some nonzero (r, p, q) gives zero additive response in both.
  - Closest known: Rank-nullity: two homogeneous linear equations in three unknowns have a nonzero solution.
  - In Mathlib: partial: LinearMap.finrank_range_add_finrank_ker (rank-nullity); here an explicit kernel vector is given
  - Caveat: Cond fields are arbitrary reals, not restricted to {0, 1}. The additive model is an assumption.
- **`Wyrd.Limits.additive_recover`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Mixture.lean:90` · new-session branch only
  - Lean: 

    ```lean
    (r p q : ℝ) : p = resp r p q skinAwake - resp r p q skinAsleep ∧ q = resp r p q skinAwake - resp r p q bedsideAwake ∧ r = resp r p q bedsideAwake + resp r p q skinAsleep - resp r p q skinAwake
    ```

  - Means: In the additive model, p, q and r are explicit differences of the responses at the conditions (1,0), (1,1) and (0,1).
  - Closest known: Contrasts in a factorial design.
  - In Mathlib: no
  - Caveat: Noise-free and additive by assumption.
- **`Wyrd.Limits.additive_identified`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Mixture.lean:98` · new-session branch only
  - Lean: 

    ```lean
    {r p q r' p' q' : ℝ} (h₁ : resp r p q bedsideAwake = resp r' p' q' bedsideAwake) (h₂ : resp r p q skinAwake = resp r' p' q' skinAwake) (h₃ : resp r p q skinAsleep = resp r' p' q' skinAsleep) : r = r' ∧ p = p' ∧ q = q'
    ```

  - Means: If two additive parameter triples give equal responses at (1,0), (1,1) and (0,1), the triples are equal.
  - Closest known: Identifiability (injectivity) of a linear model on a full-rank design.
  - In Mathlib: no
  - Caveat: Noise-free and additive by assumption.
- **`Wyrd.Limits.three_conditions_miss_interaction`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Mixture.lean:108` · new-session branch only
  - Lean: 

    ```lean
    : respI 1 (-1) (-1) 1 bedsideAwake = respI 0 0 0 0 bedsideAwake ∧ respI 1 (-1) (-1) 1 skinAwake = respI 0 0 0 0 skinAwake ∧ respI 1 (-1) (-1) 1 skinAsleep = respI 0 0 0 0 skinAsleep ∧ respI 1 (-1) (-1) 1 apart ≠ respI 0 0 0 0 apart
    ```

  - Means: With an interaction term, parameters (1, -1, -1, 1) and (0, 0, 0, 0) agree at (1,0), (1,1) and (0,1) but differ at (0,0).
  - Closest known: Aliasing in incomplete factorial designs.
  - In Mathlib: no
  - Caveat: An explicit counterexample checked by norm_num.
- **`Wyrd.Limits.four_conditions_identify_interaction`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Mixture.lean:117` · new-session branch only
  - Lean: 

    ```lean
    {r p q i r' p' q' i' : ℝ} (h₁ : respI r p q i bedsideAwake = respI r' p' q' i' bedsideAwake) (h₂ : respI r p q i skinAwake = respI r' p' q' i' skinAwake) (h₃ : respI r p q i skinAsleep = respI r' p' q' i' skinAsleep) (h₄ : respI r p q i apart = respI r' p' q' i' apart) : r = r' ∧ p = p' ∧ q = q' ∧ i = i'
    ```

  - Means: Equal interaction-model responses at all four 2×2 conditions force equal (r, p, q, i).
  - Closest known: A full 2×2 factorial design identifies the mean, both main effects and the interaction (Fisher 1935, The Design of Experiments).
  - In Mathlib: no
  - Caveat: Noise-free, and the interaction model is assumed.
- **`Wyrd.Limits.mom_untouched_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Objective.lean:39` · new-session branch only
  - Lean: `{g : ℝ} {x y z : ℝ → ℝ} (hs : LinSol g x y z) (hx0 : x 0 = 1) (hy0 : y 0 = 0) : (∀ t, 0 ≤ t → y t = 0) ↔ g = 0`
  - Means: If x, y, z : ℝ → ℝ are everywhere-differentiable solutions of the zero-delay linear system with coupling g and x(0) = 1, y(0) = 0, then y(t) = 0 for all t ≥ 0 exactly when g = 0.
  - Closest known: Uniqueness of solutions of linear ODEs (integrating factor; Picard-Lindelöf).
  - In Mathlib: partial: is_const_of_deriv_eq_zero and UniqueDiffWithinAt.eq_deriv with uniqueDiffWithinAt_Ici (used). ODE_solution_unique is not used.
  - Caveat: Solutions are assumed through LinSol; their existence is not constructed here, though it holds for linear systems. The forward direction only uses y'(0) = g/10.
- **`Wyrd.Limits.infant_best_moves_mom`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Objective.lean:70` · new-session branch only
  - Lean: 

    ```lean
    {s₀ : ℝ} (hs₀ : s₀ ∈ Set.Ioo (-(1 / 20 : ℝ)) (-(1 / 30))) (hH : H (1 / 30) (1 / 20) (1 / 4) (1 / 250) (3 / 40) s₀ = 0) {x y z : ℝ → ℝ} (hs : LinSol (G (1 / 20) (1 / 4) (1 / 250) (3 / 40) s₀) x y z) (hx0 : x 0 = 1) (hy0 : y 0 = 0) : ∃ t, 0 ≤ t ∧ y t ≠ 0
    ```

  - Means: If s₀ ∈ (-1/20, -1/30) is a root of the project's H for the model coefficients, then every LinSol solution with coupling G(s₀) and x(0) = 1, y(0) = 0 has y(t) ≠ 0 for some t ≥ 0.
  - Closest known: Combination of SharedAir.optimal_coupling (G(s₀) > 0) with mom_untouched_iff; no external result.
  - In Mathlib: no
  - Caveat: The optimality hypothesis hH carries no weight. G(1/20, 1/4, 1/250, 3/40, s₀) = 9.375·(s₀ + 1/20)/(s₀ + 1/4) is positive for every s₀ ∈ (−1/20, −1/30), and SharedAir.optimal_coupling itself proves 0 < G by positivity from hs₀ alone. So the conclusion holds for every s₀ in the interval, optimal or not, and the real content is mom_untouched_iff: any nonzero coupling moves mom. 'Optimal' refers to the zero-delay spectral rate. Solutions are assumed through LinSol, not constructed. The hypotheses are satisfiable (SharedAir.exists_optimum).
- **`Wyrd.Limits.lockIndex_eq_one`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:142` · new-session branch only
  - Lean: `{k n m : ℕ} (hn : 0 < n) (h : n ∣ k) (ψ₀ : ℝ) : lockIndex k n m ψ₀ = 1`
  - Means: For n > 0 with n ∣ k, any m and any ψ₀, the k-th harmonic index of the perfect n:m phase sequence ψ₀ + 2π m j/n (j < n) equals 1.
  - Closest known: Band structure of the synchrogram under n:m locking (Schäfer, Rosenblum, Kurths & Abel 1998, Nature 392:239; Schäfer et al. 1999, Phys Rev E 60:857); roots-of-unity orthogonality.
  - In Mathlib: partial: Complex.exp_nat_mul_two_pi_mul_I, Complex.norm_exp_ofReal_mul_I
  - Caveat: An idealised, noise-free lock whose phase sequence is fixed by definition.
- **`Wyrd.Limits.lockIndex_eq_zero`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:158` · new-session branch only
  - Lean: `{k n m : ℕ} (hn : 0 < n) (hcop : Nat.Coprime n m) (h : ¬ n ∣ k) (ψ₀ : ℝ) : lockIndex k n m ψ₀ = 0`
  - Means: For n > 0 coprime to m and n ∤ k, the k-th harmonic index of the perfect n:m phase sequence is 0.
  - Closest known: Discrete Fourier orthogonality of n-th roots of unity; synchrogram band counting (Schäfer et al. 1998).
  - In Mathlib: partial: IsPrimitiveRoot.geom_sum_eq_zero
  - Caveat: An idealised, noise-free lock.
- **`Wyrd.Limits.three_two_looks_like_three_one`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:166` · new-session branch only
  - Lean: `(k : ℕ) (ψ₀ : ℝ) : lockIndex k 3 2 ψ₀ = lockIndex k 3 1 ψ₀`
  - Means: For every harmonic k and ψ₀, the index of a perfect 3:2 lock equals that of a perfect 3:1 lock.
  - Closest known: Known in the synchrogram literature: phases wrapped modulo 2π show n bands, so the ratio needs wrapping modulo 2πm (Schäfer et al. 1998/1999).
  - In Mathlib: no
  - Caveat: An idealised lock.
- **`Wyrd.Limits.five_three_hidden`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:174` · new-session branch only
  - Lean: `(ψ₀ : ℝ) : lockIndex 2 5 3 ψ₀ = 0 ∧ lockIndex 3 5 3 ψ₀ = 0 ∧ lockIndex 5 5 3 ψ₀ = 1`
  - Means: For a perfect 5:3 lock, the 2nd- and 3rd-harmonic indices are 0 and the 5th is 1.
  - Closest known: Instance of lockIndex_eq_zero and lockIndex_eq_one.
  - In Mathlib: no
  - Caveat: An idealised lock.
- **`Wyrd.Limits.four_three_hidden`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:181` · new-session branch only
  - Lean: `(ψ₀ : ℝ) : lockIndex 2 4 3 ψ₀ = 0 ∧ lockIndex 3 4 3 ψ₀ = 0 ∧ lockIndex 4 4 3 ψ₀ = 1`
  - Means: For a perfect 4:3 lock, the 2nd- and 3rd-harmonic indices are 0 and the 4th is 1.
  - Closest known: Instance of lockIndex_eq_zero and lockIndex_eq_one.
  - In Mathlib: no
  - Caveat: An idealised lock.
- **`Wyrd.Limits.two_one_needs_second_harmonic`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:188` · new-session branch only
  - Lean: `(ψ₀ : ℝ) : lockIndex 1 2 1 ψ₀ = 0 ∧ lockIndex 2 2 1 ψ₀ = 1`
  - Means: For a perfect 2:1 lock, the first-harmonic index is 0 and the second is 1.
  - Closest known: Instance of lockIndex_eq_zero and lockIndex_eq_one. It restates the project's own SharedAir.two_to_one_moments (phases 0 and π: first moment 0, second moment 1) for an arbitrary starting phase ψ₀.
  - In Mathlib: no
  - Caveat: An idealised lock.
- **`Wyrd.Limits.model_forcing_misses_n_m`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Ratios.lean:246` · new-session branch only
  - Lean: `{n m : ℕ} (hm : 1 < m) (hcop : Nat.Coprime n m) (c a b : ℝ) : ∫ s in (0 : ℝ)..2 * π, Real.sin (n * s + a) * (Real.exp (2 * (Real.cos (m * s + b) - 1)) - c) = 0`
  - Means: For coprime naturals n, m with m > 1 and any real c, a, b, the integral over [0, 2π] of sin(ns + a)·(exp(2(cos(ms + b) - 1)) - c) is 0.
  - Closest known: Instance of resonant_average_vanishes with the model's pulse shape.
  - In Mathlib: no
  - Caveat: A first-order average only. Whether locking occurs is not proved.
- **`Wyrd.Limits.resting_rate_not_identifiable`** · `experiments/wyrd-mathlib/WyrdMathlib/Limits/Values.lean:95` · new-session branch only
  - Lean: 

    ```lean
    {ω V₀ : ℝ} (hω : 0 < ω) (hV : 0 < V₀) (hV' : V₀ < 2.5) : ∃ ω' V₀' : ℝ, (ω', V₀') ≠ (ω, V₀) ∧ 0 < ω' ∧ 0 < V₀' ∧ V₀' < 2.5 ∧ ω' * (1 + 0.25 * 0.1) * (1 - 0.4 * V₀') = ω * (1 + 0.25 * 0.1) * (1 - 0.4 * V₀)
    ```

  - Means: For ω > 0 and 0 < V₀ < 2.5, there is a different admissible pair (ω', V₀') with ω' > 0 and 0 < V₀' < 2.5 that gives the same resting rate ω(1 + 0.025)(1 - 0.4V₀).
  - Closest known: Structural non-identifiability (Bellman & Åström 1970, Math Biosci 7:329).
  - In Mathlib: no
  - Caveat: Trivial non-injectivity of a product of two unknown factors in the project's formula.

#### Periodic Navier–Stokes I: the phase family, symmetries, selection rules, averages

- **`Wyrd.PeriodicNS.div_v`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:31` · new-session branch only
  - Lean: `(x y z : ℝ) : v.div x y z = 0`
  - Means: The explicit field v = (sin y, sin z, cos x − cos(x + y)) on ℝ³ has divergence zero at every point, where the divergence is built from Lean's deriv taken one coordinate at a time.
  - Closest known: Standard fact: a sum of transverse plane waves (amplitude vector perpendicular to wave vector) is solenoidal. Equivalently here, each component u_i does not depend on x_i. v = sin y e1 + sin z e2 + (cos x − cos(x+y)) e3 is a superposition of four single-mode shear waves, each divergence-free on its own. v is not an ABC/Beltrami flow (cf. Dombre et al. 1986, J. Fluid Mech. 167, 353) and not a steady Euler solution.
  - In Mathlib: no (searched: Navier, Stokes, curl, divergence, vorticity, enstrophy, incompressible, Beltrami, vortex)
  - Caveat: A pointwise identity for one explicit field. Every partial derivative is the deriv of a constant. It is also the φ = 0 case of div_vphi (via vphi_zero), proved separately.
- **`Wyrd.PeriodicNS.curl_v`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:36` · new-session branch only
  - Lean: `: v.curl.u1 = (fun x y z => sin (x + y) - cos z) ∧ v.curl.u2 = (fun x y _ => sin x - sin (x + y)) ∧ v.curl.u3 = (fun _ y _ => -cos y)`
  - Means: The curl (vorticity) of v, as functions on ℝ³, is (sin(x+y) − cos z, sin x − sin(x+y), −cos y).
  - Closest known: Hand calculus. There is no published source for this particular field.
  - In Mathlib: no (searched: curl, vorticity)
  - Caveat: Routine computation about a project field. It duplicates the φ = 0 case of the private PhaseFamily_curl (via vphi_zero).
- **`Wyrd.PeriodicNS.grad_v`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:49` · new-session branch only
  - Lean: 

    ```lean
    : dx v.u1 = (fun _ _ _ => 0) ∧ dy v.u1 = (fun _ y _ => cos y) ∧ dz v.u1 = (fun _ _ _ => 0) ∧ dx v.u2 = (fun _ _ _ => 0) ∧ dy v.u2 = (fun _ _ _ => 0) ∧ dz v.u2 = (fun _ _ z => cos z) ∧ dx v.u3 = (fun x y _ => -sin x + sin (x + y)) ∧ dy v.u3 = (fun x y _ => sin (x + y)) ∧ dz v.u3 = (fun _ _ _ => 0)
    ```

  - Means: Lists all nine partial derivatives ∂_j v_i on ℝ³. The nonzero ones are ∂y v1 = cos y, ∂z v2 = cos z, ∂x v3 = −sin x + sin(x+y) and ∂y v3 = sin(x+y).
  - Closest known: Hand calculus.
  - In Mathlib: no (searched: curl, divergence, Navier)
  - Caveat: Routine computation. It duplicates the φ = 0 case of the private PhaseFamily_grad.
- **`Wyrd.PeriodicNS.grad_curl_v`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:59` · new-session branch only
  - Lean: 

    ```lean
    : dx v.curl.u1 = (fun x y _ => cos (x + y)) ∧ dy v.curl.u1 = (fun x y _ => cos (x + y)) ∧ dz v.curl.u1 = (fun _ _ z => sin z) ∧ dx v.curl.u2 = (fun x y _ => cos x - cos (x + y)) ∧ dy v.curl.u2 = (fun x y _ => -cos (x + y)) ∧ dz v.curl.u2 = (fun _ _ _ => 0) ∧ dx v.curl.u3 = (fun _ _ _ => 0) ∧ dy v.curl.u3 = (fun _ y _ => sin y) ∧ dz v.curl.u3 = (fun _ _ _ => 0)
    ```

  - Means: Lists all nine partial derivatives of the vorticity of v as explicit trigonometric functions on ℝ³.
  - Closest known: Hand calculus.
  - In Mathlib: no (searched: curl, vorticity)
  - Caveat: Routine computation. It duplicates the φ = 0 case of the private PhaseFamily_grad_curl.
- **`Wyrd.PeriodicNS.v_smooth`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:73` · new-session branch only
  - Lean: `: ContDiff ℝ ⊤ (fun p : ℝ × ℝ × ℝ => (v.u1 p.1 p.2.1 p.2.2, v.u2 p.1 p.2.1 p.2.2, v.u3 p.1 p.2.1 p.2.2))`
  - Means: The map ℝ³ → ℝ³ given by v is ContDiff ℝ ⊤. In this Mathlib the exponent type is WithTop ℕ∞ and ⊤ = ω, so the statement is real-analyticity, which is stronger than the docstring's 'smooth'.
  - Closest known: Trigonometric polynomials are entire or analytic.
  - In Mathlib: partial: closed by fun_prop from Real.contDiff_sin/cos-type lemmas; contDiff_omega_iff_analyticOnNhd shows that ⊤ means analytic
  - Caveat: Routine. The Lean statement (C^ω) is stronger than the prose (smooth), so this is an underclaim, not a gap.
- **`Wyrd.PeriodicNS.v_periodic`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:79` · new-session branch only
  - Lean: 

    ```lean
    (x y z : ℝ) : v.u1 (x + 2 * π) y z = v.u1 x y z ∧ v.u1 x (y + 2 * π) z = v.u1 x y z ∧ v.u1 x y (z + 2 * π) = v.u1 x y z ∧ v.u2 (x + 2 * π) y z = v.u2 x y z ∧ v.u2 x (y + 2 * π) z = v.u2 x y z ∧ v.u2 x y (z + 2 * π) = v.u2 x y z ∧ v.u3 (x + 2 * π) y z = v.u3 x y z ∧ v.u3 x (y + 2 * π) z = v.u3 x y z ∧ v.u3 x y (z + 2 * π) = v.u3 x y z
    ```

  - Means: Each of the three components of v is 2π-periodic in each of x, y and z (nine identities on ℝ³).
  - Closest known: 2π-periodicity of sin and cos (Real.sin_add_two_pi, Real.cos_add_two_pi).
  - In Mathlib: partial: Real.sin_add_two_pi, Real.cos_add_two_pi
  - Caveat: Routine.
- **`Wyrd.PeriodicNS.quantities_v`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:192` · new-session branch only
  - Lean: `: v.energy = 1 ∧ v.enstrophy = 5 / 4 ∧ v.palin = 7 / 2 ∧ v.stretching = 1 / 4 ∧ v.gradSq = 5 / 2`
  - Means: For v = (sin y, sin z, cos x − cos(x+y)), the normalised integrals over [0,2π]³ give E = ½⟨|v|²⟩ = 1, Z = ½⟨|ω|²⟩ = 5/4, D = ⟨|∇ω|²⟩ = 7/2, S = ⟨Σ ω_i ∂_j v_i ω_j⟩ = 1/4 and ⟨|∇v|²⟩ = 5/2.
  - Closest known: A routine Parseval-type computation. Comparable closed-form initial values are standard for the Taylor–Green vortex (Brachet et al. 1983, J. Fluid Mech. 130, 411). ⟨|∇v|²⟩ = 2Z is the classical identity for divergence-free periodic fields, checked here only for v.
  - In Mathlib: no (searched: enstrophy, vorticity, Navier, Stokes, incompressible)
  - Caveat: Static functionals of one fixed field at t = 0. No Navier–Stokes evolution is involved. The E, Z, D and S conjuncts are exactly the φ = 0 case of quantities_vphi (via vphi_zero and cos 0 = 1). Only ⟨|∇v|²⟩ = 5/2 is not covered there. The two were proved independently with duplicated helper machinery. Reading S − νD as dZ/dt(0) needs the enstrophy balance, which is not formalised.
- **`Wyrd.PeriodicNS.vphi_zero`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:37` · new-session branch only
  - Lean: `: vphi 0 = v`
  - Means: The phase-family member at φ = 0, (sin y, sin z, cos x − cos(x+y+0)), is the field v.
  - Closest known: Immediate from add_zero (x + y + 0 = x + y). Proved by simp. Not a kernel-definitional equality for ℝ.
  - In Mathlib: no (project definitions)
  - Caveat: Definitional check.
- **`Wyrd.PeriodicNS.div_vphi`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:40` · new-session branch only
  - Lean: `(φ x y z : ℝ) : (vphi φ).div x y z = 0`
  - Means: For every real φ, u_φ = (sin y, sin z, cos x − cos(x+y+φ)) has divergence zero at every point of ℝ³.
  - Closest known: A sum of transverse plane waves (equivalently, u_i independent of x_i) is solenoidal. u_φ is a superposition of four single-mode shear waves. It is neither Beltrami/ABC nor a steady Euler solution for any φ checked.
  - In Mathlib: no (searched: divergence, Navier, incompressible)
  - Caveat: Routine.
- **`Wyrd.PeriodicNS.PhaseFamily_curl (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:56` · new-session branch only
  - Lean: 

    ```lean
    (φ : ℝ) : (vphi φ).curl.u1 = (fun x y z => sin (x + y + φ) - cos z) ∧ (vphi φ).curl.u2 = (fun x y _ => sin x - sin (x + y + φ)) ∧ (vphi φ).curl.u3 = (fun _ y _ => -cos y)
    ```

  - Means: For every φ, the vorticity of u_φ is (sin(x+y+φ) − cos z, sin x − sin(x+y+φ), −cos y).
  - Closest known: Hand calculus.
  - In Mathlib: no (searched: curl, vorticity)
  - Caveat: Private routine computation.
- **`Wyrd.PeriodicNS.PhaseFamily_grad (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:67` · new-session branch only
  - Lean: 

    ```lean
    (φ : ℝ) : dx (vphi φ).u1 = (fun _ _ _ => 0) ∧ dy (vphi φ).u1 = (fun _ y _ => cos y) ∧ dz (vphi φ).u1 = (fun _ _ _ => 0) ∧ dx (vphi φ).u2 = (fun _ _ _ => 0) ∧ dy (vphi φ).u2 = (fun _ _ _ => 0) ∧ dz (vphi φ).u2 = (fun _ _ z => cos z) ∧ dx (vphi φ).u3 = (fun x y _ => -sin x + sin (x + y + φ)) ∧ dy (vphi φ).u3 = (fun x y _ => sin (x + y + φ)) ∧ dz (vphi φ).u3 = (fun _ _ _ => 0)
    ```

  - Means: For every φ, lists the nine velocity-gradient entries of u_φ as explicit functions on ℝ³.
  - Closest known: Hand calculus.
  - In Mathlib: no (project definitions)
  - Caveat: Private routine computation.
- **`Wyrd.PeriodicNS.PhaseFamily_grad_curl (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:79` · new-session branch only
  - Lean: 

    ```lean
    (φ : ℝ) : dx (vphi φ).curl.u1 = (fun x y _ => cos (x + y + φ)) ∧ dy (vphi φ).curl.u1 = (fun x y _ => cos (x + y + φ)) ∧ dz (vphi φ).curl.u1 = (fun _ _ z => sin z) ∧ dx (vphi φ).curl.u2 = (fun x y _ => cos x - cos (x + y + φ)) ∧ dy (vphi φ).curl.u2 = (fun x y _ => -cos (x + y + φ)) ∧ dz (vphi φ).curl.u2 = (fun _ _ _ => 0) ∧ dx (vphi φ).curl.u3 = (fun _ _ _ => 0) ∧ dy (vphi φ).curl.u3 = (fun _ y _ => sin y) ∧ dz (vphi φ).curl.u3 = (fun _ _ _ => 0)
    ```

  - Means: For every φ, lists the nine partial derivatives of the vorticity of u_φ.
  - Closest known: Hand calculus.
  - In Mathlib: no (project definitions)
  - Caveat: Private routine computation.
- **`Wyrd.PeriodicNS.quantities_vphi`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:271` · new-session branch only
  - Lean: `(φ : ℝ) : (vphi φ).energy = 1 ∧ (vphi φ).enstrophy = 5 / 4 ∧ (vphi φ).palin = 7 / 2 ∧ (vphi φ).stretching = cos φ / 4`
  - Means: For every real φ, the field u_φ = (sin y, sin z, cos x − cos(x+y+φ)) has E = 1, Z = 5/4 and D = ⟨|∇ω|²⟩ = 7/2, independent of φ, and vortex stretching S = cos φ / 4 (genuine averages over [0,2π]³).
  - Closest known: It is a known principle that quadratic averages such as E, Z and D see only Fourier magnitudes (Parseval), while cubic averages such as energy transfer and stretching depend on triad phases. Here (1,0,0)+(0,1,0) = (1,1,0) is the only triad. See the triad-interaction literature: Waleffe 1992, Phys. Fluids A 4, 350; Moffatt 2014, J. Fluid Mech. 741, R3; and triad-phase studies such as arXiv:2105.09425. The exact value is a routine computation.
  - In Mathlib: no (searched: enstrophy, vorticity, Navier, Stokes, vortex)
  - Caveat: Static t = 0 functionals of a given field, not of a Navier–Stokes solution. 'palin' is D without the factor ½. The README's companion claim that Fourier magnitudes do not depend on φ is not formalised for u_φ.
- **`Wyrd.PeriodicNS.PhaseFamily_curl_smul (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:372` · new-session branch only
  - Lean: `(A : ℝ) (u : Field) : (u.smul A).curl = u.curl.smul A`
  - Means: For any field u and real A, curl(A u) = A curl u.
  - Closest known: Linearity of the curl.
  - In Mathlib: no (Mathlib has no curl; searched: curl)
  - Caveat: Routine linearity of a project definition.
- **`Wyrd.PeriodicNS.PhaseFamily_energy_smul (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:386` · new-session branch only
  - Lean: `(A : ℝ) (u : Field) : (u.smul A).energy = A ^ 2 * u.energy`
  - Means: For any field u and real A, E(A u) = A² E(u).
  - Closest known: Quadratic homogeneity of the energy.
  - In Mathlib: no (project definitions)
  - Caveat: Routine.
- **`Wyrd.PeriodicNS.PhaseFamily_gradSq_smul (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:394` · new-session branch only
  - Lean: `(A : ℝ) (u : Field) : (u.smul A).gradSq = A ^ 2 * u.gradSq`
  - Means: For any field u and real A, ⟨|∇(A u)|²⟩ = A² ⟨|∇u|²⟩.
  - Closest known: Quadratic homogeneity.
  - In Mathlib: no (project definitions)
  - Caveat: Routine.
- **`Wyrd.PeriodicNS.PhaseFamily_stretching_smul (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:405` · new-session branch only
  - Lean: `(A : ℝ) (u : Field) : (u.smul A).stretching = A ^ 3 * u.stretching`
  - Means: For any field u and real A, the stretching functional is cubic: S(A u) = A³ S(u).
  - Closest known: Cubic homogeneity of the vortex-stretching term, standard in enstrophy estimates (e.g. Doering & Gibbon 1995, Applied Analysis of the Navier–Stokes Equations).
  - In Mathlib: no (project definitions)
  - Caveat: Routine.
- **`Wyrd.PeriodicNS.quantities_vphi_smul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:420` · new-session branch only
  - Lean: 

    ```lean
    (A φ : ℝ) : ((vphi φ).smul A).energy = A ^ 2 ∧ ((vphi φ).smul A).enstrophy = 5 * A ^ 2 / 4 ∧ ((vphi φ).smul A).palin = 7 * A ^ 2 / 2 ∧ ((vphi φ).smul A).stretching = A ^ 3 * cos φ / 4
    ```

  - Means: For all real A and φ, the scaled field A·u_φ has E = A², Z = 5A²/4, D = 7A²/2 and S = A³ cos φ / 4.
  - Closest known: quantities_vphi combined with the homogeneity degrees 2, 2, 2 and 3.
  - In Mathlib: no (project definitions)
  - Caveat: Static t = 0 functionals.
- **`Wyrd.PeriodicNS.growth_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:432` · new-session branch only
  - Lean: `{A ν φ : ℝ} (hA : 0 < A) : 0 < ((vphi φ).smul A).stretching - ν * ((vphi φ).smul A).palin ↔ 14 * ν / A < cos φ`
  - Means: For real A > 0 and any real ν and φ, the expression S − νD for A·u_φ is positive exactly when cos φ > 14ν/A.
  - Closest known: The right-hand side of the enstrophy balance dZ/dt = S − νD, and the study of its extremes over fields of given enstrophy (Lu & Doering 2008, Indiana Univ. Math. J. 57, 2693; Ayala & Protas 2017, J. Fluid Mech.). The statement itself is algebra on top of quantities_vphi_smul.
  - In Mathlib: no (project definitions)
  - Caveat: The statement concerns only the static expression S − νD. Calling it 'growth' (dZ/dt > 0 at t = 0) depends on the enstrophy balance, which is not formalised. ν need not be positive.
- **`Wyrd.PeriodicNS.zero_growth_at_pi_div_three`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:440` · new-session branch only
  - Lean: `: ((vphi (π / 3)).smul 1).stretching - 1 / 28 * ((vphi (π / 3)).smul 1).palin = 0`
  - Means: For u_{π/3} at amplitude 1, S − (1/28)·D = cos(π/3)/4 − (1/28)(7/2) = 0.
  - Closest known: A numeric instance of growth_iff's boundary case, using Real.cos_pi_div_three.
  - In Mathlib: no (project definitions)
  - Caveat: A numeric instance. The README's reading 'zero initial growth' (dZ/dt(0) = 0) relies on the enstrophy balance, which is not formalised.
- **`Wyrd.PeriodicNS.neg_v_translate`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseFamily.lean:446` · new-session branch only
  - Lean: 

    ```lean
    (x y z : ℝ) : (v.smul (-1)).u1 x y z = (vphi π).u1 (x + π) (y + π) (z + π) ∧ (v.smul (-1)).u2 x y z = (vphi π).u2 (x + π) (y + π) (z + π) ∧ (v.smul (-1)).u3 x y z = (vphi π).u3 (x + π) (y + π) (z + π)
    ```

  - Means: At every point of ℝ³, −v(x,y,z) = u_π(x+π, y+π, z+π) componentwise, so −v is a spatial translate of u_π.
  - Closest known: sin(t+π) = −sin t and cos(t+π) = −cos t. NS on the torus is translation invariant (Frisch 1995, Turbulence, ch. 2; Majda & Bertozzi 2002, Vorticity and Incompressible Flow).
  - In Mathlib: partial: Real.sin_add_pi, Real.cos_add_pi, Real.cos_add_two_pi
  - Caveat: A pointwise identity between two fields. It is not formalised that their Navier–Stokes evolutions coincide up to translation.
- **`Wyrd.PeriodicNS.rotShift_vphi`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseSymmetry.lean:35` · new-session branch only
  - Lean: `(φ : ℝ) : rotShift (vphi φ) = vphi (-φ)`
  - Means: For every real φ, the map u ↦ R u(R x + b), with R = diag(−1,−1,1) (rotation by π about z) and b = (0,0,π), sends u_φ exactly to u_{−φ}.
  - Closest known: Elementary identities sin(−y) = −sin y, sin(z+π) = −sin z and the evenness of cos. The new-session context, equivariance of NS on the torus under rotations and translations (Majda & Bertozzi 2002; Frisch 1995 §2.2; discrete symmetries as used for Taylor–Green by Brachet et al. 1983, J. Fluid Mech. 130, 411), is neither used nor proved.
  - In Mathlib: partial: the proof is pure rewriting with Real.sin_neg, Real.sin_add_pi and Real.cos_neg. Mathlib has nothing on NS equivariance (searched: Navier, curl, vorticity).
  - Caveat: An identity between fields only. That NS commutes with rotShift, and the consequence Z(T,φ) = Z(T,−φ), are not formalised.
- **`Wyrd.PeriodicNS.mirror_fixes_vphi`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseSymmetry.lean:42` · new-session branch only
  - Lean: `(φ : ℝ) : mirror (vphi φ) = vphi φ`
  - Means: For every real φ, the map u ↦ diag(1,1,−1)·u(x+π, y, −z−π) leaves u_φ unchanged.
  - Closest known: O(3)-plus-translation equivariance of NS. This is a symmetry of the specific field.
  - In Mathlib: partial: the proof rewrites with Real.sin_neg, Real.sin_add_pi and Real.cos_add_pi. No NS content.
  - Caveat: An identity between fields only.
- **`Wyrd.PeriodicNS.quantities_even`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/PhaseSymmetry.lean:50` · new-session branch only
  - Lean: 

    ```lean
    (φ : ℝ) : (vphi (-φ)).energy = (vphi φ).energy ∧ (vphi (-φ)).enstrophy = (vphi φ).enstrophy ∧ (vphi (-φ)).palin = (vphi φ).palin ∧ (vphi (-φ)).stretching = (vphi φ).stretching
    ```

  - Means: For every real φ, E, Z, D and S take the same values at φ and −φ.
  - Closest known: An immediate corollary of quantities_vphi and cos(−φ) = cos φ.
  - In Mathlib: partial: Real.cos_neg
  - Caveat: Trivial corollary. It does not use rotShift_vphi, and it says nothing about times t > 0.
- **`Wyrd.PeriodicNS.deg_ge_of_beta`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SelectionRules.lean:74` · new-session branch only
  - Lean: `{c : Counts} (h : c.Balanced) (hb : 0 < c.bp + c.bm) : 3 * c.harm.natAbs + 2 ≤ c.deg`
  - Means: For eight natural numbers (ap, am, bp, bm, gp, gm, dp, dm) satisfying gp−gm+dp−dm = 0, ap−am+dp−dm = 0 and bp = bm, with bp+bm > 0, the total count is at least 3|dp − dm| + 2.
  - Closest known: Wave-vector conservation (triad selection rules) in Fourier expansions of quadratic nonlinearities. Time-Taylor-series analyses of trigonometric initial data go back to Taylor & Green 1937 (Proc. R. Soc. Lond. A 158, 499) and were carried to high order by Morf, Orszag & Frisch 1980 (Phys. Rev. Lett. 44, 572) and Brachet et al. 1983. I found no published source for this counting rule for this four-mode family.
  - In Mathlib: no (pure linear integer arithmetic about the project structure Counts, closed by omega)
  - Caveat: Arithmetic only. The link between Counts and the Taylor coefficients of Z, and hypothesis hb, which encodes the unformalised 2D-3C fact P1, carry all the PDE content.
- **`Wyrd.PeriodicNS.deg_parity`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SelectionRules.lean:80` · new-session branch only
  - Lean: `{c : Counts} (h : c.Balanced) : ((c.deg : ℤ) - c.harm) % 2 = 0`
  - Means: For balanced counts, the total count deg minus the harmonic m = dp − dm is even.
  - Closest known: Parity bookkeeping (a+b ≡ a−b mod 2).
  - In Mathlib: no (omega arithmetic on project structure)
  - Caveat: Arithmetic only.
- **`Wyrd.PeriodicNS.not_before`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SelectionRules.lean:85` · new-session branch only
  - Lean: `{c : Counts} {n e : ℕ} (h : c.Balanced) (hb : 0 < c.bp + c.bm) (hg : c.deg + e = n + 2) : 3 * c.harm.natAbs ≤ n`
  - Means: If the counts are balanced, contain a β factor, and satisfy deg + e = n + 2 for naturals n and e, then n ≥ 3|m|.
  - Closest known: See deg_ge_of_beta. The time-Taylor order bookkeeping is in the spirit of Morf–Orszag–Frisch 1980.
  - In Mathlib: no (omega arithmetic)
  - Caveat: The grading hg and the β hypothesis hb are assumed. The README's statement that 'a cos mφ term cannot appear before t^{3|m|}' needs P1 and the monomial structure of [tⁿ]Z, and neither is in Lean.
- **`Wyrd.PeriodicNS.at_first_order`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SelectionRules.lean:90` · new-session branch only
  - Lean: 

    ```lean
    {c : Counts} {n e : ℕ} (h : c.Balanced) (hb : 0 < c.bp + c.bm) (hg : c.deg + e = n + 2) (hn : n = 3 * c.harm.natAbs) : e = 0 ∧ c.bp = 1 ∧ c.bm = 1 ∧ c.ap + c.am = c.harm.natAbs ∧ c.gp + c.gm = c.harm.natAbs ∧ c.dp + c.dm = c.harm.natAbs
    ```

  - Means: For eight naturals with the per-axis balance, at least one β count, deg + e = n + 2 and n = 3|m| (m = dp − dm), necessarily e = 0, bp = bm = 1 and ap+am = gp+gm = dp+dm = |m|. Read as factor counts, this is the unsigned monomial α^|m| β² γ^|m| δ^|m|. Lean does not connect Counts to any Taylor coefficient of Z.
  - Closest known: See deg_ge_of_beta.
  - In Mathlib: no (omega arithmetic)
  - Caveat: Arithmetic only. The Lean does not need |m| ≥ 2, which the docstring mentions. That the coefficient at n = 3|m| is ν-free and nonzero is a claim about the PDE series and is not in Lean.
- **`Wyrd.PeriodicNS.order_seven_m_two`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SelectionRules.lean:99` · new-session branch only
  - Lean: `{c : Counts} {e : ℕ} (h : c.Balanced) (hb : 0 < c.bp + c.bm) (hm : c.harm.natAbs = 2) (hg : c.deg + e = 7 + 2) : e = 1 ∧ c.deg = 8`
  - Means: For balanced counts with a β factor, |m| = 2 and deg + e = 9, necessarily e = 1 and deg = 8.
  - Closest known: Parity plus the bound from deg_ge_of_beta.
  - In Mathlib: no (omega arithmetic)
  - Caveat: The claim that the cos 2φ coefficient of [t⁷]Z is proportional to ν and vanishes for Euler needs P1 and the monomial structure, which are not in Lean. The constant 207269/7257600 is computational only.
- **`Wyrd.PeriodicNS.euler_parity`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SelectionRules.lean:107` · new-session branch only
  - Lean: `{c : Counts} {n : ℕ} (h : c.Balanced) (hg : c.deg + 0 = n + 2) : ((n : ℤ) - c.harm) % 2 = 0`
  - Means: For balanced counts with ν-power e = 0, encoded as deg = n + 2, n − m is even.
  - Closest known: Parity bookkeeping. Analogous to time-reversal parity of Euler Taylor series.
  - In Mathlib: no (omega arithmetic)
  - Caveat: 'Euler' enters only through the hypothesis e = 0. The connection to the Euler Taylor series is not formalised.

#### Periodic Navier–Stokes II: scaling, blow-up rescalings, sign flip, Galerkin, Grönwall, quantifiers

- **`Wyrd.PeriodicNS.vScaled_one`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:42` · new-session branch only
  - Lean: `: vScaled 1 = v`
  - Means: The k = 1 member of the rescaled family, v_1 = (sin y, sin z, cos x − cos(x + y)), is literally the example field v.
  - Closest known: Nothing beyond definitional unfolding of the project's vScaled and v.
  - In Mathlib: no (searched: navier, vorticity, enstrophy; project definitions)
  - Caveat: Trivial, but not a definitional equality: simp has to rewrite ((1 : ℕ) : ℝ) * y to y (Nat.cast_one, one_mul) inside each component.
- **`Wyrd.PeriodicNS.div_vScaled`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:45` · new-session branch only
  - Lean: `(k : ℕ) (x y z : ℝ) : (vScaled k).div x y z = 0`
  - Means: For every k ∈ ℕ and every point of ℝ³, the divergence of v_k = (sin ky, sin kz, cos kx − cos(kx + ky)), computed with Lean's deriv one coordinate at a time, is 0.
  - Closest known: Elementary: each component does not depend on its own coordinate. This is the standard way to build divergence-free trigonometric fields (as in ABC-type flows).
  - In Mathlib: no (searched: navier, vorticity, curl, divergence)
  - Caveat: Smoothness and 2π-periodicity of v_k are not stated in Lean; the file says they are 'clear'.
- **`Wyrd.PeriodicNS.Scaling_curl`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:52` · new-session branch only
  - Lean: 

    ```lean
    (k : ℕ) : (vScaled k).curl.u1 = (fun x y z => k * sin (k * x + k * y) - k * cos (k * z)) ∧ (vScaled k).curl.u2 = (fun x y _ => k * sin (k * x) - k * sin (k * x + k * y)) ∧ (vScaled k).curl.u3 = (fun _ y _ => -(k * cos (k * y)))
    ```

  - Means: For each k ∈ ℕ, the vorticity of v_k is (k sin(kx+ky) − k cos kz, k sin kx − k sin(kx+ky), −k cos ky), as functions on ℝ³.
  - Closest known: Direct differentiation. The k = 1 case is curl_v in Example.lean.
  - In Mathlib: no (searched: curl, vorticity)
  - Caveat: A private helper and a symbolic derivative computation.
- **`Wyrd.PeriodicNS.Scaling_grad`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:60` · new-session branch only
  - Lean: 

    ```lean
    (k : ℕ) : dx (vScaled k).u1 = (fun _ _ _ => 0) ∧ dy (vScaled k).u1 = (fun _ y _ => k * cos (k * y)) ∧ dz (vScaled k).u1 = (fun _ _ _ => 0) ∧ dx (vScaled k).u2 = (fun _ _ _ => 0) ∧ dy (vScaled k).u2 = (fun _ _ _ => 0) ∧ dz (vScaled k).u2 = (fun _ _ z => k * cos (k * z)) ∧ dx (vScaled k).u3 = (fun x y _ => -(k * sin (k * x)) + k * sin (k * x + k * y)) ∧ dy (vScaled k).u3 = (fun x y _ => k * sin (k * x + k * y)) ∧ dz (vScaled k).u3 = (fun _ _ _ => 0)
    ```

  - Means: For each k ∈ ℕ, the nine velocity-gradient entries of v_k equal the stated trigonometric functions. Each carries one factor k, and five are identically 0.
  - Closest known: Direct differentiation. The k = 1 case is grad_v in Example.lean.
  - In Mathlib: no (searched: navier, vorticity)
  - Caveat: A private helper and a symbolic derivative computation.
- **`Wyrd.PeriodicNS.Scaling_grad_curl`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:72` · new-session branch only
  - Lean: 

    ```lean
    (k : ℕ) : dx (vScaled k).curl.u1 = (fun x y _ => k ^ 2 * cos (k * x + k * y)) ∧ dy (vScaled k).curl.u1 = (fun x y _ => k ^ 2 * cos (k * x + k * y)) ∧ dz (vScaled k).curl.u1 = (fun _ _ z => k ^ 2 * sin (k * z)) ∧ dx (vScaled k).curl.u2 = (fun x y _ => k ^ 2 * cos (k * x) - k ^ 2 * cos (k * x + k * y)) ∧ dy (vScaled k).curl.u2 = (fun x y _ => -(k ^ 2 * cos (k * x + k * y))) ∧ dz (vScaled k).curl.u2 = (fun _ _ _ => 0) ∧ dx (vScaled k).curl.u3 = (fun _ _ _ => 0) ∧ dy (vScaled k).curl.u3 = (fun _ y _ => k ^ 2 * sin (k * y)) ∧ dz (vScaled k).curl.u3 = (fun _ _ _ => 0)
    ```

  - Means: For each k ∈ ℕ, the nine partial derivatives of the vorticity components of v_k equal the stated trigonometric functions, each with a factor k².
  - Closest known: Direct differentiation. The k = 1 case is grad_curl_v in Example.lean.
  - In Mathlib: no (searched: curl, vorticity)
  - Caveat: A private helper and a symbolic derivative computation.
- **`Wyrd.PeriodicNS.Scaling_tm_cont`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:202` · new-session branch only
  - Lean: `(m : ℝ × ℝ × ℤ × ℤ × ℤ) : Continuous fun p : ℝ × ℝ × ℝ => Scaling_tm m p.1 p.2.1 p.2.2`
  - Means: Each encoded Fourier mode a cos(px+qy+rz) + b sin(px+qy+rz), with m = (a, b, p, q, r), is jointly continuous on ℝ³.
  - Closest known: Continuity of trigonometric functions.
  - In Mathlib: no (a fact about the file's private encoding; follows from fun_prop)
  - Caveat: A private helper about the file's own encoding of a mode as a tuple. It is a verbatim renamed copy of Averages_tm_cont (Averages.lean:129).
- **`Wyrd.PeriodicNS.Scaling_tp_cont`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:206` · new-session branch only
  - Lean: `(L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) : Continuous fun p : ℝ × ℝ × ℝ => Scaling_tp L p.1 p.2.1 p.2.2`
  - Means: A finite list of encoded modes, summed (a trigonometric polynomial), is jointly continuous on ℝ³.
  - Closest known: Continuity of finite sums of continuous functions.
  - In Mathlib: no (a fact about the private encoding)
  - Caveat: A private helper about the encoding. It is a verbatim renamed copy of Averages_tp_cont (Averages.lean:133).
- **`Wyrd.PeriodicNS.Scaling_I3_tm`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:214` · new-session branch only
  - Lean: `(m : ℝ × ℝ × ℤ × ℤ × ℤ) : Scaling_I3 (Scaling_tm m) = (2 * π) ^ 3 * (if m.2.2 = (0, 0, 0) then m.1 else 0)`
  - Means: The iterated integral over [0,2π]³ of one encoded mode (a, b, p, q, r) is (2π)³·a when (p,q,r) = 0 and 0 otherwise.
  - Closest known: Fourier orthogonality on the 3-torus.
  - In Mathlib: partial: UnitAddTorus.orthonormal_mFourier (different form)
  - Caveat: A private helper about the encoding; the mathematical content is classical orthogonality. It is a verbatim renamed copy of Averages_I3_tm (Averages.lean:141), so it adds nothing beyond the Averages group.
- **`Wyrd.PeriodicNS.Scaling_I3_tp`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:236` · new-session branch only
  - Lean: `(L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) : Scaling_I3 (Scaling_tp L) = (2 * π) ^ 3 * Scaling_c0 L`
  - Means: The iterated integral over [0,2π]³ of an encoded trigonometric polynomial is (2π)³ times its constant coefficient, the sum of the cosine amplitudes of its zero-frequency modes.
  - Closest known: The mean of a trigonometric polynomial on the torus is its zeroth Fourier coefficient.
  - In Mathlib: partial: UnitAddTorus.orthonormal_mFourier (different form)
  - Caveat: A private helper about the encoding. It is a verbatim renamed copy of Averages_I3_tp (Averages.lean:163).
- **`Wyrd.PeriodicNS.Scaling_avg_eq`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:250` · new-session branch only
  - Lean: `{f : ℝ → ℝ → ℝ → ℝ} (L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) (h : ∀ x y z, f x y z = Scaling_tp L x y z) : avg f = Scaling_c0 L`
  - Means: If f agrees everywhere on ℝ³ with an encoded trigonometric polynomial, then its normalised average over [0,2π]³ equals that polynomial's constant coefficient.
  - Closest known: Same as Scaling_I3_tp, divided by (2π)³.
  - In Mathlib: no (a fact about the private encoding and the project's avg)
  - Caveat: A private helper. It is a verbatim renamed copy of Averages_avg_eq (Averages.lean:177).
- **`Wyrd.PeriodicNS.Scaling_tm_sc`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:271` · new-session branch only
  - Lean: `(k : ℕ) (c : ℝ) (m : ℝ × ℝ × ℤ × ℤ × ℤ) (x y z : ℝ) : Scaling_tm (Scaling_sc k c m) x y z = c * Scaling_tm m (k * x) (k * y) (k * z)`
  - Means: Multiplying an encoded mode's amplitudes by c and its wave vector by k gives c times the original mode evaluated at (kx, ky, kz).
  - Closest known: An algebraic identity (ring).
  - In Mathlib: no (a fact about the private encoding)
  - Caveat: A private helper.
- **`Wyrd.PeriodicNS.Scaling_tp_sc`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:280` · new-session branch only
  - Lean: `(k : ℕ) (c : ℝ) (L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) (x y z : ℝ) : Scaling_tp (L.map (Scaling_sc k c)) x y z = c * Scaling_tp L (k * x) (k * y) (k * z)`
  - Means: The same rescaling identity holds for a whole encoded trigonometric polynomial (a list of modes).
  - Closest known: Induction on Scaling_tm_sc.
  - In Mathlib: no (a fact about the private encoding)
  - Caveat: A private helper.
- **`Wyrd.PeriodicNS.Scaling_c0_sc`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:290` · new-session branch only
  - Lean: `{k : ℕ} (hk : 0 < k) (c : ℝ) (L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) : Scaling_c0 (L.map (Scaling_sc k c)) = c * Scaling_c0 L`
  - Means: For k > 0, the constant coefficient of the rescaled list is c times the original constant coefficient, because k·(p,q,r) = 0 exactly when (p,q,r) = 0.
  - Closest known: Elementary.
  - In Mathlib: no (a fact about the private encoding)
  - Caveat: A private helper.
- **`Wyrd.PeriodicNS.Scaling_avg_eq_scaled`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:305` · new-session branch only
  - Lean: 

    ```lean
    {f : ℝ → ℝ → ℝ → ℝ} {k : ℕ} (hk : 0 < k) (c : ℝ) (L : List (ℝ × ℝ × ℤ × ℤ × ℤ)) (h : ∀ x y z, f x y z = c * Scaling_tp L (k * x) (k * y) (k * z)) : avg f = c * Scaling_c0 L
    ```

  - Means: For an integer k ≥ 1, if f(x,y,z) = c·P(kx,ky,kz) everywhere, with P an encoded trigonometric polynomial, then the average of f over [0,2π]³ is c times P's constant coefficient.
  - Closest known: Averages of periodic functions are invariant under an integer dilation of the period cell (the average over k periods equals the average over one).
  - In Mathlib: no (a fact about the private encoding and the project's avg)
  - Caveat: A private helper.
- **`Wyrd.PeriodicNS.quantities_vScaled`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:312` · new-session branch only
  - Lean: 

    ```lean
    {k : ℕ} (hk : 0 < k) : (vScaled k).energy = 1 ∧ (vScaled k).enstrophy = 5 * (k : ℝ) ^ 2 / 4 ∧ (vScaled k).palin = 7 * (k : ℝ) ^ 4 / 2 ∧ (vScaled k).stretching = (k : ℝ) ^ 3 / 4
    ```

  - Means: For every natural k ≥ 1, the field v_k has energy E = 1, enstrophy Z = 5k²/4, D = ⟨|∇ω|²⟩ = 7k⁴/2 and vortex stretching S = k³/4. Derivatives are Lean's deriv and averages are genuine iterated integrals over [0,2π]³.
  - Closest known: Standard dilation scaling: under u(x) ↦ u(kx) on the torus, averages are unchanged and each derivative brings a factor k. The k = 1 values are quantities_v (Averages.lean, another group).
  - In Mathlib: no (searched: navier, vorticity, enstrophy, palinstrophy)
  - Caveat: An exact, kernel-checked symbolic computation about one explicit project field at a single instant. No Navier–Stokes dynamics is involved. v_k is a fixed-amplitude dilation, not the Navier–Stokes scaling λu(λx, λ²t).
- **`Wyrd.PeriodicNS.ratio_vScaled`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:399` · new-session branch only
  - Lean: 

    ```lean
    {k : ℕ} (hk : 0 < k) (a b : ℝ) : (vScaled k).stretching / ((vScaled k).enstrophy ^ a * (vScaled k).palin ^ b) = 1 / 4 / ((5 / 4 : ℝ) ^ a * (7 / 2 : ℝ) ^ b) * (k : ℝ) ^ (3 - 2 * a - 4 * b)
    ```

  - Means: For k ≥ 1 and any real exponents a, b, the ratio S/(Z^a D^b) for v_k equals (1/4)/((5/4)^a (7/2)^b) · k^(3 − 2a − 4b), using real powers.
  - Closest known: Dimensional (scaling) analysis: Z ~ k², D ~ k⁴, S ~ k³ at fixed energy.
  - In Mathlib: no (searched: navier, enstrophy); the algebra uses Real.mul_rpow, Real.rpow_natCast_mul, Real.rpow_sub
  - Caveat: Algebra on top of quantities_vScaled.
- **`Wyrd.PeriodicNS.no_power_law_bound`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:424` · new-session branch only
  - Lean: `{a b : ℝ} (hab : 2 * a + 4 * b < 3) (C : ℝ) : ∃ k : ℕ, 0 < k ∧ C * ((vScaled k).enstrophy ^ a * (vScaled k).palin ^ b) < (vScaled k).stretching`
  - Means: For real a, b with 2a + 4b < 3 and every real constant C, some v_k with k ≥ 1 (all of which have E = 1) satisfies C·Z^a·D^b < S. So no inequality S ≤ C Z^a D^b with 2a + 4b < 3 holds even on this one family.
  - Closest known: The standard scaling (dimensional-analysis) argument that gives necessary exponent conditions for interpolation inequalities, as for Gagliardo–Nirenberg (Nirenberg 1959). The classical bound S ≤ c‖ω‖₂^{3/2}‖∇ω‖₂^{3/2}, i.e. S ≤ c Z^{3/4} D^{3/4} (Doering & Gibbon 1995, Applied Analysis of the Navier–Stokes Equations; Lu & Doering 2008, Indiana Univ. Math. J.), has 2a + 4b = 9/2 and is consistent with it.
  - In Mathlib: no (searched: navier, vorticity, enstrophy, Gagliardo; Mathlib's SobolevInequality.lean is the unrelated Gagliardo–Nirenberg–Sobolev embedding)
  - Caveat: It refutes only the universality of a power-law bound at fixed energy E = 1, the case where amplitude scaling is unavailable. Without the fixed-energy restriction, the amplitude family A·v (quantities_smul: S = A³/4, Z ∝ A², D ∝ A²) already forces 2a + 2b = 3 for any bound S ≤ C Z^a D^b, by letting A → 0 and A → ∞. Together with this theorem's necessary condition 2a + 4b ≥ 3, that means b ≥ 0. All of this is elementary scaling. Bounds with 2a + 4b ≥ 3 are not addressed; the classical S ≤ c Z^{3/4} D^{3/4} is one such bound and holds. The law it refutes was fitted in ChatGPT's external lab package (file docstring); no claim in the literature is refuted. The theorem quantifies over the unrestricted Field type. The witnesses v_k are in fact smooth and 2π-periodic, but Lean states only that they are divergence-free (div_vScaled).
- **`Wyrd.PeriodicNS.fitted_law_fails`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:448` · new-session branch only
  - Lean: `(C : ℝ) : ∃ k : ℕ, 0 < k ∧ C * ((vScaled k).enstrophy ^ (0.75 : ℝ) * (vScaled k).palin ^ (0.2 : ℝ)) < (vScaled k).stretching`
  - Means: For every real C there is k ≥ 1 with C·Z(v_k)^0.75·D(v_k)^0.2 < S(v_k), because 2·0.75 + 4·0.2 = 2.3 < 3. By ratio_vScaled the ratio grows like k^0.7.
  - Closest known: A specialisation of no_power_law_bound.
  - In Mathlib: no (searched: navier, enstrophy)
  - Caveat: The refuted law was fitted to particular trajectories in an external (ChatGPT) package, and the file grants that it may still describe them. Only its use as a universal estimate is refuted. It is not even homogeneous of the right degree: under u ↦ A u, S scales as A³ but Z^0.75 D^0.2 as A^1.9, so the amplitude family of quantities_smul already refutes it as A → ∞. What the dilation family adds is a refutation at fixed energy E = 1.
- **`Wyrd.PeriodicNS.SignFlip_curl_smul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:44` · new-session branch only
  - Lean: `(A : ℝ) (u : Field) : (u.smul A).curl = u.curl.smul A`
  - Means: For any real A and any Field u, curl(A·u) = A·curl(u).
  - Closest known: Linearity of the curl.
  - In Mathlib: no (Mathlib has no curl; searched: curl)
  - Caveat: A private helper; trivial linearity for the project's curl.
- **`Wyrd.PeriodicNS.SignFlip_energy_smul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:58` · new-session branch only
  - Lean: `(A : ℝ) (u : Field) : (u.smul A).energy = A ^ 2 * u.energy`
  - Means: For any Field u and real A, E(A·u) = A²·E(u).
  - Closest known: Energy is a quadratic form.
  - In Mathlib: no (a project functional)
  - Caveat: A private helper; routine homogeneity.
- **`Wyrd.PeriodicNS.SignFlip_gradSq_smul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:65` · new-session branch only
  - Lean: `(A : ℝ) (u : Field) : (u.smul A).gradSq = A ^ 2 * u.gradSq`
  - Means: For any Field u and real A, ⟨|∇(A·u)|²⟩ = A²⟨|∇u|²⟩.
  - Closest known: A quadratic form.
  - In Mathlib: no (a project functional)
  - Caveat: A private helper; routine homogeneity.
- **`Wyrd.PeriodicNS.SignFlip_stretching_smul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:75` · new-session branch only
  - Lean: `(A : ℝ) (u : Field) : (u.smul A).stretching = A ^ 3 * u.stretching`
  - Means: For any Field u and real A, S(A·u) = A³·S(u), so S changes sign under u ↦ −u.
  - Closest known: S is a cubic form in u. Its sign flip under u ↦ −u reflects the time-reversal symmetry of the Euler nonlinearity, u(x,t) ↦ −u(x,−t).
  - In Mathlib: no (a project functional)
  - Caveat: A private helper; routine homogeneity.
- **`Wyrd.PeriodicNS.quantities_smul`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:98` · new-session branch only
  - Lean: `(A : ℝ) : (v.smul A).energy = A ^ 2 ∧ (v.smul A).enstrophy = 5 * A ^ 2 / 4 ∧ (v.smul A).palin = 7 * A ^ 2 / 2 ∧ (v.smul A).stretching = A ^ 3 / 4`
  - Means: For every real A, the field A·v has E = A², Z = 5A²/4, D = 7A²/2 and S = A³/4.
  - Closest known: Homogeneity (degree 2 for E, Z, D; degree 3 for S) applied to the values for v.
  - In Mathlib: no (searched: navier, enstrophy)
  - Caveat: Depends on quantities_v (Averages.lean, outside this group) for the values at A = 1. These are functionals at one instant only.
- **`Wyrd.PeriodicNS.rates`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:110` · new-session branch only
  - Lean: `: (v.smul 1).stretching - 1 / 28 * (v.smul 1).palin = 1 / 8 ∧ (v.smul (-1)).stretching - 1 / 28 * (v.smul (-1)).palin = -3 / 8`
  - Means: S − (1/28)·D equals 1/8 for v and −3/8 for −v.
  - Closest known: Arithmetic from quantities_smul.
  - In Mathlib: no (a project computation)
  - Caveat: A numeric computation. These numbers are 'enstrophy rates' only through the balance dZ/dt = S − νD, which is not formalised.
- **`Wyrd.PeriodicNS.opposite_signs`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:119` · new-session branch only
  - Lean: `{A ν : ℝ} (hν : 0 < ν) (hA : 14 * ν < A) : 0 < (v.smul A).stretching - ν * (v.smul A).palin ∧ (v.smul (-A)).stretching - ν * (v.smul (-A)).palin < 0`
  - Means: For real ν > 0 and A > 14ν, S − νD is positive for A·v and negative for −A·v.
  - Closest known: Elementary from S = ±A³/4 and D = 7A²/2, since A³/4 − 7νA²/2 = (A²/4)(A − 14ν).
  - In Mathlib: no (a project computation)
  - Caveat: A statement about the functional S − νD at one instant, not about dZ/dt of a solution.
- **`Wyrd.PeriodicNS.same_spectrum`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:137` · new-session branch only
  - Lean: 

    ```lean
    (A : ℝ) (k : ℤ × ℤ × ℤ) : ‖coeff (v.smul (-A)).u1 k‖ = ‖coeff (v.smul A).u1 k‖ ∧ ‖coeff (v.smul (-A)).u2 k‖ = ‖coeff (v.smul A).u2 k‖ ∧ ‖coeff (v.smul (-A)).u3 k‖ = ‖coeff (v.smul A).u3 k‖
    ```

  - Means: For every real A and wave vector k ∈ ℤ³, each component of −A·v and of A·v has a Fourier coefficient of the same modulus at k.
  - Closest known: Linearity of Fourier coefficients: |c(−f)| = |c(f)|.
  - In Mathlib: no (a project functional; follows from norm_neg and Complex.norm_real)
  - Caveat: Trivially true for any field and its negative; nothing here is specific to v.
- **`Wyrd.PeriodicNS.no_closure`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:148` · new-session branch only
  - Lean: `: ¬ ∃ Φ : ℝ → ℝ → ℝ → ℝ → ℝ, ∀ u ∈ ({v.smul 1, v.smul (-1)} : Set Field), u.stretching - 1 / 28 * u.palin = Φ u.energy u.enstrophy u.palin (1 / 28)`
  - Means: No function Φ : ℝ⁴ → ℝ satisfies S(u) − (1/28)D(u) = Φ(E(u), Z(u), D(u), 1/28) for both u = v and u = −v. Both fields have (E, Z, D) = (1, 5/4, 7/2), but the left side is 1/8 for one and −3/8 for the other.
  - Closest known: Elementary parity: S is odd under u ↦ −u while E, Z and D are even, so any field with S ≠ 0 rules out such a closure. That closures using only spectra (magnitudes) lose phase information is folklore in turbulence closure theory (e.g. Orszag 1970, 'Analytical theories of turbulence', J. Fluid Mech. 41). I found no specific published statement of this exact form.
  - In Mathlib: no (searched: navier, enstrophy, vorticity)
  - Caveat: A statement about two fixed fields at one instant with ν = 1/28. Reading it as 'no exact law dZ/dt = Φ(E, Z, D, ν) for solutions' needs the enstrophy balance and local existence, neither of which is formalised. It refutes a hypothetical exact closure that no one in the literature is known to have claimed.
- **`Wyrd.PeriodicNS.no_spectral_closure`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:167` · new-session branch only
  - Lean: 

    ```lean
    : ¬ ∃ Φ : ((ℤ × ℤ × ℤ) → ℝ × ℝ × ℝ) → ℝ → ℝ, ∀ u ∈ ({v.smul 1, v.smul (-1)} : Set Field), u.stretching - 1 / 28 * u.palin = Φ (fun k => (‖coeff u.u1 k‖, ‖coeff u.u2 k‖, ‖coeff u.u3 k‖)) (1 / 28)
    ```

  - Means: No function Φ of the full map k ↦ (|û₁(k)|, |û₂(k)|, |û₃(k)|) on ℤ³ together with ν gives S − (1/28)D for both v and −v.
  - Closest known: Same as no_closure: spectra are blind to the sign (phase) that decides S.
  - In Mathlib: no (searched: navier, enstrophy)
  - Caveat: Immediate, since the magnitudes coincide (same_spectrum) while S − νD does not. It concerns instantaneous functionals, not solutions.
- **`Wyrd.PeriodicNS.not_B_implies_D`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Quantifiers.lean:29` · new-session branch only
  - Lean: 

    ```lean
    {Data Force : Type*} (admD : Data → Prop) (admF : Force → Prop) (zero : Force) (hzero : admF zero) (Smooth : Data → Force → Prop) : ¬ AltB admD zero Smooth → AltD admD admF Smooth
    ```

  - Means: Take arbitrary types Data and Force, an admissible force zero, and any predicate Smooth. If AltB fails (it says every admissible datum is Smooth under the zero force), then AltD holds: some admissible datum and admissible force are not Smooth.
  - Closest known: Fefferman's official Clay problem description (2000). There (B) is existence and smoothness on ℝ³/ℤ³ with f ≡ 0, and (D) is breakdown on ℝ³/ℤ³ for some smooth periodic u⁰ and a smooth, decaying periodic force f. ¬(B) ⇒ (D) by taking f ≡ 0.
  - In Mathlib: no (searched: Navier, Millennium, Clay)
  - Caveat: Pure first-order logic over an abstract predicate. Nothing about Navier–Stokes, smoothness or Clay's function spaces is formalised.
- **`Wyrd.PeriodicNS.D_and_B_consistent`** · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Quantifiers.lean:41` · new-session branch only
  - Lean: `: AltB (fun _ : Unit => True) (0 : ℕ) (fun _ f => f = 0) ∧ AltD (fun _ : Unit => True) (fun f : ℕ => f ≤ 1) (fun _ f => f = 0)`
  - Means: In the toy model with Data = Unit, Force = ℕ, admissible forces f ≤ 1 and Smooth u₀ f defined as f = 0, both AltB (with zero force 0) and AltD (witness f = 1) hold.
  - Closest known: The same Fefferman (2000) statement: a forced breakdown (D) does not by itself refute (B).
  - In Mathlib: no (searched: Navier, Millennium, Clay)
  - Caveat: It shows only that D ⇒ ¬B does not follow from the shape of the quantifiers, using a toy model: Data = Unit, Force = ℕ, Smooth u₀ f := (f = 0). It says nothing about whether (B) or (D) holds for Navier–Stokes. This is already visible in Fefferman's official statement: (A)/(B) fix f ≡ 0 while (C)/(D) allow a smooth decaying force, so the alternatives are not mutually exclusive as stated. A proof of any one of (A)–(D) answers the prize problem. So a valid forced blow-up result of (C)/(D) type, like the reported September 2026 claim, would settle the Clay problem as officially posed while leaving (A)/(B) open. 'Would not settle (B)' must not be read as 'would not settle the problem'.

#### Shared Air feedback model

- **`Wyrd.SharedAir.Pc_ofReal`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Basic.lean:42` · new-session branch only
  - Lean: `(a b d c h g s : ℝ) : Pc a b d c h g (s : ℂ) = (P a b d c h g s : ℂ)`
  - Means: For real coefficients and a real number s, the complex characteristic polynomial Pc evaluated at s equals the real polynomial P(s) cast to ℂ.
  - Closest known: Routine coercion fact: Complex.ofReal is a ring homomorphism (push_cast).
  - In Mathlib: no (searched: Pc/P are project definitions; only generic cast lemmas such as Complex.ofReal_mul apply)
  - Caveat: Routine cast identity about project definitions.
- **`Wyrd.SharedAir.det_charMatrix`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Basic.lean:52` · new-session branch only
  - Lean: `(a b d r q h g : ℝ) (z : ℂ) : (z • (1 : Matrix (Fin 3) (Fin 3) ℂ) - sysMatrix a b d r q h g).det = Pc a b d (r * q) h g z`
  - Means: For the 3×3 complex matrix M = [[−a, rg, −1], [qg, −b, 0], [hg, 0, −d]], det(z·I − M) equals Pc(z) with c = r·q. So the eigenvalues of the linear system are exactly the roots of Pc.
  - Closest known: Characteristic polynomial of a 3×3 matrix by cofactor expansion (any linear algebra text).
  - In Mathlib: partial: Matrix.det_fin_three, Matrix.charpoly (generic 3×3 determinant and charpoly; the specific matrix is the project's)
  - Caveat: Symbolic determinant computation (simp + ring) for the project's matrix.
- **`Wyrd.SharedAir.complete_square`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Basic.lean:65` · new-session branch only
  - Lean: `{a b d c h g s : ℝ} (hc : c ≠ 0) (hs : s + d ≠ 0) : P a b d c h g s = (s + b) / (s + d) * H a b d c h s - c * (s + d) * (g - G b d c h s) ^ 2`
  - Means: For real numbers with c ≠ 0 and s + d ≠ 0, P(s, g) = (s+b)/(s+d)·H(s) − c(s+d)(g − G(s))², i.e. P is written as a completed square in the gain g.
  - Closest known: Completing the square (elementary algebra).
  - In Mathlib: no (searched: complete_square, discrim, quadratic_eq_zero_iff; Mathlib's quadratic lemmas concern roots, not this identity)
  - Caveat: Algebraic identity (field_simp; ring) about project definitions P, H, G.
- **`Wyrd.SharedAir.Hyp.b_lt_d`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Basic.lean:72` · new-session branch only
  - Lean: `{a b d c h : ℝ} (hp : Hyp a b d c h) : b < d`
  - Means: Under the standing hypotheses Hyp (0 < a < b, d ≥ 3b − 2a, c > 0, h > 0), b < d.
  - Closest known: Trivial linear arithmetic.
  - In Mathlib: no (searched: project structure Hyp; linarith consequence)
  - Caveat: Trivial consequence of the hypotheses.
- **`Wyrd.SharedAir.H_neg_b`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Basic.lean:75` · new-session branch only
  - Lean: `{a b d c h : ℝ} (hp : Hyp a b d c h) : H a b d c h (-b) < 0`
  - Means: Under Hyp, the envelope cubic H is negative at s = −b (it equals (a − b)(d − b)²).
  - Closest known: Elementary sign evaluation.
  - In Mathlib: no (searched: H is a project definition)
  - Caveat: Routine evaluation.
- **`Wyrd.SharedAir.H_neg_a`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Basic.lean:82` · new-session branch only
  - Lean: `{a b d c h : ℝ} (hp : Hyp a b d c h) : 0 < H a b d c h (-a)`
  - Means: Under Hyp, H is positive at s = −a (it equals h²/(4c)·(b − a)).
  - Closest known: Elementary sign evaluation.
  - In Mathlib: no (searched: H is a project definition)
  - Caveat: Routine evaluation.
- **`Wyrd.SharedAir.H_strictMonoOn`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Basic.lean:91` · new-session branch only
  - Lean: `{a b d c h : ℝ} (hp : Hyp a b d c h) : StrictMonoOn (H a b d c h) (Set.Ioi (-b))`
  - Means: Under Hyp, the real cubic H(s) = (s+a)(s+d)² + h²/(4c)(s+b) is strictly increasing on (−b, ∞).
  - Closest known: Monotonicity of a cubic via an explicit positive difference quotient; elementary.
  - In Mathlib: no (searched: StrictMonoOn for this cubic; generic tools only)
  - Caveat: Uses the sufficient condition d ≥ 3b − 2a from Hyp.
- **`Wyrd.SharedAir.existsUnique_root_H`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Basic.lean:121` · new-session branch only
  - Lean: `{a b d c h : ℝ} (hp : Hyp a b d c h) : ∃! s, s ∈ Set.Ioo (-b) (-a) ∧ H a b d c h s = 0`
  - Means: Under Hyp, H has exactly one real root s* in the open interval (−b, −a).
  - Closest known: Intermediate value theorem plus strict monotonicity.
  - In Mathlib: partial: intermediate_value_Ioo (IVT used in the proof; the root statement is about the project's H)
- **`Wyrd.SharedAir.P_neg_b`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Dominant.lean:14` · new-session branch only
  - Lean: `{a b d c h g : ℝ} (hp : Hyp a b d c h) (hg : 0 < g) : P a b d c h g (-b) < 0`
  - Means: Under Hyp and g > 0, the characteristic polynomial is negative at s = −b (P(−b, g) = −c g²(d − b)).
  - Closest known: Elementary sign evaluation.
  - In Mathlib: no (searched: P is a project definition)
  - Caveat: Routine evaluation.
- **`Wyrd.SharedAir.Dominant_no_two_roots (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Dominant.lean:24` · new-session branch only
  - Lean: `{a b d c h g s₁ s₂ : ℝ} (hp : Hyp a b d c h) (hg : 0 < g) (h1 : -b < s₁) (h12 : s₁ < s₂) (hP1 : P a b d c h g s₁ = 0) (hP2 : P a b d c h g s₂ = 0) : False`
  - Means: Under Hyp and g > 0, P(·, g) cannot have two distinct real roots s₁ < s₂ both greater than −b. The proof uses a second-divided-difference (three-point convexity) identity.
  - Closest known: Convexity of a cubic where its second derivative is positive; elementary.
  - In Mathlib: no (searched: divided difference / convexity lemma for this cubic)
  - Caveat: Private helper.
- **`Wyrd.SharedAir.existsUnique_root_gt`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Dominant.lean:44` · new-session branch only
  - Lean: `{a b d c h g : ℝ} (hp : Hyp a b d c h) (hg : 0 < g) : ∃! s, -b < s ∧ P a b d c h g s = 0`
  - Means: Under Hyp and g > 0, the real cubic P(·, g) has exactly one real root in (−b, ∞).
  - Closest known: IVT plus convexity; elementary.
  - In Mathlib: partial: intermediate_value_Ioo (used in the proof)
- **`Wyrd.SharedAir.re_le_of_root`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Dominant.lean:73` · new-session branch only
  - Lean: `{a b d c h g : ℝ} (hp : Hyp a b d c h) (hg : 0 < g) {s₀ : ℝ} (hs₀ : -b < s₀) (hP : P a b d c h g s₀ = 0) : ∀ z : ℂ, Pc a b d c h g z = 0 → z.re ≤ s₀`
  - Means: Under Hyp and g > 0, if s₀ > −b is a real root of P(·, g), then every complex root z of Pc(·, g) has Re z ≤ s₀. So the real root is the dominant eigenvalue.
  - Closest known: Vieta / polynomial division: a complex-conjugate pair of a real cubic with real root s₀ has real part −(s₀ + a + b + d)/2; elementary.
  - In Mathlib: no (searched: dominant root, spectral abscissa)
  - Caveat: Holds only under the sufficient conditions in Hyp and for g > 0.
- **`Wyrd.SharedAir.Optimal_root_ge (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Optimal.lean:38` · new-session branch only
  - Lean: `{a b d c h g t : ℝ} (hp : Hyp a b d c h) (hg : 0 ≤ g) (ht : P a b d c h g t ≤ 0) : ∃ s, t ≤ s ∧ P a b d c h g s = 0`
  - Means: Under Hyp and g ≥ 0, if P(t, g) ≤ 0 then P(·, g) has a real root s ≥ t.
  - Closest known: Intermediate value theorem.
  - In Mathlib: partial: intermediate_value_Icc (used in the proof)
  - Caveat: Private helper.
- **`Wyrd.SharedAir.optimal_coupling`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Optimal.lean:65` · new-session branch only
  - Lean: 

    ```lean
    {a b d c h : ℝ} (hp : Hyp a b d c h) {s₀ : ℝ} (hs₀ : s₀ ∈ Set.Ioo (-b) (-a)) (hH : H a b d c h s₀ = 0) : 0 < G b d c h s₀ ∧ (∀ g, 0 ≤ g → ∃ s : ℝ, s₀ ≤ s ∧ P a b d c h g s = 0) ∧ (∀ g, 0 ≤ g → g ≠ G b d c h s₀ → ∃ s : ℝ, s₀ < s ∧ P a b d c h g s = 0) ∧ (∀ z : ℂ, Pc a b d c h (G b d c h s₀) z = 0 → z.re ≤ s₀)
    ```

  - Means: Under Hyp, with s₀ the root of H in (−b, −a) and g* = G(s₀): g* > 0; for every g ≥ 0, P(·, g) has a real root ≥ s₀; for every g ≥ 0 with g ≠ g*, a real root > s₀; and at g = g* every complex root has real part ≤ s₀. So over g ≥ 0, g* is the unique minimiser of the spectral abscissa of the zero-delay linear system.
  - Closest known: Root-abscissa / spectral-abscissa minimisation over parametrised families: Burke, Lewis and Overton, 'Optimal stability and eigenvalue multiplicity' (Found. Comput. Math. 2001) for the spectral abscissa over affine matrix families; Blondel, Gürbüzbalaban, Megretski and Overton (IEEE TAC 57, 2012) for monic polynomials with one affine coefficient constraint. Here the coefficients are quadratic in g, so those results do not directly give this statement; the proof is completing the square plus the IVT.
  - In Mathlib: no (searched: spectral abscissa, spectralAbscissa, Routh, Hurwitz, root optimisation)
  - Caveat: This is about the zero-delay linearisation's spectral rate over g ≥ 0 only, not recovery time or the nonlinear, noisy or delayed model; the file docstring says so. The hypotheses hs₀ and hH are discharged by existsUnique_root_H, so the statement is not vacuous. Hyp is only a sufficient condition.
- **`Wyrd.SharedAir.P_zero`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Optimal.lean:109` · new-session branch only
  - Lean: `(a b d c h g : ℝ) : P a b d c h g 0 = a * b * d + h * b * g - c * d * g ^ 2`
  - Means: P(0, g) = abd + hbg − cdg² for all real parameters.
  - Closest known: Direct evaluation.
  - In Mathlib: no (searched: project definition P)
  - Caveat: Definitional evaluation (unfold; ring).
- **`Wyrd.SharedAir.P_gc`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Optimal.lean:114` · new-session branch only
  - Lean: `{a b d c h : ℝ} (hp : Hyp a b d c h) : P a b d c h (gc a b d c h) 0 = 0`
  - Means: Under Hyp, at the critical gain g_c = (hb + √(h²b² + 4abcd²))/(2cd), P(0, g_c) = 0, i.e. the system has a zero eigenvalue.
  - Closest known: Quadratic formula.
  - In Mathlib: partial: quadratic_eq_zero_iff (general quadratic formula; this is an instance for the project's coefficients)
  - Caveat: An instance of the quadratic formula.
- **`Wyrd.SharedAir.P_zero_pos_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Optimal.lean:131` · new-session branch only
  - Lean: `{a b d c h g : ℝ} (hp : Hyp a b d c h) (hg : 0 ≤ g) : 0 < P a b d c h g 0 ↔ g < gc a b d c h`
  - Means: Under Hyp and for g ≥ 0, P(0, g) > 0 exactly when g < g_c.
  - Closest known: Sign of a downward quadratic between its roots; elementary.
  - In Mathlib: partial: quadratic_eq_zero_iff, discrim (generic quadratic facts)
- **`Wyrd.SharedAir.stable_iff`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Optimal.lean:171` · new-session branch only
  - Lean: `{a b d c h g : ℝ} (hp : Hyp a b d c h) (hg : 0 ≤ g) : (∀ z : ℂ, Pc a b d c h g z = 0 → z.re < 0) ↔ g < gc a b d c h`
  - Means: Under Hyp and for g ≥ 0, every complex root of the characteristic polynomial Pc(·, g) has negative real part if and only if g < g_c.
  - Closest known: Routh–Hurwitz criterion for cubics (Routh 1877; Hurwitz 1895): s³ + a₂s² + a₁s + a₀ is Hurwitz iff a₂ > 0, a₀ > 0 and a₂a₁ > a₀. Here only a₀ = P(0, g) > 0 binds, because the dominant root is real.
  - In Mathlib: no (searched: Routh, Hurwitz, stable polynomial, Lyapunov)
  - Caveat: This is spectral stability of the zero-delay linearisation. Nonlinear stability of the rest state would need Lyapunov's indirect method, which is neither in Mathlib nor proved here, and at g = g_c the linearisation is degenerate. Hyp is a sufficient condition.
- **`Wyrd.SharedAir.det_delayMatrix`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Delay.lean:29` · new-session branch only
  - Lean: 

    ```lean
    (a b d r q h g τ : ℝ) (z : ℂ) : (delayMatrix a b d r q h g τ z).det = (z + a) * (z + b) * (z + d) + h * g * (z + b) * Complex.exp (-z * τ) - r * q * g ^ 2 * (z + d) * Complex.exp (-2 * z * τ)
    ```

  - Means: The project's delayed characteristic matrix puts the factor e^{−zτ} on the three g-weighted coupling entries (r g, q g, h g). The −1 feedback from z into x' is not delayed. Its determinant is (z+a)(z+b)(z+d) + hg(z+b)e^{−zτ} − rqg²(z+d)e^{−2zτ}. So the negative loop x→z→x carries a delay of τ and the positive loop x→y→x carries 2τ.
  - Closest known: Characteristic quasi-polynomial of a linear retarded DDE (Hale and Verduyn Lunel, Introduction to Functional Differential Equations, 1993).
  - In Mathlib: partial: Matrix.det_fin_three (generic 3×3 determinant)
  - Caveat: Symbolic computation. Which terms carry the delay is a modelling choice encoded in delayMatrix.
- **`Wyrd.SharedAir.Dd_zero`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Delay.lean:40` · new-session branch only
  - Lean: `(a b d c h g τ : ℝ) : Dd a b d c h g τ 0 = P a b d c h g 0`
  - Means: At s = 0 the delayed characteristic function equals the undelayed one, because e^0 = 1.
  - Closest known: Direct evaluation.
  - In Mathlib: no (searched: project definition Dd)
  - Caveat: Definitional evaluation.
- **`Wyrd.SharedAir.delay_unstable`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Delay.lean:46` · new-session branch only
  - Lean: 

    ```lean
    {a b d c h g τ : ℝ} (ha : 0 < a) (hb : 0 < b) (hd : 0 < d) (hc : 0 < c) (hh : 0 ≤ h) (hg : 0 ≤ g) (hτ : 0 ≤ τ) (hP : P a b d c h g 0 < 0) : ∃ s : ℝ, 0 < s ∧ Dd a b d c h g τ s = 0
    ```

  - Means: For a, b, d, c > 0 and h, g, τ ≥ 0, if P(0, g) < 0 then the real delayed characteristic function Dd(·) has a root s > 0, whatever the delay τ.
  - Closest known: Standard argument for delay-independent instability: the characteristic function is negative at 0 and tends to +∞ along the positive real axis, so the IVT gives a positive real root (e.g. Hale and Verduyn Lunel 1993; H. Smith, An Introduction to Delay Differential Equations with Applications to the Life Sciences, 2011).
  - In Mathlib: no (searched: delay differential, quasi-polynomial, characteristic equation)
  - Caveat: The hypothesis hP carries the content (discharged for the Shared Air coefficients by unstable_every_delay). The step from a positive characteristic root to an exponentially growing solution of the DDE, and to instability of the nonlinear delayed model, is not formalised.
- **`Wyrd.SharedAir.Dd_eq_det`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Delay.lean:81` · new-session branch only
  - Lean: `(a b d r q h g τ s : ℝ) : (Dd a b d (r * q) h g τ s : ℂ) = (delayMatrix a b d r q h g τ (s : ℂ)).det`
  - Means: For real s, the real function Dd with c = r·q, cast to ℂ, equals the determinant of the delayed characteristic matrix at s.
  - Closest known: Direct computation.
  - In Mathlib: no (searched: project definitions Dd, delayMatrix)
  - Caveat: Computation linking two project definitions.
- **`Wyrd.SharedAir.field_zero`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Linearization.lean:36` · new-session branch only
  - Lean: `(g : ℝ) : field g 0 = 0`
  - Means: The origin of ℝ³ is an equilibrium of the project's nonlinear Shared Air vector field, for every gain g.
  - Closest known: Direct evaluation.
  - In Mathlib: no (searched: project definition field)
  - Caveat: Definitional check (simp).
- **`Wyrd.SharedAir.hasDerivAt_field_line`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Linearization.lean:41` · new-session branch only
  - Lean: `(g : ℝ) (v : ℝ × ℝ × ℝ) : HasDerivAt (fun t : ℝ => field g (t • v)) (linField g v) 0`
  - Means: For every direction v in ℝ³, the map t ↦ field g (t·v) has derivative linField g v at t = 0, i.e. the directional derivative of the nonlinear field at the origin is the linear system.
  - Closest known: Jacobian linearisation at an equilibrium (standard calculus).
  - In Mathlib: partial: HasDerivAt.mul_const, HasDerivAt.inv, HasDerivAt.prodMk (generic rules; the field is the project's)
- **`Wyrd.SharedAir.hasFDerivAt_field`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Linearization.lean:93` · new-session branch only
  - Lean: `(g : ℝ) : ∃ L : ℝ × ℝ × ℝ →L[ℝ] ℝ × ℝ × ℝ, HasFDerivAt (field g) L 0 ∧ ∀ v, L v = linField g v`
  - Means: The project's nonlinear field (cubic damping and the cap(y) = 1/(1 + (y/0.8)²) term included) is Fréchet differentiable at the origin, and its derivative there is the linear map linField g.
  - Closest known: Jacobian linearisation (standard calculus).
  - In Mathlib: partial: HasFDerivAt / DifferentiableAt.hasFDerivAt / HasFDerivAt.comp_hasDerivAt (generic; the field is the project's)
  - Caveat: field is the project's encoding of the source model at zero input, noise and delay; its fidelity to the source cannot be checked in the repo. Linearisation alone does not transfer stability to the nonlinear system (Hartman–Grobman and Lyapunov's indirect method are not in Mathlib).
- **`Wyrd.SharedAir.linField_eq_sysMatrix`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Linearization.lean:109` · new-session branch only
  - Lean: 

    ```lean
    (g : ℝ) (p : ℝ × ℝ × ℝ) : (sysMatrix (1 / 30) (1 / 20) (1 / 4) (1 / 25) (1 / 10) (3 / 40) g).mulVec ![(p.1 : ℂ), p.2.1, p.2.2] = ![((linField g p).1 : ℂ), (linField g p).2.1, (linField g p).2.2]
    ```

  - Means: With a = 1/30, b = 1/20, d = 1/4, r = 1/25, q = 1/10, h = 3/40, the complexified system matrix applied to a real state p equals linField g p cast to ℂ.
  - Closest known: Direct computation.
  - In Mathlib: no (searched: project definitions sysMatrix, linField)
  - Caveat: Computation (fin_cases; simp; ring).
- **`Wyrd.SharedAir.vel_eq_sin`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:32` · new-session branch only
  - Lean: `(K : ℝ) {m : ℕ} (θ : Fin m → ℝ) (j : Fin m) {r ψ : ℝ} (hZ : Z1 θ = r * exp (ψ * I)) : vel K θ j = K * r * Real.sin (ψ - θ j)`
  - Means: If the first phase moment of m real phases is Z1 = r e^{iψ}, then the mean-field velocity K·Im(Z1 e^{−iθ_j}) equals K r sin(ψ − θ_j), the Kuramoto form.
  - Closest known: Kuramoto mean-field form of the coupling (Kuramoto 1975/1984; Strogatz, Physica D 143, 2000).
  - In Mathlib: partial: Complex.exp_ofReal_mul_I_im (Im e^{ix} = sin x); Kuramoto is not in Mathlib
  - Caveat: Routine trig identity about project definitions.
- **`Wyrd.SharedAir.hasDerivAt_Z1`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:45` · new-session branch only
  - Lean: 

    ```lean
    {m : ℕ} {θ : ℝ → Fin m → ℝ} {θ' : Fin m → ℝ} {t : ℝ} (h : ∀ j, HasDerivAt (fun s => θ s j) (θ' j) t) : HasDerivAt (fun s => Z1 (θ s)) ((∑ j, I * θ' j * exp (θ t j * I)) / m) t
    ```

  - Means: If each phase θ_j(s) has derivative θ'_j at t, then Z1(θ(s)) = (1/m)Σ e^{iθ_j(s)} has derivative (1/m)Σ i θ'_j e^{iθ_j(t)} at t.
  - Closest known: Chain rule for the order parameter; routine.
  - In Mathlib: partial: HasDerivAt.cexp, HasDerivAt.sum, HasDerivAt.ofReal_comp (generic rules)
  - Caveat: Routine calculus.
- **`Wyrd.SharedAir.moments_A`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:98` · new-session branch only
  - Lean: `: Z1 confA = 1 / 2 ∧ Z2 confA = 0`
  - Means: For the 4 phases (0, 0, π/2, −π/2), the first moment is 1/2 and the second moment is 0.
  - Closest known: Direct computation.
  - In Mathlib: no (searched: project definitions Z1, Z2, confA)
  - Caveat: Exact computation (simp/norm_num).
- **`Wyrd.SharedAir.moments_B`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:107` · new-session branch only
  - Lean: `: Z1 confB = 1 / 2 ∧ Z2 confB = 1`
  - Means: For the 4 phases (0, 0, 0, π), the first moment is 1/2 and the second moment is 1.
  - Closest known: Direct computation.
  - In Mathlib: no (searched: project definitions Z1, Z2, confB)
  - Caveat: Exact computation.
- **`Wyrd.SharedAir.same_synchrony_different_future`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:116` · new-session branch only
  - Lean: `(K : ℝ) : Z1 confA = Z1 confB ∧ Z1dot K confA = K / 4 ∧ Z1dot K confB = 0`
  - Means: For every real K, the two 4-cell configurations A and B have the same first moment (Z1 = 1/2), and their mean-field rates Z1dot are K/4 and 0. For K ≠ 0 this shows Z1 alone does not determine its own rate of change. For K = 0 both rates are 0.
  - Closest known: Non-closure of the Kuramoto moment hierarchy without a reduction ansatz (Watanabe–Strogatz, Physica D 74, 1994; Ott–Antonsen 2008).
  - In Mathlib: no (searched: kuramoto, order parameter)
  - Caveat: Explicit counterexample, computed from Z1dot_eq.
- **`Wyrd.SharedAir.PhaseMoments_sum24 (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:132` · new-session branch only
  - Lean: `(g : Fin 4 → ℂ) : ∑ j : Fin 24, g ⟨j.val % 4, Nat.mod_lt _ (by norm_num)⟩ = 6 * ∑ j, g j`
  - Means: Summing a 4-periodic pattern over 24 indices gives 6 times its 4-term sum.
  - Closest known: Finite sum computation.
  - In Mathlib: no (searched: specific periodic-sum statement; generic Finset lemmas only)
  - Caveat: Private helper; computation by simp [Fin.sum_univ_succ].
- **`Wyrd.SharedAir.PhaseMoments_moments24 (private)`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:138` · new-session branch only
  - Lean: 

    ```lean
    (c : Fin 4 → ℝ) : Z1 (fun j : Fin 24 => c ⟨j.val % 4, Nat.mod_lt _ (by norm_num)⟩) = Z1 c ∧ Z2 (fun j : Fin 24 => c ⟨j.val % 4, Nat.mod_lt _ (by norm_num)⟩) = Z2 c
    ```

  - Means: Repeating a 4-cell phase pattern six times (24 cells) leaves both phase moments Z1 and Z2 unchanged.
  - Closest known: Direct computation.
  - In Mathlib: no (searched: project definitions)
  - Caveat: Private helper.
- **`Wyrd.SharedAir.same_synchrony_different_future_24`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:151` · new-session branch only
  - Lean: `(K : ℝ) : Z1 confA24 = 1 / 2 ∧ Z1 confB24 = 1 / 2 ∧ Z1dot K confA24 = K / 4 ∧ Z1dot K confB24 = 0`
  - Means: The 24-cell versions of configurations A and B (each repeated six times) both have Z1 = 1/2, but their mean-field Z1 rates are K/4 and 0.
  - Closest known: Same as same_synchrony_different_future (Kuramoto moment non-closure).
  - In Mathlib: no (searched: kuramoto, order parameter)
  - Caveat: This is about the complex rate Z1dot, not the derivative of the synchrony ‖Z1‖ along trajectories. That is stated only for 4 cells, in synchrony_rates.
- **`Wyrd.SharedAir.hasDerivAt_Z1_vel`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:166` · new-session branch only
  - Lean: `{m : ℕ} {K t : ℝ} {θ : ℝ → Fin m → ℝ} (h : ∀ j, HasDerivAt (fun s => θ s j) (vel K (θ t) j) t) : HasDerivAt (fun s => Z1 (θ s)) (Z1dot K (θ t)) t`
  - Means: If every phase moves with the mean-field velocity at time t, then Z1(θ(s)) has derivative Z1dot K (θ t) at t.
  - Closest known: Specialisation of hasDerivAt_Z1; routine.
  - In Mathlib: no (searched: project definitions)
  - Caveat: Routine chain rule. The hypothesis fixes each phase's derivative only at the single time t, so any differentiable path with that velocity at t (for example a straight line) satisfies it. No ODE solution or Picard–Lindelöf argument is involved; the result is an instantaneous statement.
- **`Wyrd.SharedAir.different_future_of_ne`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:190` · new-session branch only
  - Lean: `{K : ℝ} (hK : K ≠ 0) : Z1 confA = Z1 confB ∧ Z1dot K confA ≠ Z1dot K confB`
  - Means: For K ≠ 0, configurations A and B have equal first moments but different mean-field rates of change of Z1.
  - Closest known: Kuramoto moment non-closure (as above).
  - In Mathlib: no (searched: project definitions)
  - Caveat: Immediate corollary of same_synchrony_different_future.
- **`Wyrd.SharedAir.synchrony_rates`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:201` · new-session branch only
  - Lean: 

    ```lean
    {K t : ℝ} {θA θB : ℝ → Fin 4 → ℝ} (hA0 : θA t = confA) (hB0 : θB t = confB) (hA : ∀ j, HasDerivAt (fun s => θA s j) (vel K (θA t) j) t) (hB : ∀ j, HasDerivAt (fun s => θB s j) (vel K (θB t) j) t) : ‖Z1 (θA t)‖ = 1 / 2 ∧ ‖Z1 (θB t)‖ = 1 / 2 ∧ HasDerivAt (fun s => ‖Z1 (θA s)‖) (K / 4) t ∧ HasDerivAt (fun s => ‖Z1 (θB s)‖) 0 t
    ```

  - Means: Take 4-cell trajectories that pass through configurations A and B at time t and move with the mean-field velocity there. Then both have synchrony ‖Z1‖ = 1/2, but ‖Z1‖ changes at rate K/4 for A and 0 for B.
  - Closest known: Kuramoto moment non-closure (Watanabe–Strogatz 1994; Ott–Antonsen 2008).
  - In Mathlib: no (searched: kuramoto, order parameter)
  - Caveat: 4-cell only; the README cites it for the 24-cell populations. The hypotheses fix the phases' velocity only at the single time t (a straight-line path satisfies them), so this is a statement about the instantaneous derivative of ‖Z1‖ at t. It says nothing about solutions of the mean-field ODE over a time interval.
- **`Wyrd.SharedAir.hyp_sharedAir`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:24` · new-session branch only
  - Lean: `: Hyp (1 / 30) (1 / 20) (1 / 4) (1 / 250) (3 / 40)`
  - Means: The model's coefficients a = 1/30, b = 1/20, d = 1/4, c = 1/250, h = 3/40 satisfy the standing hypotheses (0 < a < b, d ≥ 3b − 2a, c, h > 0).
  - Closest known: Rational arithmetic.
  - In Mathlib: no (searched: project structure Hyp)
  - Caveat: norm_num computation. It shows Hyp is satisfiable for the model, so the general theorems are not vacuous here.
- **`Wyrd.SharedAir.H_sharedAir`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:31` · new-session branch only
  - Lean: `(s : ℝ) : H (1 / 30) (1 / 20) (1 / 4) (1 / 250) (3 / 40) s = (s + 1 / 30) * (s + 1 / 4) ^ 2 + 45 / 128 * (s + 1 / 20)`
  - Means: With the Shared Air coefficients, H(s) = (s + 1/30)(s + 1/4)² + (45/128)(s + 1/20) for every real s.
  - Closest known: Arithmetic.
  - In Mathlib: no (searched: project definition H)
  - Caveat: Computation.
- **`Wyrd.SharedAir.G_sharedAir`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:38` · new-session branch only
  - Lean: `(s : ℝ) : G (1 / 20) (1 / 4) (1 / 250) (3 / 40) s = 75 / 8 * ((s + 1 / 20) / (s + 1 / 4))`
  - Means: With the Shared Air coefficients, G(s) = (75/8)·(s + 1/20)/(s + 1/4).
  - Closest known: Arithmetic.
  - In Mathlib: no (searched: project definition G)
  - Caveat: Computation.
- **`Wyrd.SharedAir.gc_sharedAir`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:44` · new-session branch only
  - Lean: `: gc (1 / 30) (1 / 20) (1 / 4) (1 / 250) (3 / 40) = 15 / 8 + Real.sqrt 2265 / 24`
  - Means: With the Shared Air coefficients, the critical coupling is g_c = 15/8 + √2265/24.
  - Closest known: Arithmetic with square roots.
  - In Mathlib: partial: Real.sqrt_mul, Real.sqrt_sq (used in the computation)
  - Caveat: Computation.
- **`Wyrd.SharedAir.optimum_bounds`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:54` · new-session branch only
  - Lean: 

    ```lean
    {s : ℝ} (hs : s ∈ Set.Ioo (-(1 / 20) : ℝ) (-(1 / 30))) (hH : H (1 / 30) (1 / 20) (1 / 4) (1 / 250) (3 / 40) s = 0) : -0.048271 < s ∧ s < -0.04827 ∧ 0.08035 < G (1 / 20) (1 / 4) (1 / 250) (3 / 40) s ∧ G (1 / 20) (1 / 4) (1 / 250) (3 / 40) s < 0.08036
    ```

  - Means: With the Shared Air coefficients, any root s of H in (−1/20, −1/30) satisfies −0.048271 < s < −0.04827, and the optimal gain G(s) lies in (0.08035, 0.08036).
  - Closest known: Certified numerical root bracketing (monotonicity plus exact rational evaluation).
  - In Mathlib: no (searched: project definitions H, G)
  - Caveat: Certified computation: H is evaluated at −0.048270930 and −0.048270910 by norm_num. The hypotheses are satisfiable (exists_optimum).
- **`Wyrd.SharedAir.gc_bounds`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:76` · new-session branch only
  - Lean: `: 3.858 < gc (1 / 30) (1 / 20) (1 / 4) (1 / 250) (3 / 40) ∧ gc (1 / 30) (1 / 20) (1 / 4) (1 / 250) (3 / 40) < 3.8581`
  - Means: With the Shared Air coefficients, 3.858 < g_c < 3.8581.
  - Closest known: Numeric bracketing of √2265 between 47.592 and 47.593.
  - In Mathlib: partial: Real.lt_sqrt, Real.sqrt_lt' (used)
  - Caveat: Numeric computation.
- **`Wyrd.SharedAir.stable_at_three`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:88` · new-session branch only
  - Lean: `: ∀ z : ℂ, Pc (1 / 30) (1 / 20) (1 / 4) (1 / 250) (3 / 40) 3 z = 0 → z.re < 0`
  - Means: With the Shared Air coefficients and coupling g = 3, every root of the zero-delay characteristic polynomial has negative real part.
  - Closest known: Instance of stable_iff (Routh–Hurwitz-type).
  - In Mathlib: no (searched: Routh, Hurwitz)
  - Caveat: Zero delay only. The README and docstring say that with delay τ ≳ 1.84 s it is unstable (numerical only).
- **`Wyrd.SharedAir.unstable_every_delay`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:93` · new-session branch only
  - Lean: `{g τ : ℝ} (hg : 15 / 8 + Real.sqrt 2265 / 24 < g) (hτ : 0 ≤ τ) : ∃ s : ℝ, 0 < s ∧ Dd (1 / 30) (1 / 20) (1 / 4) (1 / 250) (3 / 40) g τ s = 0`
  - Means: With the Shared Air coefficients, for every g > 15/8 + √2265/24 (≈ 3.858) and every delay τ ≥ 0, the delayed characteristic function has a positive real root.
  - Closest known: Delay-independent instability through a positive real characteristic root (Hale and Verduyn Lunel 1993; Smith 2011).
  - In Mathlib: no (searched: delay differential, quasi-polynomial)
  - Caveat: A positive characteristic root is not proved here to give a growing solution of the delayed (or nonlinear) model; that needs DDE theory not in Mathlib. The delay placement is a modelling choice.
- **`Wyrd.SharedAir.exists_optimum`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:109` · new-session branch only
  - Lean: `: ∃! s, s ∈ Set.Ioo (-(1 / 20) : ℝ) (-(1 / 30)) ∧ H (1 / 30) (1 / 20) (1 / 4) (1 / 250) (3 / 40) s = 0`
  - Means: With the Shared Air coefficients, H has exactly one root in (−1/20, −1/30).
  - Closest known: Instance of existsUnique_root_H.
  - In Mathlib: no (searched: project definition H)
- **`Wyrd.SharedAir.hasDerivAt_freeEnergy`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/WaterGradient.lean:39` · new-session branch only
  - Lean: 

    ```lean
    {m : ℕ} {K n : Fin m → ℝ} {nE W t : ℝ} {v : ℝ → Fin m → ℝ} (hv : ∀ i, HasDerivAt (fun s => v s i) (flux K n nE W (v t) i) t) (hpos : ∀ i, 0 < v t i) (hE : 0 < VE W (v t)) : HasDerivAt (fun s => freeEnergy n nE W (v s)) (-(∑ i, K i * (n i / v t i - nE / VE W (v t)) ^ 2)) t
    ```

  - Means: Let m cell volumes v_i obey v_i' = K_i(n_i/v_i − n_E/V_E) at time t, with v_i(t) > 0 and outside water V_E = W − Σv_i > 0. Then the free energy F = −Σ n_i log v_i − n_E log V_E has derivative −Σ K_i(n_i/v_i − n_E/V_E)² at t.
  - Closest known: Gradient-flow dissipation identity. Since ∂F/∂v_i = −n_i/v_i + n_E/V_E, the flux law reads v_i' = −K_i ∂F/∂v_i, and dF/dt = −Σ K_i (∂F/∂v_i)² follows by the chain rule. Free energy is a known Lyapunov function for osmotic cell-volume (pump-leak) models: Y. Mori, 'Mathematical properties of pump-leak models of cell volume control and electrolyte balance', J. Math. Biol. 65 (2012) 875–918. That paper uses an infinite bath; here the outside is a closed compartment V_E = W − Σv_i. Background: Kedem and Katchalsky, Biochim. Biophys. Acta 27 (1958).
  - In Mathlib: no (searched: osmo, free energy, gradient flow, Lyapunov)
  - Caveat: Pointwise dissipation identity at one time t, with the trajectory taken as a hypothesis. Monotonicity of F over intervals and global convergence are not stated.
- **`Wyrd.SharedAir.equilibrium_eq`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/WaterGradient.lean:90` · new-session branch only
  - Lean: 

    ```lean
    {m : ℕ} {n : Fin m → ℝ} {nE W : ℝ} {v : Fin m → ℝ} (hn : ∀ i, 0 < n i) (hnE : 0 < nE) (hv : ∀ i, 0 < v i) (hE : 0 < VE W v) (heq : ∀ i, n i / v i = nE / VE W v) : ∀ i, v i = W * n i / (nE + ∑ j, n j)
    ```

  - Means: With positive osmoles, volumes and outside water, equal osmolality everywhere forces v_i = W n_i/(n_E + Σ n_j) for every cell.
  - Closest known: Boyle–van 't Hoff equilibrium (volume proportional to osmole content at equal osmolality).
  - In Mathlib: no (searched: osmo, van 't Hoff)
  - Caveat: Elementary algebra.
- **`Wyrd.SharedAir.aggregate_counterexample`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/WaterGradient.lean:120` · new-session branch only
  - Lean: 

    ```lean
    : (∑ i, ![(1 : ℝ), 1] i) = ∑ i, ![(1 / 2 : ℝ), 3 / 2] i ∧ VE 4 ![(1 : ℝ), 1] = VE 4 ![(1 / 2 : ℝ), 3 / 2] ∧ (∑ i, flux ![1, 1] ![1, 1] 2 4 ![(1 : ℝ), 1] i) = 0 ∧ (∑ i, flux ![1, 1] ![1, 1] 2 4 ![(1 / 2 : ℝ), 3 / 2] i) = 2 / 3
    ```

  - Means: For two cells with n = (1, 1), n_E = 2, W = 4, K = (1, 1), the volume configurations (1, 1) and (1/2, 3/2) have equal total cell water and outside water, but total inflow 0 and 2/3.
  - Closest known: Explicit counterexample (aggregation does not commute with nonlinear flux).
  - In Mathlib: no (searched: project definitions)
  - Caveat: Exact computation (simp; norm_num).
- **`Wyrd.SharedAir.equilibrium_exists`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/WaterGradient.lean:130` · new-session branch only
  - Lean: 

    ```lean
    {m : ℕ} {K n : Fin m → ℝ} {nE W : ℝ} (hn : ∀ i, 0 < n i) (hnE : 0 < nE) (hW : 0 < W) : (∀ i, 0 < W * n i / (nE + ∑ j, n j)) ∧ 0 < VE W (fun i => W * n i / (nE + ∑ j, n j)) ∧ ∀ i, flux K n nE W (fun i => W * n i / (nE + ∑ j, n j)) i = 0
    ```

  - Means: With positive osmoles and total water W > 0, the volumes v_i = W n_i/(n_E + Σn_j) are positive, leave positive outside water, and give zero water flux into every cell.
  - Closest known: Boyle–van 't Hoff equilibrium.
  - In Mathlib: no (searched: osmo, van 't Hoff)
  - Caveat: Elementary algebra.
- **`Wyrd.SharedAir.coins_fair`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Correlation.lean:31` · new-session branch only
  - Lean: `: E (fun u _ _ _ => u) = 0 ∧ E (fun _ e1 _ _ => e1) = 0 ∧ E (fun _ _ e2 _ => e2) = 0 ∧ E (fun _ _ _ e3 => e3) = 0`
  - Means: Under the uniform average over the 16 outcomes of four ±1 coins, each coin has mean 0.
  - Closest known: Direct computation.
  - In Mathlib: no (searched: project definition E; Mathlib's ProbabilityTheory is not used)
  - Caveat: Finite exact computation. 'Independence' holds by construction (uniform product average), not through ProbabilityTheory.iIndepFun.
- **`Wyrd.SharedAir.second_moments`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Correlation.lean:36` · new-session branch only
  - Lean: 

    ```lean
    : E (fun u e1 e2 e3 => X u e1 e2 e3 ^ 2) = 2 ∧ E (fun u e1 e2 e3 => M u e1 e2 e3 ^ 2) = 2 ∧ E (fun u e1 e2 e3 => O u e1 e2 e3 ^ 2) = 10 ∧ E (fun u e1 e2 e3 => X u e1 e2 e3 * M u e1 e2 e3) = 1 ∧ E (fun u e1 e2 e3 => X u e1 e2 e3 * O u e1 e2 e3) = 1
    ```

  - Means: For X = U + e1, M = U + e2, O = U + 3e3 on the 16-point coin space: E[X²] = 2, E[M²] = 2, E[O²] = 10, E[XM] = 1, E[XO] = 1.
  - Closest known: Direct computation.
  - In Mathlib: no (searched: project definitions)
  - Caveat: Finite exact computation.
- **`Wyrd.SharedAir.corr_XM`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Correlation.lean:49` · new-session branch only
  - Lean: `: corr X M = 1 / 2`
  - Means: On the 16-point coin space, corr(X, M) = E[XM]/√(E[X²]E[M²]) = 1/2.
  - Closest known: Direct computation.
  - In Mathlib: no (searched: correlation; Mathlib has ProbabilityTheory.covariance but no Pearson correlation)
  - Caveat: Computation. corr is an uncentred ratio; it equals Pearson correlation because the means are zero (signals_mean_zero).
- **`Wyrd.SharedAir.corr_XO`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Correlation.lean:57` · new-session branch only
  - Lean: `: corr X O = 1 / Real.sqrt 20`
  - Means: On the 16-point coin space, corr(X, O) = 1/√20.
  - Closest known: Direct computation.
  - In Mathlib: no (searched: correlation)
  - Caveat: Computation.
- **`Wyrd.SharedAir.contrast_pos_without_coupling`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Correlation.lean:64` · new-session branch only
  - Lean: `: 0 < corr X M - corr X O`
  - Means: In this explicit model, where X, M and O share only a common input U plus independent noise (O's noise is 3 times larger), corr(X, M) − corr(X, O) = 1/2 − 1/√20 > 0, although no signal is directly coupled to another.
  - Closest known: Attenuation of correlation by independent noise (Spearman, 'The proof and measurement of association between two things', Am. J. Psychol. 15, 1904); common-cause confounding.
  - In Mathlib: no (searched: correlation, covariance)
  - Caveat: A single explicit toy counterexample, not a general theorem about 'noisier controls'.
- **`Wyrd.SharedAir.signals_mean_zero`** · `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Correlation.lean:73` · new-session branch only
  - Lean: `: E X = 0 ∧ E M = 0 ∧ E O = 0`
  - Means: On the 16-point coin space, the signals X, M and O each have mean 0.
  - Closest known: Direct computation.
  - In Mathlib: no (searched: project definitions)
  - Caveat: Finite exact computation.

## 3. Genuinely unresolved claims

Nothing here is proved. It covers Lean drafts that still contain `sorry`, prose claims with no matching theorem, claims that rest on numerics, conditional statements whose hypotheses are never discharged, and places where the English says more than the Lean.


### 3a. Lean declarations that are not proved

These drafts on the prime-proof branch end in `sorry`. The build does not import them and no audit counts them. The new-session branch proves every one of them with an identical statement (whitespace aside), so they are superseded, not open.

- `Wyrd.PeriodicNS.quantities_v` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Averages.lean:15`: For the explicit field v = (sin y, sin z, cos x − cos(x+y)) on [0,2π]³, with derivatives taken by Lean's deriv and averages taken as normalised triple integrals, the energy is 1, the enstrophy 5/4, ⟨|∇ω|²⟩ = 7/2, the stretching S = 1/4 and ⟨|∇v|²⟩ = 5/2. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.core_volume` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/CoreScaling.lean:18`: For real τ > 0 and any real h, (τ^{1/2})² · τ^{1/2 − h} = τ^{3/2 − h} (real powers). On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.core_energy` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/CoreScaling.lean:23`: For real τ > 0, τ^{3/2 − h} · (τ^{−(1/2 + h)})² = τ^{1/2 − 3h}. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.energy_vanishes_speed_blows` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/CoreScaling.lean:29`: If −1/2 < h < 1/6, then as τ → 0⁺, τ^{1/2 − 3h} → 0 and τ^{−(1/2 + h)} → +∞. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.div_v` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:21`: The field v = (sin y, sin z, cos x − cos(x+y)) has zero divergence at every point of ℝ³ (partial derivatives taken by Lean's deriv). On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.curl_v` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:25`: The curl of v, computed with deriv, is ω = (sin(x+y) − cos z, sin x − sin(x+y), −cos y), as functions on ℝ³. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.grad_v` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:32`: Lists all nine partial derivatives of the components of v as explicit functions on ℝ³. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.grad_curl_v` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:40`: Lists all nine partial derivatives of the vorticity components of v as explicit functions on ℝ³. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.v_smooth` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:50`: The map ℝ³ → ℝ³ given by v is real-analytic. In the Mathlib pinned here, ContDiff takes its order in WithTop ℕ∞, and ⊤ there is ω (analytic), not ∞ (C^∞). So `ContDiff ℝ ⊤` asserts C^ω, and in particular C^∞. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.v_periodic` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Example.lean:55`: Each component of v is 2π-periodic in each of x, y and z. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.cutoff_bound` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Galerkin.lean:15`: For a finite index set, if every k2 i ≤ K² and every a i ≥ 0, then Σ k2 i · a i ≤ K² · Σ a i. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.galerkin_enstrophy_bound` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Galerkin.lean:21`: Under the same hypotheses as cutoff_bound, and assuming Σ a ≤ Σ a₀, it follows that ½ Σ k2·a ≤ K² · ½ Σ a₀ (read: Z_K ≤ K² E_K(0)). On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.gronwall_variable` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Gronwall.lean:15`: If a is continuous on ℝ, Z is differentiable everywhere with derivative Z', and Z' ≤ a·Z for t ≥ 0, then Z(t) ≤ Z(0)·exp(∫₀ᵗ a) for every t ≥ 0. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.stretching_estimate_step` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Gronwall.lean:23`: For reals with ν, δ, D ≥ 0, S ≤ (1 − δ)νD + aZ implies S − νD ≤ aZ. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.not_B_implies_D` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Quantifiers.lean:27`: For abstract types and predicates, if the zero force is admissible, then the failure of 'every admissible datum is smooth with zero force' gives an admissible datum and admissible force that are not smooth. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.D_and_B_consistent` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Quantifiers.lean:34`: In the toy model with data in Unit, forces in ℕ (admissible if ≤ 1), and 'smooth iff f = 0', both AltB and AltD hold. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.quantities_smul` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:23`: For every real A, the field A·v has E = A², Z = 5A²/4, D = 7A²/2 and S = A³/4. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.rates` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:29`: With ν = 1/28, S − νD equals 1/8 for v and −3/8 for −v. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.opposite_signs` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:35`: If ν > 0 and A > 14ν, then S − νD is positive for A·v and negative for −A·v. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.same_spectrum` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:41`: For every wave vector k ∈ ℤ³, each component of −A·v has a Fourier coefficient (normalised integral over [0,2π]³) of the same modulus as the corresponding component of A·v. On the prime-proof branch the proof is `sorry`.
- `Wyrd.PeriodicNS.no_closure` · `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:48`: No function Φ of (E, Z, D, ν) can equal S − D/28 on both v and −v, because those two fields share E, Z and D but S − D/28 differs (1/8 versus −3/8). On the prime-proof branch the proof is `sorry`.

### 3b. Claims without a matching proof


#### The English says more than the Lean

- **'Formal proofs of these facts (in Lean 4) live in wyrd/'. These facts include 'Plain base-26 names have no solution up to N = 18,250'.** (Core wyrd; `experiments/README.md (on both branches; same text)`). Only the coupled-encoding facts in that paragraph are formalised (decode_encode, smallest_pangram_sum). No Lean theorem mentions the plain encoding, and ROADMAP lists 'Plain base-26 has no pangram up to 18,250' as open. checks/README states the limitation correctly, so the overclaim is confined to this sentence of experiments/README. Closest known: None (project-defined puzzle); supported only by the Python and C searches.
- **Rotating ℝ/ℤ by 250/71 and by 37/71 is one map, and every orbit has exactly 71 points** (250 = 37; `Key.lean module docstring and rotation_period docstring; experiments/wyrd-mathlib/README.md (rotation_eq, rotation_period row) (the prime-proof branch)`). Minor. Lean proves only that the points 250/71 and 37/71 of AddCircle 1 are equal and that addOrderOf (37/71) = 71. The maps and the orbit sizes are not stated, although both follow routinely (the orbit of x ↦ x + θ has addOrderOf θ points). Closest known: Rational rotations of the circle are periodic with period equal to the denominator
- **7 is a generator of (ZMod 71)ˣ** (250 = 37; `Key.lean module docstring ('make 7 a generator'); experiments/wyrd-mathlib/README.md ('7 generates')`). Minor. Lean proves orderOf (7 : ZMod 71) = 70. Being a generator of the unit group also needs |(ZMod 71)ˣ| = 70 (ZMod.card_units_eq_totient), which is not stated. Closest known: 7 is the least primitive root modulo 71
- **Adler's equation at detuning 37: with Δ = 2π·37 ('a 250 Hz oscillator against the third harmonic of a 71 Hz reference, 250 − 3·71 = 37'), the averaged phase equation φ' = Δ − k sin φ 'has an equilibrium iff k ≥ 2π·37 and a stable one iff k > 2π·37'** (250 = 37; `Key.lean module docstring (adler_37 bullet) and adler_37 docstring; experiments/wyrd-mathlib/README.md adler_37 row, which states only the equilibrium condition (the prime-proof branch)`). adler_37 only restates the algebra of SharedAir/Locking.lean at Δ = 2π·37 (for k > 0): some φ solves 2π·37 = k sin φ iff k ≥ 2π·37, and one with −k cos φ < 0 exists iff k > 2π·37. No ODE, averaging step, harmonic coupling or Lyapunov stability is formalised; 'stable' is just the sign of the linearisation. The 250 Hz / third-harmonic-of-71 Hz reading exists only in the Key.lean docstring, and Locking.lean derives its averaged equation for 2:1, not 3:1, locking. Closest known: Adler 1946; Strogatz, Nonlinear Dynamics and Chaos (Adler equation)
- **Every Dirichlet character modulo 71 agrees on 250 and 37, 'so every L-function modulo 71 weighs the two alike'** (250 = 37; `experiments/wyrd-mathlib/WyrdMathlib/Key.lean module docstring (dirichletCharacter_lock bullet) (the prime-proof branch)`). Minor. No L-function appears in any Lean statement: dirichletCharacter_lock is `rw [zmod_lock]`, i.e. χ applied to the single element (250 : ZMod 71) = 37. Read as 'the coefficients χ(250) and χ(37) of L(s, χ) agree', the sentence is a one-step corollary; read as the terms χ(n)·n^(−s), it is false, since 250^(−s) ≠ 37^(−s). Closest known: Dirichlet characters mod q are functions on (Z/qZ)ˣ extended by 0, so they are q-periodic (Dirichlet 1837)
- **'A sampler at rate T receives the same samples from the 250 Hz and the 37 Hz tone iff T ∣ 213'** (250 = 37; `experiments/wyrd-mathlib/WyrdMathlib/Key.lean, docstring of strobe_iff (lines 162–163) (the prime-proof branch)`). The theorem docstring says 'tone' without qualification, but for real tones the statement is false: cosines also agree at T = 7, 41, 287 and sines at T = 2 (cos_strobe_iff, sin_strobe_iff). Commit 2a1daf2 changed the module docstring and the README to say 'complex tone' but left this docstring unchanged. The Lean statement itself is about the complex osc and is correct, so only the docstring is ambiguous. Closest known: Aliasing of complex exponentials versus real sinusoids (Oppenheim & Schafer, ch. 2)
- **'Sections 1–3 and 5 are theorems, machine-checked' in Lean** (250 = 37; `experiments/phase_lock_250_37.py module docstring; experiments/README.md (phase_lock_250_37.py section) (the prime-proof branch)`). Minor. Those sections also print and check things no Lean statement contains: the explicit rate lists for T < 300, 287 = 7·41, 7^250 ≡ 20 and 7^37 ≡ 22 (mod 71), floating-point values, and the primes 37, 463, 1741, 2593, 3019, 4297, 4723 ≡ 37 (mod 213). Lean proves the characterisations (lock_periods, strobe_iff, cos_strobe_iff, sin_strobe_iff), seven_no_lock (7^250 ≠ 7^37), exists_prime_in_phase and an unnamed example for 463 only, so most gaps are one-step corollaries.
- **'The oscillator becomes a real one' and 'the sinusoidal oscillator t ↦ exp (2π i t / T)'; 'Two oscillators of one period that start together are phase locked, so a period-71 oscillator reads 250 as 37'** (250 = 37; `experiments/wyrd-mathlib/README.md (Lock section intro); experiments/wyrd-mathlib/WyrdMathlib/Lock.lean module docstring (osc_eq_iff bullet); experiments/README.md and experiments/wyrd/README.md (the prime-proof branch)`). Minor. osc T : ℤ → ℂ is defined only at integer ticks and equals Mathlib's standard additive character of ZMod T (ZMod.stdAddChar_coe), so no continuous-time signal or dynamics is formalised, though the module docstring writes it as t ↦ exp(2πi t/T). 'Phase locked' in the READMEs names the congruence n ≡ m (mod T) (Locked), not locking of coupled oscillators, and the osc docstring itself ('sampled at the integer tick n') is accurate. Closest known: Additive characters of Z/TZ; for real phase locking, Adler 1946 and Kuramoto
- **dark_band_of_red_le: the dark band 'holds for every colour from red (n ≥ 1.331) up'.** (Rainbow; `experiments/wyrd-mathlib/README.md, rainbow table, dark_band_of_red_le row (new-session line 42)`). Lean also assumes n < 2, so the README's unbounded 'n ≥ 1.331' is broader than the theorem. This is irrelevant for water (n < 1.35), and the statement in fact holds in the model for every n ≥ 1.331 (checked numerically up to n = 10), so this is only a formal gap. 'Every colour' also relies on the modelling identification of colours with indices.
- **The alexander_dark_band row says 'No light with one or two internal reflections leaves between 43° and 50°', with no qualifier on the index.** (Rainbow; `experiments/wyrd-mathlib/README.md, rainbow table, alexander_dark_band row (new-session line 37)`). alexander_dark_band is proved only for n = 4/3, and dark_band_of_red_le extends it only to 1.331 ≤ n < 2. In the same model the secondary bow drops below 50° for n < ≈1.3296 (recomputed 1.32962; VisibleBand.lean's docstring puts this at about 726 nm at 20 °C), and the primary exceeds 43° for n < ≈1.3267, so the unqualified 'No light' is false in the model for the deepest red in sunlight. No theorem covers 1.3296 ≤ n < 1.331, although the statement holds there. Closest known: Alexander of Aphrodisias, c. 200 AD; Descartes 1637; Newton, Opticks Prop. IX
- **ROADMAP: 'the dark band holds for every colour from red up'.** (Rainbow; `experiments/wyrd/ROADMAP.md, Rainbow colours item (new-session lines 33–36)`). dark_band_of_red_le assumes 1331/1000 ≤ n < 2, and unlike the README the ROADMAP drops the n ≥ 1.331 qualifier. Visible deep red has n < 1.331 (the project puts 1.331 at about 663 nm, 20 °C) and is not covered. Below n ≈ 1.3296 (recomputed 1.32962) the 50° edge actually fails in the model, as VisibleBand.lean's docstring admits.
- **'Mathlib's bounds stop at degree 3' (README) and 'Mathlib stops at x − x³/6 ≤ sin x and 1 − x²/2 ≤ cos x' (TrigBounds.lean docstring), given as the reason the project proves Taylor bounds to degree 7.** (Rainbow; `experiments/wyrd-mathlib/README.md, paragraph after the rainbow table (new-session lines 44–46); WyrdMathlib/Rainbow/TrigBounds.lean module docstring (line 7)`). Mathlib also has Real.sin_bound (|x| ≤ 1: |sin x − (x − x³/6)| ≤ |x|⁵/100, giving a degree-5 upper bound), Real.cos_bound (error 5|x|⁴/96), and Complex.exp_bound and taylor_mean_remainder_lagrange for any degree; only the global one-sided lemmas in Trigonometric/Bounds.lean stop at degree 3. An exact-rational check shows Mathlib's ready-made sin bounds (sin_bound above, sin_ge_sub_cube below) would give primary_bow_water and primary_red, but not primary_violet or any secondary bracket, including secondary_bow_water. So the project's degree-5/7 bounds are needed for most brackets; the error is in describing what Mathlib offers. Closest known: Real.sin_bound, Real.cos_bound, Complex.exp_bound in Mathlib
- **For every periodic pulse shape, forcing through sin θ has zero first-order average along any n:m orbit with m > 1.** (Body water and Limits; `README Limits table, 'Ratios other than n:1' row`). A minor gap. The Lean needs P continuous and m ∤ l·n (coprime n, m in model_forcing_misses_n_m). For a non-reduced ratio such as 2:2 the average need not vanish. Closest known: Fourier orthogonality.
- **The co-arousal equilibrium that appears by g = 2.1 is the one that is linearly stable at g = 3 ('a co-arousal equilibrium appears by g = 2.1, and at g = 3 it is linearly stable'). Equivalently, the second stable state is shown to appear between 2 and 2.1.** (Body water and Limits; `README Limits table, 'Test 4's second state' row; Limits/Bistability.lean module doc ('So the second state appears between 2 and 2.1')`). coarousal_exists_above_two certifies the equilibrium with y ∈ [1.3, 1.4]. Numerically that is the saddle branch (real eigenvalue ≈ +0.0127). The stable equilibrium at g = 2.1 (y ≈ 1.726) is not certified, and no theorem connects the g = 2.1 point to the stable point at g = 3 (y ≈ 2.791). Lean shows only that some non-rest equilibrium exists at 2.1 and that a stable one exists at 3. Closest known: Saddle-node (fold) bifurcation: a saddle and a node are born together (Kuznetsov, Elements of Applied Bifurcation Theory).
- **Under a perfect n:m lock the k-th harmonic index is 1 if n ∣ k, and 0 otherwise.** (Body water and Limits; `README Limits table, 'Ratios other than n:1' row`). A minor gap. lockIndex_eq_zero needs Nat.Coprime n m, and the README row omits it. For a non-reduced ratio, e.g. lockIndex 1 2 2 ψ₀ = 1 although 2 ∤ 1. The Ratios.lean doc states gcd(n, m) = 1. Closest known: Discrete Fourier orthogonality; synchrogram band counting (Schäfer et al. 1998).
- **'Proved, phase family: ... zero initial growth at φ = π/3 (ν = 1/28)'** (Navier–Stokes I; `experiments/ns-phase-audit/README.md:64, 'The Lean side' bullet list (new-session)`). The bullet lists 'zero initial growth' under 'Proved', but Lean proves only that the static expression S − νD for 1·u_{π/3} at ν = 1/28 equals 0 (zero_growth_at_pi_div_three). Reading that as dZ/dt(0) = 0 needs the enstrophy balance and local existence. This README never names those two facts; it says only that the Lean 'does not contain NS solution theory' and that 'No time-dependent claim ... is a Lean theorem'. The wyrd-mathlib README uses the same words without the 'Proved' label. Closest known: Lu & Doering 2008, Indiana Univ. Math. J. 57, 2693 (instantaneous enstrophy growth)
- **'So S − νD > 0 exactly when cos φ > 14ν/A'** (Navier–Stokes I; `experiments/wyrd-mathlib/README.md:100, phase-family table row quantities_vphi, growth_iff (new-session)`). The row drops growth_iff's hypothesis 0 < A and never says that the functionals are those of the scaled field A·u_φ (its E, Z, D, S values are for A = 1). For A < 0 the inequality reverses, because S − νD = (A²/4)(A cos φ − 14ν). The overstatement is minor.
- **README: 'energy_vanishes_speed_blows: A shrinking core can carry vanishing energy while its speed blows up.'** (Navier–Stokes II; `experiments/wyrd-mathlib/README.md, Periodic Navier–Stokes table`). The Lean proves only that τ^{1/2−3h} → 0 and τ^{−(1/2+h)} → ∞ as τ → 0⁺. No core, velocity field or energy integral is constructed; the file's own docstring says 'exponent arithmetic only'. The kinematic claim is true and easy, but it is not what Lean states. Closest known: Kinetic energy is supercritical under Navier–Stokes scaling (Leray 1934).
- **'Above g_c it is unstable for every delay' (README, citing delay_unstable, unstable_every_delay)** (Shared Air; `experiments/wyrd-mathlib/README.md Shared Air table; Specific.lean docstring`). The Lean statement is that the real characteristic quasi-polynomial Dd has a positive real root for every τ ≥ 0. Turning that root into an exponentially growing solution of the linear DDE (easy: e^{st}v with v in the kernel of delayMatrix(s)) and into instability of the nonlinear delayed model (needs DDE linearised-instability theory) is not formalised. Where the delay sits is a modelling choice. Closest known: Hale and Verduyn Lunel 1993, characteristic equations of retarded FDEs
- **'A noisier control adult makes corr(infant, mom) − corr(infant, control) positive with no bond at all'** (Shared Air; `experiments/wyrd-mathlib/README.md Shared Air table (cites contrast_pos_without_coupling)`). Lean proves one explicit 16-outcome example (control noise 3 times the infant/mom noise). The general claim that any noisier control yields a positive contrast is not proved, though it follows easily from Spearman's attenuation formula. Closest known: Spearman 1904 correction for attenuation
- **Headline: 'on the order of 2 × 10¹¹ equation pangrams in all' (Prime-26).** (Searches and drafts; `experiments/prime-pangram/search/README.md item 4; search/results/results.json equation_pangram_estimates.headline; prime-pangram/README.md (both branches)`). The sampled estimates cover only pangrams whose words have at most 5 letters (K≤5: 2.5e11 ± 0.7e11); the K=6 run never finished, and the text argues only that 8+-letter words are impossible and that 7-letter words contribute about 1e7–1e8. Pangrams containing a 6-letter word are not excluded and nothing bounds their number: for example, a 6-letter word beginning with B plus four 1-letter words can be balanced by two 5-letter words, a 4-letter word and two 1-letter words. So 'in all' is not supported; the figure is an estimate for words of at most 5 letters. Closest known: None. It is a Monte Carlo estimate over a project-defined universe.

#### Conditional: hypothesis never discharged

- **The pair is bistable (two locally asymptotically stable equilibria of the nonlinear model at g = 3).** (Body water and Limits; `README Limits table ('at g = 3 it is linearly stable, so the pair is bistable'); Bistability.lean doc`). Lean proves only that the Jacobian eigenvalues lie in the open left half-plane at both equilibria (coarousal_stable_at_three; SharedAir.stable_at_three). Passing to nonlinear local asymptotic stability needs Lyapunov's indirect method, which is not formalised and not in Mathlib (grep 'Lyapunov' found nothing). Closest known: Lyapunov's indirect (linearisation) method; Hartman-Grobman.
- **The system's best recovery needs g* > 0, so no coupling serves both mom and infant.** (Body water and Limits; `README 'Whose good' row; Limits/Objective.lean doc`). 'Best' is the zero-delay spectral rate (SharedAir.optimal_coupling), not a trajectory-level recovery. infant_best_moves_mom quantifies over LinSol solutions, which are assumed rather than constructed. Closest known: Spectral abscissa optimisation.
- **'φ = π/3 has zero initial growth at ν = 1/28', and the theorem name growth_iff, which present the static condition on S − νD as enstrophy growth** (Navier–Stokes I; `wyrd-mathlib README phase-family table (zero_growth_at_pi_div_three, growth_iff)`). Lean proves only that the static expression S − νD equals 0, or is positive. Reading it as dZ/dt at t = 0 needs local existence and the enstrophy balance, neither of which is formalised. Closest known: Lu & Doering 2008 (instantaneous enstrophy growth rate)
- **Z(T, φ) = Z(T, −φ) for the NS evolution, so φ = 0 is always a stationary point of φ ↦ Z(T, φ)** (Navier–Stokes I; `PhaseSymmetry.lean module docstring`). It needs existence and uniqueness of smooth solutions on [0,T], NS equivariance under rotShift, and differentiability in φ. None is formalised. Lean has only the field identity rotShift(u_φ) = u_{−φ} and the t = 0 evenness. Closest known: Symmetry arguments for Taylor–Green (Brachet et al. 1983)
- **A cos mφ term (|m| ≥ 2) in the enstrophy Taylor series cannot appear before t^{3|m|}, is ν-free there, and the t⁷ cos 2φ term is ∝ ν (zero for Euler)** (Navier–Stokes I; `wyrd-mathlib README phase-family table (not_before, at_first_order, order_seven_m_two); ns-phase-audit README`). Lean proves only the integer-count arithmetic. The PDE statement additionally needs P1 and the monomial/grading structure, both unformalised. The README table says 'given the 2D-3C fact' but does not mention the monomial-structure input. Closest known: No published source found for this family
- **For Euler (ν = 0), the Laurent coefficient z_{n,m} of the enstrophy series is 0 unless n ≡ m (mod 2)** (Navier–Stokes I; `SelectionRules.lean docstring (euler_parity bullet); AUDIT.md §4.2 consequence 4 (new-session)`). euler_parity proves only integer parity for a Counts record, with e = 0 supplied through the hypothesis hg. The PDE statement also needs the monomial/grading structure of [tⁿ]Z, which is not formalised. My float Taylor series agrees numerically: at ν = 0, |z_{n,m}| ≤ 6e-17 for every n ≤ 10 with n − m odd. Closest known: Time-reversal symmetry of the Euler equations (u(x,t) ↦ −u(x,−t))
- **No exact law dZ/dt = Φ(E, Z, D, ν) holds for all smooth solutions.** (Navier–Stokes II; `SignFlip.lean docstring on the new-session branch, explicitly marked 'not formalised'. The unimported the prime-proof branch draft of SignFlip.lean states it as a 'Consequence' without that caveat.`). Lean proves only the instantaneous version for the fields ±v at ν = 1/28 (no_closure, with no_spectral_closure as the Fourier-magnitude analogue). Turning it into a statement about solutions needs the enstrophy balance and local existence of smooth solutions from ±A v, both unformalised. The step is mathematically standard, but it is not proved here. Closest known: Local existence: Leray 1934; Fujita & Kato 1964. The parity argument is elementary.
- **In an exact unforced, Leray-projected Fourier–Galerkin truncation, the energy does not increase, so Z_K(t) ≤ K² E_K(0), a bound that grows without limit as K → ∞.** (Navier–Stokes II; `Galerkin.lean docstring; README row for galerkin_enstrophy_bound ('A fixed Fourier cutoff gives Z_K ≤ K² E_K(0)')`). No Galerkin system is defined. The energy non-increase is the hypothesis henergy, and the theorem is a finite-sum inequality. 'Worse as K → ∞' is prose. Closest known: The Galerkin energy equality (Temam 1977; Constantin & Foias 1988).
- **'At zero delay the rest state is stable exactly when g < g_c = 15/8 + √2265/24 ≈ 3.858' (README, citing stable_iff, gc_bounds)** (Shared Air; `experiments/wyrd-mathlib/README.md Shared Air table`). stable_iff, together with det_charMatrix and hasFDerivAt_field, proves only that every eigenvalue of the zero-delay linearisation at rest has negative real part iff g < g_c. No theorem says that solutions of the linear or nonlinear system decay or grow. The nonlinear statement needs Lyapunov's indirect method (not in Mathlib) for g ≠ g_c, plus a centre-manifold argument at g = g_c, where one eigenvalue is 0; numerically that boundary case goes the README's way. Closest known: Lyapunov's indirect method (linearised stability theorem); Routh–Hurwitz criterion
- **'At zero delay there is exactly one best coupling g*' interpreted as the best coupling of the Shared Air model** (Shared Air; `experiments/wyrd-mathlib/README.md Shared Air table`). optimal_coupling with optimum_bounds proves g* is the unique maximiser over g ≥ 0 of the spectral decay rate of the zero-delay linearisation. It says nothing about the source's recovery statistic, or the nonlinear, noisy or delayed model; Optimal.lean's docstring says so explicitly. Closest known: Spectral-abscissa minimisation (Burke–Lewis–Overton 2001)
- **'First-order averaged 2:1 locking holds iff |Δ| < k' as a statement about the Shared Air population model** (Shared Air; `experiments/wyrd-mathlib/README.md Shared Air table; Locking.lean docstring`). Lean proves a trig fact about φ' = Δ − k sin φ, with stability encoded as −k cos φ < 0. The averaging reduction from the forced, noisy population model (with k = ε a₂/2) is not formalised, and the docstring calls it a first-order approximation. Closest known: Adler 1946; averaging theorem (Sanders, Verhulst and Murdock, Averaging Methods in Nonlinear Dynamical Systems)
- **'That linear system really is the Fréchet derivative of the model's nonlinear field (cap and cubic terms included) at rest' (README row citing hasFDerivAt_field and linField_eq_sysMatrix)** (Shared Air; `experiments/wyrd-mathlib/README.md, Shared Air table, first row`). Lean proves this for `field`, the project's own transcription of the source's 'Perceived' equations at zero input, zero noise, baseline 0, steadiness 1 and zero delay. Specific.lean's docstring says the source's default delay is 1.5 s, so the model the source actually runs is a delay system, and `field` is not that system. Whether `field` matches the source cannot be checked in the repository. Closest known: Jacobian linearisation at an equilibrium; Hale and Verduyn Lunel 1993 for linearising retarded functional differential equations

#### Prose only, no theorem

- **'`n` has a divisor `d` with `2 ≤ d < n`, `d ≤ 65`. Every composite number below 4295 has one, since `66² > 4295`.' (docstring of hasSmallDiv)** (Core wyrd; `experiments/wyrd/Wyrd/Minimal.lean, docstring of hasSmallDiv (both branches)`). Minor. The composite-divisor fact is not stated in Lean and is not needed, because the minimality proof uses only the converse direction (a prime has no small divisor, rejectB_false) together with VB_complete. The fact is true: no composite below 4295 lacks a divisor 2 ≤ d ≤ 65. Closest known: Elementary: a composite n has a prime factor ≤ √n, and √4294 < 65.6.
- **The real cosine has the 'mirror keys' 7 and 41 (287 = 250 + 37 = 7·41), which the complex tone lacks; the full list of cosine sampling rates is {1, 3, 7, 41, 71, 213, 287}** (250 = 37; `Key.lean (module docstring, cos_strobe_iff docstring), experiments/wyrd-mathlib/README.md and experiments/README.md for 287 = 7·41 and the mirror keys; the explicit rate list appears only in phase_lock_250_37.py section 2 (the prime-proof branch)`). Minor. Lean proves cos_strobe_iff (T ∣ 213 ∨ T ∣ 287) and strobe_iff (T ∣ 213) but never states 287 = 7·41, the list of rates, or that 7 and 41 fail for the complex tone. Each follows in one step, and the script checks the lists numerically for T < 300. Closest known: Sampled real sinusoids alias at f' ≡ ±f (mod fs) (Oppenheim & Schafer)
- **'The light piles up where D is stationary, and that bright fold is the bow' (a caustic).** (Rainbow; `experiments/wyrd-mathlib/README.md, rainbow intro (about lines 23–26); Defs.lean module docstring`). There is no intensity or ray-density model. The theorems prove only that dev has a unique strict minimum on [0, π/2]; they do not prove that brightness concentrates there. Closest known: In geometric optics, intensity is proportional to sin 2i / (sin D · |dD/di|), so it carries the factor 1/|dD/di|, which diverges at the stationary ray (Adam, Phys. Rep. 356 (2002), §1.5, eq. (1.15)); Airy's 1838 wave theory.
- **The sky between the bows is darker ('which is why the sky between the bows is darker').** (Rainbow; `README.md alexander_dark_band row; DarkBand.lean and VisibleBand.lean docstrings`). The Lean only excludes once- and twice-reflected refracted rays from the 43–50° band (for n = 4/3, or n ∈ [1.331, 2)). Brightness is not modelled. The README itself says 'darker, not black'. Closest known: Alexander of Aphrodisias (c. 200 AD); Descartes 1637.
- **The constants represent real water: n = 4/3 is 'water', 1.331 is red (663 nm at 20 °C, 694 nm at 10 °C) and 1.343 is violet (402–410 nm).** (Rainbow; `README.md rainbow section; SpectrumPrimary.lean, SpectrumSecondary.lean and VisibleBand.lean docstrings`). The theorems are about the rational numbers 4/3, 1331/1000 and 1343/1000 only. Mapping them to wavelengths and temperatures is a modelling input taken from measured dispersion data, not mathematics. Closest known: Measured dispersion of water (e.g. Hale & Querry, Appl. Opt. 1973; Daimon & Masumura, Appl. Opt. 2007); not checked here.
- **Historical attribution: the closed form cos² i = (n² − 1)/(k(k+2)) is 'due to Newton and Halley (around 1700)'.** (Rainbow; `Defs.lean module docstring`). This is history, not mathematics. Halley's 1700 Phil. Trans. paper (vol. 22, no. 267) exists, but I did not verify that it states the general-k formula; its title speaks of the diameters of both bows. Newton does state the general-k condition in Opticks (1704), Book I Part II, Prop. IX (the numbers 3, 8, 15, 24, … are k(k+2)), and Adam (Phys. Rep. 356, 2002) credits Newton as the first to derive the bow after any number of reflections, so the Newton half of the attribution checks out. Closest known: C. B. Boyer, The Rainbow: From Myth to Mathematics (1959)
- **A large enough disturbance flips the pair from rest into sustained co-arousal (the size of the second state's basin and its boundary).** (Body water and Limits; `Limits/Bistability.lean module doc: the source quote 'a large enough disturbance flips the pair into sustained co-arousal', introduced with 'this is exact', and later 'Not proved: the size of the disturbance that flips the pair'. The README Test 4 row says only 'bistable'.`). No theorem covers basins of attraction, separatrices or trajectories. The Bistability results are about equilibria and Jacobian spectra only. The file's own 'Not proved' line says so, although its opening 'this is exact' sentence introduces the source quote that contains the flipping claim. Closest known: Basin boundaries via the stable manifold of the saddle in bistable systems (Strogatz 1994).
- **The rising side of Test 4's inverted U is 'a second stable state' of the model. This is the source's wording; the module doc quotes it and introduces it with 'For the deterministic perceived world ... this is exact', and the README titles the row 'Test 4's second state'.** (Body water and Limits; `Limits/Bistability.lean module doc, lines 7-11 and 32-34; README Limits table, 'Test 4's second state' row`). No theorem mentions the Test 4 statistic or an inverted-U shape. Every result is about equilibria of the zero-delay, noise-free field. The project makes no claim about delay or noise: the file says 'Not proved: ... anything about delay or noise' and calls this 'one mechanism that could produce the shape, not evidence', so the gap is disclosed. Closest known: Not Yerkes-Dodson: no arousal-performance law is formalised or implied.
- **To first order in ε, locking near n:m is decided by the average of the forcing along the unperturbed orbit.** (Body water and Limits; `Limits/Ratios.lean module doc ('standard averaging theory, not formalised here')`). No averaging theorem is formalised. resonant_average_vanishes only computes the integrals. Closest known: First-order averaging (Sanders, Verhulst & Murdock 2007); Pikovsky, Rosenblum & Kurths 2001.
- **For the model's own pulse P = exp(2(cos ψ − 1)) − c, the n:1 first-order average need not vanish, because its n-th Fourier coefficient (proportional to e^{-2} I_n(2)) is nonzero.** (Body water and Limits; `Limits/Ratios.lean module doc ('true but not formalised')`). No theorem covers the model's P on an n:1 orbit. n_one_average uses the test pulse cos(nψ), and no Bessel-function fact is formalised. The doc itself says 'true but not formalised'. Closest known: Generating function of the modified Bessel functions, exp(z cos ψ) = Σ I_k(z) e^{ikψ}.
- **Covariance and correlation of the stationary sinusoids have the same sign and peak, so the results speak of the 'correlation peak'.** (Body water and Limits; `Limits/Direction.lean module doc ('not formalised'); README 'Direction of influence' row says 'correlation peak'`). All Direction theorems are about xcov (one-period covariance of pure sinusoids), not the Test 2 correlation statistic on real signals. Closest known: Normalisation of cross-covariance by the standard deviations.
- **The nearer-mean decision rule errs with probability at most δ once n ≥ 4σ²/(δΔ²).** (Body water and Limits; `Limits/Sessions.lean module doc; README 'How many sessions' row`). A minor gap. sessions_enough bounds P(|mean - m| ≥ Δ/2), which contains the error event, but the decision rule itself is not formalised. Closest known: Chebyshev-based sample-size bound.
- **D₂O overstates total body water by about 4%.** (Body water and Limits; `BodyWater/Compartments.lean module doc; README Body water table`). An empirical literature value. dilution_overestimate only proves the generic 1/(1 - e) factor. Closest known: Schoeller et al. 1980 (2H space about 3% above the 18O space).
- **The result is consistent with term SGA infants (more water) and LGA infants (more fat).** (Body water and Limits; `BodyWater/Newborn.lean doc; README 'more_water_less_fat' row`). The Lean is only the monotonicity of 1 - t/h at a fixed h. The empirical pattern and equal fat-free-mass hydration are assumptions that the file flags as possibly false for SGA infants. Closest known: Fomon et al. 1982 (reference-infant body composition at birth; it does not itself compare SGA and LGA infants); the source chapter.
- **Iso-osmolar dextrose does change cell water: once the glucose is metabolised it acts as free water and mostly enters the cells. Permeant solutes such as urea do not shift water.** (Body water and Limits; `README Body water table, isotonic_stays_extracellular row ('iso-osmolar dextrose does not'); Osmotic.lean module doc and the docstrings of isotonic_stays_extracellular and solute_load_shrinks_cells`). The model has only effective (impermeant) osmoles, with no glucose uptake or metabolism and no permeant solutes, so neither the dextrose sentence nor the urea sentence is a theorem. The dextrose case would follow from water_load_split only if infused dextrose is treated as pure free water, which the prose asserts but no theorem encodes. Even then 'mostly enters the cells' holds for adult proportions (2/3) but not for the file's own term-newborn proportions (newborn_water_load: 34/78 < 1/2). Closest known: The tonicity-versus-osmolality distinction in textbook physiology (Rose & Post).
- **Isotonic saline stays outside the cells, but most of it moves to the interstitium rather than staying in the vessels.** (Body water and Limits; `BodyWater/Osmotic.lean module doc, lines 19-21 ('Outside the cells is not the same as inside the vessels: most of it moves to the interstitium')`). The first half is isotonic_stays_extracellular. The second half has no theorem: Osmotic.lean models only ICW versus ECW, and Compartments.lean defines plasma and interstitial volumes only statically, with no Starling forces and no distribution of an infusion between them. Closest known: Distribution of crystalloid between plasma and interstitium in proportion to their volumes (Starling forces).
- **Without the capacity limit, any equilibrium other than rest forces P(0, g) < 0, 'so rest is already unstable', for any positive coefficients with cubic damping κ > 0.** (Body water and Limits; `Limits/Bistability.lean module doc (bullet for no_coarousal_without_cap_general)`). no_coarousal_without_cap_general concludes only P(0, g) < 0. No theorem turns that into a positive real eigenvalue of the rest linearisation for general coefficients: it would follow from delay_unstable at τ = 0 together with det_charMatrix, while stable_iff needs Hyp. Instability of the nonlinear rest state would further need the linearised-instability theorem, which is not in Mathlib. Closest known: A monic real cubic with negative constant term has a positive real root.
- **Using an adult water fraction (about 0.6) for a newborn understates the free-water deficit.** (Body water and Limits; `BodyWater/Sodium.lean module doc`). No theorem states that W·(Na/140 − 1) increases with W. The companion claim, that it overstates the change per volume, is covered by smaller_body_bigger_change_abs. Closest known: Elementary monotonicity of the free-water-deficit formula in TBW.
- **The ~3.9 bpm chest-warmth effect is the one the source says 'will hide in noise'.** (Body water and Limits; `Limits/Values.lean module doc, lines 13-15 (phrase attributed to the source)`). chest_warmth_bpm proves only the size, 140·(2.2^0.035 − 1) ∈ (3.9, 3.94). Nothing about noise or detectability is formalised. The file attributes the phrase to the source and claims only that 'the stated numbers agree', so this is an unproved statement from the source, not a project overclaim. Closest known: Signal-to-noise and detectability (no specific result).
- **Enstrophy balance dZ/dt = S − νD for smooth solutions of unforced NS on the 2π-torus** (Navier–Stokes I; `Field.lean module docstring; wyrd-mathlib README 'Not formalised'`). Stated as background and explicitly not formalised. Mathlib has no Navier–Stokes theory. It is what turns every S − νD theorem here into a growth statement. Closest known: Classical: Doering & Gibbon 1995, Applied Analysis of the Navier–Stokes Equations; Majda & Bertozzi 2002.
- **Changing φ moves no Fourier magnitude of u_φ; translations can remove three of the four plane-wave phases but not the triad phase φ** (Navier–Stokes I; `PhaseFamily.lean module docstring (marked 'not formalised')`). No Lean theorem concerns the Fourier magnitudes of u_φ or how translations act on its phases; only E, Z and D are shown to be φ-independent (quantities_vphi). So the phase-family version of 'magnitude-only descriptions cannot determine S' is not formalised. It is proved only for ±v in SignFlip.lean (same_spectrum, no_spectral_closure), which is outside this group. Closest known: Triad interactions: Waleffe 1992; Moffatt 2014. Triad phases: arXiv:2105.09425 (Kang, Protas & Bustamante 2021)
- **[tⁿ]Z is a sum of monomials ν^e·(product of initial Fourier factors) with wave-vector balance and grading d + e = n + 2** (Navier–Stokes I; `SelectionRules.lean docstring 'Not formalised here'; AUDIT.md §4.2`). Proved on paper from the Taylor recurrence (AUDIT.md §4.2). It is checked by exact computation only for n ≤ 9, and in floating point for n ≤ 12; the docstring's 'up to order 16' applies only to the β = 0 (P1) runs. It enters the Lean only as the hypotheses Balanced and hg. Closest known: Time-Taylor-series methods: Morf, Orszag & Frisch 1980; Brachet et al. 1983
- **P1 (2D-3C): with β = 0, u₃ evolves linearly and only |m| ≤ 1 occurs, so every |m| ≥ 2 term has a β factor** (Navier–Stokes I; `SelectionRules.lean docstring; ns-phase-audit README; AUDIT.md §4.2–4.3`). The recurrence-level proof is on paper only (AUDIT.md §4.2). The solution-level (finite T) version is verified only numerically and not written out: in one N = 24 DNS the |m| = 2–4 harmonics stay at round-off through T = 4 (at most 4.4e-15 in xcheck/p1_finite_time.log, not the 2e-15 that AUDIT.md states). It enters the Lean only as hypothesis hb. Closest known: Standard invariance of the 2D-3C (z-independent) subspace for NS
- **'Every file builds with no sorry. Audit.lean prints the axioms of 130 theorems: only propext, Classical.choice and Quot.sound.'** (Navier–Stokes I; `experiments/ns-phase-audit/README.md:68, 'The Lean side' (new-session)`). The count is stale: '130' matches Audit.lean at commit 772df99, and e29a9fe added six Scaling prints, giving 136. All 16 public theorems of this group's three files are printed, but the audit reaches neither v_smooth and v_periodic (Example.lean) nor seven Blowup/CoreScaling/Gronwall lemmas, directly or transitively. The axiom output was not re-run because lean could not be run; grep finds no sorry, admit or axiom in any new-session .lean source, every module is imported, and the 55 lake trace logs present record no warnings.
- **v_k is smooth and 2π-periodic for every integer k, so no_power_law_bound refutes the bound over all smooth periodic divergence-free fields.** (Navier–Stokes II; `Scaling.lean docstring ('clear from the definition ... not stated separately'); README row for quantities_vScaled / no_power_law_bound`). Only div_vScaled is proved. Smoothness and periodicity are true and easy (Example.lean proves them for k = 1 as v_smooth and v_periodic) but are not stated for general k. As formalised, the refutation is over the unrestricted Field type, with witnesses that are in fact smooth and periodic. Closest known: Elementary.
- **The classical estimate S ≤ c Z^{3/4} D^{3/4}** (Navier–Stokes II; `Scaling.lean docstring`). It is cited as standard (Calderón–Zygmund plus Gagliardo–Nirenberg) and not formalised. It is only used to note that no_power_law_bound does not contradict it. Closest known: Doering & Gibbon 1995; Lu & Doering 2008, Indiana Univ. Math. J. 57.
- **Vorticity ~ 1/(t_b − t), and its non-integrability is 'exactly the divergence the Beale–Kato–Majda criterion requires of any blow-up'.** (Navier–Stokes II; `Blowup.lean docstring and the vorticity_not_integrable docstring`). BKM is not formalised, and no vorticity of any flow appears. The Lean shows only that t ↦ 1/(t_b − t) is not integrable on [0, t_b]. Closest known: Beale, Kato & Majda 1984, Comm. Math. Phys. 94.
- **Status of the Clay problem: OpenAI's September 2026 manuscript claims blow-up with a smooth external force (Clay alternatives C/D), and Clay's 11 September 2026 statement says the problem has 'apparently been settled', with review ongoing.** (Navier–Stokes II; `experiments/wyrd-mathlib/README.md, end of the Periodic Navier–Stokes section`). This is outside Lean. The Clay wording checks out: claymath.org's 11 September 2026 'Navier-Stokes Announcement' refers to 'the announcement that the Navier-Stokes problem has apparently been settled' and calls its evaluation process 'deliberately unhurried', and press reports describe OpenAI's claim as forced finite-time blow-up. Nothing in this group proves or refutes (B), (C) or (D); Quantifiers.lean proves only the abstract logic ¬B → D and that D does not imply ¬B. Closest known: Fefferman 2000, the official Clay problem description.
- **The fixed-cutoff Galerkin ODE cannot blow up (global existence at fixed K, by the standard energy argument).** (Navier–Stokes II; `experiments/ns-phase-audit/audit_v2/AUDIT.md:153 (new-session), marked PASS for the package's proof_notes §6`). No Galerkin ODE is defined in Lean. galerkin_enstrophy_bound takes energy non-increase as the hypothesis henergy and proves no existence or continuation statement. The catalogue's Galerkin entry covers energy non-increase but not this global-existence claim. Closest known: Standard: ⟨u, P_K N(u)⟩ = 0 gives energy conservation (or decay with viscosity), and Picard–Lindelöf plus continuation then gives global existence (Temam 1977; Constantin & Foias 1988).
- **'A smooth finite-energy example [with these blow-up scalings] would settle the Millennium problem in the blow-up direction.'** (Navier–Stokes II; `experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Blowup.lean docstring (new-session)`). This is not a Lean statement, and it is imprecise. Clay's breakdown alternatives need data and force meeting specific hypotheses, not just smoothness and finite energy: rapid decay of all derivatives on ℝ³ for (C) (conditions (4), (5), with f ≡ 0 allowed), or periodicity for (D) (conditions (8), (9)). Existence of any solution with these scalings is open. Closest known: Fefferman 2000, the official Clay problem description, conditions (4), (5), (8), (9).
- **'Two 24-cell populations with the same synchrony ‖Z₁‖ = 1/2 whose synchrony changes at different rates (K/4 and 0)'** (Shared Air; `experiments/wyrd-mathlib/README.md Shared Air table (cites same_synchrony_different_future_24, synchrony_rates)`). same_synchrony_different_future_24 gives the complex rate Z1dot for 24 cells. The rate of the synchrony ‖Z1‖ along trajectories (synchrony_rates) is proved only for the 4-cell configurations. The 24-cell norm-rate statement follows immediately from the generic lemmas hasDerivAt_Z1_vel and hasDerivAt_norm_of_real_pos but is not a declared theorem. Closest known: Kuramoto moment non-closure (Watanabe–Strogatz 1994; Ott–Antonsen 2008)
- **Osmotic water flow 'is a gradient flow: free energy never increases'; global convergence and no sustained oscillations** (Shared Air; `experiments/wyrd-mathlib/README.md Shared Air table; WaterGradient.lean docstring (the prime-proof branch's older title: 'it settles and cannot oscillate')`). Lean proves a pointwise dissipation identity at one time t under positivity hypotheses (hasDerivAt_freeEnergy) and its sign (dissipation_nonpos). Monotonicity of F along a whole trajectory, flux = −K∇F as a gradient-flow statement, global convergence and no oscillations are not stated. The new-session docstring says convergence is not formalised. Closest known: LaSalle invariance principle / Lyapunov's direct method
- **Dd / delayMatrix is the characteristic equation of the delayed Shared Air model, so delay_unstable and unstable_every_delay are statements about that model** (Shared Air; `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Delay.lean module docstring; README row citing delay_unstable and unstable_every_delay`). delayMatrix is assumed, not derived. No delayed version of `field` exists, Delay.lean does not import Linearization.lean, and no theorem links delayMatrix to linearising any delayed nonlinear system. It puts e^{−zτ} only on the three g-weighted entries and leaves the −1 feedback from z to x undelayed. That placement is a modelling choice, and it determines the quasi-polynomial (delays τ and 2τ on the two loops). Closest known: Characteristic quasi-polynomials of linear retarded DDEs (Hale and Verduyn Lunel 1993)
- **For N ≥ 457001 no five-pair pangram is possible (either naming); plain-rule exclusions N < 1352, odd N and the prime 2 'carry over on paper'.** (Searches and drafts; `experiments/checks/README.md (both)`). The arguments are correct as far as I checked, but they are not formalised. Lean lower_bound, sum_even and two_not_mem are about the coupled encode only. Closest known: Elementary digit-length counting.
- **Prime-26 'proved bounds': equal-sum N even, N < 35152, words ≤ 4 letters, N ≡ 0 (mod 10); equal-difference D even, 26 ∤ D, 28 ≤ D < 17576; letter-sum ≡ 10D (mod 25); mod-25 theorem for perfect and equation pangrams.** (Searches and drafts; `experiments/prime-pangram/search/results/results.json, search/README.md (both)`). Called 'proved' in results.json, but no proof is written down beyond one-line hints, and there is no Lean. The arguments I checked (mod 10, N < 35152, D < 17576) are sound. Closest known: Casting out (base − 1)s: n ≡ digit sum (mod 25) in base 26.
- **P1 at the solution level (β = 0 keeps the flow z-independent, and only |m| ≤ 1 harmonics occur in Z(t)): 'verified numerically ... the proof has not been written out'.** (Searches and drafts; `new-session experiments/ns-phase-audit/audit_v2/AUDIT.md §7.5 and §4.3`). AUDIT.md gives a numerical check and a one-sentence proof sketch, and nothing is formalised. The result follows routinely from known facts: with β = 0, (α e^{−νt} sin y, 0) is an exact shear solution, z-independent data stay z-independent by uniqueness of smooth solutions, and u₃ solves a linear advection–diffusion equation with (y, t)-dependent coefficients that preserves k_x and the e^{±iφ} labels, so Z keeps only |m| ≤ 1. My own float Taylor jet with β = 0 shows no |m| = 2–4 harmonic through order 10 (all ≤ 1e-14). Closest known: 2½-dimensional (2D-3C) flows (Majda and Bertozzi, Vorticity and Incompressible Flow, 2002); global regularity of 2D Navier–Stokes.

#### Numerical evidence only

- **Plain (uncoupled) base-26 names give no five-pair prime pangram up to N = 18,250** (Core wyrd; `experiments/README.md; experiments/wyrd/ROADMAP.md (listed as open)`). Only the Python search supports it; ROADMAP lists the Lean proof as open and no theorem about the plain encoding exists. Closest known: None (project-defined puzzle).
- **Plain naming has no five-pair prime pangram at any sum (via the 457000 cutoff)** (Core wyrd; `experiments/checks/README.md; experiments/README.md`). C/Python enumeration up to 457000 plus a paper cutoff argument; nothing formalised. checks/README says the parity and lower-bound lemmas 'carry over on paper' to the plain rule but are not formalised. Closest known: None.
- **Exactly 12 coupled five-pair pangrams exist (11 sums, all N ≤ 15990); 4296 has a unique solution; 4243 is the smallest maximum prime of any solution** (Core wyrd; `experiments/README.md; experiments/checks/README.md`). Lean proves existence at 4296 and non-existence below 4296 only. Uniqueness at 4296, the full list and the global finiteness/cutoff are computer-search results. Closest known: None.
- **Riemann's oscillators: the phases γ·log x of the first 100 zeta zeros lock near π at prime powers (3, 37, 71 among them) and not at 213 = 3·71; 33 of the 35 strongest locks in 2..100 are prime powers** (250 = 37; `experiments/phase_lock_250_37.py section 4; experiments/README.md; experiments/wyrd/ROADMAP.md (⬜ 'Riemann's oscillators') (the prime-proof branch)`). No Lean statement covers it. The script computes a truncated sum over 100 zeros and checks only that the mean lock at prime powers exceeds the mean elsewhere; the 33/35 figure is printed, not checked. The README and ROADMAP say clearly that this is not a proof. Closest known: Riemann–von Mangoldt explicit formula ψ(x) = x − Σ_ρ x^ρ/ρ − log 2π − ½ log(1 − x⁻²) (von Mangoldt 1895; Davenport, Multiplicative Number Theory, ch. 17)
- **The first primes in phase with 37 on the 213-cycle are 37, 463, 1741, …** (250 = 37; `Key.lean (comment on an unnamed example); experiments/README.md; phase_lock_250_37.py section 5`). Lean has only an unnamed `example` (Nat.Prime 463 ∧ 463 ≡ 37 mod 213) and the existence theorem exists_prime_in_phase. Neither 1741 nor the claim that these are the first is proved. Closest known: Dirichlet 1837 (existence only)
- **True bow angles 42.03° (primary) and 50.98° (secondary) for n = 4/3.** (Rainbow; `experiments/wyrd-mathlib/README.md, rainbow table rows primary_bow_water and secondary_bow_water (new-session lines 35–36)`). Lean proves exact closed forms (primary_bow_water_exact, secondary_bow_water_exact) and the brackets 41–43° and 50–52°, but no theorem states the decimal values. I recomputed them with mpmath: 42.0297° and 50.9781°.
- **Spectrum values 42.37° and 40.65° (primary band about 1.7° wide) and 50.37° and 53.48° (secondary band about 3.1° wide).** (Rainbow; `SpectrumPrimary.lean and SpectrumSecondary.lean module docstrings; experiments/wyrd/ROADMAP.md, open item 'Rainbow width to 0.1°'`). Lean proves 1° brackets and widths of more than 1° and more than 2° only. The ROADMAP marks the 1.7° and 3.1° widths as not yet proved. I confirmed the values numerically (widths 1.72° and 3.11°).
- **The red secondary bracket holds only for n between about 1.3296 and 1.3334, and the 50° edge holds down to n ≈ 1.3296 (about 726 nm at 20 °C).** (Rainbow; `SpectrumSecondary.lean and VisibleBand.lean docstrings`). No theorem states these thresholds; my bisection confirms 1.32962 and 1.33342. The 726 nm wavelength is a physical-data claim that is not checked.
- **The second state appears at g ≈ 2.069 and exists (and is stable) for every g between about 2.069 and 3.** (Body water and Limits; `Limits/Bistability.lean module doc ('numerically near 2.069'); README 'appears by g = 2.1'`). Lean shows no non-rest equilibrium for g ≤ 2, existence only at g = 2.1, and stable existence only at g = 3. The threshold and intermediate g values are numerical (my check gives about 2.0689). No fold bifurcation is proved. Closest known: Saddle-node (fold) bifurcation (Kuznetsov, Elements of Applied Bifurcation Theory).
- **Exact coefficients: [t⁶] cos 2φ = −6487/1555200; [t⁷] cos 2φ = (207269/7257600)ν; z_{9,3} = −21381938959/211843247616000; leading coefficients nonzero for |m| = 2, 3, 4** (Navier–Stokes I; `SelectionRules.lean docstring; ns-phase-audit README items 1–3; AUDIT.md §4`). Exact rational Python computations, not Lean theorems
- **Finite-time results: φ = 0 stops being a local maximum of Z(T,·) at T ≈ 1.764994; T = 2 optimum φ* ≈ 0.970364; rankings of Z(2), Z(4) across φ** (Navier–Stokes I; `ns-phase-audit README items 4–5; AUDIT.md §5`). Finite-cutoff Galerkin DNS in floating point, with no cutoff-uniform error bound, no Taylor remainder bound and no global optimality certificate Closest known: A-posteriori route of Chernyshenko–Constantin–Robinson–Titi 2007, cited in AUDIT.md §7.1
- **Z''(0) = 5/4 − (5/2)ν cos φ + 11ν² for NS from u_φ; also the v1 'high-shell values 7/48 and 9/16' and 'new-mode values 11/24 and 19/16'** (Navier–Stokes I; `AUDIT.md §2 'Earlier (v1) FFT re-derivations' (new-session)`). These are statements about the NS evolution at t = 0, re-derived by FFT to 7e-16 (and Z''(0) also appears in the exact [t²]Z row of AUDIT.md §4.1). No Lean theorem covers them, and the catalogue did not list them. My own float Taylor code reproduces the Z''(0) formula at ν = 0 and ν = 1/28, and my FFT evaluation of P[u_φ × ω_φ] gives 7/48, 9/16, 11/24 and 19/16 to within 1.2e-16 at four values of φ.
- **At finite time the m = 2 harmonic of Z(T) is even in β and O(β²) (c₂/β² ≈ −1.2075e-3 at T = 1, ν = 1/28); further exact values [t⁸] cos 2φ = 7035947189629/3354184753920000 − (7261/120960)ν², z_{10,3} = (22945853676929/20125108523520000)ν, and the order-7 pair split of z_{7,2}** (Navier–Stokes I; `AUDIT.md §4.3 table and following paragraph; §4.4 (new-session)`). These are DNS and exact-rational computations outside Lean, and the catalogue did not list them. My independent float Taylor series reproduces [t⁸] cos 2φ at ν = 0 and ν = 1/28 (relative errors 2e-14 and 8e-15) and z_{10,3} at ν = 1/28 (with z_{10,3} ≈ 1e-17 at ν = 0), and the c₂/β² values match xcheck/p1_finite_time.log. The order-7 pair split was not rechecked.
- **A law S ≈ C Z^0.75 D^0.2 fitted to particular trajectories 'may still describe them'.** (Navier–Stokes II; `Scaling.lean docstring (test 'suggested by ChatGPT'); README row for fitted_law_fails`). The docstring only hedges ('may still describe them') and does not assert this. The fit and its trajectory data come from outside the repo; the docstring credits ChatGPT with the test. Lean refutes only the law's universality (fitted_law_fails) and says nothing about whether it fits any trajectory. Closest known: None; an empirical fit.
- **The λ tables on the slides (CCF, IPM, Boussinesq) are 'high-precision numerical solutions, not proofs'.** (Navier–Stokes II; `Blowup.lean docstring`). The file states that they are numerical, not proofs. The slides and data are not in the repo, and no Lean statement concerns them. Closest known: Possibly Wang et al. 2025, 'Discovery of unstable singularities', arXiv:2509.14185, which treats CCF, IPM and Boussinesq. I have not checked this against the slides.
- **Below g_c, delay destabilises: τ ≈ 1.8356 s at g = 3 and τ ≈ 4.7613 s at g = 1 (two independent methods)** (Shared Air; `experiments/wyrd-mathlib/README.md 'Delay caveat'; Optimal.lean and Specific.lean docstrings`). The README labels this numerical, and no script for it exists in either checkout. An independent imaginary-axis-crossing computation (mpmath, solving D(iω) = 0 for ω and τ) gives τ ≈ 1.835585 at g = 3 (ω ≈ 0.42879) and τ ≈ 4.761272 at g = 1 (ω ≈ 0.22375), both rounding to the README values. The root crosses into the right half-plane as τ increases, so both crossings are destabilising. Closest known: Stability switches in DDEs (Cooke and van den Driessche 1986, Funkcialaj Ekvacioj, D-subdivision method)
- **The source's a₂ ≈ 0.19 matches 2e⁻² I₂(2) ≈ 0.18648** (Shared Air; `experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Locking.lean docstring`). The docstring states it is not proved. My float check gives 0.186478. Closest known: Modified Bessel function series
- **Exactly three equal-difference five-pair Prime-26 pangrams (D = 204, 258, 534); none with equal sum.** (Searches and drafts; `experiments/prime-pangram/search/ (both)`). Exhaustive C search within prose bounds; reproduced, but not formalised. Closest known: None found.
- **NICU: no perfect pangram of pronounceable primes under the English cluster lists; packing bound of 17 consonants; F(2,2) count 11,261,264,735,669; smallest single added cluster is a 3-consonant coda ending in q.** (Searches and drafts; `experiments/prime-pangram/nicu-pangram/README.md (both)`). Python and C exact computations, partly reproduced (task a re-run by me). No formal proof, and the results depend on the hand-chosen cluster lists, which differ from the task statement's (whose '4,644 prime words' figure is not reproduced). Closest known: None.

#### Open problem

- **Full Goldbach conjecture** (Core wyrd; `experiments/wyrd/ROADMAP.md ('The full conjecture is open and won't be settled here')`). Open problem, mentioned only as context; not claimed. Closest known: Goldbach 1742; open.
- **Checking Lucas's certificate is easy but finding every prime key of a general pair means factoring the gap, 'the shape of the P versus NP question'** (250 = 37; `Key.lean module docstring; experiments/wyrd-mathlib/README.md`). The README itself says nothing about P vs NP is decided. The analogy is loose: primality is in P (Agrawal–Kayal–Saxena 2004), and factoring is not known to be NP-hard. No theorem touches complexity. Closest known: P vs NP (Cook 1971; Clay Millennium Problem); AKS 2004
- **Nothing here is conditional on the Riemann Hypothesis** (250 = 37; `Key.lean module docstring; experiments/wyrd-mathlib/README.md`). RH is mentioned only as a disclaimer. The disclaimer is accurate: no theorem in these files assumes RH, and Dirichlet's theorem comes from Mathlib unconditionally. Closest known: Riemann Hypothesis (Riemann 1859; open)
- **The leading coefficient at n = 3|m| is nonzero for |m| ≥ 5** (Navier–Stokes I; `ns-phase-audit README 'Still open'; AUDIT.md §7.5`). Computed only for |m| = 2, 3, 4
- **A cutoff-uniform (continuum) estimate; a remainder bound for the Taylor jet at t = 2 or 4; a global optimality certificate in φ** (Navier–Stokes I; `ns-phase-audit README 'Still open, on both sides'; AUDIT.md §7.1–7.3`). Explicitly listed as open
- **Global regularity of 3D NS (Clay Millennium problem), or the uniform stretching estimate that would let the Grönwall route prove it** (Navier–Stokes I; `wyrd-mathlib README 'Not formalised' paragraph`). The README says the stretching estimate is the open problem itself and is not claimed. No theorem in this group concerns NS solutions at all: each is a static statement about explicit fields at t = 0 (functional values or field identities such as rotShift_vphi) or integer arithmetic. Closest known: Fefferman, Clay problem statement (2000)
- **A uniform estimate S ≤ (1 − δ)νD + a(t)Z with ∫₀ᵀ a < ∞, controlled independently, would bound the enstrophy and so give regularity (the 'Grönwall route').** (Navier–Stokes II; `Gronwall.lean docstring; wyrd-mathlib README 'Not formalised' paragraph`). The README says correctly that this is the open problem itself and that it is not claimed. Lean proves only the Grönwall step and a trivial arithmetic step (stretching_estimate_step). Closest known: Conditional regularity criteria: Prodi–Serrin–Ladyzhenskaya; Beale–Kato–Majda 1984; Escauriaza–Seregin–Šverák 2003 (L³).
- **A Navier–Stokes solution with the anisotropic blow-up scalings l_r ~ τ^{1/2}, u_r ~ τ^{−1/2}, l_θ ~ τ^{1/2−h}, u_θ ~ τ^{−(1/2+h)} with 0 < h < 0.01 exists, and 'viscosity cannot keep pace with the swirl'.** (Navier–Stokes II; `Blowup.lean and CoreScaling.lean docstrings (scalings taken from slides that are not in the repo)`). The files say explicitly that this is exponent arithmetic only and that existence is open, and no solution or velocity field with these scalings is constructed. The 'viscosity cannot keep pace' reading is flagged as heuristic and is not proved. Closest known: Leray 1934 (self-similar ansatz); Nečas–Růžička–Šverák 1996 and Tsai 1998 exclude L³ or locally-finite-energy self-similar profiles, which does not cover h > 0.
- **Exact count of Prime-26 perfect pangrams with words ≤ 6 letters.** (Searches and drafts; `prime-pangram/README.md 'unfinished' item 1; results.json words_le_6_letters: null (both)`). The run died at 75 %; this is a computation to finish, not an open mathematical problem. Closest known: Subset-DP set-partition counting (Björklund, Husfeldt and Koivisto 2009, inclusion–exclusion set partitioning).
- **R(3,0): the minimum number of non-English clusters is 2 or 3.** (Searches and drafts; `nicu-pangram/README.md; prime-pangram/README.md 'unfinished' item 3 (both)`). The exhaustive budget-2 search was stopped after 42 CPU-minutes. Closest known: None.
- **ROADMAP open items (both branches): prove Bertrand's postulate in core Lean (currently borrowed from Mathlib's Nat.bertrand); rainbow band widths to 0.1° (about 1.7° and 3.1°); body water over time (postnatal diuresis model); Goldbach for even N up to a bound; speed up the minimality check.** (Searches and drafts; `experiments/wyrd/ROADMAP.md (both)`). Formalization or modelling to-dos, not open mathematics (except the full Goldbach conjecture, which the roadmap says will not be settled). The band widths are prose-only numbers. Closest known: Bertrand: Chebyshev 1852, Mathlib Nat.bertrand. Goldbach verified to 4·10¹⁸ (Oliveira e Silva, Herzog and Pardi, Math. Comp. 2014).

## 4. Computer searches and numerical checks

Results of running code. A row is a theorem only where it names a kernel-checked Lean declaration.


### Core wyrd: pangram encoding, primes, √2, minimality search; Mathlib bridge

- **Certificate for N = 4296: names of the ten numbers, primality of all ten, pair sums, and the letters forming a permutation of A–Z** (`experiments/wyrd/Wyrd/Pangram.lean (solution_names, solution_isPangram)`)
  - Method: decide +kernel (kernel-evaluated trial division via primeB plus primeB_sound; kernel List.Perm decision)
  - Result: Pairs (1187,3109),(53,4243),(349,3947),(293,4003),(659,3637) are prime, each sums to 4296, and their names UKR TEP DB NMF YL AQV SH CWZ IJ OGX use each letter exactly once
  - Proof status: kernel-checked, sorry-free, no native_decide
- **Candidate-prime superset below 4295** (`experiments/wyrd/Wyrd/Minimal.lean (VB_complete, V_eq)`)
  - Method: decide +kernel over all n < 4295
  - Result: Every n < 4295 is either in VB/V or rejected (n < 3, repeated letter, or a divisor ≤ 65); so V contains every odd prime < 4295 with a repeat-free name
  - Proof status: kernel-checked; Lean proves only the superset direction (which is all the minimality proof needs)
- **Packed name table agrees with encode** (`experiments/wyrd/Wyrd/Minimal.lean (nameOf_all)`)
  - Method: decide +kernel over all n < 4295
  - Result: nameOf n = encode n for every n < 4295
  - Proof status: kernel-checked
- **Exhaustive exact-cover search for every even sum 1352–4294 (minimality of 4296)** (`experiments/wyrd/Wyrd/MinimalTable0–3.lean (t{i}_{j}_ok, table{i}_ok), Smallest.lean (tables_ok, tables_cover)`)
  - Method: 184 decide +kernel chunk theorems (8 sums each); each row recomputes cands N (pairs p < N − p in V, N − p in VB, names jointly repeat-free) and runs ec with 5 blocks; tables_cover checks coverage of all 1472 even N
  - Result: For all 1472 even N in [1352, 4294] the search finds no 5-pair exact cover of the 26 letters (47,625 candidate pairs in total, 9–89 per sum); with ec_complete, checkEntry_sound, lower_bound and sum_even this gives ¬IsPangram N ps for all N < 4296
  - Proof status: kernel-checked; stored candidate lists are untrusted data re-verified by the kernel
- **Data generators** (`experiments/wyrd/scripts/gen_candidates.py, experiments/wyrd/scripts/GenTables.lean`)
  - Method: Python and Lean scripts emit V/VB/NT and the table rows
  - Result: Generated data files MinimalData.lean and MinimalTable0–3.lean
  - Proof status: untrusted; every output is re-checked by the kernel theorems above
- **First-solution search, coupled and plain naming** (`experiments/coupled_prime26_pangram.py (described in experiments/README.md)`)
  - Method: Python search over even N
  - Result: Coupled naming: first solution at N = 4296; plain base-26: no solution up to N = 18,250
  - Proof status: numerical only; the coupled minimality was later kernel-checked (smallest_pangram_sum), the plain-naming result is not formalised
- **Complete enumeration of five-pair pangrams** (`experiments/checks/enumerate_all.py, experiments/checks/pangram_all.c, checks/README.md, coupled_all.txt, plain_all.txt`)
  - Method: Exhaustive C/Python enumeration for even N from 1352 to 457000, with an informal cutoff argument for N > 457000
  - Result: Coupled: exactly 12 pangrams at 11 sums (4296, 6942, 8242, 8970, 9216, 12510, 12516, 13812 ×2, 14634, 15726, 15990), so 4296 has a unique solution; plain: none at any sum
  - Proof status: numerical only (computer search with informal soundness argument); not in Lean
- **Independent cross-check during this audit** (`scratchpad Python (not in repo)`)
  - Method: Python recomputation of the coupled encoding and trial-division primality
  - Result: Reproduced the ten names; V is exactly the 525 odd primes < 4295 with repeat-free coupled names (no composites); table rows are 1472 consecutive even sums in 184 chunks of 8
  - Proof status: numerical cross-check only
- **Independent re-derivation of the minimal coupled pangram sum, with no reliance on lower_bound or sum_even** (`/tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-core/minimal.py (audit scratch, not in repo)`)
  - Method: Python: my own sieve, my own coupled base-26 encoder, and a bitmask exact-cover search that branches on the lowest uncovered letter. It covers every N from 4 to 4299, odd N and N < 1352 included, over all prime pairs p < q whose joint names have no repeated letter.
  - Result: The first N with a 5-pair exact cover of the 26 letters is 4296, and it has exactly one cover there. The script reproduces the names UKR/TEP, DB/NMF, YL/AQV, SH/CWZ, IJ/OGX. This agrees with the kernel-checked smallest_pangram_sum and with the numerical uniqueness claim in checks/README.
  - Proof status: numerical cross-check only
- **Candidate set V and the composite claim** (`/tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-core/vcheck.py (audit scratch)`)
  - Method: Python: parse V from MinimalData.lean and compare it with trial division
  - Result: V has 525 elements and equals the list of odd primes below 4295 whose coupled names have no repeated letter. No composite below 4295 lacks a divisor in [2, 65].
  - Proof status: numerical only; Lean proves only the superset direction

### 250 = 37 phase lock and the mirror keys (prime-proof branch)

- **Lock periods of 250 and 37: every T in 1..213 with 250 % T == 37 % T; prime keys; division 250 = 3·71 + 37** (`experiments/phase_lock_250_37.py section 1 (section_lock)`)
  - Method: Python exhaustive search (complete, since a lock period divides 213 and so is ≤ 213)
  - Result: periods [1, 3, 71, 213]; prime keys [3, 71]; 250 = 3·71 + 37 with 3, 71, 37 prime (re-run 2026-10-21, all checks passed)
  - Proof status: Proved in Lean for all T ∈ ℕ: Wyrd.lock_periods, Wyrd.dvd_213, Wyrd.prime_keys, Wyrd.Lock.lock_periods', Wyrd.Lock.prime_keys', Wyrd.three_primes
- **Floating-point oscillator checks: |exp(2πi·250/71) − exp(2πi·37/71)|, sin(2π·250/71) vs sin(2π·37/71), stroboscope for k < 1000, sine aliasing gap at T = 71** (`experiments/phase_lock_250_37.py section 2 (section_oscillators)`)
  - Method: Python cmath/math floating point
  - Result: gap 3.0e-15; both sines −0.132353854264; strobe True for k < 1000; largest sample gap 2.3e-13
  - Proof status: Exact versions proved in Lean: Wyrd.Lock.osc_lock, sin_lock, cos_lock, Wyrd.strobe / Wyrd.Lock.strobe' (all k), sin_strobe_iff at T = 71
- **Sampling rates T < 300 for which the 250 Hz and 37 Hz samples agree at every k, for the complex phasor, the real cosine and the real sine** (`experiments/phase_lock_250_37.py section 2 (rates dict)`)
  - Method: Python floating point, tolerance 1e-9, k over one period 0..T−1. I also re-ran the sine list independently.
  - Result: complex [1, 3, 71, 213]; cosine [1, 3, 7, 41, 71, 213, 287]; sine [1, 2, 3, 71, 213]
  - Proof status: Characterised for all T ≠ 0 by strobe_iff (T ∣ 213), cos_strobe_iff (T ∣ 213 ∨ T ∣ 287) and sin_strobe_iff (T ∣ 213 ∨ T = 2). The explicit lists and 287 = 7·41 are not stated in Lean; they follow by enumerating divisors.
- **Chinese remainder check: locked on 213 iff locked on 3 and on 71, for all n, m < 213** (`experiments/phase_lock_250_37.py section 3`)
  - Method: Python exhaustive over 213² pairs
  - Result: True
  - Proof status: Proved in Lean for all n, m ∈ ℕ (Wyrd.crt_213, Wyrd.Lock.crt_213', general Wyrd.Lock.crt_lock)
- **Riemann's oscillators: Kuramoto order parameter and 'lock at π' of the phases γ_k log x for the first 100 zeta zeros, at x ∈ {3, 37, 71, 70, 72, 213, 212, 214} and over 2..100** (`experiments/phase_lock_250_37.py section 4 (section_riemann); experiments/README.md`)
  - Method: Python with 100 hard-coded zeta-zero ordinates (from mpmath.zetazero, 12 decimals); truncated explicit-formula heuristic
  - Result: lock at π: 3 → +0.232, 37 → +0.171, 71 → +0.163, 213 → −0.041. Of 2..100, 35 are prime powers, and 33 of the 35 strongest locks are prime powers. Mean lock: prime powers +0.152, others −0.039. Only the mean comparison and the zero table are asserted.
  - Proof status: Numerical only. No Lean theorem; ROADMAP marks it ⬜.
- **Why 71 is the key: Λ over the divisors of 213, Lucas certificate for 71 with witness 7, order of 7, 7^250 vs 7^37, solutions of a^250 = a^37 in Z/71 and Z/37, primes p ≡ 37 (mod 213) below 5000** (`experiments/phase_lock_250_37.py section 5 (section_key)`)
  - Method: Python integer arithmetic and float logs
  - Result: Λ(1), Λ(3), Λ(71), Λ(213) = 0, 1.098612, 4.262680, 0; sum 5.361292 = log 213. Lucas checks [(2, 70), (5, 54), (7, 45)] → prime. ord(7) = 70; 7^250 ≡ 20, 7^37 ≡ 22. Z/71: [0, 1]. Z/37: [0, 1, 10, 26]. Primes: [37, 463, 1741, 2593, 3019, 4297, 4723].
  - Proof status: Proved in Lean: log_gap, lucas_71, orderOf_seven, seven_no_lock, pow_lock_71, pow_lock_37 + cube_roots_37. The prime list is numerics only (Lean proves existence, exists_prime_in_phase, plus an unnamed example for 463).
- **Kernel decide checks whose meaning is a finite search** (`Wyrd.dvd_213 (decide +kernel over all t < 214), Wyrd.Lock.divisors_213, pow_lock_71 (all 71 residues), pow_lock_37 and cube_roots_37 (all 37 residues), seven_no_lock, the powers 7^70, 7^35, 7^14, 7^10 in lucas_71/orderOf_seven, zmod_lock, Wyrd.lock, primeB trial division for 3, 37, 71`)
  - Method: Lean `decide` / `decide +kernel` (no native_decide anywhere in the three files)
  - Result: All stated equalities and enumerations hold (as stated in the theorems)
  - Proof status: Kernel-checked by construction. I did not rebuild, because the task forbids lake/lean while a build runs. Audit.lean lists all of these except primeFactors_70 (Mathlib) and Locked.symm, three_prime, thirtyseven_prime (core).
- **Least primitive root mod 71 (my check, to support closest_known for orderOf_seven)** (`my own one-off Python check (not in the repo)`)
  - Method: Python order computation for a = 2..7 mod 71
  - Result: orders 35, 35, 35, 5, 35, 70, so 7 is the least primitive root mod 71; also gcd(213, 70) = 1, gcd(213, 36) = 3, 2·71 − 47·3 = 1, 287 = 7·41, 250 mod 213 = 37
  - Proof status: Computation only. Lean proves orderOf (7 : ZMod 71) = 70 but not minimality.
- **General sampling criteria for real discrete-time sinusoids (to check closest_known for cos_strobe_iff and sin_strobe_iff)** (`reviewer script /tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-keylock-review/checks.py (not in the repo)`)
  - Method: Python floating point, tolerance 1e-9, all integer f, f' in 0..39, T in 1..59, n over one period 0..T−1
  - Result: 0 counterexamples to: cos samples agree for all n iff T ∣ f − f' or T ∣ f + f'; sin samples agree for all n iff T ∣ f − f' or (T ∣ 2f and T ∣ 2f'). Also gcd(500, 74) = gcd(574, 426) = 2.
  - Proof status: Numerical only. Lean proves only the instances f = 250, f' = 37 (cos_strobe_iff, sin_strobe_iff).
- **Bézout exponents in the root-of-unity decomposition for osc_213_eq** (`reviewer script checks.py (same path)`)
  - Method: Python cmath with 2·71 − 47·3 = 1
  - Result: ζ_213 = ζ_3^2·ζ_71^(−47) holds, matching the Lean statement. The catalogue's swapped form ζ_3^(−47)·ζ_71^2 fails; it equals ζ_213^77.
  - Proof status: The Lean form is proved (osc_213_eq). The swapped form in the catalogue's closest_known is false.

### Rainbow geometry (Descartes, Alexander’s dark band, spectrum)

- **Rigorous rational brackets for arcsin √q and π, used for all bow-angle bounds** (`Primary.lean (inline ha1/ha2/hb1/hb2 in primary_bow_water), Secondary.lean, SpectrumPrimary.lean, SpectrumSecondary.lean`)
  - Method: Kernel-checked Lean. Real.lt_arcsin_iff_sin_lt' and Real.arcsin_lt_iff_lt_sin' reduce each bound to a sin bound. The project's Taylor polynomials (degree 5 above, degree 7 below) are compared with square roots by norm_num, π comes from Real.pi_gt_d6 and Real.pi_lt_d6, and linarith combines them.
  - Result: 1–2° brackets: 41–43° and 50–52° for n = 4/3; 42–43° and 50–51° for n = 1.331; 40–41° and 53–54° for n = 1.343. I checked every bracket numerically and all are valid (e.g. 0.7928 < 0.79321 < 0.7936).
  - Proof status: Proved in Lean; grep finds no sorry or axiom in the group. I did not rebuild or run Audit.lean, because a build was running.
- **Decimal bow angles and thresholds quoted in the README and docstrings** (`README.md rainbow table ('true value 42.03°', '50.98°'); SpectrumPrimary.lean and SpectrumSecondary.lean docstrings (42.37°, 40.65°, 50.37°, 53.48°, widths 1.7° and 3.1°, red bracket valid for n between 1.3296 and 1.3334); VisibleBand.lean docstring (50° edge holds down to n ≈ 1.3296)`)
  - Method: The repository has no script that produces these. I recomputed them in double precision with /tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-rainbow/num.py, using cos² i = (n²−1)/(k(k+2)) and bisection for the thresholds.
  - Result: n = 4/3: 42.0297° and 50.9781°. n = 1.331: 42.3698° and 50.3651°. n = 1.343: 40.6459° and 53.4778°. Widths 1.72° and 3.11°. The secondary angle is 50° at n ≈ 1.32962 and 51° at n ≈ 1.33342; the primary angle is 43° at n ≈ 1.32672. Every figure in the prose is confirmed.
  - Proof status: Numerical only (floating point); not formalized.
- **Range of exit angles over all incidences for n = 4/3 (checks the prose reading of π − D and D − π as angles from the antisolar point)** (`My check of DarkBand.lean`)
  - Method: Python grid of 100001 points on [0, π/2]
  - Result: π − D₁ ∈ [0°, 42.03°] and D₂ − π ∈ [50.98°, 180°], so the Lean quantities are the true sky angles with no mod-2π issue on this domain.
  - Proof status: Numerical only
- **Classical precedents for the spectrum brackets: the project's bow-angle formula evaluated at Newton's and Stewart's indices** (`My check of SpectrumPrimary.lean and SpectrumSecondary.lean against Newton, Opticks, Prop. IX and Stewart's rainbow project`)
  - Method: Python, double precision (/tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-rainbow-review/num.py), using cos² i = (n²−1)/(k(k+2)) and dev = kπ + 2i − 2(k+1) arcsin(sin i/n)
  - Result: n = 108/81: primary 42.030°, secondary 50.978°. Newton printed 42°2′ and 50°57′. n = 109/81: 40.270° and 54.159°. Newton printed 40°17′ and 54°7′. n = 1.3318: 42.25° and 50.58°. n = 1.3435: 40.58° and 53.61°, matching Stewart's quoted ≈42.3° and ≈40.6°. So the red/violet brackets are classical calculations at slightly different constants.
  - Proof status: Numerical only
- **Whether Mathlib's own Real.sin_bound would suffice for the bow brackets** (`My check of the README and TrigBounds claim that Mathlib's bounds are too coarse`)
  - Method: First-order error propagation in Python: the sin error |x|⁵/100 divided by cos x gives the arcsin error, weighted by the coefficients of the closed forms (4a + 2b for the primary, 6a + 2b for the secondary)
  - Result: primary_bow_water (n = 4/3): error ≈ 0.0099 rad against a margin of ≈ 0.0169 rad to the nearer of 41° and 43°, so very probably provable with Mathlib alone. secondary_red (n = 1.331): ≈ 0.027 rad against ≈ 0.0064 rad, so not provable with it. The project's degree-5 and degree-7 bounds are needed only for the tighter brackets.
  - Proof status: Numerical estimate only (first-order; not a Lean proof)
- **Independent recheck of the catalogue's numerical figures** (`The catalogue's computations and unresolved_claims entries`)
  - Method: The same Python script, with bisection over n and a 100001-point grid over i
  - Result: Confirmed: 42.0297° and 50.9781° (n = 4/3); 42.3698° and 50.3651° (1.331); 40.6459° and 53.4778° (1.343); thresholds 1.329617 (secondary = 50°), 1.333417 (secondary = 51°), 1.326721 (primary = 43°); all 12 arcsin bracket values; and every inline bracket in primary_bow_water, primary_red and primary_violet (e.g. arcsin √(742813/1771561) = 0.704342 ∈ (0.7043, 0.7044)). Ranges for n = 4/3: π − D₁ ∈ [0°, 42.03°], D₂ − π ∈ [50.98°, 180°].
  - Proof status: Numerical only

### Body-water physiology models and Limits models

- **Existence of a co-arousal equilibrium at g = 2.1** (`Limits/Bistability.lean: coarousal_exists_above_two`)
  - Method: norm_num signs bistF 2.1 1.3 < 0 < bistF 2.1 1.4, then intermediate_value_Icc
  - Result: An equilibrium with Aₘ ∈ [1.3, 1.4] and Aᵢ > 0
  - Proof status: proved in Lean (kernel arithmetic + IVT)
- **Linearly stable co-arousal equilibrium at g = 3** (`Limits/Bistability.lean: coarousal_stable_at_three, bist_coeffs, bist_det3`)
  - Method: IVT bracket [2.79, 2.792] for bistF 3, interval bounds x ∈ [1.91, 1.92], cap y ≤ 0.08, then Routh-Hurwitz inequalities by linarith
  - Result: Jacobian eigenvalues all have negative real part
  - Proof status: proved in Lean (interval arithmetic)
- **No non-rest equilibrium for 0 ≤ g ≤ 2 with the cap** (`Limits/Bistability.lean: only_rest_upto_two, bist_f2_pos`)
  - Method: Elimination plus an nlinarith positivity certificate in u = y² (hints (u - 2.1)², u^3..u^5)
  - Result: The origin is the only equilibrium
  - Proof status: proved in Lean
- **Numeric constants in Values** (`Limits/Values.lean: q10_per_degree, chest_warmth_rate, chest_warmth_bpm, warming_after_twelve_minutes`)
  - Method: norm_num on powers (1.082^10 < 2.2 < 1.0821^10; 2.2^7 against 1.0279^200 and 1.0281^200) and Real.exp_bound with 10 terms for exp(-0.9), squared
  - Result: 2.2^(1/10) ∈ (1.082, 1.0821); 2.2^0.035 ∈ (1.0279, 1.0281); 140(2.2^0.035 - 1) ∈ (3.9, 3.94); 1 - e^{-1.8} ∈ (0.8346, 0.8348)
  - Proof status: proved in Lean (numeric)
- **Body-water arithmetic checks** (`BodyWater/Newborn.lean term_and_one_year_add_up, term_newborn_ten_percent_loss; BodyWater/Sodium.lean newborn_scaling_example`)
  - Method: norm_num
  - Result: Percentages add up; 68/90 < 78/100, 34/90 < 44/100; 1.42 < 3.34/2.35
  - Proof status: proved in Lean (numeric)
- **Counterexample for interaction aliasing** (`Limits/Mixture.lean: three_conditions_miss_interaction`)
  - Method: norm_num on the explicit parameters (1, -1, -1, 1) versus 0
  - Result: Agreement on three conditions, disagreement on apart
  - Proof status: proved in Lean
- **Onset of the co-arousal equilibrium (README/doc 'numerically near 2.069')** (`Limits/Bistability.lean module doc; independent check /tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-bodylimits/check.py`)
  - Method: Python bisection on g for a sign change of bistF(g, y), y ∈ (0, 20)
  - Result: Threshold ≈ 2.06889, which matches the doc. Also confirmed bistF(2.1,1.3) ≈ -6.5e-4, bistF(2.1,1.4) ≈ 1.35e-3, bistF(3,2.79) ≈ 2.7e-4, bistF(3,2.792) ≈ -4.3e-4, 2.2^0.1 ≈ 1.082037, 140(2.2^0.035 - 1) ≈ 3.917, 1 - e^{-1.8} ≈ 0.834701, 3.34/2.35 ≈ 1.42128
  - Proof status: numerical only (not Lean)
- **Stability of the co-arousal equilibria that the Lean proofs certify, and of their fold partners** (`Limits/Bistability.lean: coarousal_exists_above_two (bracket y ∈ [1.3, 1.4]), coarousal_stable_at_three (bracket y ∈ [2.79, 2.792])`)
  - Method: Python: bisection on bistF in each bracket, then eigenvalues of a central-difference Jacobian of SharedAir.field. This is independent of the hand-written jac. Scripts: /tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-bodylimits-review/chk.py and chk2.py
  - Result: g = 2.1: the certified root y ≈ 1.328749 (x ≈ 0.540) has eigenvalues ≈ +0.01271, −0.23473 ± 0.1864i (a saddle). The second root y ≈ 1.726274 has eigenvalues ≈ −0.01669, −0.27207 ± 0.15355i (stable, not certified). g = 3: the certified root y ≈ 2.790768 has eigenvalues ≈ −0.55874, −0.14952, −0.31222 (stable, agreeing with Lean). The other root y ≈ 0.555237 has eigenvalues ≈ −0.18791 ± 0.34244i, +0.02335 (a saddle). Rest at g = 3: −0.16024 ± 0.42627i, −0.01286 (stable). Residuals |field| < 1e-16.
  - Proof status: numerical only (not Lean)
- **Numbers in the prose of BodyWater and the README that no theorem states** (`Newborn.lean doc ('t = 0.78 with h = 0.73 even gives a negative fat fraction'); README Body water row ('the scaled figure is about 30% too small'); Sodium.lean doc ('negligible for an adult, W ≈ 42 L')`)
  - Method: Direct arithmetic in Python
  - Result: 1 − 0.78/0.73 ≈ −0.0685 (negative, as stated). 1 − 2.35/3.34 ≈ 0.2964 (about 30%, as stated). For an adult, (42 + 1)/(42 + 0.01) ≈ 1.0236, i.e. about 2.4%. All statements are accurate, but none is proved in Lean.
  - Proof status: numerical only (prose claims, not Lean)

### Periodic Navier–Stokes I: the phase family, symmetries, selection rules, averages

- **Exact Taylor-in-time series of the enstrophy Z(t) for initial data (α sin y, β sin z, γ cos x − δ cos(x+y+φ)), with ν symbolic** (`experiments/ns-phase-audit/audit_v2/exact/ (nsseries.py, run_series.py, test_predictions.py; results in AUDIT.md §4.1, §4.3)`)
  - Method: Independent Python code in exact rational (Fraction) arithmetic, cross-checked by a long-double FFT code (audit_v2/float/)
  - Result: [t⁶] cos 2φ coefficient = −6487/1555200 (Laurent −6487/3110400), ν-independent. [t⁷] cos 2φ = (207269/7257600)ν. z_{9,3} = −21381938959/211843247616000 (ν-free). z_{12,4} = −36714890439535371262123/39287653650070819209216000000. No |m| ≥ 5 through n = 12.
  - Proof status: Computation outside Lean. No time-dependent statement is a Lean theorem.
- **P1 (β = 0 gives no |m| ≥ 2 harmonic) checked by computation** (`experiments/ns-phase-audit/audit_v2/exact/p1_highorder.py; audit_v2/xcheck/p1_finite_time.py (AUDIT.md §4.3)`)
  - Method: Exact symbolic-ν series to n = 16; finite-time pseudo-spectral DNS (N = 24, T = 1, 2, 4)
  - Result: max|m| = 1 through order 16 (exact). |m| = 2–4 harmonics at most 1.9e-15 in DNS.
  - Proof status: Numerical and exact-computational evidence. The recurrence-level proof is on paper (AUDIT.md §4.2). The solution-level statement is unproved and not in Lean.
- **Selection-rule and grading checks (d + e = n + 2, no |m| before n = 3|m|)** (`experiments/ns-phase-audit/audit_v2/exact/test_predictions.py, predictions.log; audit_v2/float/`)
  - Method: Exact univariate interpolation for n ≤ 9; float per-variable DFTs for n ≤ 12; amplitude-scaling tests
  - Result: Zero violations reported
  - Proof status: Computational. The Lean SelectionRules theorems prove only the integer arithmetic that follows from these assumed structures.
- **Mode decomposition of z_{6,2}** (`experiments/ns-phase-audit/audit_v2/exact/mode_decomp.py, mode_decomp_n6m2.log (AUDIT.md §4.4)`)
  - Method: Exact rational shell-pair decomposition
  - Result: Near-cancellation: pair {2,4} gives +103/6912 and pair {3,3} gives −433/27648. Six shells contribute.
  - Proof status: Computation only
- **Finite-time behaviour of Z(T, φ): curvature crossing and optimum phase** (`experiments/ns-phase-audit/audit_v2/dns/ (c1–c5 scripts, logs; AUDIT.md §5.3–5.4)`)
  - Method: Pseudo-spectral Galerkin DNS, fixed-dt RK4, tangent equations, N = 24…96
  - Result: ∂²_φ Z(T,0) changes sign at T ≈ 1.764994 (φ = 0 goes from a local maximum to a local minimum). The T = 2 optimum is φ* ≈ 0.970364 (64³).
  - Proof status: Numerical only, at finite cutoff, with no continuum error bound (AUDIT.md §7)
- **Reviewer cross-check of E, Z, D, S and ⟨|∇u|²⟩ for u_φ** (`/tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-nsphase/check.py`)
  - Method: Exact-quadrature grid average on 16³ (the integrands are trigonometric polynomials of low degree), with analytic and spectral derivatives, at φ ∈ {0, 0.7, π/3, π, 2.1}
  - Result: E = 1, Z = 1.25, D = 3.5, S = cos φ/4 and ⟨|∇u|²⟩ = 2.5 to machine precision, in agreement with quantities_v and quantities_vphi
  - Proof status: Confirms the Lean-proved values; it adds no new claim
- **Reviewer's independent check of the headline exact series coefficients in floating point** (`/tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-nsphase-review/taylor.py and taylor_lib.py`)
  - Method: A time-Taylor recurrence for NS, u_{n+1} = (−P Σ (u_j·∇)u_{n−j} + νΔu_n)/(n+1), on a 32³ alias-free spectral grid. Z_n = ½Σ⟨ω_j·ω_{n−j}⟩, with an 8-point DFT in φ, at ν ∈ {0, 1/28, 0.5}.
  - Result: No cos 2φ term through t⁵ (|coef| < 3e-16). [t⁶] cos 2φ = −4.171167695473e-3 at every ν, against −6487/1555200 = −4.171167695473251e-3. [t⁷] cos 2φ = 0 at ν = 0 and 0.02855889ν otherwise, against 207269/7257600. [t⁸] cos 2φ = 2.0976623847e-3 at ν = 0 and 2.0210959198e-3 at ν = 1/28, matching AUDIT.md's exact formula. The first cos 3φ term is at t⁹ and equals −2.018656643497e-4 = 2·z_{9,3}, ν-free.
  - Proof status: Floating-point corroboration of computations outside Lean. Not a proof. Note that z_{9,3} in the catalogue is a Laurent coefficient, half the cos 3φ coefficient, while the m = 2 values are quoted as cos coefficients.
- **Reviewer check of Z'(0) and Z''(0) for u_φ** (`/tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-nsphase-review/z2.py`)
  - Method: Spectral evaluation of u_t and u_tt from the new-session right-hand side at t = 0 (16³ grid), with a quadratic fit in ν from ν ∈ {0, 1, 2}
  - Result: Z''(0) = 1.25 − 2.5ν cos φ + 11ν² exactly (to 1e-12) at φ ∈ {0, 0.7, π/3, 2.1}. Z'(0) at ν = 0 equals cos φ/4 = S(u_φ), consistent with the unformalised enstrophy balance.
  - Proof status: Numerical. It supports AUDIT.md §2 and the enstrophy-balance reading, but proves neither.
- **Reviewer check that u_φ is not a known exact solution** (`/tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-nsphase-review/chk.py`)
  - Method: Spectral computation on a 24³ grid of E, Z, D, S, u×ω and curl(u×ω) at φ ∈ {0, 0.7, π/3, π/2, π, 2.1}
  - Result: E = 1, Z = 1.25, D = 3.5 and S = cos φ/4 to machine precision, in agreement with quantities_vphi. max|u×ω| is between 3.0 and 3.41 and max|curl(u×ω)| between 2.5 and 3.0 at every φ checked. So u_φ is not Beltrami/ABC and not a steady Euler solution, and none of the theorems here concerns a known exact NS or Euler solution.
  - Proof status: Numerical. It confirms the Lean-proved values and adds context only.

### Periodic Navier–Stokes II: scaling, blow-up rescalings, sign flip, Galerkin, Grönwall, quantifiers

- **Exact averages E, Z, D, S of the rescaled field v_k for all integers k ≥ 1** (`experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:312 (quantities_vScaled)`)
  - Method: Each integrand is rewritten as k^j·P(kx, ky, kz), with P an explicit hand-listed trigonometric polynomial (a list of modes). The pointwise identity is closed by trigonometric expansion plus ring_nf modulo sin² + cos² = 1, and the average is the constant coefficient via the orthogonality lemmas. The integrals are symbolic and kernel-checked, with no decide or native_decide.
  - Result: E = 1, Z = 5k²/4, D = 7k⁴/2, S = k³/4
  - Proof status: Proved in Lean without sorry on the new-session branch (dcc29e2). I did not rebuild it, because a build is running.
- **Instantaneous S − νD for ±v at ν = 1/28** (`experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/SignFlip.lean:110 (rates)`)
  - Method: norm_num on the values from quantities_smul
  - Result: 1/8 for v and −3/8 for −v
  - Proof status: Proved in Lean without sorry on the new-session branch; not rebuilt by me.
- **Growth exponent of the fitted-law ratio S/(Z^0.75 D^0.2) along v_k** (`experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/Scaling.lean:399 and 448 (ratio_vScaled, fitted_law_fails)`)
  - Method: The closed form from ratio_vScaled, with 2·0.75 + 4·0.2 = 2.3 < 3 checked by norm_num
  - Result: The ratio is proportional to k^0.7, so it is unbounded
  - Proof status: Proved in Lean on the new-session branch. This group contains no computer searches, decide checks or numerical scripts; the ns-phase-audit numerics (DNS, Taylor jets) concern the phase family and are outside this group.
- **Exponent bookkeeping for the anisotropic blow-up scalings: core volume exponent 3/2 − h, core energy 1/2 − 3h, radial Reynolds 0, swirl Reynolds −2h, with thresholds h < 1/6 (energy → 0), h > −1/2 (speed → ∞), h > 0 (swirl Reynolds → ∞) and h < 1/2 (swirl length → 0)** (`experiments/wyrd-mathlib/WyrdMathlib/PeriodicNS/CoreScaling.lean:26–54 and Blowup.lean:34–70 (core_volume, core_energy, energy_vanishes_speed_blows, radial_reynolds_const, swirl_reynolds_eq, swirl_reynolds_blowup, swirl_length_shrinks, swirl_speed_blowup)`)
  - Method: Real.rpow_add and Real.rpow_mul with ring on the exponents. The limits use tendsto_rpow_neg_nhdsGT_zero and Real.continuousAt_rpow_const with Real.zero_rpow, and the thresholds come from linarith.
  - Result: The exponents and thresholds listed above. These are pure real-power identities and limits; no velocity field, core or solution is constructed.
  - Proof status: Proved in Lean without sorry on the new-session branch (dcc29e2); not rebuilt. On the prime-proof branch, core_volume, core_energy and energy_vanishes_speed_blows are sorry'd unimported drafts.

### Shared Air feedback model

- **Certified bracket of the zero-delay optimum s* and g* for the Shared Air coefficients** (`experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:54 (optimum_bounds)`)
  - Method: Exact rational evaluation of H at −0.048270930 and −0.048270910 by norm_num, combined with the strict monotonicity of H (H_strictMonoOn); G bounds by linear arithmetic
  - Result: s* ∈ (−0.048271, −0.04827), g* ∈ (0.08035, 0.08036)
  - Proof status: Lean-proved (norm_num/linarith); my independent float check (bisection) gives s* = −0.0482709206, g* = 0.0803558863, and a grid search of the cubic's spectral abscissa has its minimum at g ≈ 0.0804
- **Critical coupling bounds** (`experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Specific.lean:76 (gc_bounds)`)
  - Method: norm_num bracketing 47.592 < √2265 < 47.593 via Real.lt_sqrt / Real.sqrt_lt'
  - Result: 3.858 < g_c = 15/8 + √2265/24 < 3.8581 (float: 3.8580007)
  - Proof status: Lean-proved
- **Finite moment evaluations on the 16-point coin space** (`experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Correlation.lean:31,36,73`)
  - Method: simp/norm_num expansion of 16-term sums
  - Result: Coin means 0; E[X²] = E[M²] = 2, E[O²] = 10, E[XM] = E[XO] = 1; signal means 0; contrast 1/2 − 1/√20 ≈ 0.2764
  - Proof status: Lean-proved (exact finite computation)
- **Phase moments of explicit 4- and 24-cell configurations** (`experiments/wyrd-mathlib/WyrdMathlib/SharedAir/PhaseMoments.lean:98,107,132,138`)
  - Method: simp with Fin.sum_univ_four / Fin.sum_univ_succ and Complex.exp values
  - Result: Z1(A) = Z1(B) = 1/2, Z2(A) = 0, Z2(B) = 1; the 24-cell repeats have the same moments
  - Proof status: Lean-proved (exact computation)
- **Two-cell osmotic aggregate counterexample** (`experiments/wyrd-mathlib/WyrdMathlib/SharedAir/WaterGradient.lean:120`)
  - Method: simp/norm_num
  - Result: Same totals, total inflow 0 vs 2/3
  - Proof status: Lean-proved (exact computation)
- **Delay stability-loss thresholds below g_c (README 'Delay caveat')** (`experiments/wyrd-mathlib/README.md Shared Air section; Optimal.lean and Specific.lean docstrings`)
  - Method: README: imaginary-axis crossing and Chebyshev collocation (no script found in the repo). My independent reproduction: solve D(iω) = 0 as a quadratic in E = e^{−iωτ}, find ω with |E| = 1 on a fine grid, take the smallest τ (numpy; /tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-sharedair/numcheck.py)
  - Result: g = 3: first crossing τ ≈ 1.835587 (ω ≈ 0.42879); g = 1: τ ≈ 4.761303 (ω ≈ 0.22375). Matches the README's 1.8356 and 4.7613; the direction of the crossing was not checked
  - Proof status: numerical only, not Lean
- **a₂ ≈ 0.19 vs 2e⁻² I₂(2)** (`experiments/wyrd-mathlib/WyrdMathlib/SharedAir/Locking.lean docstring`)
  - Method: Series for the modified Bessel function I₂(2) (my float check)
  - Result: 2e⁻² I₂(2) = 0.186478
  - Proof status: numerical only, not Lean
- **Independent reproduction of the first delay at which stability is lost below g_c** (`README Shared Air 'Delay caveat'; Optimal.lean and Specific.lean docstrings`)
  - Method: Treat D(iω) = 0 as a quadratic in E = e^{−iωτ}, find sign changes of |E| − 1 in ω on a 30001-point grid, refine each by bisection, and take the smallest τ = (−arg E mod 2π)/ω. Script: /tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-sharedair-review/check2.py
  - Result: g = 3: τ ≈ 1.835585 (ω ≈ 0.428787); g = 1: τ ≈ 4.761272 (ω ≈ 0.223749). Both agree with the README's 1.8356 and 4.7613. The catalogue's 4.761303 at g = 1 differs from mine at the fifth significant digit; both round to 4.7613.
  - Proof status: numerical only, not Lean
- **Routh–Hurwitz margin a₂a₁ − a₀ for the Shared Air coefficients on 0 ≤ g ≤ g_c** (`Closest-known remark for stable_iff ('only a₀ = P(0, g) > 0 binds')`)
  - Method: Evaluate (a+b+d)(ab+ad+bd+hg−cg²) − (abd+hbg−cdg²) on a 10001-point grid in numpy. Script: /tmp/claude-0/-home-user/19ee0883-735f-50e9-a87f-2804560be084/scratchpad/wf-sharedair-review/check.py
  - Result: The minimum is 0.0070833 > 0, at g = 0. So for these coefficients the a₂a₁ > a₀ condition never binds, which agrees with stable_iff. The general claim under Hyp follows from stable_iff itself.
  - Proof status: numerical only, not Lean
- **Zero-delay optimum cross-check** (`Specific.lean:54 (optimum_bounds)`)
  - Method: Bisection for the root of H on (−b, −a), plus a grid search (step 1e-5 on [0, 0.2]) of the cubic's spectral abscissa using numpy roots
  - Result: s* = −0.0482709206 and g* = 0.0803558863. The grid minimum is at g ≈ 0.08036 with abscissa −0.0482709, consistent with optimal_coupling and optimum_bounds.
  - Proof status: numerical only; the Lean bracket is proved

### Computer searches, numerics and leftover WIP

- **First coupled-naming five-pair prime pangram (smallest even N ≥ 1360 up to 5000)** (`experiments/coupled_prime26_pangram.py (both branches, identical)`)
  - Method: Python exact-cover search per even N over primes with letter-distinct coupled names (2 excluded), MRV branching; verify() rechecks sums, primality, decodes, and that the 10 names are a permutation of A..Z.
  - Result: N = 4296: (1187,3109) UKR+TEP, (53,4243) DB+NMF, (349,3947) YL+AQV, (293,4003) SH+CWZ, (659,3637) IJ+OGX. I re-ran it in 0.19 s with identical output. The loop starts at N = 1360, not 1352, which is harmless because the Lean tables cover 1352–4294.
  - Proof status: The certificate is kernel-checked (Wyrd.solution_isPangram, Wyrd.solution_names, Wyrd.pangram_exists). Minimality is kernel-checked by Wyrd.smallest_pangram_sum, a decide +kernel search over all 1,472 even sums 1352..4294 proved complete via Wyrd.ec_complete, Wyrd.checkEntry_sound, Wyrd.tables_cover and Wyrd.tables_ok, with lower bound Wyrd.lower_bound and parity Wyrd.sum_even. The Python search itself is not a proof.
- **Plain base-26 five-pair pangram, first-found search** (`experiments/coupled_prime26_pangram.py --plain (both)`)
  - Method: The same Python exact cover with encode_plain, even N from 1360 to 18250.
  - Result: 'No solution for plain encoding up to N=18250.' I re-ran it in 3.4 s.
  - Proof status: Python only. The ROADMAP's Lean item 'Plain base-26 has no pangram up to 18,250' is still open (⬜) on both branches.
- **Complete enumeration of coupled-naming five-pair pangrams** (`experiments/checks/pangram_all.c, coupled_all.txt, coupled_all.log (both)`)
  - Method: C: sieve to hi; mask_of re-implements the coupled naming independently of Python; for each even N, collect every letter-disjoint pair (p, N−p) of odd primes, then exact cover with fewest-candidate-letter branching, counting each cover once. Range 1352 ≤ N ≤ 457000, with the cutoff argued in the README.
  - Result: Exactly 12 solutions at 11 sums: 4296, 6942, 8242, 8970, 9216, 12510, 12516, 13812 (×2), 14634, 15726, 15990; 227,336 sums reached the cover stage. Re-runs: on [1352, 20000] in 0.15 s, the same 12 lines byte-for-byte. A full-range re-run capped at 60 s reached N ≈ 350,000 with output identical to coupled_all.txt (no further solutions), and I did not re-run the last ~107,000 sums.
  - Proof status: C only, except that 'no solution below 4296' is kernel-checked (Wyrd.smallest_pangram_sum). The count of 12 and the 457000 cutoff are not Lean theorems.
- **Independent Python enumeration of coupled pangrams** (`experiments/checks/enumerate_all.py (both)`)
  - Method: Python, importing the encoder and sieve from coupled_prime26_pangram.py; exact cover enumerating all solutions per even N.
  - Result: On [1352, 20000]: 12 solutions at 11 distinct sums; the smallest maximum prime over all solutions is 4243; only 13812 has 2 solutions. I re-ran it in 4.4 s with an identical list.
  - Proof status: Python only. It agrees with the C code on the overlap.
- **Complete enumeration of plain-naming five-pair pangrams** (`experiments/checks/pangram_all.c plain, plain_all.txt (empty), plain_all.log (both)`)
  - Method: The same C code with plain digits, over even N in [1352, 457000], skipping the prime 2.
  - Result: 0 solutions; 225,612 sums reached the cover stage. My re-run on [1352, 20000] also gave 0. I did not re-run the full range.
  - Proof status: C only. The exclusions N < 1352, odd N and the prime 2 are argued 'on paper' for the plain rule; the Lean theorems lower_bound, sum_even and two_not_mem are stated for the coupled encode only. The gap N < 1352 is also covered by search/pairs.c, which starts at N = 4 and includes the prime 2.
- **The 457000 cutoff (names too long to fit 26 letters)** (`experiments/checks/README.md 'Why 457000 is enough' (both)`)
  - Method: Prose argument: a name has as many letters as the number has base-26 digits; for N ≥ 457001 every pair (p < q) has at least 6 letters (p ≤ 25 forces q ≥ 26⁴ = 456976; p ≤ 675 forces q ≥ 456326 with 4 letters; and so on), so five pairs need at least 30 > 26 letters.
  - Result: I re-derived the case split and it is correct, for both namings (each naming is one letter per digit).
  - Proof status: Prose only, not formalised.
- **Prime-26 (plain, distinct-digit primes) equal-sum five-pair pangrams** (`experiments/prime-pangram/search/scratchpad/pairs.c, results/results.json (both)`)
  - Method: C exact cover over all even N < 40000, words < 26⁴, prime 2 included; also counts 4-pair covers. Prose bounds in results.json: N even, N < 2·26³ = 35152, words ≤ 4 letters, N ≡ 0 (mod 10) (by casting out 25s: 5N ≡ 0+…+25 ≡ 0 mod 25).
  - Result: 0 five-pair solutions and 0 four-pair covers of all 26 letters; best partial: 4 pairs at N = 10146 leaving C M Q R U Y. I re-ran `./pairs 40000` in 0.18 s with the same output. I checked the N ≡ 0 (mod 10) and N < 35152 arguments informally and they hold: four (1-letter, 4-letter) pairs would have q's within 20 of each other, so two would share leading digits.
  - Proof status: C only. The bounds are prose. This independently corroborates the checks/ plain result on N < 40000.
- **Prime-26 equal-difference five-pair pangrams** (`experiments/prime-pangram/search/scratchpad/diff.c (both)`)
  - Method: C exhaustive search over even D ≤ 20000, words < 26⁴. Prose bounds: D even, 26 ∤ D, 28 ≤ D < 17576, words ≤ 4 letters. It also checks the identity letter-sum of the smaller words ≡ 10D (mod 25).
  - Result: Exactly three: D = 204 (YSH/ZAD, MWF/NEB, JUP/KCL, GX/OT, IV/QR), D = 258, D = 534. I re-ran it in 18.9 s with identical output.
  - Proof status: C only. The bounds are prose. No Lean.
- **Equation pangram and mod-25 identities** (`experiments/prime-pangram/search/tests/test_solutions.py, tmp/prime26.py (both)`)
  - Method: Pure-Python checks: YR BQL CWH DNF GAX = KV MT OP ESJ IUZ (641+1103+1931+2371+4079 = 281+331+379+3181+5953 = 10125); the three equal-difference solutions; the near miss at 10146.
  - Result: All checks pass (0 failures). I re-ran it in 0.03 s.
  - Proof status: Python only. The 'mod-25 theorem' (26 ≡ 1 mod 25, so a perfect pangram's sum ≡ 325 ≡ 0 mod 25) is a correct one-line prose argument, not formalised.
- **Exact count of Prime-26 perfect pangrams, words ≤ K letters** (`experiments/prime-pangram/search/scratchpad/pangdp.c, brute.c, results/results.json, results/logs/ (both)`)
  - Method: DP over all 2²⁶ letter subsets with exact word counts (2.1–3.2 GB of memory). Validated against an independent brute-force partition counter and a third Python implementation on sub-instances.
  - Result: K≤3: 2,476,752,460,975; K≤4: 1,820,178,519,744,870; K≤5: 17,712,554,714,431,732; K≤6: unfinished (run died at 75 % after 2,802 s). K=3 was reproduced in the 2026-10-16 session log. I re-ran only the brute-force validator (0.55 s): 27152, 73155, 30128, 122443, matching results.json.
  - Proof status: C only (archived numbers, except K=3 and the validation counts). No Lean.
- **Number of Prime-26 equation pangrams** (`pangdp.c sampling phase, results.json equation_pangram_estimates (both)`)
  - Method: Uniform sampling from the exact DP; the fraction admitting a balanced 5-vs-5 split times the exact count.
  - Result: K≤3: 9.98e9 ± 0.16e9; K≤4: 1.9e11 ± 0.13e11; K≤5: 2.5e11 ± 0.7e11; headline about 2 × 10¹¹. The 7-letter contribution of about 1e7–1e8 is itself an estimate.
  - Proof status: Monte Carlo estimate with standard errors; not exact and not proved.
- **Supply of prime pairs p, p+D by D** (`search/scratchpad/pack.c, results/pack_by_D.tsv (both)`)
  - Method: C statistics over even D in [28, 17574]: candidate pairs and the largest disjoint packing.
  - Result: Mean candidates 1554.8 when 3 | D versus 777.5 otherwise (ratio 2.00); 1296.7 when 5 | D versus 971.6 (ratio 1.33). This matches the Hardy–Littlewood singular-series factors (p−1)/(p−2) = 2 and 4/3 (Hardy and Littlewood 1923). The README's '5 | D adds ≈ 25 %' is relative to the overall mean.
  - Proof status: Archived C output, not re-run. Heuristic explanation only.
- **NICU English-list prime pronounceable perfect pangrams (task a)** (`experiments/prime-pangram/nicu-pangram/run_a_english.py, xcover.c, core.py, mr.c (both)`)
  - Method: Generate all pronounceable distinct-letter words from clusters.py, test primality (bijective base 26) by deterministic 12-base Miller–Rabin with a Python recheck, then bitset Algorithm X exact cover.
  - Result: 289,404 pronounceable words, 16,243 prime, 1,633,290 search nodes, 0 perfect pangrams. I re-ran it in a scratchpad copy in 3.6 s, with the same numbers and a byte-identical english_prime_words.txt. core.py self-test passed.
  - Proof status: Python and C only.
- **NICU packing obstruction** (`nicu-pangram/structure.py (both)`)
  - Method: A prime word of ≥ 2 letters ends in a letter coprime to 26 (value ≡ last letter mod 26), so codas must be 'odd'. A subset DP over 2²⁰ consonant sets bounds coverage by ≤ 6 onsets plus ≤ 6 odd codas.
  - Result: At most 17 of 20 consonants with the English lists, so 0 pangrams regardless of which numbers are prime; 20 once any 2-consonant onset or coda is allowed. Reproduced in the 2026-10-16 log (2 min 21 s); I did not re-run it.
  - Proof status: Python only; the mod-26 step is elementary prose.
- **NICU free CC·V·CC count (task d) and engine closed-form check** (`nicu-pangram/run_d_free_count.py, freedp.c, engine.py (both)`)
  - Method: Inclusion–exclusion/zeta transform over 2²⁰ consonant subsets mod three 31-bit primes plus CRT; independent 64-bit DP in freedp.c. With primality off, the engine must return N₀ = 20!·[x²⁰](1+x+x²)¹².
  - Result: 34,587 prime words; 11,261,264,735,669 unordered 6-word pangrams (both implementations, archived). I recomputed the closed form [x²⁰](1+x+x²)¹² = 1221, so N₀ = 2,970,573,351,983,677,440,000, matching engine.py's log.
  - Proof status: Python and C only; the count itself is archived, not re-run.
- **NICU first moments, single-cluster relaxations, lattice of regimes (tasks b, c)** (`nicu-pangram/run_c_english.py, reach.py, run_b_single.py, run_b_lattice.py, check_*.py, results/*.json (both)`)
  - Method: Weighted inclusion–exclusion (1/ln n and (13/6)/ln n densities); exact-cover enumerations with cost budgets.
  - Result: English E_naive 7.06e4 and E_refined exactly 0 (certified mod two primes); free regime E_refined 1.108e13 versus observed 1.126e13. Smallest single added cluster: a 3-consonant coda ending in q (100 clusters, 946,514 solutions); k=4: 15,022/92,916,257; k=5: 558,205/4,128,113,285. Lattice counts as in the nicu README (for example R(2,2) has 20,886,836,221,201). R(3,0) minimum: 2 or 3, unresolved.
  - Proof status: Archived Python and C output, not re-run (≈ 3 h).
- **Exact time-Taylor coefficients of enstrophy for the NS phase family** (`experiments/ns-phase-audit/audit_v2/exact/ (run_series.py, nsseries.py, phase_lemma_check.py, mode_decomp.py, logs) (new-session branch only)`)
  - Method: Python Fractions: Taylor recurrence of 3D incompressible NS on the torus with symbolic ν, φ carried as a Fourier label, general amplitudes. Built-in checks: divergence-free modes and the energy identity (n+1)E_{n+1} = −2νZ_n. Corroborated by an independent float line (long double), the package's own code, and DNS at small t.
  - Result: z_{6,±2} = −6487/3110400 (cos 2φ coefficient −6487/1555200), with ν¹…ν⁶ coefficients exactly 0; z_{7,2} = (207269/14515200)ν; z_{9,3} = −21381938959/211843247616000; z_{12,4} as in AUDIT.md; no |m| ≥ 2 harmonic before n = 3|m|. I re-ran order 7 (1.0 s) and order 9 (5.7 s): energy identity OK, z_{6,2}, z_{7,2} and z_{9,3} exactly as stated, and Z_8 has only |m| ≤ 2. Mode decomposition re-run (2.1 s): {2,4} = +103/6912, {3,3} = −433/27648, shells as stated. β = 0 re-run with amplitudes (2,0,5,7) to n = 10: max |m| = 1 at every order.
  - Proof status: Exact rational computation in Python, not kernel-checked. Only the counting arithmetic is in Lean on the new-session branch (Wyrd.PeriodicNS.deg_ge_of_beta, deg_parity, not_before, at_first_order, order_seven_m_two, euler_parity), and it takes P1 and the monomial/grading structure as unformalised inputs.
- **v1 FFT re-derivation of exact t = 0 identities** (`experiments/ns-phase-audit/checks_v1/nslab_check.py (new-session branch only)`)
  - Method: numpy FFT on a 16³ grid (exact for these trigonometric polynomials up to round-off), over φ ∈ {0, .7, π/3, 2, π} and ν ∈ {1/28, .1, 0}.
  - Result: Max abs error 6.7e-16 for S = cos φ/4, dZ/dt(0) = cos φ/4 − 7ν/2, Z''(0) = 5/4 − (5/2)ν cos φ + 11ν², high-shell t² energy 7/48 and enstrophy 9/16; new-mode coefficients 11/24 and 19/16. I re-ran it in 0.35 s with identical output.
  - Proof status: Python float only. S = cos φ/4 and E, Z, D at t = 0 are kernel-checked on the new-session branch (Wyrd.PeriodicNS.quantities_vphi). The time derivatives need the NS evolution, which is not formalised.
- **DNS reproduction of the lab package (rankings, optimum, curvature crossing)** (`experiments/ns-phase-audit/audit_v2/dns/, xcheck/, code_audit/ (new-session branch only)`)
  - Method: Independent pseudo-spectral Fourier–Galerkin solver, fixed-dt RK4, 2/3-type cube cutoff K = ⌊(N−1)/3⌋, N = 24…96, plus tangent equations.
  - Result: Z(2) and Z(4) agree with the package to about 1e-8; rankings 0.971 > 0 > 2.16 at t = 2 and 2.16 > 0.971 > 0 at t = 4 for N = 24–64; φ* → about 0.970364; curvature crossing T ≈ 1.764994; package 9th decimals are integrator-dependent; bugs B1–B8 recorded.
  - Proof status: Floating-point numerics at finite cutoff; not re-run (heavy). No continuum or validated bound.
- **250 = 37 phase-lock walk-through (sections 1–3 and 5)** (`experiments/phase_lock_250_37.py (the prime-proof branch only)`)
  - Method: Python finite checks: lock periods by trial over T ≤ 213; sampling rates by brute force over T < 300 and k < T; CRT over all n, m < 213; Λ sum; Lucas test with witness 7; a^250 = a^37 in Z/71 and Z/37; primes ≡ 37 (mod 213) below 5000.
  - Result: Periods [1, 3, 71, 213], prime keys [3, 71], 250 = 3·71 + 37; sampling rates: phasor [1, 3, 71, 213], cosine [1, 3, 7, 41, 71, 213, 287], sine [1, 2, 3, 71, 213]; Σ_{T|213} Λ(T) = log 213; 7 has order 70 mod 71; a^250 = a^37 only for a ∈ {0, 1} mod 71 and {0, 1, 10, 26} mod 37; in-phase primes 37, 463, 1741, 2593, 3019, 4297, 4723. `--check` passes (0.07 s) and the full output is reproduced.
  - Proof status: Lean counterparts on the prime-proof branch cover every quantifier, not just T < 300: Wyrd.lock_periods, Wyrd.prime_keys, Wyrd.crt_213, Wyrd.strobe, Wyrd.Lock.strobe_iff, cos_strobe_iff, sin_strobe_iff, vonMangoldt_lock_sum, log_gap, lucas_71, orderOf_seven, pow_lock_71, pow_lock_37, cube_roots_37, exists_prime_in_phase (whose proof uses Mathlib's Nat.forall_exists_prime_gt_and_eq_mod). The listed primes beyond 463 are Python only.
- **Riemann zeros as oscillators (section 4)** (`experiments/phase_lock_250_37.py section_riemann (the prime-proof branch only)`)
  - Method: Python: embedded first 100 zeta-zero ordinates (stated as from mpmath.zetazero, rounded to 12 decimals); −(1/100) Σ cos(γ log x) and the Kuramoto order parameter at integers 2..213.
  - Result: Lock near π at 3, 37, 71 (+0.232, +0.171, +0.163) and not at 213 (−0.041); 33 of the 35 strongest-lock integers in 2..100 are prime powers (there are 35 prime powers there); mean +0.152 versus −0.039. Reproduced. I could not cross-check the embedded zeros (mpmath not installed); the script itself checks only γ₁ against Odlyzko and monotonicity.
  - Proof status: Numerical illustration only, as the script and the prime-proof branch ROADMAP (⬜ 'Riemann's oscillators') state. The closest known result is the explicit formula; the picture is the one in Mazur and Stein, Prime Numbers and the Riemann Hypothesis (CUP 2016), Part III, 'From the Riemann spectrum to primes'.
- **Shared Air delay-destabilisation thresholds quoted in the new-session README** (`experiments/wyrd-mathlib/README.md 'Delay caveat (numerical, not Lean)' (new-session); no script in the repository`)
  - Method: README: 'two independent methods (imaginary-axis crossing, Chebyshev collocation)'. I checked it independently with my own numpy scan: for s = iω, solve the quadratic in E = e^{−iωτ} from Dd (Delay.lean) with a=1/30, b=1/20, d=1/4, c=1/250, h=3/40; find |E| = 1; take the smallest τ > 0.
  - Result: First imaginary-axis crossings τ = 1.83559 (ω ≈ 0.4288) at g = 3 and τ = 4.76127 (ω ≈ 0.2237) at g = 1, matching the README's 1.8356 and 4.7613. I did not check the crossing direction.
  - Proof status: Numerical only, and the generating scripts are not in the repository. Lean on the new-session branch covers only zero delay and g > g_c (Wyrd.SharedAir.delay_unstable, unstable_every_delay).
- **Precomputed candidate tables for the minimality proof** (`experiments/wyrd/scripts/gen_candidates.py, scripts/GenTables.lean → Wyrd/MinimalData.lean, MinimalTable0–3.lean (both)`)
  - Method: Generated offline; the kernel re-checks every table rather than trusting it.
  - Result: 1,472 rows covering the even sums 1352..4294.
  - Proof status: Kernel-checked: Wyrd.VB_complete, Wyrd.nameOf_all, Wyrd.tables_cover, Wyrd.tables_ok (via table0_ok … table3_ok), Wyrd.checkEntry_sound, Wyrd.ec_complete. The 2026-10-16 build log shows the audit printing only propext, Classical.choice and Quot.sound for the 14 audited theorems.
- **Full-range reproduction of the coupled-naming complete enumeration (the catalogue stopped near N ≈ 350,000)** (`new-session experiments/checks/pangram_all.c, compiled in my scratchpad`)
  - Method: C, run as 6 chunks under 60 s each: [1352,150000], [150000,250000], [250000,340000], [340000,380000], [380000,420000], [420000,457000]
  - Result: 12 solutions, all in the first chunk, byte-identical to coupled_all.txt; 0 solutions in 340000–457000. Cover-stage counts 73836 + 50001 + 45001 + 20001 + 20001 + 18501 = 227,341. Subtracting the 5 shared boundary sums gives 227,336, matching coupled_all.log.
  - Proof status: C only. Only 'none below 4296' is in Lean (Wyrd.smallest_pangram_sum).
- **Full-range reproduction of the plain-naming complete enumeration (the catalogue re-ran only [1352, 20000])** (`new-session experiments/checks/pangram_all.c plain`)
  - Method: C, run as 7 chunks under 60 s each covering 1352..457000
  - Result: 0 solutions in every chunk. Counts 72215 + 39957 + 34980 + 19991 + 19991 + 19987 + 18497 = 225,618; minus 6 shared boundaries gives 225,612, matching plain_all.log.
  - Proof status: C only; not formalised.
- **Sharper cutoff for both namings: no five-pair pangram has N ≥ 35152 = 2·26³** (`My argument, adapted from search/results/results.json's 'N_upper_bound_exclusive: 35152' for Prime-26`)
  - Method: Prose argument. If N ≥ 35152, every q ≥ 17576 has at least 4 letters, so at least four of the p's have one letter (p ≤ 23). Their q's lie in [N−23, N−2], so two of them fall in one aligned block of 26. Those two share their top three base-26 digits. Under plain naming that repeats letters directly. Under coupled naming a_2 = d_2+d_1 and a_3 = d_3+d_2 also coincide. If any q has 5 letters, all five p's have one letter and the same collision follows.
  - Result: The README's 457000 cutoff is valid but loose. Searching to 35152, which pangram_all.c and pairs.c (to 40000) both did, already settles both namings, consistent with all 12 coupled solutions having N ≤ 15990.
  - Proof status: Prose only (mine); not formalised.
- **β = 0 harmonic check through order 16 (README: 'With β = 0, no |m| ≥ 2 term occurs through order 16'; the catalogue re-ran only to n = 10)** (`new-session experiments/ns-phase-audit/audit_v2/exact/p1_highorder.py (copied to scratchpad)`)
  - Method: Exact rational Taylor recurrence with symbolic ν, amplitudes (2, 0, 5, 7), order 16
  - Result: max|m| per order = [0, 1, 1, …, 1] for n = 0..16, in 3.3 s
  - Proof status: Exact Python computation; not in Lean.
- **Independent check of the 100 zeta-zero ordinates embedded in phase_lock_250_37.py (the catalogue could not check them)** (`the prime-proof branch experiments/phase_lock_250_37.py ZETA_ZEROS`)
  - Method: My own double-precision Hardy Z(t): Euler–Maclaurin ζ(1/2+it) with N = 200 and 20 Bernoulli terms, and asymptotic θ(t). Sign changes on a 0.02 grid over (10, 237.5), each refined by bisection.
  - Result: Exactly 100 zeros in (10, 237.5); max |table − computed| = 5.4e-13, consistent with the table's 12-decimal rounding
  - Proof status: Numerical (floating point) only.
- **Direction of the Shared Air delay crossings (the catalogue did not check it)** (`new-session experiments/wyrd-mathlib/README.md 'Delay caveat'; Dd from SharedAir/Delay.lean with a = 1/30, b = 1/20, d = 1/4, c = 1/250, h = 3/40`)
  - Method: numpy: solve the quadratic in E = e^{−iωτ} on the imaginary axis to find τ*, then Newton-continue the root at τ* ± 1e-3
  - Result: g = 3: τ* = 1.835585, ω = 0.428787, Re s goes from −7.6e-5 to +7.6e-5. g = 1: τ* = 4.761272, ω = 0.223749, Re s goes from −1.5e-5 to +1.5e-5. Both first crossings destabilise. The equation is retarded, so the system is stable on [0, τ*) and unstable just beyond, as the README says. The README's 'Chebyshev collocation' second method has no script in the repository.
  - Proof status: Numerical only. Lean covers zero delay (stable_iff) and g > g_c for all τ (delay_unstable, unstable_every_delay).
- **Hardy–Littlewood supply statistics, recomputed from the archived table** (`experiments/prime-pangram/search/results/pack_by_D.tsv (both)`)
  - Method: Python means over the 8,774 rows (even D in 28..17574) of the archived TSV; pack.c was not re-run
  - Result: Mean candidates: 3|D 1554.8 vs 777.5 otherwise; 5|D 1296.7 vs 971.6; overall 1036.7; 30|D 1943.1. All match results.json, and '5|D adds ≈ 25 %' is relative to the overall mean (1296.7/1036.7 = 1.25).
  - Proof status: Archived C output, checked for internal consistency only.
- **Best equal-sum partial at N = 10146** (`search/results/results.json best_partial_example`)
  - Method: Python trial division
  - Result: F+PAB (5+10141), N+OZT (13+10133), EHX+KSJ (2909+7237) and GWL+IDV (4639+5507) are all prime and all sum to 10146. Leftover letters CMQRUY complete the alphabet.
  - Proof status: Python only.

## Appendix A. Definitions used in the statements


### Core wyrd: pangram encoding, primes, √2, minimality search; Mathlib bridge

- `Wyrd.IsPrime`: n is prime: 2 ≤ n ∧ ∀ m, m ∣ n → m = 1 ∨ m = n (literally the RHS of Mathlib's Nat.prime_def; Bridge.isPrime_iff proves IsPrime n ↔ Nat.Prime n).
- `Wyrd.primeB`: Bool trial division: 2 ≤ n and no m in [2, n) divides n (made sound by primeB_sound).
- `Wyrd.digitsAux / Wyrd.digits`: Base-26 digits of n, least significant first, with fuel = n for structural recursion; reimplements Nat.digits 26 (equality not proved).
- `Wyrd.ofDigits`: Reads a least-significant-first base-26 digit list back into a number (d + 26·rest); reimplements Nat.ofDigits 26 (equality not proved).
- `Wyrd.couple / Wyrd.uncouple`: couple replaces each digit by (digit + previous lower digit) mod 26 (0 at the units place); uncouple subtracts the previously recovered digit mod 26.
- `Wyrd.encode / Wyrd.decode / Wyrd.name`: encode n = reverse (couple 0 (digits n)), the coupled name as letter codes 0–25 most significant first; decode inverts it; name renders codes as A–Z (display only).
- `Wyrd.letters`: Concatenation of encode p ++ encode q over all pairs (p, q) of a list.
- `Wyrd.IsPangram N ps`: Structure: ps has length 5, every pair sums to N, both entries of every pair are IsPrime, and letters ps is a permutation of List.range 26 (each letter exactly once).
- `Wyrd.solution`: The five pairs [(1187,3109),(53,4243),(349,3947),(293,4003),(659,3637)].
- `Wyrd.primesOf`: Flattens pairs to [p₁, q₁, p₂, q₂, …].
- `Wyrd.fact`: Factorial by the usual recursion (core-Lean copy of Nat.factorial; equality not proved).
- `Wyrd.nodupB`: Bool 'no repeated element' test on List Nat (correct by nodupB_iff).
- `Wyrd.hasSmallDiv / Wyrd.rejectB`: hasSmallDiv n: some d in [2, 65] with d < n divides n; rejectB n: n < 3, or encode n repeats a letter, or hasSmallDiv n.
- `Wyrd.V / Wyrd.VB / Wyrd.NT`: Generated data (scripts/gen_candidates.py): V = candidate list (525 numbers below 4295), VB = same set as a bitmask, NT = all names below 4295 packed 16 bits per number; all re-checked by the kernel (V_eq, VB_complete, nameOf_all).
- `Wyrd.entry / Wyrd.unpack3 / Wyrd.nameOf`: 16-bit lookup of n's packed name in NT, unpacked into up to three letter codes; nameOf n = encode n for n < 4295 (nameOf_eq).
- `Wyrd.cands N`: Packed candidate pairs for sum N: p ∈ V with 2p < N, N − p in VB, and the two names jointly repeat-free; packed as entry p + 65536·entry (N − p).
- `Wyrd.unblock`: Unpacks a packed candidate into its letter block (both names concatenated).
- `Wyrd.ec C used k`: Bool exact-cover search: can k more blocks from C, disjoint from used and from each other, complete used to all 26 letters? Branches on the lowest uncovered letter.
- `Wyrd.checkEntry (N, Lb)`: Row check: cands N == Lb and ec (Lb.map unblock) [] 5 = false.
- `Wyrd.t{i}_{j} / Wyrd.table{i} / Wyrd.tables`: Generated table rows (N, packed candidate list) for 8 consecutive even sums per chunk, 46 chunks per file, 4 files; tables = table0 ++ table1 ++ table2 ++ table3, covering even N in 1352–4294.

### 250 = 37 phase lock and the mirror keys (prime-proof branch)

- `Wyrd.phase`: phase T n := n % T (ℕ). The 'phase' of tick n on a T-cycle; phase 0 n = n.
- `Wyrd.Locked`: Locked T n m := phase T n = phase T m, i.e. n % T = m % T. Definitionally Mathlib's Nat.ModEq T n m (locked_iff_modEq is Iff.rfl). Locked 0 n m ↔ n = m.
- `Wyrd.IsPrime (Wyrd/Pangram.lean)`: IsPrime n := 2 ≤ n ∧ ∀ m, m ∣ n → m = 1 ∨ m = n. Core-Lean primality, equivalent to Nat.Prime via Wyrd.isPrime_iff (= Nat.prime_def.symm).
- `Wyrd.primeB / primeB_sound (Wyrd/Pangram.lean)`: Boolean trial division over 2..n−1. primeB_sound turns a kernel `decide` of primeB n = true into IsPrime n.
- `Wyrd.Lock.osc`: osc (T : ℕ) (n : ℤ) : ℂ := exp(2π i n / T). The complex exponential 'oscillator' sampled at integer ticks; at T = 0 it is constantly 1.
- `SharedAir.averaged_equilibrium_iff / averaged_stable_equilibrium_iff (used by adler_37; SharedAir/Locking.lean)`: Project lemmas (not definitions): for k > 0, (∃ φ, Δ − k sin φ = 0) ↔ |Δ| ≤ k, and with −k cos φ < 0 ↔ |Δ| < k. Body identical on both branches; only the docstring differs.

### Rainbow geometry (Descartes, Alexander’s dark band, spectrum)

- `Wyrd.Rainbow.refr (Defs.lean)`: refr n i := arcsin (sin i / n): the refraction angle inside the drop, defined so that Snell's law sin i = n sin r holds (for n ≥ 1).
- `Wyrd.Rainbow.dev (Defs.lean)`: dev k n i := k·π + 2i − 2(k+1)·refr n i: the total turning angle of a ray entering at incidence i with k internal reflections. It is not reduced mod 2π.
- `Wyrd.Rainbow.bowIncidence (Defs.lean)`: bowIncidence k n := arccos (√((n² − 1)/(k(k+2)))): the incidence angle of the k-th bow. It is meaningful for 1 < n < k+1; outside that range the formula clamps to 0 or π/2.
- `Observation-angle convention (in statements, not a def)`: The angle from the antisolar point is written π − dev 1 n i for the primary and dev 2 n i − π for the secondary. The link to the observed sky angle is prose; I checked numerically that for n = 4/3 on i ∈ [0, π/2] these lie in [0°, 42.03°] and [50.98°, 180°], so no mod-2π reduction is needed.

### Body-water physiology models and Limits models

- `Wyrd.BodyWater.Body`: Structure of real weight, tbw, ecw, plasma, with fields asserting 0 < plasma < ecw < tbw < weight.
- `Wyrd.BodyWater.Body.icw / interstitial / solids`: icw = tbw - ecw; interstitial = ecw - plasma; solids = weight - tbw.
- `Wyrd.BodyWater.fatFraction`: fatFraction h t = 1 - t/h (two-compartment model, fat-free-mass water fraction h).
- `Wyrd.BodyWater.icwEq / ecwEq`: Equilibrium water split: icwEq W Oi Oe = W·Oi/(Oi+Oe), ecwEq W Oi Oe = W·Oe/(Oi+Oe).
- `Wyrd.BodyWater.serumNa`: Model serum sodium serumNa S W = S/W (Edelman without slope or intercept).
- `Wyrd.Limits.vagal`: vagal V₀ rsa insp A = V₀(1 - 0.8A)(1 - rsa·insp).
- `Wyrd.Limits.symp`: symp A = 0.1 + 0.5·max A 0.
- `Wyrd.Limits.Cond, resp, respI`: Cond has real fields perceived and contact; resp r p q c = r + p·perceived + q·contact; respI adds i·perceived·contact.
- `Wyrd.Limits.bedsideAwake / skinAwake / skinAsleep / apart`: The conditions ⟨1,0⟩, ⟨1,1⟩, ⟨0,1⟩, ⟨0,0⟩.
- `Wyrd.Limits.LinSol`: Prop: x, y, z : ℝ → ℝ satisfy, at every t, x' = -x/30 - z + (g/25)y, y' = -y/20 + (g/10)x, z' = -z/4 + (3g/40)x (HasDerivAt).
- `Wyrd.Limits.lockIndex`: lockIndex k n m ψ₀ = ‖(Σ_{j<n} exp(i k(ψ₀ + 2π m j/n)))/n‖, the k-th harmonic index over one perfect n:m cycle.
- `Wyrd.Limits.xcov`: xcov ω X Y h = (ω/2π)∫_0^{2π/ω} X(t) Y(t+h) dt, the one-period cross-covariance.
- `Wyrd.Limits.fieldNoCap`: The SharedAir field with cap ≡ 1: (-x/30 - z + 0.04gy - 0.02x³, -y/20 + 0.10gx - 0.02y³, (0.30gx - z)/4).
- `Wyrd.Limits.capDeriv`: capDeriv y = -(2y/0.64)/(1 + (y/0.8)²)², the derivative of cap.
- `Wyrd.Limits.jac`: The hand-written 3×3 Jacobian of SharedAir.field g at p.
- `Wyrd.Limits.bistX / bistF (private)`: bistX g y = y(1/20 + 0.02y²)/(0.1g); bistF g y = first field component along the curve where the 2nd and 3rd components vanish.
- `Wyrd.SharedAir.cap (imported)`: cap y = 1/(1 + (y/0.8)²), the response-capacity limit.
- `Wyrd.SharedAir.field (imported)`: The nonlinear zero-delay, zero-noise, U = 0 field: (-x/30 - z + 0.04gy - 0.02x³, -y/20 + 0.10gx - 0.02y³, (0.30gx·cap y - z)/4).
- `Wyrd.SharedAir.P / H / G (imported)`: P a b d c h g s = (s+a)(s+b)(s+d) + hg(s+b) - cg²(s+d) (characteristic polynomial); H = (s+a)(s+d)² + h²/(4c)(s+b); G = h/(2c)·(s+b)/(s+d) (optimal-gain curve).

### Periodic Navier–Stokes I: the phase family, symmetries, selection rules, averages

- `Wyrd.PeriodicNS.Field`: A structure of three real functions u1, u2, u3 : ℝ → ℝ → ℝ → ℝ, the velocity components (it shadows Mathlib's Field class).
- `Wyrd.PeriodicNS.dx / dy / dz`: Partial derivatives defined with Mathlib's one-variable deriv in a single coordinate. deriv returns 0 where the function is not differentiable, so they are only meaningful for differentiable fields; all fields used here are trigonometric.
- `Wyrd.PeriodicNS.Field.div / Field.curl / Field.smul`: Divergence dx u1 + dy u2 + dz u3; curl (dy u3 − dz u2, dz u1 − dx u3, dx u2 − dy u1); componentwise scaling by a real A.
- `Wyrd.PeriodicNS.avg`: The normalised average: the iterated interval integral over [0,2π]³ (x outermost) divided by (2π)³.
- `Wyrd.PeriodicNS.Field.energy`: E = ½⟨u1² + u2² + u3²⟩.
- `Wyrd.PeriodicNS.Field.enstrophy`: Z = energy of the curl, i.e. ½⟨|ω|²⟩.
- `Wyrd.PeriodicNS.Field.gradSq`: ⟨|∇u|²⟩, the average of the sum of the nine squared partial derivatives.
- `Wyrd.PeriodicNS.Field.palin`: D = gradSq of the curl = ⟨|∇ω|²⟩, with no factor ½, so the standard balance reads dZ/dt = S − νD.
- `Wyrd.PeriodicNS.Field.stretching`: S = ⟨Σ_ij ω_i (∂_j u_i) ω_j⟩, vortex stretching as a static functional of a given field.
- `Wyrd.PeriodicNS.coeff`: Complex Fourier coefficient on [0,2π]³ for k ∈ ℤ³. It is defined in Field.lean but used by no theorem in this group (SignFlip uses it).
- `Wyrd.PeriodicNS.v`: The example field (sin y, sin z, cos x − cos(x + y)).
- `Wyrd.PeriodicNS.vphi`: The phase family u_φ = (sin y, sin z, cos x − cos(x + y + φ)), with u_0 = v.
- `Wyrd.PeriodicNS.rotShift`: u ↦ (−u1, −u2, u3) evaluated at (−x, −y, z + π): rotation by π about the z-axis, then a shift by π in z.
- `Wyrd.PeriodicNS.mirror`: u ↦ (u1, u2, −u3) evaluated at (x + π, y, −z − π).
- `Wyrd.PeriodicNS.Counts`: Eight naturals ap, am, bp, bm, gp, gm, dp, dm counting signed initial Fourier factors α±, β±, γ±, δ± in one monomial.
- `Wyrd.PeriodicNS.Counts.deg / harm / Balanced`: deg is the sum of all eight counts (amplitude degree). harm = dp − dm ∈ ℤ is the phase harmonic m. Balanced is the zero total wave vector: gp−gm+dp−dm = 0, ap−am+dp−dm = 0 and bp = bm.
- `Averages_I3 / PhaseFamily_I3, _tm, _tp, _c0 (private)`: The unnormalised iterated integral over [0,2π]³; one encoded mode a cos(k·x) + b sin(k·x) from (a, b, k) ∈ ℝ×ℝ×ℤ³; a list-sum of modes; and its constant coefficient (the sum of a over modes with k = 0). Duplicated in both files.

### Periodic Navier–Stokes II: scaling, blow-up rescalings, sign flip, Galerkin, Grönwall, quantifiers

- `Wyrd.PeriodicNS.Field`: A structure of three real functions u1, u2, u3 : ℝ→ℝ→ℝ→ℝ, with no smoothness, periodicity or divergence-free condition (Field.lean). It shadows Mathlib's Field class.
- `Wyrd.PeriodicNS.dx / dy / dz`: Partial derivatives as Lean's deriv in one coordinate, with the others fixed (0 wherever the function is not differentiable).
- `Wyrd.PeriodicNS.Field.div`: Divergence dx u1 + dy u2 + dz u3.
- `Wyrd.PeriodicNS.Field.curl`: Vorticity (dy u3 − dz u2, dz u1 − dx u3, dx u2 − dy u1).
- `Wyrd.PeriodicNS.Field.smul`: Componentwise multiplication of a Field by a real amplitude A.
- `Wyrd.PeriodicNS.avg`: Normalised average: the iterated interval integral of f over [0,2π]³ divided by (2π)³.
- `Wyrd.PeriodicNS.Field.energy`: E = ½⟨u1² + u2² + u3²⟩.
- `Wyrd.PeriodicNS.Field.enstrophy`: Z = energy of the curl = ½⟨|ω|²⟩.
- `Wyrd.PeriodicNS.Field.gradSq`: ⟨|∇u|²⟩, the average of the sum of all nine squared first partials.
- `Wyrd.PeriodicNS.Field.palin`: D = gradSq of the curl = ⟨|∇ω|²⟩, with no factor ½ (twice the usual palinstrophy).
- `Wyrd.PeriodicNS.Field.stretching`: Vortex stretching S = ⟨Σᵢⱼ ωᵢ (∂ⱼuᵢ) ωⱼ⟩.
- `Wyrd.PeriodicNS.coeff`: Complex Fourier coefficient (1/(2π)³)∫∫∫_{[0,2π]³} f·e^{−i k·x} for k ∈ ℤ³ (not Mathlib's mFourierCoeff).
- `Wyrd.PeriodicNS.v`: The example field (sin y, sin z, cos x − cos(x + y)) (Example.lean, outside this group).
- `Wyrd.PeriodicNS.vScaled`: v_k = (sin ky, sin kz, cos kx − cos(kx + ky)) for k ∈ ℕ: a fixed-amplitude spatial dilation of v, not the Navier–Stokes scaling λu(λx, λ²t).
- `Wyrd.PeriodicNS.Scaling_I3 (private)`: The unnormalised iterated integral over [0,2π]³ (avg f = Scaling_I3 f / (2π)³).
- `Wyrd.PeriodicNS.Scaling_tm / Scaling_tp / Scaling_c0 / Scaling_sc (private)`: The encoding of a Fourier mode (a, b, p, q, r) ↦ a cos(px+qy+rz) + b sin(px+qy+rz); a list of modes summed into a trigonometric polynomial; its constant coefficient (the sum of a over zero-frequency modes); and the rescaling of a mode's amplitude by c and its wave vector by k.
- `Wyrd.PeriodicNS.AltB`: AltB admD zero Smooth := ∀ u₀, admD u₀ → Smooth u₀ zero: an abstract form of Clay alternative (B).
- `Wyrd.PeriodicNS.AltD`: AltD admD admF Smooth := ∃ u₀ f, admD u₀ ∧ admF f ∧ ¬ Smooth u₀ f: an abstract form of Clay alternative (D).

### Shared Air feedback model

- `Wyrd.SharedAir.Hyp a b d c h`: Structure of standing hypotheses: 0 < a, a < b, 3b − 2a ≤ d, 0 < c, 0 < h (sufficient, not necessary).
- `Wyrd.SharedAir.P a b d c h g s`: Real characteristic polynomial (s+a)(s+b)(s+d) + h g (s+b) − c g² (s+d) of the zero-delay linear system.
- `Wyrd.SharedAir.Pc a b d c h g z`: The same polynomial with a complex variable z and real coefficients.
- `Wyrd.SharedAir.sysMatrix a b d r q h g`: 3×3 complex matrix [[−a, r g, −1], [q g, −b, 0], [h g, 0, −d]] of the linear system x' = −ax − z + rgy, y' = −by + qgx, z' = −dz + hgx.
- `Wyrd.SharedAir.H a b d c h s`: Envelope cubic (s+a)(s+d)² + h²/(4c)·(s+b) from completing the square in g.
- `Wyrd.SharedAir.G b d c h s`: Gain that completes the square: h/(2c)·(s+b)/(s+d); the optimal coupling is g* = G(s*).
- `Wyrd.SharedAir.gc a b d c h`: Critical coupling (h b + √(h²b² + 4abcd²))/(2cd), the positive root of P(0, g) = 0.
- `Wyrd.SharedAir.Dd a b d c h g τ s`: Real delayed characteristic function (s+a)(s+b)(s+d) + hg(s+b)e^{−sτ} − cg²(s+d)e^{−2sτ}.
- `Wyrd.SharedAir.delayMatrix a b d r q h g τ z`: 3×3 complex characteristic matrix with every coupling term multiplied by e^{−zτ}.
- `Wyrd.SharedAir.cap y`: Response capacity 1/(1 + (y/0.8)²).
- `Wyrd.SharedAir.field g p`: Project encoding of the nonlinear 'Perceived' Shared Air field at zero input, noise and delay: (−x/30 − z + 0.04gy − 0.02x³, −y/20 + 0.10gx − 0.02y³, (0.30gx·cap(y) − z)/4).
- `Wyrd.SharedAir.linField g p`: Linear field (−x/30 − z + (g/25)y, −y/20 + (g/10)x, −z/4 + (3g/40)x).
- `Wyrd.SharedAir.Z1 θ / Z2 θ`: First and second circular phase moments (1/m)Σ e^{iθ_j} and (1/m)Σ e^{2iθ_j} of m phases (0 when m = 0).
- `Wyrd.SharedAir.vel K θ j`: Mean-field (Kuramoto, rotating-frame) velocity K·Im(Z1 e^{−iθ_j}).
- `Wyrd.SharedAir.Z1dot K θ`: (1/m)Σ i·vel_j·e^{iθ_j}, the rate of change of Z1 implied by the velocities.
- `Wyrd.SharedAir.confA / confB`: 4-cell phase configurations (0, 0, π/2, −π/2) and (0, 0, 0, π).
- `Wyrd.SharedAir.confA24 / confB24`: 24-cell configurations repeating confA / confB six times (index j mod 4).
- `Wyrd.SharedAir.VE W v`: Extracellular water W − Σ v_i.
- `Wyrd.SharedAir.flux K n nE W v i`: Water flux into cell i: K_i (n_i/v_i − n_E/V_E).
- `Wyrd.SharedAir.freeEnergy n nE W v`: −Σ n_i log v_i − n_E log V_E.
- `Wyrd.SharedAir.coin b`: ±1 value of a Boolean coin (true ↦ 1, false ↦ −1).
- `Wyrd.SharedAir.E f`: Uniform average of f over the 16 outcomes of four ±1 coins (u, e1, e2, e3).
- `Wyrd.SharedAir.X / M / O`: Signals u + e1, u + e2, u + 3e3 (shared input plus independent noise, no direct coupling).
- `Wyrd.SharedAir.corr f g`: E[fg]/√(E[f²]E[g²]) (uncentred; equals Pearson correlation for mean-zero signals).

### Computer searches, numerics and leftover WIP

- `Wyrd.PeriodicNS.Field`: A velocity field given by three functions ℝ→ℝ→ℝ→ℝ (u1, u2, u3); no regularity or periodicity built in.
- `Wyrd.PeriodicNS.dx / dy / dz`: Partial derivatives defined coordinatewise with Lean's one-variable deriv.
- `Wyrd.PeriodicNS.Field.div / curl / smul`: Divergence, curl (vorticity) and scaling by an amplitude A, defined with dx/dy/dz.
- `Wyrd.PeriodicNS.avg`: Normalised average: iterated interval integral over [0,2π]³ divided by (2π)³.
- `Wyrd.PeriodicNS.Field.energy / enstrophy / gradSq / palin / stretching`: E = ½⟨|u|²⟩; Z = E of the curl; ⟨|∇u|²⟩ (sum of nine squared partials); D = gradSq of the curl (no ½); S = ⟨Σ ω_i ∂_j u_i ω_j⟩.
- `Wyrd.PeriodicNS.coeff`: Fourier coefficient at k ∈ ℤ³: normalised integral of f·exp(−i k·x) over [0,2π]³.
- `Wyrd.PeriodicNS.v`: The explicit field (sin y, sin z, cos x − cos(x+y)), i.e. u_φ at φ = 0.
- `Wyrd.PeriodicNS.AltB / AltD`: Abstract Clay alternatives: B = every admissible datum is smooth with the zero force; D = some admissible datum and admissible force are not smooth.
- `coupled base-26 naming (Wyrd.encode, coupled_prime26_pangram.encode)`: Base-26 digits d_j (units first), letter a_0 = d_0, a_j = (d_j + d_{j−1}) mod 26, written A..Z; reversible (Wyrd.decode_encode).
- `plain base-26 naming (encode_plain; Prime-26 in search/)`: Base-26 digits written A=0..Z=25, most significant first, no leading A.
- `Wyrd.IsPangram N ps`: ps is a list of 5 pairs, each summing to N, all entries IsPrime, and the concatenated coupled names of all ten numbers are a permutation of [0..25].
- `five-pair prime pangram (computations)`: Five Goldbach pairs p+q = N whose ten names use each letter exactly once (exact cover of the alphabet), under the coupled or plain naming.
- `Prime-26 word / perfect pangram / equation pangram (search/)`: Word = prime whose plain base-26 digits are pairwise distinct; perfect pangram = 10 words covering 26 letters once; equation pangram = perfect pangram splittable into two groups of five with equal numeric sums.
- `equal-difference five-pair pangram (search/diff.c)`: Five pairs of Prime-26 words with q − p = D for all five, covering every letter once.
- `NICU pronounceable prime word (nicu-pangram/)`: Bijective base 26 (A=1..Z=26) value is prime; word = onset + nucleus (1 vowel or 2 distinct vowels, y a vowel) + coda, onset/coda from the 70/175-entry lists in clusters.py.
- `regimes R(o,c), F(n,m) (nicu-pangram/)`: R(o,c): English cluster lists plus all consonant strings of length ≤ o as onsets and ≤ c as codas; F(n,m): free family, onset ≤ n consonants, one vowel, coda ≤ m consonants.
- `u_φ and z_{n,m} (ns-phase-audit)`: u_0 = (α sin y, β sin z, γ cos x − δ cos(x+y+φ)) on [0,2π]³; z_{n,m} = coefficient of e^{imφ} in the t^n Taylor coefficient of Z(t) for the NS solution from u_0.
- `Wyrd.PeriodicNS.Counts / Counts.Balanced (NS SelectionRules)`: Counts of α±, β±, γ±, δ± Fourier factors in a monomial; Balanced = wave vectors sum to zero along each axis.
- `Locked T n m / osc T n`: Locked T n m means n % T = m % T; osc T n = exp(2πi n/T).

## Appendix B. How this list was checked

Each area was catalogued by one agent and checked by a second, adversarial one. The reviewer re-counted the declarations by grep, compared every statement with the source, re-searched Mathlib, and tried to refute every novelty claim. A third pass checked every literature citation and re-tested every unresolved claim.

| Area | Declarations (grep) | Covered | Reviewer corrections |
|---|---:|---:|---:|
| Core wyrd: pangram encoding, primes, √2, minimality search; Mathlib bridge | 255 | 255 | 10 |
| 250 = 37 phase lock and the mirror keys (prime-proof branch) | 62 | 62 | 12 |
| Rainbow geometry (Descartes, Alexander’s dark band, spectrum) | 73 | 73 | 14 |
| Body-water physiology models and Limits models | 83 | 83 | 16 |
| Periodic Navier–Stokes I: the phase family, symmetries, selection rules, averages | 60 | 60 | 12 |
| Periodic Navier–Stokes II: scaling, blow-up rescalings, sign flip, Galerkin, Grönwall, quantifiers | 56 | 56 | 17 |
| Shared Air feedback model | 65 | 65 | 27 |
| Computer searches, numerics and leftover WIP | 21 | 21 | 7 |
