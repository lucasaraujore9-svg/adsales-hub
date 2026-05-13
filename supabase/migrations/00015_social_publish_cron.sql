-- ============================================================================
-- Social media publish cron job
--
-- Schedules pg_cron + pg_net to call the Next.js cron runner every minute,
-- which picks up `social_posts` with status='scheduled' and scheduled_at <=
-- now() and publishes them.
--
-- Configuration: set the following GUCs (per-database) before scheduling:
--
--   ALTER DATABASE postgres SET app.cron_runner_url = 'https://<your-app>/api/cron/run';
--   ALTER DATABASE postgres SET app.cron_secret = '<your CRON_SECRET>';
--
-- Or update the values inline below before running this migration in
-- production.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Helper that triggers the Next.js cron runner. Reads the URL and secret from
-- runtime settings so the same migration works across environments.
CREATE OR REPLACE FUNCTION public.invoke_cron_task(task_name TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  base_url TEXT := current_setting('app.cron_runner_url', true);
  secret    TEXT := current_setting('app.cron_secret', true);
  request_id BIGINT;
BEGIN
  IF base_url IS NULL OR base_url = '' THEN
    RAISE NOTICE 'app.cron_runner_url is not set; skipping cron task %', task_name;
    RETURN NULL;
  END IF;

  SELECT net.http_post(
    url := base_url || '?task=' || task_name,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', CASE WHEN secret IS NOT NULL AND secret <> ''
                            THEN 'Bearer ' || secret
                            ELSE ''
                       END
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  )
  INTO request_id;

  RETURN request_id;
END;
$$;

-- Unschedule any prior version (idempotent migration re-runs)
DO $$
BEGIN
  PERFORM cron.unschedule('social_publish_minute');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Run every minute. The runner is fast and idempotent (uses status transitions
-- to lock posts), so back-to-back invocations are safe.
SELECT cron.schedule(
  'social_publish_minute',
  '* * * * *',
  $$SELECT public.invoke_cron_task('social_publish');$$
);

-- Optional: collect metrics every 15 minutes (kept disabled by default; uncomment to enable)
-- SELECT cron.schedule('metrics_collect_15m', '*/15 * * * *', $$SELECT public.invoke_cron_task('metrics_collect');$$);
