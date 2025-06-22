/*
  # Update company-assessment relationship to one-to-one

  1. Changes
    - Drop dependent views first
    - Drop existing triggers and functions
    - Drop existing constraints
    - Remove columns that are no longer needed
    - Add unique constraint on company_id
    - Update RLS policies
    - Recreate views

  2. Data Migration
    - Keep only the most recent assessment for each company
    - Delete older assessments
*/

-- First drop the views that depend on the columns we want to remove
DROP VIEW IF EXISTS latest_assessments;
DROP VIEW IF EXISTS assessment_scores;
DROP VIEW IF EXISTS category_scores;
DROP VIEW IF EXISTS domain_scores;

-- Drop triggers and functions
DROP TRIGGER IF EXISTS assessment_status_trigger ON assessments;
DROP FUNCTION IF EXISTS handle_assessment_status();

-- Drop existing constraints
ALTER TABLE assessments
DROP CONSTRAINT IF EXISTS unique_company_assessment;

-- Delete all but the most recent assessment for each company
WITH KeepRows AS (
  SELECT DISTINCT ON (company_id) id
  FROM assessments
  ORDER BY company_id, created_at DESC
)
DELETE FROM assessments a
WHERE NOT EXISTS (
  SELECT 1 FROM KeepRows k WHERE k.id = a.id
);

-- Remove columns that are no longer needed
ALTER TABLE assessments
DROP COLUMN IF EXISTS is_open CASCADE,
DROP COLUMN IF EXISTS status CASCADE;

-- Add unique constraint on company_id
ALTER TABLE assessments
ADD CONSTRAINT unique_company_assessment UNIQUE (company_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can update assessments they created" ON assessments;
CREATE POLICY "Users can update assessments they created"
ON assessments
FOR UPDATE
TO authenticated
USING (created_by = auth.uid());

-- Recreate views
CREATE VIEW assessment_scores AS
SELECT 
  assessment_id,
  AVG(score) as avg_score
FROM scores
GROUP BY assessment_id;

CREATE VIEW category_scores AS
SELECT 
  s.assessment_id,
  p.category_id,
  c.domain_id,
  AVG(s.score) as avg_score
FROM scores s
JOIN processes p ON s.process_id = p.id
JOIN categories c ON p.category_id = c.id
GROUP BY s.assessment_id, p.category_id, c.domain_id;

CREATE VIEW domain_scores AS
SELECT 
  assessment_id,
  c.domain_id,
  AVG(score) as avg_score
FROM scores s
JOIN processes p ON s.process_id = p.id
JOIN categories c ON p.category_id = c.id
GROUP BY assessment_id, c.domain_id;