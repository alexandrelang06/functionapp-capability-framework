/*
  # Fix Processes Table Structure

  1. Changes
    - Add proper array and JSON column constraints
    - Add validation for maturity levels
    - Add performance indexes
    - Update default values

  2. Security
    - Drop existing policy if exists to avoid conflicts
    - Add updated policy for authenticated users
*/

-- Drop existing policy to avoid conflicts
DROP POLICY IF EXISTS "Processes are viewable by authenticated users" ON processes;

-- Ensure arrays are properly typed and have defaults
ALTER TABLE processes 
ALTER COLUMN description TYPE text[] USING COALESCE(description, ARRAY[]::text[]),
ALTER COLUMN description SET DEFAULT ARRAY[]::text[],
ALTER COLUMN key_questions TYPE text[] USING COALESCE(key_questions, ARRAY[]::text[]),
ALTER COLUMN key_questions SET DEFAULT ARRAY[]::text[],
ALTER COLUMN key_artifacts TYPE text[] USING COALESCE(key_artifacts, ARRAY[]::text[]),
ALTER COLUMN key_artifacts SET DEFAULT ARRAY[]::text[];

-- Set default maturity levels
ALTER TABLE processes
ALTER COLUMN maturity_levels SET DEFAULT jsonb_build_object(
  '1', 'Initial/Ad-hoc: Basic or no processes exist',
  '2', 'Repeatable: Processes follow a regular pattern',
  '3', 'Defined: Processes are documented and standardized',
  '4', 'Managed: Processes are measured and controlled',
  '5', 'Optimized: Focus on process improvement'
);

-- Add validation for maturity levels
CREATE OR REPLACE FUNCTION validate_maturity_levels()
RETURNS trigger AS $$
BEGIN
  -- Ensure maturity_levels is a JSON object
  IF NOT (jsonb_typeof(NEW.maturity_levels) = 'object') THEN
    RAISE EXCEPTION 'maturity_levels must be a JSON object';
  END IF;

  -- Ensure it has exactly levels 1-5
  IF NOT (
    NEW.maturity_levels ? '1' AND
    NEW.maturity_levels ? '2' AND
    NEW.maturity_levels ? '3' AND
    NEW.maturity_levels ? '4' AND
    NEW.maturity_levels ? '5'
  ) THEN
    RAISE EXCEPTION 'maturity_levels must contain exactly levels 1-5';
  END IF;

  -- Ensure all values are strings
  IF NOT (
    jsonb_typeof(NEW.maturity_levels->'1') = 'string' AND
    jsonb_typeof(NEW.maturity_levels->'2') = 'string' AND
    jsonb_typeof(NEW.maturity_levels->'3') = 'string' AND
    jsonb_typeof(NEW.maturity_levels->'4') = 'string' AND
    jsonb_typeof(NEW.maturity_levels->'5') = 'string'
  ) THEN
    RAISE EXCEPTION 'maturity_levels values must be strings';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger for maturity levels validation
DROP TRIGGER IF EXISTS validate_process_maturity_levels ON processes;
CREATE TRIGGER validate_process_maturity_levels
  BEFORE INSERT OR UPDATE ON processes
  FOR EACH ROW
  WHEN (NEW.maturity_levels IS NOT NULL)
  EXECUTE FUNCTION validate_maturity_levels();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_processes_category_id ON processes(category_id);
CREATE INDEX IF NOT EXISTS idx_processes_order_index ON processes(order_index);

-- Enable RLS if not already enabled
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;

-- Add updated RLS policy
CREATE POLICY "processes_select_policy"
  ON processes
  FOR SELECT
  TO authenticated
  USING (true);

-- Update existing processes with default maturity levels if null
UPDATE processes
SET maturity_levels = jsonb_build_object(
  '1', 'Initial/Ad-hoc: Basic or no processes exist',
  '2', 'Repeatable: Processes follow a regular pattern',
  '3', 'Defined: Processes are documented and standardized',
  '4', 'Managed: Processes are measured and controlled',
  '5', 'Optimized: Focus on process improvement'
)
WHERE maturity_levels IS NULL;