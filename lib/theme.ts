/**
 * sgrounds design tokens
 * Single source of truth for the visual system.
 * Cream paper, soft gold, warm gray — contemplative and sacred.
 */

// ─── Colors ───────────────────────────────────────────
export const color = {
  gold: '#c9a96e',
  goldRgb: '201, 169, 110',
  // gold opacity variants
  gold90: 'rgba(201, 169, 110, 0.9)',
  gold85: 'rgba(201, 169, 110, 0.85)',
  gold70: 'rgba(201, 169, 110, 0.7)',
  gold50: 'rgba(201, 169, 110, 0.5)',
  gold38: 'rgba(201, 169, 110, 0.38)',
  gold22: 'rgba(201, 169, 110, 0.22)',
  gold15: 'rgba(201, 169, 110, 0.15)',
  gold12: 'rgba(201, 169, 110, 0.12)',
  gold08: 'rgba(201, 169, 110, 0.08)',
  gold05: 'rgba(201, 169, 110, 0.05)',
  // text opacity variants (use CSS var for theme-awareness)
  text85: 'rgba(var(--sg-text-rgb), 0.85)',
  text75: 'rgba(var(--sg-text-rgb), 0.75)',
  text55: 'rgba(var(--sg-text-rgb), 0.55)',
  text45: 'rgba(var(--sg-text-rgb), 0.45)',
  text38: 'rgba(var(--sg-text-rgb), 0.38)',
  text34: 'rgba(var(--sg-text-rgb), 0.34)',
  text30: 'rgba(var(--sg-text-rgb), 0.30)',
  text25: 'rgba(var(--sg-text-rgb), 0.25)',
  text20: 'rgba(var(--sg-text-rgb), 0.20)',
  text15: 'rgba(var(--sg-text-rgb), 0.15)',
  // surface variants
  surface03: 'rgba(var(--sg-text-rgb), 0.03)',
  surface04: 'rgba(var(--sg-text-rgb), 0.04)',
  surface05: 'rgba(var(--sg-text-rgb), 0.05)',
  // border variants
  border06: 'rgba(var(--sg-text-rgb), 0.06)',
  border08: 'rgba(var(--sg-text-rgb), 0.08)',
  border11: 'rgba(var(--sg-text-rgb), 0.11)',
} as const

// ─── Spacing ──────────────────────────────────────────
// 4px base, harmonious scale
export const space = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const

// ─── Radii ────────────────────────────────────────────
export const radius = {
  sm: '8px',
  md: '10px',
  lg: '12px',
  xl: '16px',
  pill: '9999px',
} as const

// ─── Typography ───────────────────────────────────────
export const font = {
  display: '"Instrument Serif", Georgia, serif',
  body: '"DM Sans", system-ui, sans-serif',
  mono: '"DM Mono", monospace',
} as const

export const fontSize = {
  '2xs': '8px',
  xs: '9px',
  sm: '10px',
  base: '12px',
  md: '13px',
  lg: '14px',
  xl: '16px',
  '2xl': '18px',
  '3xl': '22px',
  '4xl': '28px',
  '5xl': '42px',
} as const

export const lineHeight = {
  tight: '1.2',
  snug: '1.35',
  normal: '1.5',
  relaxed: '1.65',
} as const

// ─── Borders ──────────────────────────────────────────
export const border = {
  subtle: `1px solid ${color.border06}`,
  light: `1px solid ${color.border08}`,
  medium: `1px solid ${color.border11}`,
  goldSubtle: `1px solid ${color.gold38}`,
  goldLight: `1px solid ${color.gold22}`,
} as const

// ─── Shadows ──────────────────────────────────────────
export const shadow = {
  none: 'none',
  sm: '0 1px 3px rgba(var(--sg-text-rgb), 0.03)',
  md: '0 4px 16px rgba(var(--sg-text-rgb), 0.04)',
  lg: '0 12px 40px rgba(var(--sg-text-rgb), 0.06)',
  modal: '0 24px 80px rgba(var(--sg-text-rgb), 0.08)',
} as const

// ─── Transitions ──────────────────────────────────────
export const transition = {
  fast: '120ms ease',
  normal: '200ms ease',
  slow: '350ms ease',
  gentle: '500ms cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const

// ─── Shared input style ───────────────────────────────
export const inputStyle = {
  background: color.surface03,
  border: border.medium,
  color: color.text85,
} as const

// ─── Section eyebrow label ────────────────────────────
export const eyebrowStyle = {
  fontSize: fontSize['2xs'],
  color: color.text34,
  fontFamily: font.mono,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.15em',
  fontWeight: 500 as const,
  lineHeight: lineHeight.normal,
} as const

// ─── Pill base styles ─────────────────────────────────
export const pillBase = {
  height: '26px',
  padding: '0 10px',
  borderRadius: radius.pill,
  fontSize: fontSize.sm,
  fontFamily: font.body,
  display: 'inline-flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  transition: `all ${transition.normal}`,
  cursor: 'pointer' as const,
  whiteSpace: 'nowrap' as const,
  border: '1px solid transparent',
} as const

export function pillStyle(selected: boolean) {
  return {
    ...pillBase,
    background: selected ? color.gold12 : color.surface03,
    borderColor: selected ? color.gold38 : color.border08,
    color: selected ? color.gold85 : color.text38,
  }
}

// ─── Helper text ──────────────────────────────────────
export const helperStyle = {
  fontSize: fontSize.sm,
  color: color.text25,
  fontFamily: font.body,
  lineHeight: lineHeight.normal,
} as const
