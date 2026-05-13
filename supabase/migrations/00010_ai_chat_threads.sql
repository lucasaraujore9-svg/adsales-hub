-- ============================================================================
-- AdSales Hub — AI chat threads + messages
-- Migration: 00010
--
-- Adds a proper chat conversation model on top of the single-shot ai_questions.
-- Each user can have multiple ongoing threads; messages are persisted so the
-- UI can restore a conversation and re-hydrate Claude with full context.
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Nova conversa',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES ai_chat_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_threads_workspace ON ai_chat_threads(workspace_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_thread ON ai_chat_messages(thread_id, created_at);

ALTER TABLE ai_chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_chat_threads_select ON ai_chat_threads;
CREATE POLICY ai_chat_threads_select ON ai_chat_threads FOR SELECT TO authenticated
  USING (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS ai_chat_threads_write ON ai_chat_threads;
CREATE POLICY ai_chat_threads_write ON ai_chat_threads FOR ALL TO authenticated
  USING (workspace_id = public.current_workspace_id() AND public.is_workspace_writer())
  WITH CHECK (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS ai_chat_messages_select ON ai_chat_messages;
CREATE POLICY ai_chat_messages_select ON ai_chat_messages FOR SELECT TO authenticated
  USING (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS ai_chat_messages_write ON ai_chat_messages;
CREATE POLICY ai_chat_messages_write ON ai_chat_messages FOR ALL TO authenticated
  USING (workspace_id = public.current_workspace_id() AND public.is_workspace_writer())
  WITH CHECK (workspace_id = public.current_workspace_id());

-- updated_at trigger on threads
DROP TRIGGER IF EXISTS trg_set_updated_at ON ai_chat_threads;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON ai_chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
