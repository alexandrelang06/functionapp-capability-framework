/*
  # Fix Assessment Deletion Cascade

  1. Changes
    - Add ON DELETE CASCADE to all foreign key constraints related to assessments
    - Ensure proper cleanup of all related data when an assessment is deleted
    - Add trigger to delete company if it has no more assessments

  2. Security
    - Maintain existing RLS policies
    - No changes to access control
*/

-- First, drop existing foreign key constraints
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_assessment_id_fkey;
ALTER TABLE category_scores DROP CONSTRAINT IF EXISTS category_scores_assessment_id_fkey;

-- Recreate foreign key constraints with ON DELETE CASCADE
ALTER TABLE scores
  ADD CONSTRAINT scores_assessment_id_fkey
  FOREIGN KEY (assessment_id)
  REFERENCES assessments(id)
  ON DELETE CASCADE;

ALTER TABLE category_scores
  ADD CONSTRAINT category_scores_assessment_id_fkey
  FOREIGN KEY (assessment_id)
  REFERENCES assessments(id)
  ON DELETE CASCADE;

-- Create function to delete company if no assessments remain
CREATE OR REPLACE FUNCTION delete_company_if_no_assessments()
RETURNS TRIGGER AS $$
DECLARE
  company_id_var UUID;
BEGIN
  -- Store the company_id before the assessment is deleted
  company_id_var := OLD.company_id;
  
  -- After the assessment is deleted, check if any other assessments exist for this company
  IF NOT EXISTS (
    SELECT 1 FROM assessments 
    WHERE company_id = company_id_var
  ) THEN
    -- If no assessments remain, delete the company
    DELETE FROM companies WHERE id = company_id_var;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run after assessment deletion
DROP TRIGGER IF EXISTS trigger_delete_company_if_no_assessments ON assessments;
CREATE TRIGGER trigger_delete_company_if_no_assessments
  AFTER DELETE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION delete_company_if_no_assessments();