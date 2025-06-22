/*
  # Update Assessment Schema

  1. Changes
    - Add title column to assessments table
    - Add assessment details columns to assessments table
    - Add assessment metadata table for additional context
    - Update views to include new fields

  2. Security
    - Enable RLS on new table
    - Add appropriate policies
*/

-- Add title and details to assessments table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'title') THEN
    ALTER TABLE assessments ADD COLUMN title TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'scope') THEN
    ALTER TABLE assessments ADD COLUMN scope TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'objectives') THEN
    ALTER TABLE assessments ADD COLUMN objectives TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'methodology') THEN
    ALTER TABLE assessments ADD COLUMN methodology TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'stakeholders') THEN
    ALTER TABLE assessments ADD COLUMN stakeholders TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'constraints') THEN
    ALTER TABLE assessments ADD COLUMN constraints TEXT;
  END IF;
END $$;

-- Create assessment_metadata table if not exists
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
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assessment_metadata' 
    AND policyname = 'Users can view assessment metadata they created'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assessment_metadata' 
    AND policyname = 'Users can insert assessment metadata they created'
  ) THEN
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
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assessment_metadata' 
    AND policyname = 'Users can update assessment metadata they created'
  ) THEN
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
  END IF;
END $$;

-- Create trigger to update updated_at timestamp if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_assessment_metadata_timestamp'
  ) THEN
    CREATE TRIGGER update_assessment_metadata_timestamp
      BEFORE UPDATE ON assessment_metadata
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

-- Update latest_assessments view to include title
DROP MATERIALIZED VIEW IF EXISTS latest_assessments CASCADE;
CREATE MATERIALIZED VIEW latest_assessments AS
SELECT DISTINCT ON (company_id)
  a.id,
  a.company_id,
  a.title,
  a.created_at,
  a.created_by,
  a.status,
  a.completion_percentage,
  ROUND(CAST(AVG(s.score) AS NUMERIC), 1) as avg_score
FROM assessments a
LEFT JOIN scores s ON s.assessment_id = a.id
GROUP BY 
  a.id, 
  a.company_id, 
  a.title,
  a.created_at, 
  a.created_by, 
  a.status, 
  a.completion_percentage
ORDER BY company_id, created_at DESC;

-- Recreate indexes
CREATE UNIQUE INDEX latest_assessments_id_idx ON latest_assessments(id);
CREATE INDEX latest_assessments_company_id_idx ON latest_assessments(company_id);
CREATE INDEX latest_assessments_created_by_idx ON latest_assessments(created_by);

-- Grant permissions
GRANT SELECT ON latest_assessments TO authenticated;