/*
  # Fix scores table constraints

  1. Changes
    - Add unique constraint on assessment_id and process_id combination
    - Drop existing duplicate scores to ensure clean data

  2. Security
    - No changes to RLS policies
*/

-- First, remove any duplicate scores keeping only the latest one
DELETE FROM scores a USING (
  SELECT DISTINCT ON (assessment_id, process_id) 
    id,
    assessment_id,
    process_id,
    created_at
  FROM scores
  ORDER BY assessment_id, process_id, created_at DESC
) b
WHERE a.assessment_id = b.assessment_id 
  AND a.process_id = b.process_id 
  AND a.id != b.id;

-- Add unique constraint
ALTER TABLE scores
ADD CONSTRAINT scores_assessment_process_unique 
UNIQUE (assessment_id, process_id);