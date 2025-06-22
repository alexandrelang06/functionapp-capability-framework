/*
  # Add job code to assessments

  1. Changes
    - Add job_code column to assessments table
    - Drop and recreate latest_assessments view with job_code field
*/

-- Add job_code column to assessments table
ALTER TABLE assessments 
ADD COLUMN job_code text;

-- Drop existing view
DROP VIEW IF EXISTS latest_assessments;

-- Recreate view with job_code
CREATE VIEW latest_assessments AS
SELECT 
  a.id,
  a.company_id,
  a.title,
  a.created_at,
  a.created_by,
  a.status,
  a.completion_percentage,
  a.job_code,
  COALESCE(
    (SELECT AVG(s.score)::numeric(3,1)
     FROM scores s
     WHERE s.assessment_id = a.id),
    0
  ) as avg_score
FROM assessments a;