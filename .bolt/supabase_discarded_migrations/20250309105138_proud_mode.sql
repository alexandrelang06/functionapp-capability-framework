/*
  # Add process details fields
  
  1. New Fields
    - Add key_questions array field for evaluation questions
    - Add key_artifacts array field for deliverables
    - Add maturity_levels JSONB field for level descriptions
    - Add short_description text field for quick overview
  
  2. Constraints
    - Ensure array fields are 1-dimensional
    - Validate maturity levels JSON structure
*/

-- Add new columns to processes table (skipping 'description' as it already exists)
ALTER TABLE processes 
ADD COLUMN key_questions text[] DEFAULT ARRAY[]::text[],
ADD COLUMN key_artifacts text[] DEFAULT ARRAY[]::text[],
ADD COLUMN maturity_levels jsonb,
ADD COLUMN short_description text;

-- Add constraints to ensure array fields are 1-dimensional
ALTER TABLE processes
ADD CONSTRAINT check_key_questions_array CHECK (key_questions IS NULL OR array_ndims(key_questions) = 1),
ADD CONSTRAINT check_key_artifacts_array CHECK (key_artifacts IS NULL OR array_ndims(key_artifacts) = 1);

-- Create function to validate maturity levels JSON
CREATE OR REPLACE FUNCTION validate_maturity_levels_json()
RETURNS trigger AS $$
BEGIN
  IF NEW.maturity_levels IS NOT NULL THEN
    -- Check if all required levels (1-5) exist
    IF NOT (
      NEW.maturity_levels ? '1' AND
      NEW.maturity_levels ? '2' AND
      NEW.maturity_levels ? '3' AND
      NEW.maturity_levels ? '4' AND
      NEW.maturity_levels ? '5'
    ) THEN
      RAISE EXCEPTION 'Maturity levels must contain descriptions for levels 1-5';
    END IF;
    
    -- Check if all values are strings
    IF NOT (
      jsonb_typeof(NEW.maturity_levels->>'1') = 'string' AND
      jsonb_typeof(NEW.maturity_levels->>'2') = 'string' AND
      jsonb_typeof(NEW.maturity_levels->>'3') = 'string' AND
      jsonb_typeof(NEW.maturity_levels->>'4') = 'string' AND
      jsonb_typeof(NEW.maturity_levels->>'5') = 'string'
    ) THEN
      RAISE EXCEPTION 'Maturity level descriptions must be strings';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate maturity levels JSON
CREATE TRIGGER validate_maturity_levels
  BEFORE INSERT OR UPDATE ON processes
  FOR EACH ROW
  WHEN (NEW.maturity_levels IS NOT NULL)
  EXECUTE FUNCTION validate_maturity_levels_json();