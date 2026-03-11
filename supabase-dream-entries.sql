CREATE TABLE IF NOT EXISTS dream_entries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  entry_date date NOT NULL,
  dreamed text NOT NULL, -- 'yes' | 'no' | 'fragments'
  lucid text, -- 'yes' | 'partial' | 'no'
  quality text, -- 'void' | 'threat' | 'flight' | 'presence' | 'resolution' | 'light'
  closing_image text,
  continuity text, -- 'yes' | 'no' | 'unclear'
  waking_coherence float, -- signal coherence from PREVIOUS day's entry
  waking_closing_word text, -- closing word from PREVIOUS day's entry
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

ALTER TABLE dream_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own dream entries"
ON dream_entries FOR ALL
USING (user_id = auth.uid()::text OR user_id = 'dev-user');
