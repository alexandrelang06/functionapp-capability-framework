/*
  # Fix Scores Table and Validation

  1. Changes
    - Add proper unique constraint for scores
    - Fix validation triggers
    - Add better error handling
    - Add proper indexes
    
  2. Security
    - Ensure proper RLS policies
    - Add validation checks
*/

-- Drop existing duplicate constraints
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_assessment_id_process_id_key;
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_assessment_process_unique;

-- Add single unique constraint
ALTER TABLE scores
ADD CONSTRAINT scores_assessment_process_unique 
UNIQUE (assessment_id, process_id);

-- Update score validation function
CREATE OR REPLACE FUNCTION validate_score()
RETURNS trigger AS $$
BEGIN
  -- Validate score range
  IF NEW.score IS NOT NULL AND (NEW.score < 1 OR NEW.score > 5) THEN
    RAISE EXCEPTION 'Score must be between 1 and 5';
  END IF;

  -- Validate assessment exists and is open
  IF NOT EXISTS (
    SELECT 1 FROM assessments 
    WHERE id = NEW.assessment_id 
    AND is_open = true
  ) THEN
    RAISE EXCEPTION 'Assessment not found or is closed';
  END IF;

  -- Validate process exists
  IF NOT EXISTS (
    SELECT 1 FROM processes 
    WHERE id = NEW.process_id
  ) THEN
    RAISE EXCEPTION 'Process not found';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger
DROP TRIGGER IF EXISTS validate_score_trigger ON scores;

-- Add new validation trigger
CREATE TRIGGER validate_score_trigger
  BEFORE INSERT OR UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION validate_score();

-- Update RLS policies for better error messages
DROP POLICY IF EXISTS "Users can update scores" ON scores;
CREATE POLICY "Users can update scores"
ON scores
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE id = assessment_id
    AND created_by = auth.uid()
    AND is_open = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE id = assessment_id
    AND created_by = auth.uid()
    AND is_open = true
  )
);

-- Add function to update assessment completion
CREATE OR REPLACE FUNCTION update_assessment_completion()
RETURNS trigger AS $$
DECLARE
  total_processes INTEGER;
  scored_processes INTEGER;
  completion_pct INTEGER;
BEGIN
  -- Get total number of processes
  SELECT COUNT(*) INTO total_processes FROM processes;
  
  -- Get number of scored processes for this assessment
  SELECT COUNT(*) INTO scored_processes 
  FROM scores 
  WHERE assessment_id = NEW.assessment_id 
  AND score IS NOT NULL;
  
  -- Calculate completion percentage
  completion_pct := ROUND((scored_processes::float / total_processes::float) * 100);
  
  -- Update assessment
  UPDATE assessments 
  SET 
    completion_percentage = completion_pct,
    status = CASE WHEN completion_pct = 100 THEN 'complete' ELSE 'partial' END
  WHERE id = NEW.assessment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for completion update
DROP TRIGGER IF EXISTS update_assessment_completion_trigger ON scores;
CREATE TRIGGER update_assessment_completion_trigger
  AFTER INSERT OR UPDATE OR DELETE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_completion();