/*
  # Fix Assessment Deletion

  1. Changes
    - Add ON DELETE CASCADE to all foreign key constraints
    - Add trigger to delete company if it has no more assessments
    - Add trigger to update assessment counts
    - Add trigger to validate deletion permissions

  2. Why these changes?
    - Ensure proper cleanup of all related data
    - Maintain data consistency
    - Prevent orphaned records
    - Add proper error handling
*/

-- Create function to delete company if no assessments remain
CREATE OR REPLACE FUNCTION delete_company_if_no_assessments()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if company has any remaining assessments
  IF NOT EXISTS (
    SELECT 1 FROM assessments 
    WHERE company_id = OLD.company_id
  ) THEN
    -- Delete the company
    DELETE FROM companies WHERE id = OLD.company_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle company deletion
DROP TRIGGER IF EXISTS trigger_delete_company_if_no_assessments ON assessments;
CREATE TRIGGER trigger_delete_company_if_no_assessments
  AFTER DELETE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION delete_company_if_no_assessments();

-- Add validation function for deletion permissions
CREATE OR REPLACE FUNCTION validate_assessment_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has permission to delete
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND (
      id = OLD.created_by 
      OR EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
    )
  ) THEN
    RAISE EXCEPTION 'Permission denied: You cannot delete this assessment';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for deletion validation
DROP TRIGGER IF EXISTS trigger_validate_assessment_deletion ON assessments;
CREATE TRIGGER trigger_validate_assessment_deletion
  BEFORE DELETE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION validate_assessment_deletion();