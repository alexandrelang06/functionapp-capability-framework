/*
  # Add process metadata fields
  
  1. Changes
    - Add description array field for process descriptions
    - Add key_questions array field for evaluation questions
    - Add key_artifacts array field for deliverables
    - Add maturity_levels JSONB field for level descriptions
    - Add short_description text field for quick overview
  
  2. Constraints
    - Array fields must be 1-dimensional
    - Maturity levels must contain descriptions for levels 1-5
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processes' AND column_name = 'description') THEN
    ALTER TABLE processes ADD COLUMN description text[] DEFAULT ARRAY[]::text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processes' AND column_name = 'key_questions') THEN
    ALTER TABLE processes ADD COLUMN key_questions text[] DEFAULT ARRAY[]::text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processes' AND column_name = 'key_artifacts') THEN
    ALTER TABLE processes ADD COLUMN key_artifacts text[] DEFAULT ARRAY[]::text[];
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processes' AND column_name = 'maturity_levels') THEN
    ALTER TABLE processes ADD COLUMN maturity_levels jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'processes' AND column_name = 'short_description') THEN
    ALTER TABLE processes ADD COLUMN short_description text;
  END IF;
END $$;

-- Add array dimension constraints
ALTER TABLE processes
DROP CONSTRAINT IF EXISTS check_description_array,
DROP CONSTRAINT IF EXISTS check_key_questions_array,
DROP CONSTRAINT IF EXISTS check_key_artifacts_array;

ALTER TABLE processes
ADD CONSTRAINT check_description_array CHECK (description IS NULL OR array_ndims(description) = 1),
ADD CONSTRAINT check_key_questions_array CHECK (key_questions IS NULL OR array_ndims(key_questions) = 1),
ADD CONSTRAINT check_key_artifacts_array CHECK (key_artifacts IS NULL OR array_ndims(key_artifacts) = 1);

-- Create function to validate maturity levels JSON
CREATE OR REPLACE FUNCTION validate_maturity_levels()
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

-- Create or replace trigger to validate maturity levels JSON
DROP TRIGGER IF EXISTS validate_maturity_levels ON processes;
CREATE TRIGGER validate_maturity_levels
  BEFORE INSERT OR UPDATE ON processes
  FOR EACH ROW
  WHEN (NEW.maturity_levels IS NOT NULL)
  EXECUTE FUNCTION validate_maturity_levels();