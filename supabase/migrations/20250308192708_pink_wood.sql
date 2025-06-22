/*
  # Update latest_assessments view

  1. Changes
    - Drop and recreate latest_assessments view to include job_code
    - No need to add job_code column since it already exists

  2. Security
    - Maintain existing RLS policies
*/

-- Drop the existing view first
DROP VIEW IF EXISTS latest_assessments;

-- Recreate the latest_assessments view with job_code
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