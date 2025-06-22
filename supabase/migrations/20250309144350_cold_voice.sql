/*
  # Fix scores table constraints and policies

  1. Changes
    - Drop existing constraints and recreate them properly
    - Update RLS policies to ensure proper access control
    - Clean up any duplicate scores
    - Add trigger to prevent duplicates

  2. Security
    - Users can only insert/update scores for assessments they created
    - All authenticated users can view scores
    - Ensures one score per assessment/process combination
*/

-- First, clean up any duplicate scores keeping only the latest one
WITH duplicates AS (
  SELECT DISTINCT ON (assessment_id, process_id) id
  FROM scores
  ORDER BY assessment_id, process_id, created_at DESC
)
DELETE FROM scores s
WHERE NOT EXISTS (
  SELECT 1 FROM duplicates d
  WHERE d.id = s.id
);

-- Drop existing constraints if they exist
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_assessment_id_process_id_key;
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_assessment_process_unique;

-- Add unique constraint
ALTER TABLE scores ADD CONSTRAINT scores_assessment_id_process_id_key 
  UNIQUE (assessment_id, process_id);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert scores" ON scores;
DROP POLICY IF EXISTS "Users can update scores they created" ON scores;
DROP POLICY IF EXISTS "Users can view all scores" ON scores;

-- Enable RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper checks
CREATE POLICY "Users can insert scores"
ON scores
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_id
    AND a.created_by = auth.uid()
  )
);

CREATE POLICY "Users can update scores they created"
ON scores
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_id
    AND a.created_by = auth.uid()
  )
);

CREATE POLICY "Users can view all scores"
ON scores
FOR SELECT
TO authenticated
USING (true);

-- Create or replace function to prevent duplicates
CREATE OR REPLACE FUNCTION prevent_duplicate_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- If updating and not changing assessment_id or process_id, allow
  IF (TG_OP = 'UPDATE' AND 
      NEW.assessment_id = OLD.assessment_id AND 
      NEW.process_id = OLD.process_id) THEN
    RETURN NEW;
  END IF;

  -- Check for existing score
  IF EXISTS (
    SELECT 1 FROM scores 
    WHERE assessment_id = NEW.assessment_id 
    AND process_id = NEW.process_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) THEN
    RAISE EXCEPTION 'Duplicate score for assessment_id=% and process_id=%', 
      NEW.assessment_id, NEW.process_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_duplicate_scores_trigger ON scores;

-- Create trigger
CREATE TRIGGER prevent_duplicate_scores_trigger
  BEFORE INSERT OR UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_scores();