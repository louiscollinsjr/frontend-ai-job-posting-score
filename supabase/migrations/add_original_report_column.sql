-- Add original_report and job_body columns to reports table
ALTER TABLE reports ADD COLUMN IF NOT EXISTS original_report jsonb;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS job_body text;
