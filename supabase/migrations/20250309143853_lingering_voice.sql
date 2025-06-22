/*
  # Fix scores uniqueness constraint

  1. Changes
    - Remove any duplicate scores keeping only the latest one
    - Add unique constraint on (assessment_id, process_id) if it doesn't exist
    - Add trigger to prevent duplicates

  2. Security
    - No changes to RLS policies
*/

-- First, remove any duplicate scores keeping only the latest one
WITH duplicates AS (
  SELECT DISTINCT ON (assessment_id, process_id) 
    id,
    assessment_id,
    process_id,
    created_at
  FROM scores
  ORDER BY assessment_id, process_id, created_at DESC
)
DELETE FROM scores a
WHERE NOT EXISTS (
  SELECT 1 FROM duplicates d
  WHERE d.id = a.id
);

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

-- Create or replace trigger function to prevent duplicates
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

-- Drop trigger if it exists and recreate it
DROP TRIGGER IF EXISTS prevent_duplicate_scores_trigger ON scores;

CREATE TRIGGER prevent_duplicate_scores_trigger
  BEFORE INSERT OR UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_scores();