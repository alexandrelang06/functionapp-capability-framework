/*
  # Add constraints column to assessments table

  1. Changes
    - Add `constraints` column to assessments table to store assessment constraints
    - Column is nullable text field
    - No default value required

  2. Security
    - No additional security measures needed as existing RLS policies will cover the new column
*/

-- Add constraints column to assessments table
ALTER TABLE assessments 
ADD COLUMN IF NOT EXISTS constraints text;