/*
  # Fix Assessment Completion Calculation

  1. Changes
    - Fix ambiguous column reference in calculate_completion_percentage function
    - Update trigger function to properly handle score updates
    - Add proper constraints for scores

  2. Security
    - No changes to RLS policies
*/

-- Drop existing function and trigger
DROP FUNCTION IF EXISTS calculate_completion_percentage CASCADE;
DROP FUNCTION IF EXISTS update_assessment_completion_percentage CASCADE;

-- Create improved completion percentage calculation function
CREATE OR REPLACE FUNCTION calculate_completion_percentage(assessment_id_param uuid)
RETURNS integer AS $$
DECLARE
  total_processes integer;
  scored_processes integer;
BEGIN
  -- Get total number of processes
  SELECT COUNT(*)
  INTO total_processes
  FROM processes;

  -- Get count of processes with valid scores (between 1 and 5)
  SELECT COUNT(*)
  INTO scored_processes
  FROM scores s
  WHERE s.assessment_id = assessment_id_param 
  AND s.score IS NOT NULL 
  AND s.score BETWEEN 1 AND 5;

  -- Calculate and return percentage
  RETURN CASE 
    WHEN total_processes = 0 THEN 0
    ELSE (scored_processes * 100 / total_processes)
  END;
END;
$$ LANGUAGE plpgsql;

-- Create improved trigger function
CREATE OR REPLACE FUNCTION update_assessment_completion_percentage()
RETURNS trigger AS $$
BEGIN
  -- Update completion percentage
  UPDATE assessments
  SET 
    completion_percentage = calculate_completion_percentage(NEW.assessment_id),
    status = CASE 
      WHEN calculate_completion_percentage(NEW.assessment_id) = 100 THEN 'complete'
      ELSE 'partial'
    END
  WHERE id = NEW.assessment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_assessment_completion
AFTER INSERT OR UPDATE OR DELETE ON scores
FOR EACH ROW
EXECUTE FUNCTION update_assessment_completion_percentage();

-- Update existing scores to ensure they are integers between 1 and 5
UPDATE scores
SET score = NULL
WHERE score < 1 OR score > 5;

UPDATE scores
SET score = ROUND(score)
WHERE score IS NOT NULL;

-- Add constraint to ensure scores are integers between 1 and 5
ALTER TABLE scores
DROP CONSTRAINT IF EXISTS scores_score_check,
ADD CONSTRAINT scores_score_check 
  CHECK (score IS NULL OR (score >= 1 AND score <= 5));

-- Recalculate completion percentages for all assessments
DO $$
DECLARE
  assessment_record RECORD;
BEGIN
  FOR assessment_record IN SELECT id FROM assessments LOOP
    UPDATE assessments
    SET 
      completion_percentage = calculate_completion_percentage(id),
      status = CASE 
        WHEN calculate_completion_percentage(id) = 100 THEN 'complete'
        ELSE 'partial'
      END
    WHERE id = assessment_record.id;
  END LOOP;
END $$;