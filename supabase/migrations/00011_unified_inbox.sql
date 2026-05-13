-- ============================================================================
-- AdSales Hub — Unified inbox (Chatwoot-style)
-- Migration: 00011
--
-- Multi-channel conversations so vendedores + suporte podem responder leads
-- de qualquer canal (WhatsApp oficial/nao-oficial, Instagram DM, Messenger,
-- Email, SMS, Live chat widget) numa unica caixa de entrada.
--
-- Channel connections reuse existing social_accounts (Instagram/Facebook)
-- and integrations (WhatsApp) rows, plus a new live_chat_widgets for sites.
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN (
    'whatsapp_cloud', 'whatsapp_unofficial',
    'instagram_dm', 'messenger',
    'email', 'sms', 'live_chat', 'telegram'
  )),
  channel_identifier TEXT NOT NULL,
  -- e.g. phone number E.164, IG user id, messenger PSID, email address.
  external_conversation_id TEXT,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  assignee_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'pending', 'snoozed', 'resolved', 'spam')),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_preview TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, channel, channel_identifier)
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound', 'internal_note')),
  sender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_name TEXT,
  content TEXT,
  media_urls JSONB,
  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
  provider_message_id TEXT,
  error TEXT,
  replied_to_id UUID REFERENCES conversation_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS live_chat_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL UNIQUE REFERENCES workspaces(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  welcome_message TEXT NOT NULL DEFAULT 'Oi! Como podemos ajudar?',
  accent_color TEXT NOT NULL DEFAULT '#FF5E1A',
  position TEXT NOT NULL DEFAULT 'bottom_right' CHECK (position IN ('bottom_right', 'bottom_left')),
  avatar_url TEXT,
  business_hours JSONB,
  offline_message TEXT,
  collect_fields JSONB NOT NULL DEFAULT '["name","email"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_workspace_status ON conversations(workspace_id, status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(workspace_id, channel);
CREATE INDEX IF NOT EXISTS idx_conversations_assignee ON conversations(workspace_id, assignee_user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_conversations_deal ON conversations(deal_id);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_thread ON conversation_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_workspace ON conversation_messages(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_provider ON conversation_messages(provider_message_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_chat_widgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS conversations_select ON conversations;
CREATE POLICY conversations_select ON conversations FOR SELECT TO authenticated
  USING (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS conversations_write ON conversations;
CREATE POLICY conversations_write ON conversations FOR ALL TO authenticated
  USING (workspace_id = public.current_workspace_id() AND public.is_workspace_writer())
  WITH CHECK (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS conversation_messages_select ON conversation_messages;
CREATE POLICY conversation_messages_select ON conversation_messages FOR SELECT TO authenticated
  USING (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS conversation_messages_write ON conversation_messages;
CREATE POLICY conversation_messages_write ON conversation_messages FOR ALL TO authenticated
  USING (workspace_id = public.current_workspace_id() AND public.is_workspace_writer())
  WITH CHECK (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS live_chat_widgets_select ON live_chat_widgets;
CREATE POLICY live_chat_widgets_select ON live_chat_widgets FOR SELECT TO authenticated
  USING (workspace_id = public.current_workspace_id());

DROP POLICY IF EXISTS live_chat_widgets_write ON live_chat_widgets;
CREATE POLICY live_chat_widgets_write ON live_chat_widgets FOR ALL TO authenticated
  USING (workspace_id = public.current_workspace_id() AND public.is_workspace_admin())
  WITH CHECK (workspace_id = public.current_workspace_id());

DROP TRIGGER IF EXISTS trg_set_updated_at ON conversations;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at ON live_chat_widgets;
CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON live_chat_widgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- Demo data section removed for fresh-DB compatibility (depends on seed.sql fixtures)
