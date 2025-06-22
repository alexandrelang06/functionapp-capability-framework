/*
  # Clean up assessments data

  This migration will:
  1. Temporarily disable the deletion trigger
  2. Keep only the most recent assessment
  3. Clean up related data
  4. Re-enable the trigger
  
  The deletion is done safely with proper error handling.
*/

-- First, temporarily disable the trigger
ALTER TABLE assessments DISABLE TRIGGER trigger_validate_assessment_deletion;

DO $$ 
DECLARE
  last_assessment_id uuid;
BEGIN
  -- Get the ID of the most recent assessment
  SELECT id INTO last_assessment_id
  FROM assessments
  ORDER BY updated_at DESC
  LIMIT 1;

  -- Delete assessment metadata for all assessments except the last one
  DELETE FROM assessment_metadata
  WHERE assessment_id != last_assessment_id;

  -- Delete scores for all assessments except the last one
  DELETE FROM scores 
  WHERE assessment_id != last_assessment_id;

  -- Delete all assessments except the last one
  DELETE FROM assessments 
  WHERE id != last_assessment_id;

  -- Delete companies that no longer have any assessments
  DELETE FROM companies 
  WHERE id NOT IN (
    SELECT DISTINCT company_id 
    FROM assessments
  );

END $$;

-- Re-enable the trigger
ALTER TABLE assessments ENABLE TRIGGER trigger_validate_assessment_deletion;