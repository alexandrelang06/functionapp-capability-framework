/*
  # Fix scores table structure and constraints
  
  1. Changes
    - Add ON DELETE CASCADE to foreign key constraints
    - Allow NULL scores
    - Update score constraint to allow NULL or values between 1-5
*/

-- Drop existing constraints
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_score_check;
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_assessment_id_fkey;
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_process_id_fkey;

-- Add new constraints with ON DELETE CASCADE
ALTER TABLE scores
  ADD CONSTRAINT scores_assessment_id_fkey 
  FOREIGN KEY (assessment_id) 
  REFERENCES assessments(id) 
  ON DELETE CASCADE;

ALTER TABLE scores
  ADD CONSTRAINT scores_process_id_fkey 
  FOREIGN KEY (process_id) 
  REFERENCES processes(id) 
  ON DELETE CASCADE;

-- Add new score constraint
ALTER TABLE scores 
  ADD CONSTRAINT scores_score_check 
  CHECK (score IS NULL OR (score >= 1 AND score <= 5));