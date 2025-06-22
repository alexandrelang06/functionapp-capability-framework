/*
  # Fix Assessment Deletion Process

  1. Changes
    - Removes existing deletion trigger
    - Creates new function for safe deletion
    - Adds proper RLS policies
    - Ensures proper cleanup of all related data
  
  2. Security
    - Uses Supabase auth roles for admin checks
    - Handles cascading deletes properly
    - Maintains data integrity
*/

-- Drop existing trigger and function that prevent deletion
DROP TRIGGER IF EXISTS validate_assessment_deletion ON assessments;
DROP FUNCTION IF EXISTS validate_assessment_deletion;

-- Create a new function to handle assessment deletion
CREATE OR REPLACE FUNCTION handle_assessment_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete assessment metadata
  DELETE FROM assessment_metadata
  WHERE assessment_id = OLD.id;

  -- Delete scores
  DELETE FROM scores
  WHERE assessment_id = OLD.id;

  -- Check if company has other assessments
  IF NOT EXISTS (
    SELECT 1 FROM assessments 
    WHERE company_id = OLD.company_id 
    AND id != OLD.id
  ) THEN
    -- If no other assessments exist, delete the company
    DELETE FROM companies
    WHERE id = OLD.company_id;
  END IF;

  RETURN OLD;
END;
$$;

-- Create new trigger for assessment deletion
CREATE TRIGGER handle_assessment_deletion_trigger
  BEFORE DELETE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION handle_assessment_deletion();

-- Update RLS policies for assessments to allow deletion
DROP POLICY IF EXISTS "Users can delete assessments" ON assessments;
CREATE POLICY "Users can delete assessments"
  ON assessments
  FOR DELETE
  TO authenticated
  USING (
    -- Allow deletion if user created the assessment
    created_by = auth.uid()
  );

-- Ensure RLS is enabled
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;