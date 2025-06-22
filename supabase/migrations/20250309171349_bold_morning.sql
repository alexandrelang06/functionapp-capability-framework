/*
  # Update Assessment and Company Schema

  1. Changes
    - Add `is_open` boolean column to assessments
    - Add unique constraint on company_id in assessments table
    - Update RLS policies for assessment updates
    
  2. Security
    - Add policy for closing assessments
    - Add policy for updating open assessments only
*/

-- Add is_open column to assessments if it doesn't exist
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

-- Add unique constraint on company_id in assessments table
ALTER TABLE assessments
ADD CONSTRAINT unique_company_assessment UNIQUE (company_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can update assessments they created" ON assessments;
DROP POLICY IF EXISTS "Users can update open assessments" ON assessments;
DROP POLICY IF EXISTS "Users can close assessments" ON assessments;

-- Create policy for updating open assessments
CREATE POLICY "Users can update open assessments"
ON assessments
FOR UPDATE
TO authenticated
USING ((created_by = auth.uid()) AND (is_open = true));

-- Create policy for closing assessments
CREATE POLICY "Users can close assessments"
ON assessments
FOR UPDATE
TO authenticated
USING (created_by = auth.uid());