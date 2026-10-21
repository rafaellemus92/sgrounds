#!/usr/bin/env python3
"""250 = 37, on the 71-cycle.

On the number line 250 and 37 are different. On a cycle of length T a tick n
is seen only as its phase n % T, and 250 and 37 show the same phase exactly
when T divides 250 - 37 = 213 = 3 * 71. Two oscillators of the same period
that start together are phase locked, so a period-71 oscillator reads 250 as
37. The prime 71 is the key; 3 is the other one; there are no more.

Four sections, printed in order:

  1. the lock          the periods on which 250 and 37 coincide, and the keys
  2. oscillators       a period-71 clock, a sine wave, a stroboscope, aliasing
  3. chinese remainder locking on 3 and on 71 is locking on 213
  4. riemann (illustration only)  the first 100 zeros of the zeta function as
                       oscillators in log x: their phases lock near pi at prime
                       powers such as 3, 37 and 71, and not at 213 = 3 * 71
  5. why 71 is the key the prime keys carry log 213 (Chebyshev), Lucas's
                       certificate that 71 is prime, the multiplicative refusal,
                       and primes in phase with 37 on the 213-cycle (Dirichlet)

Sections 1-3 and 5 are theorems, machine-checked in wyrd/Wyrd/Lock.lean (core
Lean) and wyrd-mathlib/WyrdMathlib/Lock.lean and Key.lean (Mathlib). Section 4
is numerical evidence about a truncated sum, not a proof of anything.

Run (standard library only):

    python3 experiments/phase_lock_250_37.py           # print all five sections
    python3 experiments/phase_lock_250_37.py --check   # assertions only
"""

import cmath
import contextlib
import io
import math
import sys

A, B = 250, 37
D = A - B  # 213


def check(cond, what):
    """A check that `python3 -O` cannot strip, unlike `assert`."""
    if not cond:
        raise SystemExit(f"check failed: {what}")


# ---------------------------------------------------------------- arithmetic

def is_prime(n):
    if n < 2:
        return False
    return all(n % k for k in range(2, int(n ** 0.5) + 1))


def prime_factors(n):
    out, p = [], 2
    while p * p <= n:
        while n % p == 0:
            out.append(p)
            n //= p
        p += 1
    if n > 1:
        out.append(n)
    return out


def divisors(n):
    return [t for t in range(1, n + 1) if n % t == 0]


def locked(T, n, m):
    """Same phase on the T-cycle."""
    return n % T == m % T


def lock_periods(a, b):
    """Every T on which the distinct ticks a and b coincide. A lock period
    divides |a - b|, so it is at most |a - b|: the search below is complete,
    not a sample. (Equal ticks coincide on every T, so they are refused.)"""
    if a == b:
        raise ValueError("equal ticks lock on every period")
    d = abs(a - b)
    return [T for T in range(1, d + 1) if locked(T, a, b)]


def is_prime_power(n):
    f = prime_factors(n)
    return len(f) > 0 and len(set(f)) == 1


# ---------------------------------------------------------------- 1. the lock

def section_lock():
    print("1. THE LOCK")
    print(f"   {A} - {B} = {D} = {' * '.join(map(str, prime_factors(D)))}")
    periods = lock_periods(A, B)
    print(f"   periods T with {A} % T == {B} % T:  {periods}")
    print(f"   divisors of {D}:                      {divisors(D)}")
    keys = [T for T in periods if is_prime(T)]
    print(f"   prime keys:                          {keys}")
    q, r = divmod(A, 71)
    print(f"   {A} = {q} * 71 + {r}   (quotient, divisor and remainder all prime: "
          f"{is_prime(q)}, {is_prime(71)}, {is_prime(r)})")
    print(f"   on the line: {A} == {B} is {A == B}; on the 71-cycle: {A % 71} == {B % 71} is {A % 71 == B % 71}")
    check(periods == [1, 3, 71, 213] and keys == [3, 71] and (q, r) == (3, 37), "the lock")
    print()


# ---------------------------------------------------------------- 2. oscillators

def osc(T, n):
    """A sinusoidal oscillator of period T at tick n: its point on the unit circle."""
    return cmath.exp(2j * math.pi * n / T)


def ring(T, marks):
    """An ASCII T-cycle with the given ticks marked by their phase."""
    cells = ["."] * T
    for label, n in marks:
        cells[n % T] = label
    return "".join(cells)


def section_oscillators():
    print("2. OSCILLATORS")
    print(f"   71-cycle, tick {A} marked a, tick {B} marked b (same cell means same phase):")
    print("   " + ring(71, [("a", A), ("b", B)]))
    print("   70-cycle, for contrast:")
    print("   " + ring(70, [("a", A), ("b", B)]))
    gap = abs(osc(71, A) - osc(71, B))
    print(f"   |exp(2 pi i 250/71) - exp(2 pi i 37/71)| = {gap:.1e}")
    print(f"   sin(2 pi 250/71) = {math.sin(2 * math.pi * A / 71):+.12f}")
    print(f"   sin(2 pi  37/71) = {math.sin(2 * math.pi * B / 71):+.12f}")
    # stroboscope: a wheel turning 250 times per second, lit 71 times per second
    strobe = all(locked(71, A * k, B * k) for k in range(0, 1000))
    print(f"   stroboscope: (250 k) % 71 == (37 k) % 71 for k < 1000: {strobe}")
    # aliasing: a 250 Hz tone sampled at 71 Hz gives the samples of a 37 Hz tone
    alias = max(abs(math.sin(2 * math.pi * A * k / 71) - math.sin(2 * math.pi * B * k / 71))
                for k in range(71))
    print(f"   aliasing: 250 Hz sampled at 71 Hz vs 37 Hz, largest sample gap: {alias:.1e}")
    # Which sample rates T cannot tell the two tones apart at all? The sample
    # sequences repeat every T samples, so k < T covers every integer k.
    def gap_of(f, T):
        return max(abs(f(A * k / T) - f(B * k / T)) for k in range(T))
    phasor = lambda x: cmath.exp(2j * math.pi * x)
    cosine = lambda x: math.cos(2 * math.pi * x)
    sine = lambda x: math.sin(2 * math.pi * x)
    rates = {name: [T for T in range(1, 300) if gap_of(f, T) < 1e-9]
             for name, f in (("complex phasor", phasor), ("cosine", cosine), ("sine", sine))}
    print("   rates T < 300 whose samples of the 250 Hz and 37 Hz tones agree for every k:")
    for name, Ts in rates.items():
        print(f"      {name:<15}{Ts}")
    print("   the real cosine folds 250 onto -37 at the rates dividing 287 = 250 + 37 = 7 * 41,")
    print("   and the sine is sampled at its zeros at T = 2; the complex phasor has no such extras")
    check(gap < 1e-12 and strobe and alias < 1e-9, "oscillators")
    check(not locked(70, A, B), "the 70-cycle does not lock")
    check(rates["complex phasor"] == [1, 3, 71, 213], "complex sampling rates")
    check(rates["cosine"] == [1, 3, 7, 41, 71, 213, 287], "cosine sampling rates")
    check(rates["sine"] == [1, 2, 3, 71, 213], "sine sampling rates")
    print()


# ---------------------------------------------------------------- 3. chinese remainder

def section_crt():
    print("3. CHINESE REMAINDER")
    ok = all((locked(213, n, m) == (locked(3, n, m) and locked(71, n, m)))
             for n in range(213) for m in range(213))
    print(f"   for all n, m < 213: locked on 213 iff locked on 3 and on 71: {ok}")
    print(f"   {A} % 3 = {A % 3}, {B} % 3 = {B % 3};  {A} % 71 = {A % 71}, {B} % 71 = {B % 71};"
          f"  {A} % 213 = {A % 213}, {B} % 213 = {B % 213}")
    check(ok, "chinese remainder")
    print()


# ---------------------------------------------------------------- 4. riemann's oscillators

# Imaginary parts of the first 100 nontrivial zeros of the Riemann zeta function,
# computed with mpmath.zetazero at 25 digits and rounded to 12 decimals, so that
# this script needs only the standard library.
ZETA_ZEROS = [
    14.134725141735, 21.022039638772, 25.010857580146, 30.424876125860,
    32.935061587739, 37.586178158826, 40.918719012147, 43.327073280915,
    48.005150881167, 49.773832477672, 52.970321477714, 56.446247697063,
    59.347044002602, 60.831778524610, 65.112544048082, 67.079810529494,
    69.546401711174, 72.067157674482, 75.704690699084, 77.144840068875,
    79.337375020249, 82.910380854086, 84.735492980517, 87.425274613125,
    88.809111207634, 92.491899270558, 94.651344040520, 95.870634228245,
    98.831194218194, 101.317851005731, 103.725538040478, 105.446623052326,
    107.168611184276, 111.029535543170, 111.874659176993, 114.320220915453,
    116.226680320858, 118.790782865976, 121.370125002421, 122.946829293553,
    124.256818554346, 127.516683879596, 129.578704199956, 131.087688530933,
    133.497737202998, 134.756509753374, 138.116042054533, 139.736208952121,
    141.123707404021, 143.111845807621, 146.000982486766, 147.422765342560,
    150.053520420785, 150.925257612241, 153.024693811199, 156.112909294238,
    157.597591817594, 158.849988171421, 161.188964137596, 163.030709687182,
    165.537069187900, 167.184439978175, 169.094515415569, 169.911976479412,
    173.411536519592, 174.754191523366, 176.441434297710, 178.377407776100,
    179.916484020257, 182.207078484366, 184.874467848387, 185.598783677707,
    187.228922583502, 189.416158656017, 192.026656360714, 193.079726603846,
    195.265396679529, 196.876481840958, 198.015309676252, 201.264751943704,
    202.493594514141, 204.189671803105, 205.394697202163, 207.906258887806,
    209.576509716856, 211.690862595365, 213.347919359713, 214.547044783491,
    216.169538508264, 219.067596349021, 220.714918839314, 221.430705554693,
    224.007000254604, 224.983324669582, 227.421444279679, 229.337413305525,
    231.250188700499, 231.987235253180, 233.693404178908, 236.524229665816,
]


def zero_phases(x, N=100):
    """The phases gamma_k * log x of the first N zero-oscillators, as unit vectors.

    In the explicit formula psi(x) = x - sum_rho x^rho / rho - ..., each pair of
    zeros 1/2 +- i gamma contributes an oscillation in log x. The derivative of
    the oscillating part is -2 x^(-1/2) * sum cos(gamma log x), so the sum of
    the oscillators jumps up where the cosines are near -1 together: where the
    phases lock near pi. The jumps of psi are at the prime powers."""
    L = math.log(x)
    return [cmath.exp(1j * g * L) for g in ZETA_ZEROS[:N]]


def order_parameter(x, N=100):
    """Kuramoto order parameter r e^(i psi) of the zero-oscillators at x.
    r near 1 means the phases agree; psi is their mean."""
    z = sum(zero_phases(x, N)) / N
    return abs(z), math.atan2(z.imag, z.real) % (2 * math.pi)


def lock_at_pi(x, N=100):
    """-(1/N) sum cos(gamma log x): positive and large when the phases lock near pi."""
    return -sum(v.real for v in zero_phases(x, N)) / N


def section_riemann():
    N = len(ZETA_ZEROS)
    print(f"4. RIEMANN'S OSCILLATORS  (illustration with the first {N} zeros; not a proof)")
    print("   x    prime power?   r      mean phase / pi   lock at pi")
    for x in (3, 37, 71, 70, 72, 213, 212, 214):
        r, psi = order_parameter(x, N)
        print(f"   {x:<4} {str(is_prime_power(x)):<14} {r:.3f}  {psi / math.pi:>6.2f}            {lock_at_pi(x, N):+.3f}")
    xs = range(2, 101)
    pp = [x for x in xs if is_prime_power(x)]
    top = sorted(xs, key=lambda x: -lock_at_pi(x, N))[:len(pp)]
    hit = len(set(top) & set(pp))
    mean_pp = sum(lock_at_pi(x, N) for x in pp) / len(pp)
    mean_other = sum(lock_at_pi(x, N) for x in xs if x not in pp) / (len(list(xs)) - len(pp))
    print(f"   among 2..100 there are {len(pp)} prime powers; of the {len(pp)} integers where the")
    print(f"   oscillators lock most strongly at pi, {hit} are prime powers")
    print(f"   mean lock at pi: prime powers {mean_pp:+.3f}, other integers {mean_other:+.3f}")
    print("   The truncated sum blurs each jump over a width of about x / 40 at this N,")
    print("   so neighbours of a prime inherit some of its lock; nothing here is exact.")
    # the table: 100 zeros, strictly increasing, and the first one as published in
    # Odlyzko's tables, 14.134725141734693790...
    check(len(ZETA_ZEROS) == 100 and all(a < b for a, b in zip(ZETA_ZEROS, ZETA_ZEROS[1:])),
          "zeta zero table")
    check(abs(ZETA_ZEROS[0] - 14.13472514173469) < 1e-11, "first zeta zero")
    check(mean_pp > mean_other, "prime powers lock more than other integers")
    print()


# ---------------------------------------------------------------- 5. why 71 is the key

def von_mangoldt(n):
    """log p if n is a power of the prime p, else 0 (as a (p, k) pair; 0 means none)."""
    f = prime_factors(n)
    return math.log(f[0]) if f and len(set(f)) == 1 else 0.0


def lucas_certificate(p, g):
    """Lucas's test: g^(p-1) = 1 and g^((p-1)/q) != 1 mod p for every prime q | p-1.
    Returns the list of (q, g^((p-1)/q) mod p) checked; prime iff all != 1."""
    checks = [(q, pow(g, (p - 1) // q, p)) for q in sorted(set(prime_factors(p - 1)))]
    return pow(g, p - 1, p) == 1 and all(r != 1 for _, r in checks), checks


def section_key():
    print("5. WHY 71 IS THE KEY")
    # Chebyshev: sum of Lambda over the lock periods is log of the gap
    terms = [(T, von_mangoldt(T)) for T in divisors(D)]
    total = sum(v for _, v in terms)
    print("   Chebyshev: sum of Lambda(T) over the lock periods T | 213")
    for T, v in terms:
        print(f"      Lambda({T:>3}) = {v:.6f}" + ("   (prime)" if is_prime(T) else "   (not a prime power)"))
    print(f"      sum = {total:.6f} = log 213 = {math.log(D):.6f};  log 3 + log 71 = {math.log(3) + math.log(71):.6f}")
    # Lucas certificate for 71 with witness 7
    ok, checks = lucas_certificate(71, 7)
    print("   Lucas certificate for 71, witness 7: 7^70 mod 71 =", pow(7, 70, 71),
          "; 7^(70/q) mod 71 for q | 70:", checks, "->", "prime" if ok else "not proved")
    order = next(k for k in range(1, 71) if pow(7, k, 71) == 1)
    print(f"   order of 7 in (Z/71)^x = {order}; 7^250 = {pow(7, 250, 71)}, 7^37 = {pow(7, 37, 71)} mod 71: the witness's own oscillator does not lock")
    # multiplicatively the key refuses
    lock71 = [a for a in range(71) if pow(a, 250, 71) == pow(a, 37, 71)]
    lock37 = [a for a in range(37) if pow(a, 250, 37) == pow(a, 37, 37)]
    print(f"   a^250 = a^37 in Z/71 exactly for a in {lock71}  (gcd(213, 70) = {math.gcd(213, 70)})")
    print(f"   a^250 = a^37 in Z/37 exactly for a in {lock37}  (gcd(213, 36) = {math.gcd(213, 36)}: 0 and the cube roots of 1)")
    # Dirichlet: primes in phase with 37 on the 213-cycle
    in_phase = [p for p in range(2, 5000) if is_prime(p) and p % 213 == 37]
    print(f"   primes below 5000 with p = 37 mod 213 (so p = 250 there too): {in_phase}")
    check(abs(total - math.log(D)) < 1e-12 and ok and order == 70, "why 71 is the key")
    check(lock71 == [0, 1] and lock37 == [0, 1, 10, 26] and in_phase[:3] == [37, 463, 1741],
          "multiplicative refusal and primes in phase")
    print()


# ---------------------------------------------------------------- main

def run_sections():
    section_lock()
    section_oscillators()
    section_crt()
    section_riemann()
    section_key()


def main(argv):
    if "--check" in argv:
        # run every section for its checks, silently; a failed check exits nonzero
        with contextlib.redirect_stdout(io.StringIO()):
            run_sections()
        print("all checks passed")
    else:
        run_sections()


if __name__ == "__main__":
    main(sys.argv[1:])
