-- ============================================================================
-- Inbox SLA tracking
-- Migration: 00012
--
-- Adiciona last_inbound_at para calcular tempo de resposta (SLA) desde a
-- ultima mensagem recebida do cliente. Usado no dot de urgencia da lista.
-- ============================================================================

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS last_inbound_at TIMESTAMPTZ;

-- Backfill initial value from existing inbound messages
UPDATE conversations c
SET last_inbound_at = sub.max_ts
FROM (
  SELECT conversation_id, MAX(created_at) AS max_ts
  FROM conversation_messages
  WHERE direction = 'inbound'
  GROUP BY conversation_id
) sub
WHERE c.id = sub.conversation_id
  AND c.last_inbound_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_last_inbound ON conversations(workspace_id, last_inbound_at);

-- Trigger: when a new inbound message is inserted, bump last_inbound_at.
CREATE OR REPLACE FUNCTION public.bump_conversation_last_inbound()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.direction = 'inbound' THEN
    UPDATE conversations
    SET last_inbound_at = NEW.created_at
    WHERE id = NEW.conversation_id
      AND (last_inbound_at IS NULL OR last_inbound_at < NEW.created_at);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bump_last_inbound ON conversation_messages;
CREATE TRIGGER trg_bump_last_inbound AFTER INSERT ON conversation_messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation_last_inbound();
