/*
  # Add priority flag to scores

  1. Changes
    - Add priority boolean column to scores table with default false
    - Add index for faster priority filtering
*/

-- Add priority column with default false
ALTER TABLE scores 
ADD COLUMN priority boolean DEFAULT false;

-- Add index for priority column
CREATE INDEX idx_scores_priority ON scores(priority);