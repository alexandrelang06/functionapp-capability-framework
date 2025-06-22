/*
  # Remove score restrictions

  1. Changes
    - Drop existing restrictive policies
    - Create new permissive policies that allow all authenticated users to:
      - Insert any scores
      - Update any scores
      - View all scores
    - Keep RLS enabled for basic authentication check only

  2. Security
    - Only requires user to be authenticated
    - No ownership checks
    - No assessment creator restrictions
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert scores" ON scores;
DROP POLICY IF EXISTS "Users can update scores they created" ON scores;
DROP POLICY IF EXISTS "Users can view all scores" ON scores;

-- Create new permissive insert policy
CREATE POLICY "Users can insert scores"
ON scores
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create new permissive update policy
CREATE POLICY "Users can update scores"
ON scores
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create new permissive select policy
CREATE POLICY "Users can view all scores"
ON scores
FOR SELECT
TO authenticated
USING (true);