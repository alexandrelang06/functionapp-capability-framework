/*
  # Update Schema and RLS Policies

  1. Changes
    - Add missing columns to companies table
    - Add missing columns to assessments table
    - Update RLS policies for all tables
    - Add necessary indexes

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users
*/

-- Add missing columns to companies table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'it_department_size') THEN
    ALTER TABLE companies ADD COLUMN it_department_size INTEGER;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'annual_it_cost') THEN
    ALTER TABLE companies ADD COLUMN annual_it_cost NUMERIC;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'it_budget_percentage') THEN
    ALTER TABLE companies ADD COLUMN it_budget_percentage NUMERIC;
  END IF;
END $$;

-- Add missing columns to assessments table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assessments' AND column_name = 'title') THEN
    ALTER TABLE assessments ADD COLUMN title TEXT NOT NULL DEFAULT 'IT Process Assessment';
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

-- Create assessment_metadata table if it doesn't exist
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);
CREATE INDEX IF NOT EXISTS idx_assessments_company_id ON assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_by ON assessments(created_by);
CREATE INDEX IF NOT EXISTS idx_assessment_metadata_assessment_id ON assessment_metadata(assessment_id);

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for companies table
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
DROP POLICY IF EXISTS "Users can insert companies" ON companies;
DROP POLICY IF EXISTS "Users can update companies they created" ON companies;

CREATE POLICY "Users can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update companies they created"
  ON companies FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Update RLS policies for assessments table
DROP POLICY IF EXISTS "Users can view all assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update assessments they created" ON assessments;

CREATE POLICY "Users can view all assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert assessments"
  ON assessments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update assessments they created"
  ON assessments FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Update RLS policies for assessment_metadata table
DROP POLICY IF EXISTS "Users can view all assessment metadata" ON assessment_metadata;
DROP POLICY IF EXISTS "Users can insert assessment metadata" ON assessment_metadata;
DROP POLICY IF EXISTS "Users can update assessment metadata they created" ON assessment_metadata;

CREATE POLICY "Users can view all assessment metadata"
  ON assessment_metadata FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert assessment metadata"
  ON assessment_metadata FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_metadata.assessment_id
      AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update assessment metadata they created"
  ON assessment_metadata FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = assessment_metadata.assessment_id
      AND a.created_by = auth.uid()
    )
  );

-- Update RLS policies for scores table
DROP POLICY IF EXISTS "Users can view all scores" ON scores;
DROP POLICY IF EXISTS "Users can insert scores" ON scores;
DROP POLICY IF EXISTS "Users can update scores they created" ON scores;

CREATE POLICY "Users can view all scores"
  ON scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert scores"
  ON scores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = scores.assessment_id
      AND a.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update scores they created"
  ON scores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = scores.assessment_id
      AND a.created_by = auth.uid()
    )
  );