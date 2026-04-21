'use client';

// Live per-hand onset-deviation strip chart.
//
// For each matched onset we plot (x = session time, y = deviation ms).
// Separate traces per hand: LH (blue), RH (amber). Horizontal band at
// ±timingWindowMs shows the acceptance window. Rolling window keeps only
// the last `windowSec` seconds visible. Rendered on canvas for speed.

import { useEffect, useRef } from 'react';
import type { Hand } from '@/lib/piano/types';

export interface TimingPoint {
  t: number;            // session seconds
  deviationMs: number;  // signed; + = late, − = early
  hand: Hand;
}

export interface TimingStripProps {
  pointsRef: React.MutableRefObject<TimingPoint[]>;
  windowSec?: number;
  timingWindowMs?: number;
  height?: number;
  className?: string;
}

const LH_COLOR = '#60a5fa';
const RH_COLOR = '#f59e0b';
const INK = 'rgba(255,255,255,0.12)';
const INK_STRONG = 'rgba(255,255,255,0.5)';

export default function TimingStrip({
  pointsRef,
  windowSec = 12,
  timingWindowMs = 80,
  height = 120,
  className,
}: TimingStripProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const widthRef = useRef(400);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const w = canvas.clientWidth || 400;
      widthRef.current = w;
      canvas.width = w * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return () => ro.disconnect();

    let raf = 0;

    function draw() {
      const width = widthRef.current;
      ctx!.clearRect(0, 0, width, height);
      const points = pointsRef.current;

      // Time axis: last `windowSec` seconds up to the newest point.
      const latest = points.length > 0 ? points[points.length - 1].t : 0;
      const tMin = latest - windowSec;
      const tMax = latest;

      const maxDev = Math.max(timingWindowMs * 2.5, 100);
      const yFor = (devMs: number) => {
        const clamped = Math.max(-maxDev, Math.min(maxDev, devMs));
        return height / 2 - (clamped / maxDev) * (height / 2 - 8);
      };
      const xFor = (t: number) => ((t - tMin) / windowSec) * width;

      // Acceptance band.
      ctx!.fillStyle = 'rgba(201,169,110,0.08)';
      ctx!.fillRect(0, yFor(timingWindowMs), width, yFor(-timingWindowMs) - yFor(timingWindowMs));

      // Zero line.
      ctx!.strokeStyle = INK_STRONG;
      ctx!.lineWidth = 1;
      ctx!.setLineDash([2, 3]);
      ctx!.beginPath();
      ctx!.moveTo(0, height / 2);
      ctx!.lineTo(width, height / 2);
      ctx!.stroke();
      ctx!.setLineDash([]);

      // Window edges.
      ctx!.strokeStyle = INK;
      ctx!.beginPath();
      ctx!.moveTo(0, yFor(timingWindowMs));
      ctx!.lineTo(width, yFor(timingWindowMs));
      ctx!.moveTo(0, yFor(-timingWindowMs));
      ctx!.lineTo(width, yFor(-timingWindowMs));
      ctx!.stroke();

      // Points: draw each hand as a connected line + dot.
      const lh = points.filter(p => p.hand === 'LH' && p.t >= tMin);
      const rh = points.filter(p => p.hand === 'RH' && p.t >= tMin);

      drawTrace(ctx!, lh, xFor, yFor, LH_COLOR);
      drawTrace(ctx!, rh, xFor, yFor, RH_COLOR);

      // Axis labels.
      ctx!.fillStyle = INK_STRONG;
      ctx!.font = '10px "DM Mono", monospace';
      ctx!.textAlign = 'left';
      ctx!.fillText(`+${timingWindowMs}ms`, 4, yFor(timingWindowMs) - 2);
      ctx!.fillText(`−${timingWindowMs}ms`, 4, yFor(-timingWindowMs) + 10);
      ctx!.textAlign = 'right';
      ctx!.fillText(`${windowSec}s`, width - 4, height - 2);

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [height, pointsRef, timingWindowMs, windowSec]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height }}
    />
  );
}

function drawTrace(
  ctx: CanvasRenderingContext2D,
  pts: TimingPoint[],
  xFor: (t: number) => number,
  yFor: (dev: number) => number,
  color: string,
) {
  if (pts.length === 0) return;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const x = xFor(p.t);
    const y = yFor(p.deviationMs);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (const p of pts) {
    ctx.beginPath();
    ctx.arc(xFor(p.t), yFor(p.deviationMs), 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
