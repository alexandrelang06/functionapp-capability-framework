/*
  # Fix Assessment Deletion and Error Handling

  1. Changes
    - Add proper cascading deletes
    - Add proper indexes for performance
    - Fix assessment deletion flow
    - Add proper validation triggers
    
  2. Security
    - Ensure proper RLS policies for assessment deletion
    - Add validation checks
*/

-- Add proper indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scores_assessment_id ON scores(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_metadata_assessment_id ON assessment_metadata(assessment_id);

-- Update RLS policies for assessment deletion
DROP POLICY IF EXISTS "Users can delete assessments" ON assessments;
CREATE POLICY "Users can delete assessments"
ON assessments
FOR DELETE
TO authenticated
USING (created_by = auth.uid());

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

-- Add function to validate assessment exists
CREATE OR REPLACE FUNCTION check_assessment_exists(assessment_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM assessments WHERE id = assessment_id
  );
END;
$$ LANGUAGE plpgsql;

-- Add function to validate assessment ownership
CREATE OR REPLACE FUNCTION validate_assessment_ownership()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM assessments 
    WHERE id = NEW.assessment_id 
    AND created_by = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Assessment not found or access denied';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for scores
DROP TRIGGER IF EXISTS validate_assessment_ownership_scores ON scores;
CREATE TRIGGER validate_assessment_ownership_scores
  BEFORE INSERT OR UPDATE ON scores
  FOR EACH ROW
  EXECUTE FUNCTION validate_assessment_ownership();

-- Add trigger for metadata
DROP TRIGGER IF EXISTS validate_assessment_ownership_metadata ON assessment_metadata;
CREATE TRIGGER validate_assessment_ownership_metadata
  BEFORE INSERT OR UPDATE ON assessment_metadata
  FOR EACH ROW
  EXECUTE FUNCTION validate_assessment_ownership();

-- Add function to cleanup orphaned records
CREATE OR REPLACE FUNCTION cleanup_orphaned_assessment_records()
RETURNS void AS $$
BEGIN
  -- Delete scores without valid assessments
  DELETE FROM scores
  WHERE NOT EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = scores.assessment_id
  );
  
  -- Delete metadata without valid assessments
  DELETE FROM assessment_metadata
  WHERE NOT EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = assessment_metadata.assessment_id
  );
END;
$$ LANGUAGE plpgsql;