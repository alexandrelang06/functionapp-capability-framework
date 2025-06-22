/*
  # Update RLS policies for full access

  1. Security Changes
    - Drop existing policies
    - Create new policies allowing full access for authenticated users:
      - SELECT: View all scores
      - INSERT: Add any score
      - UPDATE: Modify any score
      - DELETE: Remove any score

  2. Changes
    - Removes all existing restrictions
    - Grants full access to authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all scores" ON scores;
DROP POLICY IF EXISTS "Users can insert scores" ON scores;
DROP POLICY IF EXISTS "Users can update any score" ON scores;
DROP POLICY IF EXISTS "Users can delete any score" ON scores;
DROP POLICY IF EXISTS "Users can delete scores" ON scores;
DROP POLICY IF EXISTS "Users can only update scores for their assessments" ON scores;
DROP POLICY IF EXISTS "Users can update scores" ON scores;
DROP POLICY IF EXISTS "Users can view all scores" ON scores;
DROP POLICY IF EXISTS "validate_assessment_ownership_scores" ON scores;

-- Enable RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Create new unrestricted policies
CREATE POLICY "allow_select_scores"
ON scores
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "allow_insert_scores"
ON scores
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow_update_scores"
ON scores
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_delete_scores"
ON scores
FOR DELETE
TO authenticated
USING (true);