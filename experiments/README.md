# experiments

Side explorations — not part of the app.

## `coupled_prime26_pangram.py`

Finds five pairs of primes that share one sum (Goldbach pairs), where the ten
primes' base-26 names together use every letter A–Z exactly once.

Plain base-26 names have no solution up to N = 18,250. With *coupled* digits
(each letter = its digit + the digit to its right, mod 26 — still reversible),
the smallest solution is N = 4296:

```
UKR + TEP  = 4296    (1187 + 3109)
 DB + NMF  = 4296    (53 + 4243)
 YL + AQV  = 4296    (349 + 3947)
 SH + CWZ  = 4296    (293 + 4003)
 IJ + OGX  = 4296    (659 + 3637)
```

Run (standard library only):

```
python3 experiments/coupled_prime26_pangram.py          # coupled, ~0.2s
python3 experiments/coupled_prime26_pangram.py --plain  # plain, no solution
```

Formal proofs of these facts (in Lean 4) live in [`wyrd/`](wyrd/).

[`checks/`](checks/) is a computer search, not a Lean proof, that enumerates
*every* solution instead of stopping at the first: exactly 12 five-pair pangrams
exist under the coupled naming (all with N ≤ 15990), and none at all under plain
naming, for every even N up to the 457000 cutoff beyond which the names are too
long to fit the alphabet.

Caveat: the coupling rule was chosen after the plain search failed, so the
result shows that *a* simple reversible naming yields a pangram, not that
primes "want" to spell the alphabet.

[`prime-pangram/`](prime-pangram/) preserves the Prime-26 search programs and
raw results (`search/`) and a copy of the NICU-Module pronounceable-prime
pangram project with its onset/coda lists and dictionaries (`nicu-pangram/`),
with a README giving definitions, reproduction commands, runtimes and what is
still unfinished.

## `phase_lock_250_37.py`

On the number line 250 and 37 differ. On a cycle of length `T` a tick is seen
only as its phase `n % T`, and 250 and 37 show the same phase exactly when `T`
divides `250 − 37 = 213 = 3 · 71`. Two oscillators of one period that start
together are phase locked, so a period-71 oscillator reads 250 as 37. The prime
71 is the key, 3 is the other, and there are no more. In the app's own
notation, `250 ; 37 → 71`: hold the two together without collapsing either and
the key appears.

The script prints four sections: the lock (the periods are the divisors of
213, the prime keys are 3 and 71, and `250 = 3 · 71 + 37` with all three
prime); oscillators (a 71-cycle drawn in ASCII, the sine wave, a stroboscope
at 71 flashes per turn that cannot tell `250 k` from `37 k`, and a 250 Hz tone
that sampled at 71 Hz gives the samples of a 37 Hz tone); the Chinese
remainder theorem (locked on 213 iff locked on 3 and on 71, every pair
checked); and Riemann's oscillators, where the phases `γ · log x` of the first
100 zeta zeros lock near π at prime powers, 3, 37 and 71 among them, and not at
`213 = 3 · 71`. From 2 to 100 there are 35 prime powers; of the 35 integers in
that range where the lock is strongest, 33 are prime powers.

```
python3 experiments/phase_lock_250_37.py           # all four sections
python3 experiments/phase_lock_250_37.py --check   # assertions only
```

Sections 1–3 are theorems, machine-checked in [`wyrd/Wyrd/Lock.lean`](wyrd/Wyrd/Lock.lean)
(core Lean) and [`wyrd-mathlib/WyrdMathlib/Lock.lean`](wyrd-mathlib/WyrdMathlib/Lock.lean)
(Mathlib: `ZMod`, `Nat.ModEq`, the Chinese remainder theorem, the complex
exponential, and `ring_lock`: in any ring `250 = 37` iff the characteristic
divides 213). Section 4 is numerical evidence about a truncated sum, not a
proof; the zeros were computed with `mpmath.zetazero` and are embedded so the
script needs only the standard library. Nothing anywhere makes `250 = 37` in
the integers: `not_on_the_line` proves the opposite, and that no cycle longer
than 213 locks them either.
