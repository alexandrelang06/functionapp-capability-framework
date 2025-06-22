/*
  # Fix scores table RLS policies and constraints

  1. Changes
    - Drop existing policies and recreate them
    - Add unique constraint for assessment_id and process_id
    - Add trigger to prevent duplicate scores
    - Clean up any duplicate scores

  2. Security
    - Ensures users can only modify scores for assessments they created
    - Allows read access to all authenticated users
    - Prevents duplicate scores for the same assessment/process combination
*/

-- First, remove any duplicate scores keeping only the latest one
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

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert scores" ON scores;
DROP POLICY IF EXISTS "Users can update scores they created" ON scores;
DROP POLICY IF EXISTS "Users can view all scores" ON scores;

-- Enable RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Add unique constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'scores_assessment_id_process_id_key'
  ) THEN
    ALTER TABLE scores ADD CONSTRAINT scores_assessment_id_process_id_key 
      UNIQUE (assessment_id, process_id);
  END IF;
END $$;

-- Create or replace trigger function
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

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'prevent_duplicate_scores_trigger'
  ) THEN
    CREATE TRIGGER prevent_duplicate_scores_trigger
      BEFORE INSERT OR UPDATE ON scores
      FOR EACH ROW
      EXECUTE FUNCTION prevent_duplicate_scores();
  END IF;
END $$;

-- Create new policies
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