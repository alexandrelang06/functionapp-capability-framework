/*
  # Update Assessment Policies

  1. Changes
    - Remove creator-based restrictions from RLS policies
    - Allow any authenticated user to update assessments
    - Keep unique constraint on company_id
    
  2. Security
    - All authenticated users can view and update any assessment
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update assessments they created" ON assessments;
DROP POLICY IF EXISTS "Users can update open assessments" ON assessments;
DROP POLICY IF EXISTS "Users can close assessments" ON assessments;

-- Create new policies without creator restrictions
CREATE POLICY "Users can update open assessments"
ON assessments
FOR UPDATE
TO authenticated
USING (is_open = true);

CREATE POLICY "Users can close assessments"
ON assessments
FOR UPDATE
TO authenticated
USING (true);

-- Ensure unique constraint exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'assessments' 
    AND constraint_name = 'unique_company_assessment'
  ) THEN
    ALTER TABLE assessments
    ADD CONSTRAINT unique_company_assessment UNIQUE (company_id);
  END IF;
END $$;