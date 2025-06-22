/*
  # Add Status Column to Assessments

  1. Changes
    - Add `status` column to assessments table with values 'complete' or 'partial'
    - Set default value to 'partial'
    - Update existing rows to have status based on completion_percentage
    
  2. Security
    - No changes to security policies needed
*/

-- Add status column to assessments table
ALTER TABLE assessments
ADD COLUMN status text NOT NULL DEFAULT 'partial'
CHECK (status IN ('complete', 'partial'));

-- Update existing rows based on completion_percentage
UPDATE assessments
SET status = CASE 
  WHEN completion_percentage = 100 THEN 'complete'
  ELSE 'partial'
END;