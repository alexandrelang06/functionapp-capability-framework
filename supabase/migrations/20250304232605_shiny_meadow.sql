/*
  # Update Assessment Schema

  1. Changes
    - Add IT department information columns to companies table
    - Add assessment details columns to assessments table
    - Add assessment metadata table for additional context

  2. Security
    - Enable RLS on new table
    - Add appropriate policies
*/

-- Add IT department information to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS it_department_size INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS annual_it_cost NUMERIC;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS it_budget_percentage NUMERIC;

-- Add assessment details to assessments table
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS scope TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS objectives TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS methodology TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS stakeholders TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS constraints TEXT;

-- Create assessment_metadata table for additional context
CREATE TABLE IF NOT EXISTS assessment_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  business_strategy TEXT,
  it_strategy TEXT,
  major_initiatives TEXT,
  risk_profile TEXT,
  regulatory_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_metadata_assessment_id 
  ON assessment_metadata(assessment_id);

-- Enable RLS
ALTER TABLE assessment_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view assessment metadata they created"
  ON assessment_metadata
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_metadata.assessment_id
      AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert assessment metadata they created"
  ON assessment_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_metadata.assessment_id
      AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update assessment metadata they created"
  ON assessment_metadata
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_metadata.assessment_id
      AND a.created_by = auth.uid()
    )
  );

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_assessment_metadata_timestamp
  BEFORE UPDATE ON assessment_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();