// Kuramoto order parameter for N oscillators.
//
//   z(t) = (1/N) · Σⱼ exp(i·θⱼ(t))
//   r(t) = |z(t)|          ∈ [0, 1]
//   ψ(t) = arg(z(t))       mean phase
//
// r = 1 → all phases identical (fully synced).
// r = 0 → uniformly distributed phases (incoherent).
// For N = 2 oscillators, r = |cos((θ₂ − θ₁)/2)|, maximal when phases equal.
//
// We also expose a live helper that takes per-hand onset spike trains and
// returns an r(t) series sampled at a uniform rate — used both by
// PhasorDisplay (live) and SessionAnalytics (post-session).

import { instantaneousPhase, onsetDensity } from './hilbert';
import type { KuramotoFrame } from './types';

// Single-frame order parameter. `phases` are in radians; NaN/non-finite are
// skipped (treated as "oscillator has no data yet").
export function orderParameter(phases: ArrayLike<number>): { r: number; meanPhase: number } {
  let cSum = 0;
  let sSum = 0;
  let n = 0;
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    if (!Number.isFinite(p)) continue;
    cSum += Math.cos(p);
    sSum += Math.sin(p);
    n++;
  }
  if (n === 0) return { r: 0, meanPhase: 0 };
  const cMean = cSum / n;
  const sMean = sSum / n;
  return {
    r: Math.hypot(cMean, sMean),
    meanPhase: Math.atan2(sMean, cMean),
  };
}

// Frame-by-frame r(t) from N parallel phase time series. Assumes all series
// share the same length and sample rate. Returns `phases.length` frames.
export function orderParameterSeries(
  phases: Float64Array[],
  dt: number,
  tStart = 0,
): KuramotoFrame[] {
  if (phases.length === 0) return [];
  const n = phases[0].length;
  for (const p of phases) if (p.length !== n) throw new Error('orderParameterSeries: length mismatch');
  const frames: KuramotoFrame[] = new Array(n);
  const tmp: number[] = new Array(phases.length);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < phases.length; j++) tmp[j] = phases[j][i];
    const { r, meanPhase } = orderParameter(tmp);
    frames[i] = {
      t: tStart + i * dt,
      r,
      meanPhase,
      phaseLH: phases.length > 0 ? phases[0][i] : 0,
      phaseRH: phases.length > 1 ? phases[1][i] : 0,
    };
  }
  return frames;
}

// Convenience: given per-hand onset times, produce the full r(t) series by
// building smoothed onset densities, taking Hilbert phases, and computing
// the order parameter at each sample.
export function kuramotoFromOnsets(
  onsetsByHand: number[][],
  tMax: number,
  dt: number,
  sigma: number,
): KuramotoFrame[] {
  if (tMax <= 0) return [];
  const phases = onsetsByHand.map(onsets => {
    const density = onsetDensity(onsets, tMax, dt, sigma);
    return instantaneousPhase(density);
  });
  return orderParameterSeries(phases, dt, 0);
}

// Streaming helper for the live phasor. Given per-hand phase histories
// (ring buffers), compute an instantaneous frame. Exposed separately from
// `orderParameter` so callers can cache the phase arrays.
export function liveFrame(phaseLH: number, phaseRH: number, t: number): KuramotoFrame {
  const { r, meanPhase } = orderParameter([phaseLH, phaseRH]);
  return { t, r, meanPhase, phaseLH, phaseRH };
}
