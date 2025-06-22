/*
  # Initialize Assessment Scores

  1. Changes
    - Create trigger function to initialize scores for all processes when a new assessment is created
    - Add trigger to assessments table (if it doesn't exist)

  2. Details
    - When a new assessment is created, automatically create score records for all processes
    - Default score value is NULL (displayed as N/A in the application)
    - Ensures consistent data structure for all assessments
    - Safely handles case where trigger already exists
*/

-- Drop trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_initialize_assessment_scores ON assessments;

-- Create or replace function to initialize scores
CREATE OR REPLACE FUNCTION initialize_assessment_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a score record for each process with NULL value
  INSERT INTO scores (assessment_id, process_id, score)
  SELECT 
    NEW.id,
    p.id,
    NULL
  FROM processes p;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the function after assessment creation
CREATE TRIGGER trigger_initialize_assessment_scores
  AFTER INSERT ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION initialize_assessment_scores();