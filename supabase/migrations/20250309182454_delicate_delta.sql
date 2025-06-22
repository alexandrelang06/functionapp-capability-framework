/*
  # Add Assessment Metadata Table

  1. New Tables
    - `assessment_metadata`
      - `id` (uuid, primary key)
      - `assessment_id` (uuid, foreign key to assessments)
      - `business_strategy` (text)
      - `it_strategy` (text)
      - `major_initiatives` (text)
      - `risk_profile` (text)
      - `regulatory_requirements` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `assessment_metadata` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS assessment_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  business_strategy text,
  it_strategy text,
  major_initiatives text,
  risk_profile text,
  regulatory_requirements text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE assessment_metadata ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert metadata for their assessments
CREATE POLICY "Users can insert metadata"
  ON assessment_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE id = assessment_id
      AND created_by = auth.uid()
    )
  );

-- Allow authenticated users to view metadata for assessments they can access
CREATE POLICY "Users can view metadata"
  ON assessment_metadata
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE id = assessment_id
      AND created_by = auth.uid()
    )
  );

-- Allow authenticated users to update metadata for their assessments
CREATE POLICY "Users can update metadata"
  ON assessment_metadata
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE id = assessment_id
      AND created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE id = assessment_id
      AND created_by = auth.uid()
    )
  );

-- Add trigger to update timestamp
CREATE TRIGGER update_assessment_metadata_timestamp
  BEFORE UPDATE ON assessment_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();