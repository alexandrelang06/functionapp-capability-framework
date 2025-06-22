/*
  # Update scores table policies

  1. Changes
    - Remove existing restrictive policies
    - Add new permissive policies allowing authenticated users to perform all operations
    
  2. Security
    - Maintains basic authentication check
    - Allows authenticated users full CRUD access
    - Removes ownership validation constraints
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON scores;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON scores;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON scores;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON scores;

-- Drop existing triggers that might restrict operations
DROP TRIGGER IF EXISTS validate_assessment_ownership_scores ON scores;
DROP TRIGGER IF EXISTS validate_score_trigger ON scores;

-- Create new permissive policies
CREATE POLICY "Enable full access for authenticated users"
ON scores
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);