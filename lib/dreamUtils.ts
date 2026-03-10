export const QUALITY_SCORES: Record<string, number> = {
  void: 0,
  threat: 1,
  fragments: 2,
  flight: 3,
  presence: 4,
  resolution: 5,
  light: 6,
}

export function getDreamScore(quality: string | null, lucid: string | null): number | null {
  if (!quality) return null
  const base = QUALITY_SCORES[quality] ?? 2
  if (lucid === 'yes') return 7
  if (lucid === 'partial') return base + 0.5
  return base
}

export function getClosingWordValence(word: string): number {
  const positive = ['held', 'stayed', 'light', 'whole', 'still', 'home',
                    'peace', 'enough', 'grace', 'open', 'clear', 'found']
  const negative = ['lost', 'fear', 'dark', 'heavy', 'broken', 'alone',
                    'tired', 'hollow', 'doubt', 'falling']
  const w = word.toLowerCase().trim()
  if (positive.includes(w)) return 1
  if (negative.includes(w)) return -1
  return 0
}

export interface DreamEntry {
  id?: string
  user_id: string
  entry_date: string
  dreamed: 'yes' | 'no' | 'fragments'
  lucid?: string | null
  quality?: string | null
  closing_image?: string | null
  continuity?: string | null
  waking_coherence?: number | null
  waking_closing_word?: string | null
  created_at?: string
}

export const DREAM_QUALITIES = ['void', 'threat', 'flight', 'presence', 'resolution', 'light'] as const
export const LUCID_OPTIONS = ['yes', 'partially', 'no'] as const
export const DREAMED_OPTIONS = ['yes', 'fragments', 'no'] as const
export const CONTINUITY_OPTIONS = ['yes', 'unclear', 'no'] as const
