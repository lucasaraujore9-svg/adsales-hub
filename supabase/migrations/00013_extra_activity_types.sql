-- Adds extra activity types to support richer CRM workflows.
-- Original constraint: type IN ('call','email','whatsapp','meeting','task','note','sms')
-- New types: video_meeting, demo, follow_up, linkedin

ALTER TABLE activities DROP CONSTRAINT IF EXISTS activities_type_check;

ALTER TABLE activities
  ADD CONSTRAINT activities_type_check
  CHECK (
    type IN (
      'call',
      'email',
      'whatsapp',
      'meeting',
      'task',
      'note',
      'sms',
      'video_meeting',
      'demo',
      'follow_up',
      'linkedin'
    )
  );
