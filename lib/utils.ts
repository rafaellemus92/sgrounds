import { Coherence } from './types'

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function currentTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

const PROMPTS = [
  'What moment did you endure today?',
  'What did today ask you to carry?',
  'What moment deserves the semicolon?',
  'What was not the end, even if it felt heavy?',
  'What moment stood between who you were and who you\'re becoming?',
  'What did you hold today that no one else saw you holding?',
  'What almost went unnoticed?',
  'What small moment today might someday define this season?',
  'What carried weight today?',
  'What needed you to show up — and did you?',
]

export function dailyPrompt(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  return PROMPTS[dayOfYear % PROMPTS.length]
}

export function timeOfDayTheme(): { bg: string; text: string; textRgb: string } {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 9) {
    return { bg: 'rgb(255, 252, 240)', text: 'rgb(45, 38, 28)', textRgb: '45, 38, 28' }
  } else if (hour >= 9 && hour < 17) {
    return { bg: 'rgb(253, 250, 242)', text: 'rgb(38, 32, 22)', textRgb: '38, 32, 22' }
  } else if (hour >= 17 && hour < 21) {
    return { bg: 'rgb(250, 245, 232)', text: 'rgb(35, 28, 18)', textRgb: '35, 28, 18' }
  } else {
    return { bg: 'rgb(248, 242, 225)', text: 'rgb(30, 24, 14)', textRgb: '30, 24, 14' }
  }
}

const clamp = (n: number) => Math.min(99, Math.max(18, n))

export function computeCoherence(entry: {
  passage: string
  arcNote: string
  picture: string | null
  inspoType: string | null
  inspoText: string
  closingWord: string
}): Coherence {
  const cc = [...entry.passage].map((c) => c.charCodeAt(0))
  let inside = 0
  for (let i = 0; i < cc.length - 1; i++) {
    const x = (cc[i] % 97) / 96
    const y = (cc[i + 1] % 97) / 96
    if (x * x + y * y <= 1) inside++
  }
  const n = cc.length - 1
  const piEst = n > 0 ? (4 * inside) / n : Math.PI
  const sumC = cc.reduce((a, v) => a + v, 0)
  const xorC = cc.reduce((a, v) => a ^ v, 0)
  const cr = ((sumC % 350) / 350) * 3.5 - 2.5
  const ci = ((xorC % 200) / 200) * 2.0 - 1.0
  let zr = 0,
    zi = 0,
    depth = 0
  while (zr * zr + zi * zi < 4 && depth < 100) {
    ;[zr, zi] = [zr * zr - zi * zi + cr, 2 * zr * zi + ci]
    depth++
  }
  const letters = (entry.passage.match(/[a-zA-Z]/g) || []).length
  const sigDensity = letters / Math.max(entry.passage.length, 1)
  const base = Math.min(
    0.99,
    Math.max(0.08, Math.exp(-Math.abs(piEst - Math.PI)) * 0.5 + (depth / 100) * 0.3 + sigDensity * 0.2)
  )
  return {
    momentClarity: clamp(Math.round(base * 100 * 0.82 + Math.sin(depth) * 8)),
    arcContinuity: clamp(Math.round(base * 100 * 0.74 + (entry.arcNote?.length > 5 ? 14 : 0))),
    imageResonance: clamp(Math.round(base * 100 * 0.7 + (entry.picture ? 18 : 0))),
    echoFit: clamp(
      Math.round(base * 100 * 0.76 + (entry.inspoText?.length > 3 ? 16 : entry.inspoType ? 8 : 0))
    ),
    emotionalUnity: clamp(Math.round(base * 100 * 0.8 + (entry.closingWord?.length > 1 ? 7 : 0))),
  }
}

export function coherenceDescriptor(overall: number): string {
  if (overall >= 85) return 'tightly convergent'
  if (overall >= 72) return 'strong center, some drift'
  if (overall >= 58) return 'signal building'
  if (overall >= 44) return 'clear but restless'
  if (overall >= 30) return 'diffuse'
  return 'emerging'
}

export function passageFontSize(len: number): number {
  if (len < 80) return 20
  if (len > 250) return 13
  return 20 - ((len - 80) / 170) * 7
}
