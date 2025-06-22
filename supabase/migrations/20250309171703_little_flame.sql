/*
  # Update Assessment Status and Completion

  1. Changes
    - Add status column to assessments table with values 'complete' or 'partial'
    - Add is_open column for access control
    - Add unique constraint on company_id
    
  2. Security
    - Update RLS policies to handle open/closed assessments
*/

-- Add status column to assessments table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assessments' AND column_name = 'status'
  ) THEN
    ALTER TABLE assessments 
    ADD COLUMN status text NOT NULL DEFAULT 'partial'
    CHECK (status IN ('complete', 'partial'));
  END IF;
END $$;

-- Add is_open column to assessments table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assessments' AND column_name = 'is_open'
  ) THEN
    ALTER TABLE assessments 
    ADD COLUMN is_open boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Add unique constraint on company_id if it doesn't exist
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update assessments they created" ON assessments;
DROP POLICY IF EXISTS "Users can update open assessments" ON assessments;
DROP POLICY IF EXISTS "Users can close assessments" ON assessments;

-- Create policy for updating open assessments
CREATE POLICY "Users can update open assessments"
ON assessments
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() AND is_open = true);

-- Create policy for closing assessments
CREATE POLICY "Users can close assessments"
ON assessments
FOR UPDATE
TO authenticated
USING (created_by = auth.uid());