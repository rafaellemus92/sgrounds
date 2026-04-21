'use client';

// Rotating Kuramoto phasor on canvas.
//
// Renders three vectors in a unit circle:
//   - LH oscillator   (cool tone)
//   - RH oscillator   (warm tone)
//   - Mean vector     (gold, length = r = order parameter)
//
// The mean vector's length *is* the live phase-lock strength. When the hands
// are synchronized it reaches out to the circle; when they decouple it
// collapses toward the origin. A faded r-history ring around the phasor
// shows the last ~2 seconds of |r|, making drift visible.
//
// Rendered at requestAnimationFrame (typically 60Hz). The parent pushes a
// new frame via `framesRef`, which we sample on each rAF tick.

import { useEffect, useRef } from 'react';
import type { KuramotoFrame } from '@/lib/piano/types';

export interface PhasorDisplayProps {
  frameRef: React.MutableRefObject<KuramotoFrame | null>;
  historyRef?: React.MutableRefObject<KuramotoFrame[]>;
  size?: number;
  className?: string;
}

const GOLD = '#c9a96e';
const LH_COLOR = '#60a5fa';   // blue-400
const RH_COLOR = '#f59e0b';   // amber-500
const INK = 'rgba(255,255,255,0.12)';
const INK_STRONG = 'rgba(255,255,255,0.6)';

export default function PhasorDisplay({
  frameRef,
  historyRef,
  size = 240,
  className,
}: PhasorDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let rafId = 0;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 20;

    function draw() {
      const frame = frameRef.current;
      ctx!.clearRect(0, 0, size, size);

      // Background — faint radial grid.
      ctx!.strokeStyle = INK;
      ctx!.lineWidth = 1;
      for (const frac of [0.25, 0.5, 0.75, 1]) {
        ctx!.beginPath();
        ctx!.arc(cx, cy, radius * frac, 0, Math.PI * 2);
        ctx!.stroke();
      }
      // Axes.
      ctx!.beginPath();
      ctx!.moveTo(cx - radius, cy);
      ctx!.lineTo(cx + radius, cy);
      ctx!.moveTo(cx, cy - radius);
      ctx!.lineTo(cx, cy + radius);
      ctx!.stroke();

      // r-history: faded trailing points.
      const history = historyRef?.current;
      if (history && history.length > 0) {
        const last = history.length;
        const shown = Math.min(last, 120);
        for (let i = 0; i < shown; i++) {
          const h = history[last - shown + i];
          const alpha = (i / shown) * 0.3;
          const x = cx + Math.cos(h.meanPhase) * radius * h.r;
          const y = cy - Math.sin(h.meanPhase) * radius * h.r;
          ctx!.fillStyle = `rgba(201,169,110,${alpha})`;
          ctx!.beginPath();
          ctx!.arc(x, y, 2, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      if (!frame) {
        ctx!.fillStyle = 'rgba(255,255,255,0.3)';
        ctx!.font = '11px "DM Mono", monospace';
        ctx!.textAlign = 'center';
        ctx!.fillText('awaiting onsets', cx, cy + 4);
        rafId = requestAnimationFrame(draw);
        return;
      }

      // Individual oscillator vectors.
      drawVector(ctx!, cx, cy, radius, frame.phaseLH, LH_COLOR, 1);
      drawVector(ctx!, cx, cy, radius, frame.phaseRH, RH_COLOR, 1);

      // Mean phasor: length = r, heavier stroke.
      drawVector(ctx!, cx, cy, radius, frame.meanPhase, GOLD, frame.r, 3, frame.r >= 0.8);

      // r value centered above origin.
      ctx!.fillStyle = frame.r >= 0.8 ? GOLD : INK_STRONG;
      ctx!.font = '600 22px "DM Mono", monospace';
      ctx!.textAlign = 'center';
      ctx!.fillText(frame.r.toFixed(2), cx, size - 4);

      // Regime label.
      const label = frame.r >= 0.8 ? 'locked' : frame.r < 0.4 ? 'drifting' : 'coupled';
      ctx!.font = '10px "DM Mono", monospace';
      ctx!.fillStyle = INK_STRONG;
      ctx!.fillText(label.toUpperCase(), cx, 14);

      rafId = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(rafId);
  }, [size, frameRef, historyRef]);

  return <canvas ref={canvasRef} className={className} />;
}

function drawVector(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  phase: number,
  color: string,
  length: number,
  width = 1.5,
  glow = false,
) {
  if (!Number.isFinite(phase)) return;
  const x = cx + Math.cos(phase) * radius * length;
  // Canvas y grows downward; flip so phase 0 = +x, π/2 = +y (up).
  const y = cy - Math.sin(phase) * radius * length;

  ctx.save();
  if (glow) {
    ctx.shadowBlur = 16;
    ctx.shadowColor = color;
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x, y);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, width + 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
