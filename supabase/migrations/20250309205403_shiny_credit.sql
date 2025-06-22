/*
  # Fix Deletion Cascade and RLS Policies

  1. Changes
    - Add proper RLS policies for deletion
    - Ensure correct foreign key constraints with CASCADE
    - Fix assessment deletion handling
    
  2. Security
    - Enable RLS on all tables
    - Add explicit DELETE policies
    - Maintain existing SELECT/INSERT/UPDATE policies
*/

-- Enable RLS on all tables
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can delete assessments" ON assessments;
DROP POLICY IF EXISTS "Users can delete scores" ON scores;
DROP POLICY IF EXISTS "Users can delete metadata" ON assessment_metadata;
DROP POLICY IF EXISTS "Users can delete companies" ON companies;

-- Add DELETE policies for assessments
CREATE POLICY "Users can delete assessments"
ON assessments
FOR DELETE 
TO authenticated
USING (created_by = auth.uid());

-- Add DELETE policies for scores
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

-- Add DELETE policies for assessment metadata
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

-- Add DELETE policies for companies
CREATE POLICY "Users can delete companies"
ON companies
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Drop existing foreign key constraints
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_assessment_id_fkey;
ALTER TABLE assessment_metadata DROP CONSTRAINT IF EXISTS assessment_metadata_assessment_id_fkey;
ALTER TABLE assessments DROP CONSTRAINT IF EXISTS assessments_company_id_fkey;

-- Recreate foreign key constraints with CASCADE
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