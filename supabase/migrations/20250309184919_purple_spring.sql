/*
  # Fix Assessment Deletion Cascade

  1. Changes
    - Add ON DELETE CASCADE to foreign key constraints for assessment-related tables
    - Ensure proper cleanup of all related data when an assessment is deleted

  2. Security
    - Maintains existing RLS policies
    - No changes to access control
*/

-- Drop existing foreign key constraints
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_assessment_id_fkey;
ALTER TABLE assessment_metadata DROP CONSTRAINT IF EXISTS assessment_metadata_assessment_id_fkey;

-- Recreate foreign key constraints with ON DELETE CASCADE
ALTER TABLE scores
  ADD CONSTRAINT scores_assessment_id_fkey
  FOREIGN KEY (assessment_id)
  REFERENCES assessments(id)
  ON DELETE CASCADE;

ALTER TABLE assessment_metadata
  ADD CONSTRAINT assessment_metadata_assessment_id_fkey
  FOREIGN KEY (assessment_id)
  REFERENCES assessments(id)
  ON DELETE CASCADE;