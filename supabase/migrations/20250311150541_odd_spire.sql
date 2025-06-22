/*
  # Update companies table permissions

  1. Changes
    - Remove restrictive RLS policies
    - Add new permissive policies for authenticated users
    - Enable full access to companies table for authenticated users

  2. Security
    - Maintains RLS enabled
    - Allows authenticated users to perform all operations
    - Preserves created_by tracking
*/

-- Enable RLS but with permissive policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can delete companies" ON companies;
DROP POLICY IF EXISTS "Users can insert companies" ON companies;
DROP POLICY IF EXISTS "Users can update companies" ON companies;
DROP POLICY IF EXISTS "Users can view all companies" ON companies;

-- Add new permissive policies
CREATE POLICY "Enable full access for authenticated users"
  ON companies
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);