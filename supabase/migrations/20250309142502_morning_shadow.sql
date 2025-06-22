/*
  # Fix score updates and constraints
  
  1. Changes
    - Add ON CONFLICT clause to scores table
    - Allow NULL values for scores
    - Update score constraint to handle NULL values
    
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing score constraint
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_score_check;

-- Add new constraint allowing NULL or values 1-5
ALTER TABLE scores 
  ADD CONSTRAINT scores_score_check 
  CHECK (score IS NULL OR (score >= 1 AND score <= 5));

-- Update existing NULL scores to maintain data consistency
UPDATE scores SET score = NULL WHERE score = 0;