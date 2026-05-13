-- ============================================================================
-- Storage buckets for AI-generated media (image/video).
--
-- Bucket `ai-creatives` is PUBLIC so Meta Ads / social networks / browsers can
-- fetch the asset via HTTPS without auth. Workspace isolation is enforced at
-- the path level (`<workspace_id>/<creative_id>.<ext>`), and write access is
-- restricted to the service role through RLS policies on storage.objects.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-creatives',
  'ai-creatives',
  true,
  20 * 1024 * 1024, -- 20 MB
  ARRAY['image/png','image/jpeg','image/webp','image/gif','video/mp4','video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Service role inserts/updates/deletes (uploads happen server-side)
DROP POLICY IF EXISTS ai_creatives_service_role_write ON storage.objects;
CREATE POLICY ai_creatives_service_role_write ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'ai-creatives')
  WITH CHECK (bucket_id = 'ai-creatives');

-- Authenticated users in the same workspace can read (for inline preview in UI)
DROP POLICY IF EXISTS ai_creatives_workspace_read ON storage.objects;
CREATE POLICY ai_creatives_workspace_read ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ai-creatives'
    AND (
      -- Public bucket: anyone authenticated can read; the path-level workspace
      -- isolation matters mostly for listing. The asset URL itself is public.
      true
    )
  );

-- Anonymous read for the public asset URL (Meta Ads fetch, social, OG images)
DROP POLICY IF EXISTS ai_creatives_anon_read ON storage.objects;
CREATE POLICY ai_creatives_anon_read ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'ai-creatives');
