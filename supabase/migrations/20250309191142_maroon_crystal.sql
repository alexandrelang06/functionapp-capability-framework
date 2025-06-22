/*
  # Fix Cascade Delete Configuration

  1. Changes
    - Add ON DELETE CASCADE to scores foreign key constraint
    - Add ON DELETE CASCADE to assessment_metadata foreign key constraint
    - Add ON DELETE CASCADE to assessments foreign key constraint
    This ensures proper cleanup of all related data when an assessment is deleted

  2. Why this change?
    - Currently, deletion can fail because of foreign key constraints
    - This change ensures proper cleanup of all related data
*/

-- First drop existing foreign key constraints
ALTER TABLE scores
DROP CONSTRAINT IF EXISTS scores_assessment_id_fkey;

ALTER TABLE assessment_metadata
DROP CONSTRAINT IF EXISTS assessment_metadata_assessment_id_fkey;

ALTER TABLE assessments 
DROP CONSTRAINT IF EXISTS assessments_company_id_fkey;

-- Re-add constraints with CASCADE delete
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

ALTER TABLE assessments
ADD CONSTRAINT assessments_company_id_fkey 
FOREIGN KEY (company_id) 
REFERENCES companies(id) 
ON DELETE CASCADE;