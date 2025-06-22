/*
  # Fix Assessment Deletion Process

  1. Changes
    - Removes existing deletion restrictions
    - Creates new cascade deletion trigger
    - Updates RLS policies to allow proper deletion
    - Ensures proper cleanup of related data
  
  2. Security
    - Maintains data integrity during deletion
    - Handles cascading deletes properly
    - Preserves RLS security model
*/

-- First, drop existing triggers that might prevent deletion
DROP TRIGGER IF EXISTS prevent_duplicate_scores_trigger ON scores;
DROP TRIGGER IF EXISTS validate_assessment_deletion ON assessments;
DROP TRIGGER IF EXISTS handle_assessment_deletion_trigger ON assessments;

-- Drop existing functions
DROP FUNCTION IF EXISTS validate_assessment_deletion();
DROP FUNCTION IF EXISTS prevent_duplicate_scores();
DROP FUNCTION IF EXISTS handle_assessment_deletion();

-- Create new function to handle assessment deletion with proper cascade
CREATE OR REPLACE FUNCTION handle_assessment_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete scores first (due to foreign key constraint)
  DELETE FROM scores
  WHERE assessment_id = OLD.id;
  
  -- Delete assessment metadata
  DELETE FROM assessment_metadata
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

-- Update RLS policies to allow proper deletion
DROP POLICY IF EXISTS "Users can delete assessments" ON assessments;
CREATE POLICY "Users can delete assessments"
  ON assessments
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Add policies for related tables to ensure proper cascade
DROP POLICY IF EXISTS "Users can delete scores" ON scores;
CREATE POLICY "Users can delete scores"
  ON scores
  FOR DELETE
  TO authenticated
  USING (
    assessment_id IN (
      SELECT id FROM assessments 
      WHERE created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete metadata" ON assessment_metadata;
CREATE POLICY "Users can delete metadata"
  ON assessment_metadata
  FOR DELETE
  TO authenticated
  USING (
    assessment_id IN (
      SELECT id FROM assessments 
      WHERE created_by = auth.uid()
    )
  );

-- Enable RLS on related tables
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_metadata ENABLE ROW LEVEL SECURITY;