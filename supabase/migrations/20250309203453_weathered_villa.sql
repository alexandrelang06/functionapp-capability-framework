/*
  # Complete Assessment Deletion Function

  This migration creates a function to safely delete an assessment and all its related data.
  
  1. New Functions
    - safely_delete_assessment: Handles complete deletion of an assessment and related data
  
  2. Changes
    - Removes the existing trigger that prevents deletion
    - Adds new function for safe deletion
    - Ensures proper cleanup of all related data
  
  3. Security
    - Function runs with security definer to ensure proper permissions
    - Validates input parameters
    - Handles errors gracefully
*/

-- First, drop the existing trigger that prevents deletion
DROP TRIGGER IF EXISTS trigger_validate_assessment_deletion ON assessments;

-- Create function for safe assessment deletion
CREATE OR REPLACE FUNCTION safely_delete_assessment(assessment_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_id_var uuid;
  assessment_count integer;
BEGIN
  -- Validate input
  IF assessment_id_param IS NULL THEN
    RAISE EXCEPTION 'Assessment ID cannot be null';
  END IF;

  -- Get company ID and store it for later use
  SELECT company_id INTO company_id_var
  FROM assessments
  WHERE id = assessment_id_param;

  -- If assessment doesn't exist, raise exception
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment not found';
  END IF;

  -- Delete assessment metadata first (due to foreign key constraints)
  DELETE FROM assessment_metadata
  WHERE assessment_id = assessment_id_param;

  -- Delete all scores associated with this assessment
  DELETE FROM scores
  WHERE assessment_id = assessment_id_param;

  -- Delete the assessment itself
  DELETE FROM assessments
  WHERE id = assessment_id_param;

  -- Check if company has any remaining assessments
  SELECT COUNT(*) INTO assessment_count
  FROM assessments
  WHERE company_id = company_id_var;

  -- If no assessments remain, delete the company
  IF assessment_count = 0 THEN
    DELETE FROM companies
    WHERE id = company_id_var;
  END IF;

  RETURN true;
END;
$$;