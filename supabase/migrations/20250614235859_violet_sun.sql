/*
  # Create category_scores table with manual score support
  
  1. Changes
    - Drop existing view if it exists
    - Create a proper table with all required columns
    - Add RLS policies for security
    - Add indexes for performance
    
  2. New Fields
    - manual_score: Allows setting a score manually
    - is_manual: Flag to indicate if score is manual or calculated
*/

-- Drop the view if it exists
DROP VIEW IF EXISTS category_scores CASCADE;

-- Create the category_scores table
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
CREATE INDEX idx_category_scores_assessment_category 
ON category_scores(assessment_id, category_id);

-- Force PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'category_scores table created successfully with all required columns';
  RAISE NOTICE 'PostgREST schema cache refreshed - is_manual column should now be recognized';
END $$;