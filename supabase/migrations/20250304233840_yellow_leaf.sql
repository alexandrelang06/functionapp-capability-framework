/*
  # Update RLS Policies

  1. Changes
    - Update RLS policies for companies table
    - Update RLS policies for assessments table
    - Add policies for authenticated users to create and manage their data

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for authenticated users
*/

-- Update companies table RLS policies
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
DROP POLICY IF EXISTS "Users can insert their own companies" ON companies;
DROP POLICY IF EXISTS "Users can update their own companies" ON companies;

CREATE POLICY "Users can view all companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update companies they created"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Update assessments table RLS policies
DROP POLICY IF EXISTS "Users can view all assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON assessments;

CREATE POLICY "Users can view all assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update assessments they created"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Update assessment_metadata table RLS policies
DROP POLICY IF EXISTS "Users can view assessment metadata they created" ON assessment_metadata;
DROP POLICY IF EXISTS "Users can insert assessment metadata they created" ON assessment_metadata;
DROP POLICY IF EXISTS "Users can update assessment metadata they created" ON assessment_metadata;

CREATE POLICY "Users can view all assessment metadata"
  ON assessment_metadata
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert assessment metadata"
  ON assessment_metadata
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

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

-- Update scores table RLS policies
DROP POLICY IF EXISTS "Users can view all scores" ON scores;
DROP POLICY IF EXISTS "Users can insert scores for their own assessments" ON scores;
DROP POLICY IF EXISTS "Users can update scores for their own assessments" ON scores;

CREATE POLICY "Users can view all scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert scores"
  ON scores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update scores they created"
  ON scores
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = scores.assessment_id
      AND a.created_by = auth.uid()
    )
  );