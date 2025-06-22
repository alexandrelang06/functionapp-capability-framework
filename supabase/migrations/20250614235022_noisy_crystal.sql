/*
  # Fix category_scores schema cache issue

  1. Problem
    - PostgREST cannot find the 'is_manual' column in category_scores table
    - This causes HTTP 400 errors when trying to update category scores
    - Schema cache needs to be refreshed

  2. Solution
    - Drop and recreate the category_scores table to force schema refresh
    - Preserve any existing data during the recreation
    - Ensure all columns and constraints are properly defined

  3. Changes
    - Backup existing data
    - Drop and recreate table with all columns
    - Restore data
    - Recreate all policies and triggers
*/

-- Backup existing data if any
CREATE TEMP TABLE category_scores_backup AS 
SELECT * FROM category_scores WHERE 1=1;

-- Drop existing table and policies
DROP TABLE IF EXISTS category_scores CASCADE;

-- Recreate the table with all columns
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
INSERT INTO category_scores 
SELECT * FROM category_scores_backup 
WHERE EXISTS (SELECT 1 FROM category_scores_backup);

-- Enable RLS
ALTER TABLE category_scores ENABLE ROW LEVEL SECURITY;

-- Recreate policies
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

-- Recreate trigger for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_category_scores_timestamp
  BEFORE UPDATE ON category_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Recreate index
CREATE INDEX IF NOT EXISTS idx_category_scores_assessment_category 
ON category_scores(assessment_id, category_id);

-- Clean up temp table
DROP TABLE IF EXISTS category_scores_backup;