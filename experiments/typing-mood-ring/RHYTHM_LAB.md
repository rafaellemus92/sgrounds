# Rhythm Lab: design note

**Exploratory prototype.** It asks one question: does a phase-locking model describe how a
person taps along with a steady beat? It does not measure empathy, mood, intelligence or health,
and it makes no claim that tapping practice improves typing or anything else.

## Protocol (one session, about 3 to 8 minutes depending on pace, plus breaks)

1. **Consent.** The page says what is recorded and where, before anything is recorded.
2. **Baseline before.** No sound. Tap the large circle at a steady, comfortable pace, 20 taps.
   Baseline period `T0` = median inter-tap interval, skipping the first 3 intervals.
   Valid if at least 10 intervals remain and `T0` is between 250 and 1500 ms.
3. **Paced trials.** 8 trials in random order: beat periods `T = T0 × (1 + p)` with
   `p ∈ {−10%, −5%, +5%, +10%}`, each twice. A trial is 4 low lead-in clicks (listen) and 30 high
   clicks (tap along). Each trial starts with its own button, so a break is always possible.
4. **Baseline after.** Same as before. If it differs from the first by more than 10%, the session is
   flagged: the person's own tempo moved, so the detuning below is uncertain.

The screen stays static during trials: no visual beat, no tap feedback, no colour. Colour feedback
can be a later comparison.

## One clock

Every recorded time is in **`performance.now()` milliseconds**, the clock that `event.timeStamp` uses.
Clicks are scheduled on the Web Audio clock (`AudioContext.currentTime`) for sample accuracy, and each
click's time is converted to the performance clock with `AudioContext.getOutputTimestamp()` (which pairs
a context time with the performance time at which it reaches the output). Where that is missing, the
fallback is `performance.now() + baseLatency + outputLatency` at scheduling time. Single readings of the
mapping jitter (by an audio render buffer or more), so the offset is settled once per trial as the median of
about 300 ms of readings before the first click, and every click is mapped with it; over a 20 s trial the two
clocks drift apart by about a millisecond. Readings continue during the trial, and if their rolling median (the last
12 readings) moves by more than 10 ms at any point (an audio route change, an underrun) the trial is flagged. If the
mapping method changes before any click is scheduled (getOutputTimestamp waking up late), settling starts again with
the new method. A watchdog on the page clock ends and flags a trial whose audio clock stops advancing for 500 ms or
which runs past its expected length. The recorded cue time is the mapped output time.

**Latency limits.** The browser cannot see Bluetooth delay (often 100–300 ms), and touch screens add
roughly 20–80 ms before a tap is timestamped; Safari may coarsen timestamps to about 1 ms. A constant
delay is absorbed into one fitted offset `L` and is never read as anticipation or lag; variable delay
adds noise. Use the built-in speaker or wired headphones.

## Input

Taps come from `pointerdown` on the circle (touch, mouse, pen) or Space/Enter. Held-key repeats are
ignored. Any tap less than 80 ms after the previous accepted tap is a duplicate and dropped (counted).
`click`, `touchstart` and `mousedown` are not listened to, so one press is one tap.

**Interrupted trials** are flagged invalid, never scored: page hidden, page unloaded, window focus
lost, the audio context leaving `running` (iOS uses `interrupted` for calls and Siri), audio stalled, a
click scheduled late, or clock drift. A trial that was about to start is not started if the session was
stopped or reset, or the page was hidden or lost focus, while the sound was starting. A flagged trial is
kept on record and re-queued at the end, at most twice per condition. Timer resolution is measured at the
start (until two clock ticks or 60 ms); coarser than 5 ms is reported as too coarse for reliable timing.

## Phase, slips, missed and extra taps

For a tap at time `t`, the beat position `B(t)` is the continuous cue count (cue `j` at `B = j`,
linear between cues). Taps are credited to cycles relative to where the person has been tapping, not to
the nearest beat:

- the first analysed tap is credited to the nearest cue (the only nearest-beat step);
- each next tap is credited to cycle `round(B(t) − ref)`, where `ref` is the median `ψ` of the last 3
  credited taps. A gap of several cycles means that many **missed** taps (counted, no false slip). A
  second tap for a cycle already credited is an **extra** tap (counted); of the two, the one nearer `ref`
  is kept, so a stray tap near the off-beat cannot shift the count.

The **unwrapped relative phase** is `ψ = B(t) − cycle`, in cycles. Each tap sits within half a cycle of
the running phase, so `ψ` follows the person and slow slips stay visible: nearest-beat scoring would
silently re-centre them. Positive `ψ` = tap after the beat.
A **slip** is counted when `ψ` has moved more than 0.75 cycle from the current level, measured from the
trial's own start (the median of its first 3 taps), so a slip always means the same amount of movement;
the level then steps by one. Cumulative counts are kept: beats in the window, taps credited
(including missed), net slip. A trial is **steady** (no slip, trend under 0.2 cycle across the trial),
**drifting** (no slip, trend at least 0.2) or **slipping** (one or more slips), and needs 15 analysed taps.
A short trial without slips is not proof of permanent locking: it is consistent with locking, or with a
slip period longer than the trial.

## Models

`δ = −2π(ψ − L/T)` is the person's phase minus the beat's, after removing the constant delay `L`.
Detuning from the baseline: `Δ = 2π(1/T0 − 1/T)` rad/s. Between successive taps the models integrate:

| model | equation | slips? |
|-------|----------|--------|
| null (no coupling) | `dδ/dt = Δ` | always drifts |
| linear correction (simple baseline) | `dδ/dt = Δ − k·δ` | never; settles at `Δ/k` |
| phase model | `dδ/dt = Δ − k·sin δ` | locks at `sin δ* = Δ/k` if `|Δ| < k`; slips once every `2π/√(Δ² − k²)` s if `|Δ| > k`; `|Δ| = k` is the boundary (a half-stable point; noise makes it slip occasionally) |

`k` is a coupling rate in rad/s. It is not loudness, and nothing assumes people obey either equation.

**Estimation.** Shared per session: `k` in 0–40 rad/s and `L` in −200 to 400 ms. A fit at the upper bound of `k` means locking within a fraction of a beat, where the phase and linear models predict the same thing, and is reported as such. Fit by least squares on one-step
predictions: for each pair of consecutive credited taps with no missed tap between them, predict `δₙ₊₁`
from `δₙ` by integrating over one beat (RK4 for the phase model, exact for the others). Coarse grid, then
coordinate refinement. `σ` is the RMS residual. Which whole cycle a trial sits on depends on where its
first tap was credited, so for the models that are not 2π-periodic (no coupling, linear) each trial's
whole-cycle offset (`round(median ψ − L/T)`) is removed before comparing phases; otherwise a delay near
half a beat would wrap some trials by a cycle and make the linear model lose for no reason.
Known limitation: tap-timing jitter enters both sides of the one-step fit, which biases `k` upward
(about 10–20% at 8–20 ms of jitter in simulation) and makes residuals negatively correlated. A
state-space fit with a separate measurement-noise term would remove this; it is deferred.

**Held-out test.** Fit on the first repetition of each condition, test on the second. Report each model's
held-out one-step RMS error in ms, and for each held-out trial the observed net slip next to the phase
model's noise-free prediction. Prefer the phase model only if it beats the linear model's held-out error by
at least 5% **and** gets the slipping/steady pattern of held-out trials right; otherwise prefer the simpler model.

**Observations that would count against the phase model:**
- slips where the fitted model predicts locking, or steady trials where it predicts slips;
- steady offsets across detunings that do not follow `sin δ* = Δ/k` (for example, growing linearly far
  past where the sine saturates, or strongly asymmetric between faster and slower);
- offsets that drift back toward zero within a trial (period correction: the person's own tempo adapts,
  so `Δ` is not constant);
- `k` fitted on the two halves differing by more than a factor of two, or `L` by more than 60 ms;
- a large change between the two baselines (more than 10%; flagged in the results whether or not the
  comparison is ready).

Each check reads ok, no, or not tested (for example, no second baseline, or no held-out trial whose
predicted offset is large enough to compare). The offset check measures offsets after removing `L` and
compares the late part of each non-slipping held-out trial with the fitted model's own prediction for
it, so the model's settling from the first tap is not mistaken for period correction. The lag-1
residual correlation is shown as a noise-model diagnostic only: tap jitter alone gives about
`−a/(1 + a²)` with `a = exp(−k·T·cos δ*)`, so it is not evidence about coupling.

## Data

Stored only in this browser (`localStorage` key `tmr-lab`): consent date; per session its start date and
time and basic device timing details (reported audio latency and sample rate, timer resolution, whether the
screen is a touch screen, whether the audio timestamp API exists); and per trial its start date and time,
the condition, period, cue times, tap times with input type, clock-mapping statistics, flags and validity. No account, no upload, no typing text, no journal text, no health data. Export writes a JSON
file the person chooses to save. Reset deletes all lab data and the consent.

## Simulation

A separate panel integrates `dδ/dt = Δ − k sin δ` from sliders for `Δ` and `k` and plots `−δ/2π`, where a tap
would sit (the same sign as the tap plot: up is after the beat), with the regime stated in words: locked
offset `asin(Δ/k)`, boundary, or the slip period.
