/*
  # Fix RLS Policies and Add Missing Columns

  1. Changes
    - Update RLS policies to be more permissive for inserts
    - Add missing columns to companies and assessments tables
    - Update materialized views

  2. Security
    - Enable RLS on all tables
    - Allow authenticated users to insert data
    - Restrict updates to record owners
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

-- Drop and recreate RLS policies for companies
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
DROP POLICY IF EXISTS "Users can insert companies" ON companies;
DROP POLICY IF EXISTS "Users can update companies they created" ON companies;

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update companies they created"
  ON companies FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Drop and recreate RLS policies for assessments
DROP POLICY IF EXISTS "Users can view all assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update assessments they created" ON assessments;

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert assessments"
  ON assessments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update assessments they created"
  ON assessments FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Drop and recreate RLS policies for assessment_metadata
DROP POLICY IF EXISTS "Users can view all assessment metadata" ON assessment_metadata;
DROP POLICY IF EXISTS "Users can insert assessment metadata" ON assessment_metadata;
DROP POLICY IF EXISTS "Users can update assessment metadata they created" ON assessment_metadata;

ALTER TABLE assessment_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all assessment metadata"
  ON assessment_metadata FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert assessment metadata"
  ON assessment_metadata FOR INSERT
  TO authenticated
  WITH CHECK (true);

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

-- Drop and recreate RLS policies for scores
DROP POLICY IF EXISTS "Users can view all scores" ON scores;
DROP POLICY IF EXISTS "Users can insert scores" ON scores;
DROP POLICY IF EXISTS "Users can update scores they created" ON scores;

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all scores"
  ON scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert scores"
  ON scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

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

-- Refresh materialized views to ensure they're up to date
SELECT refresh_materialized_views();