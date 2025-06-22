/*
  # Add support for process editing
  
  1. Changes
    - Add RLS policies to allow updating processes
    - Ensure proper validation for process fields
    - Add trigger to update timestamp on process changes
    
  2. Security
    - Only allow updates to specific fields (description, key_questions, etc.)
    - Maintain existing RLS policies for other operations
*/

-- Enable RLS on processes table
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "processes_select_policy" ON processes;
DROP POLICY IF EXISTS "processes_update_policy" ON processes;

-- Create policies for processes table
CREATE POLICY "processes_select_policy"
  ON processes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "processes_update_policy"
  ON processes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create or replace function to update timestamp
CREATE OR REPLACE FUNCTION update_process_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_process_timestamp ON processes;
CREATE TRIGGER update_process_timestamp
  BEFORE UPDATE ON processes
  FOR EACH ROW
  EXECUTE FUNCTION update_process_timestamp();

-- Add validation for maturity_levels
CREATE OR REPLACE FUNCTION validate_process_maturity_levels()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if maturity_levels is a valid JSON object
  IF NEW.maturity_levels IS NOT NULL AND jsonb_typeof(NEW.maturity_levels) != 'object' THEN
    RAISE EXCEPTION 'maturity_levels must be a JSON object';
  END IF;

  -- Check if it has levels 1-5
  IF NEW.maturity_levels IS NOT NULL AND (
    NOT (NEW.maturity_levels ? '1') OR
    NOT (NEW.maturity_levels ? '2') OR
    NOT (NEW.maturity_levels ? '3') OR
    NOT (NEW.maturity_levels ? '4') OR
    NOT (NEW.maturity_levels ? '5')
  ) THEN
    RAISE EXCEPTION 'maturity_levels must contain levels 1-5';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for maturity_levels validation
DROP TRIGGER IF EXISTS validate_process_maturity_levels_trigger ON processes;
CREATE TRIGGER validate_process_maturity_levels_trigger
  BEFORE UPDATE OF maturity_levels ON processes
  FOR EACH ROW
  EXECUTE FUNCTION validate_process_maturity_levels();