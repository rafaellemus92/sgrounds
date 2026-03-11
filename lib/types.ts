export interface Entry {
  id?: string
  user_id?: string
  date_key: string
  date_label: string
  picture_url: string | null
  passage: string
  arc_note: string
  closing_word: string
  inspo_type: string | null
  inspo_text: string
  inspo_artist: string
  inspo_song: string
  inspo_preview_url: string | null
  news_tag: string | null
  reflection: string | null
  day_gift: string | null
  tomorrow_q: string | null
  ts?: string
  updated_at?: string
}

export interface Profile {
  id?: string
  name: string
  role: string
  faith: string
  context: string
  updated_at?: string
}

export interface Coherence {
  momentClarity: number
  arcContinuity: number
  imageResonance: number
  echoFit: number
  emotionalUnity: number
}

export type InspoType = 'lyric' | 'scripture' | 'film' | 'poem' | 'news' | 'quote'
export type NewsTag = 'world' | 'local' | 'personal'
export type Archetype = 'spouse' | 'parent' | 'their child' | 'therapist' | 'mentor' | 'pastor' | 'future self' | 'inner critic' | 'investor' | 'clinical witness'
export type PageView = 'thread' | 'archive' | 'lens' | 'map'
