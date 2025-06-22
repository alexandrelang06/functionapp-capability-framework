/*
  # Allow null scores in scores table
  
  1. Changes
    - Modify scores table to allow null values for score column
    - Update score constraint to allow null or values between 1-5
    - Add check constraint to ensure score is either null or between 1-5
*/

ALTER TABLE scores ALTER COLUMN score DROP NOT NULL;

-- Drop existing constraint if it exists
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_score_check;

-- Add new constraint that allows null or values between 1-5
ALTER TABLE scores ADD CONSTRAINT scores_score_check 
  CHECK (score IS NULL OR (score >= 1 AND score <= 5));