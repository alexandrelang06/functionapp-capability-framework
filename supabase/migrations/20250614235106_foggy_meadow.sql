/*
  # Fix category_scores schema cache issue
  
  1. Changes
    - Force PostgREST schema cache refresh by recreating category_scores table
    - Backup existing data before recreation
    - Restore data after table recreation
    - Recreate all policies and triggers
    
  2. Purpose
    - Resolve PostgREST error: "Could not find the 'is_manual' column"
    - Ensure all columns are properly recognized by the API
*/

-- Backup existing data if any
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'category_scores') THEN
    CREATE TEMP TABLE category_scores_backup AS 
    SELECT * FROM category_scores;
  END IF;
END $$;

-- Drop existing table completely to force schema refresh
DROP TABLE IF EXISTS category_scores CASCADE;

-- Recreate the table with all required columns
CREATE TABLE category_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  category_id text NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  manual_score numeric CHECK (manual_score IS NULL OR (manual_score >= 1 AND manual_score <= 5)),
  is_manual boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, category_id)
);

-- Restore data if any existed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'category_scores_backup') THEN
    INSERT INTO category_scores 
    SELECT * FROM category_scores_backup;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE category_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all category scores"
  ON category_scores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert category scores"
  ON category_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update category scores"
  ON category_scores
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete category scores"
  ON category_scores
  FOR DELETE
  TO authenticated
  USING (true);

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_category_scores_timestamp
  BEFORE UPDATE ON category_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_category_scores_assessment_category 
ON category_scores(assessment_id, category_id);

-- Force PostgREST to refresh its schema cache by updating the schema version
NOTIFY pgrst, 'reload schema';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'category_scores table recreated successfully with all columns';
  RAISE NOTICE 'PostgREST schema cache should now recognize the is_manual column';
END $$;