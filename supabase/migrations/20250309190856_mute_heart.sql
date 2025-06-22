/*
  # Fix Assessment Metadata Cascade Delete

  1. Changes
    - Add ON DELETE CASCADE to assessment_metadata foreign key constraint
    This ensures that when an assessment is deleted, its metadata is automatically deleted

  2. Why this change?
    - Currently, assessment deletion can fail because metadata remains
    - This change ensures proper cleanup of all related data
*/

-- First drop the existing foreign key constraint
ALTER TABLE assessment_metadata 
DROP CONSTRAINT IF EXISTS assessment_metadata_assessment_id_fkey;

-- Re-add it with CASCADE delete
ALTER TABLE assessment_metadata
ADD CONSTRAINT assessment_metadata_assessment_id_fkey 
FOREIGN KEY (assessment_id) 
REFERENCES assessments(id) 
ON DELETE CASCADE;