/*
  # Fix Assessment Creation and Error Handling

  1. Changes
    - Add proper foreign key constraints
    - Add validation triggers
    - Fix assessment creation flow
    - Add proper indexes for performance
    
  2. Security
    - Ensure proper RLS policies for assessment creation
    - Add validation checks
*/

-- Add validation trigger function for assessments
CREATE OR REPLACE FUNCTION validate_assessment()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate company_id exists
  IF NOT EXISTS (SELECT 1 FROM companies WHERE id = NEW.company_id) THEN
    RAISE EXCEPTION 'Invalid company_id: Company does not exist';
  END IF;

  -- Validate status
  IF NEW.status NOT IN ('complete', 'partial') THEN
    RAISE EXCEPTION 'Invalid status: Must be either complete or partial';
  END IF;

  -- Validate completion_percentage
  IF NEW.completion_percentage < 0 OR NEW.completion_percentage > 100 THEN
    RAISE EXCEPTION 'Invalid completion_percentage: Must be between 0 and 100';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger
DROP TRIGGER IF EXISTS validate_assessment_trigger ON assessments;
CREATE TRIGGER validate_assessment_trigger
  BEFORE INSERT OR UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION validate_assessment();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_company_created_by ON assessments(company_id, created_by);
CREATE INDEX IF NOT EXISTS idx_scores_assessment_process ON scores(assessment_id, process_id);
CREATE INDEX IF NOT EXISTS idx_assessment_metadata_assessment ON assessment_metadata(assessment_id);

-- Update RLS policies for assessment creation
DROP POLICY IF EXISTS "Users can create assessments" ON assessments;
CREATE POLICY "Users can create assessments"
ON assessments
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM companies
    WHERE companies.id = company_id
    AND companies.created_by = auth.uid()
  )
);

-- Add cascade delete for assessment cleanup
ALTER TABLE scores DROP CONSTRAINT IF EXISTS scores_assessment_id_fkey;
ALTER TABLE scores
ADD CONSTRAINT scores_assessment_id_fkey
FOREIGN KEY (assessment_id)
REFERENCES assessments(id)
ON DELETE CASCADE;

ALTER TABLE assessment_metadata DROP CONSTRAINT IF EXISTS assessment_metadata_assessment_id_fkey;
ALTER TABLE assessment_metadata
ADD CONSTRAINT assessment_metadata_assessment_id_fkey
FOREIGN KEY (assessment_id)
REFERENCES assessments(id)
ON DELETE CASCADE;

-- Add default values for optional fields
ALTER TABLE assessments 
ALTER COLUMN scope SET DEFAULT '',
ALTER COLUMN objectives SET DEFAULT '',
ALTER COLUMN methodology SET DEFAULT '',
ALTER COLUMN stakeholders SET DEFAULT '',
ALTER COLUMN constraints SET DEFAULT '',
ALTER COLUMN job_code SET DEFAULT '';

-- Add NOT NULL constraints for required fields
ALTER TABLE assessments
ALTER COLUMN company_id SET NOT NULL,
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN status SET NOT NULL,
ALTER COLUMN is_open SET NOT NULL,
ALTER COLUMN completion_percentage SET NOT NULL;