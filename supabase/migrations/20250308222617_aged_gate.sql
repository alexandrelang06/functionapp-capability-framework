/*
  # Update companies table schema

  1. Changes
    - Add missing fields for company information
    - Add validation constraints
    - Update RLS policies

  2. New Fields
    - it_department_size (integer)
    - annual_it_cost (numeric)
    - it_budget_percentage (numeric)

  3. Security
    - Update RLS policies to allow proper access
*/

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'it_department_size'
  ) THEN
    ALTER TABLE companies ADD COLUMN it_department_size integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'annual_it_cost'
  ) THEN
    ALTER TABLE companies ADD COLUMN annual_it_cost numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'it_budget_percentage'
  ) THEN
    ALTER TABLE companies ADD COLUMN it_budget_percentage numeric;
  END IF;
END $$;

-- Add validation constraints
ALTER TABLE companies 
  ADD CONSTRAINT check_it_budget_percentage 
  CHECK (it_budget_percentage >= 0 AND it_budget_percentage <= 100);

ALTER TABLE companies 
  ADD CONSTRAINT check_it_department_size 
  CHECK (it_department_size >= 0);

ALTER TABLE companies 
  ADD CONSTRAINT check_annual_it_cost 
  CHECK (annual_it_cost >= 0);

-- Update RLS policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
DROP POLICY IF EXISTS "Users can update companies they created" ON companies;
DROP POLICY IF EXISTS "Users can insert companies" ON companies;

-- Create new policies
CREATE POLICY "Users can view all companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update companies they created"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can insert companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);