/*
  # Initialize Assessment Scores

  1. New Function
    - Creates a function to automatically initialize scores for all processes when a new assessment is created
    - Sets all scores to NULL by default
    - Triggered after each new assessment insertion

  2. Changes
    - Adds a trigger on the assessments table
    - Automatically creates score records for all processes
    - Ensures data consistency by having all processes represented
*/

-- Function to initialize scores
CREATE OR REPLACE FUNCTION initialize_assessment_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a score record for each process with NULL score
  INSERT INTO scores (assessment_id, process_id, score)
  SELECT 
    NEW.id,
    p.id,
    NULL
  FROM processes p
  WHERE NOT EXISTS (
    SELECT 1 
    FROM scores s 
    WHERE s.assessment_id = NEW.id 
    AND s.process_id = p.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run after assessment creation
DROP TRIGGER IF EXISTS trigger_initialize_assessment_scores ON assessments;
CREATE TRIGGER trigger_initialize_assessment_scores
  AFTER INSERT ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION initialize_assessment_scores();