/*
  # Remove score restrictions
  
  1. Changes
    - Remove all RLS policies from scores table that restrict user access
    - Add new permissive policies allowing full access to authenticated users
    
  2. Security
    - Maintain RLS enabled but with more permissive policies
    - All authenticated users can now perform CRUD operations on scores
*/

-- Remove existing restrictive policies
DROP POLICY IF EXISTS "allow_delete_scores" ON scores;
DROP POLICY IF EXISTS "allow_insert_scores" ON scores;
DROP POLICY IF EXISTS "allow_select_scores" ON scores;
DROP POLICY IF EXISTS "allow_update_scores" ON scores;

-- Add new permissive policies
CREATE POLICY "Enable read for authenticated users" 
ON scores FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert for authenticated users" 
ON scores FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" 
ON scores FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" 
ON scores FOR DELETE 
TO authenticated 
USING (true);