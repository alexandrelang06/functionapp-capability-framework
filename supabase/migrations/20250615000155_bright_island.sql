/*
  # Fix category_scores table structure
  
  1. Changes
    - Add manual_score column to category_scores table
    - Add is_manual flag to category_scores table
    - Ensure proper constraints and indexes
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add columns to category_scores table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'category_scores' AND column_name = 'manual_score'
  ) THEN
    ALTER TABLE category_scores ADD COLUMN manual_score numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'category_scores' AND column_name = 'is_manual'
  ) THEN
    ALTER TABLE category_scores ADD COLUMN is_manual boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add constraint for manual_score
ALTER TABLE category_scores 
DROP CONSTRAINT IF EXISTS category_scores_manual_score_check;

ALTER TABLE category_scores 
ADD CONSTRAINT category_scores_manual_score_check 
CHECK (manual_score IS NULL OR (manual_score >= 1 AND manual_score <= 5));

-- Create index for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_category_scores_assessment_category 
ON category_scores(assessment_id, category_id);

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';