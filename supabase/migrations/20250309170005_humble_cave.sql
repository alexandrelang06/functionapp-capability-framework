/*
  # Update company-assessment relation

  1. Changes
    - Add unique constraint on company_id in assessments table to ensure one company can only have one open assessment
    - Add trigger to automatically close previous assessment when creating a new one for a company
    - Add trigger to prevent multiple open assessments for the same company

  2. Security
    - No changes to RLS policies
*/

-- Create a unique index for open assessments per company
CREATE UNIQUE INDEX IF NOT EXISTS unique_open_assessment_per_company 
ON assessments (company_id)
WHERE is_open = true;

-- Create function to handle assessment status
CREATE OR REPLACE FUNCTION handle_assessment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to open a new assessment, close any existing open assessments for this company
  IF NEW.is_open = true THEN
    UPDATE assessments 
    SET is_open = false
    WHERE company_id = NEW.company_id 
    AND id != NEW.id 
    AND is_open = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to handle assessment status changes
DROP TRIGGER IF EXISTS assessment_status_trigger ON assessments;

CREATE TRIGGER assessment_status_trigger
  BEFORE INSERT OR UPDATE OF is_open
  ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION handle_assessment_status();