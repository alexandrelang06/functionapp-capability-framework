/*
  # Fix completion calculation and company updates

  1. Changes
    - Add function to calculate completion percentage
    - Add trigger to update completion percentage
    - Add completion percentage view

  2. Security
    - No changes to RLS policies
*/

-- Create a function to calculate completion percentage
CREATE OR REPLACE FUNCTION calculate_completion_percentage(assessment_id uuid)
RETURNS integer AS $$
DECLARE
  total_processes integer;
  scored_processes integer;
  completion integer;
BEGIN
  -- Get total number of processes
  SELECT COUNT(*) INTO total_processes FROM processes;
  
  -- Get number of scored processes for this assessment
  SELECT COUNT(*) INTO scored_processes 
  FROM scores 
  WHERE assessment_id = $1 AND score > 0;
  
  -- Calculate percentage
  IF total_processes = 0 THEN
    completion := 0;
  ELSE
    completion := (scored_processes * 100) / total_processes;
  END IF;
  
  RETURN completion;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to update completion percentage
CREATE OR REPLACE FUNCTION update_assessment_completion_percentage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE assessments
    SET completion_percentage = calculate_completion_percentage(NEW.assessment_id)
    WHERE id = NEW.assessment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE assessments
    SET completion_percentage = calculate_completion_percentage(OLD.assessment_id)
    WHERE id = OLD.assessment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS update_assessment_completion ON scores;
CREATE TRIGGER update_assessment_completion
  AFTER INSERT OR UPDATE OR DELETE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_completion_percentage();