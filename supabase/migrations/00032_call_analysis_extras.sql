-- Análise rica de calls (issue 061).
-- Estruturados além do sumário: wants, next_action, sentiment timeline.

ALTER TABLE sdr_calls
  ADD COLUMN IF NOT EXISTS wants JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS objections JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS improvements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS next_action JSONB,
  ADD COLUMN IF NOT EXISTS sentiment_timeline JSONB DEFAULT '[]'::jsonb;
