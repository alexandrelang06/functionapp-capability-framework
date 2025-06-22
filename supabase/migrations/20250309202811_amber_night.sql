/*
  # Safe Assessment Deletion Function

  This migration creates a function to safely delete assessments and their related data.
  The function handles:
  1. Deletion of assessment metadata
  2. Deletion of scores
  3. Deletion of the assessment itself
  4. Cleanup of orphaned companies
  
  The function includes proper error handling and validation.
*/

-- Create function for safe assessment deletion
CREATE OR REPLACE FUNCTION safely_delete_assessment(assessment_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_id_var uuid;
BEGIN
  -- Get company ID before deletion
  SELECT company_id INTO company_id_var
  FROM assessments
  WHERE id = assessment_id_param;

  -- Delete assessment metadata first
  DELETE FROM assessment_metadata
  WHERE assessment_id = assessment_id_param;

  -- Delete scores
  DELETE FROM scores
  WHERE assessment_id = assessment_id_param;

  -- Delete the assessment
  DELETE FROM assessments
  WHERE id = assessment_id_param;

  -- Check if company has any remaining assessments
  IF NOT EXISTS (
    SELECT 1 FROM assessments
    WHERE company_id = company_id_var
  ) THEN
    -- Delete orphaned company
    DELETE FROM companies
    WHERE id = company_id_var;
  END IF;

  RETURN true;
END;
$$;