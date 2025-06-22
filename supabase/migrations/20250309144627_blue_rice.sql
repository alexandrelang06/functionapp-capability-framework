/*
  # Fix scores RLS policies

  1. Changes
    - Drop existing policies
    - Create new policies with correct conditions
    - Ensure users can only modify scores for assessments they created
    - Allow all authenticated users to view scores

  2. Security
    - RLS remains enabled
    - Policies are scoped to authenticated users only
    - Write access is restricted to assessment owners
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert scores" ON scores;
DROP POLICY IF EXISTS "Users can update scores they created" ON scores;
DROP POLICY IF EXISTS "Users can view all scores" ON scores;

-- Create new insert policy
CREATE POLICY "Users can insert scores"
ON scores
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_id
    AND a.created_by = auth.uid()
  )
);

-- Create new update policy
CREATE POLICY "Users can update scores they created"
ON scores
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_id
    AND a.created_by = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = assessment_id
    AND a.created_by = auth.uid()
  )
);

-- Create new select policy
CREATE POLICY "Users can view all scores"
ON scores
FOR SELECT
TO authenticated
USING (true);