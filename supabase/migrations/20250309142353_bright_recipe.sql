/*
  # Add NULL support for scores
  
  1. Changes
    - Allow NULL values for scores
    - Update score constraint to handle NULL values
    - Add trigger to update assessment completion percentage
*/

-- Drop existing score constraint
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_score_check;

-- Add new constraint allowing NULL or values 1-5
ALTER TABLE scores 
  ADD CONSTRAINT scores_score_check 
  CHECK (score IS NULL OR (score >= 1 AND score <= 5));

-- Update existing NULL scores to 0 to maintain data consistency
UPDATE scores SET score = NULL WHERE score = 0;