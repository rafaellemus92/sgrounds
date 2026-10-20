import Wyrd
/-! Run `lake env lean Audit.lean`. Each line should list only Lean's standard
axioms (`propext`, `Classical.choice`, `Quot.sound`) — never `sorryAx`
(an unfinished proof) or `Lean.ofReduceBool` (trusting compiled code). -/
#print axioms Wyrd.decode_encode
#print axioms Wyrd.encode_injective
#print axioms Wyrd.solution_names
#print axioms Wyrd.solution_isPangram
#print axioms Wyrd.lower_bound
#print axioms Wyrd.primes_nodup
#print axioms Wyrd.length_primesOf
#print axioms Wyrd.sum_even
#print axioms Wyrd.two_not_mem
#print axioms Wyrd.no_smaller_pangram
#print axioms Wyrd.smallest_pangram_sum
#print axioms Wyrd.exists_prime_gt
#print axioms Wyrd.primes_infinite
#print axioms Wyrd.no_fraction_squares_to_two
#print axioms Wyrd.lock
#print axioms Wyrd.key_prime
#print axioms Wyrd.three_primes
#print axioms Wyrd.locked_iff_dvd
#print axioms Wyrd.lock_iff_dvd
#print axioms Wyrd.dvd_213
#print axioms Wyrd.lock_periods
#print axioms Wyrd.prime_keys
#print axioms Wyrd.not_on_the_line
#print axioms Wyrd.crt_213
#print axioms Wyrd.strobe
#print axioms Wyrd.exists_prime_lock
#print axioms Wyrd.consecutive_never_lock
