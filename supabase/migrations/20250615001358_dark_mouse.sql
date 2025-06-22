/*
  # Fix Category Scores Table Structure

  1. Changes
    - Ensure category_scores table exists with proper structure
    - Add manual_score and is_manual columns if they don't exist
    - Add proper constraints and indexes
    - Force PostgREST to refresh its schema cache

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- First check if category_scores is a view or table
DO $$ 
BEGIN
  -- If it's a view, drop it
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE viewname = 'category_scores'
  ) THEN
    DROP VIEW category_scores;
  END IF;
END $$;

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS category_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  category_id text NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  manual_score numeric CHECK (manual_score IS NULL OR (manual_score >= 1 AND manual_score <= 5)),
  is_manual boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, category_id)
);

-- Add columns if they don't exist
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

-- Enable RLS
ALTER TABLE category_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'category_scores' AND policyname = 'Users can view all category scores'
  ) THEN
    CREATE POLICY "Users can view all category scores"
      ON category_scores
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'category_scores' AND policyname = 'Users can insert category scores'
  ) THEN
    CREATE POLICY "Users can insert category scores"
      ON category_scores
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'category_scores' AND policyname = 'Users can update category scores'
  ) THEN
    CREATE POLICY "Users can update category scores"
      ON category_scores
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'category_scores' AND policyname = 'Users can delete category scores'
  ) THEN
    CREATE POLICY "Users can delete category scores"
      ON category_scores
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_category_scores_timestamp'
  ) THEN
    CREATE TRIGGER update_category_scores_timestamp
      BEFORE UPDATE ON category_scores
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'category_scores table structure fixed successfully';
  RAISE NOTICE 'PostgREST schema cache refreshed - is_manual column should now be recognized';
END $$;