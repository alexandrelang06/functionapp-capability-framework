/*
  # Update Assessment Schema

  1. Changes
    - Add `is_open` boolean column to assessments if it doesn't exist
    - Add unique constraint on company_id in companies table
    
  2. Security
    - Update RLS policies to reflect new schema
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

-- Add unique constraint on company_id in companies table
ALTER TABLE companies
ADD CONSTRAINT unique_company_id UNIQUE (id);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can update assessments they created" ON assessments;

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
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());