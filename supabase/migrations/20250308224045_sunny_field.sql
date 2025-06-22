/*
  # Fix RLS policies and indexes

  1. Changes
    - Drop existing policies to avoid conflicts
    - Re-create RLS policies for companies and assessments
    - Add missing indexes
    - Add updated_at trigger for companies

  2. Security
    - Enable RLS on tables
    - Add policies for authenticated users
    - Ensure proper access control
*/

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop companies policies
  DROP POLICY IF EXISTS "Users can view all companies" ON companies;
  DROP POLICY IF EXISTS "Users can update companies they created" ON companies;
  
  -- Drop assessments policies
  DROP POLICY IF EXISTS "Users can view all assessments" ON assessments;
  DROP POLICY IF EXISTS "Users can update assessments they created" ON assessments;
END $$;

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Companies policies
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

-- Assessments policies
CREATE POLICY "Users can view all assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update assessments they created"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Add updated_at trigger to companies if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_companies_timestamp'
  ) THEN
    CREATE TRIGGER update_companies_timestamp
      BEFORE UPDATE ON companies
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp();
  END IF;
END $$;

-- Add indexes if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'companies' AND indexname = 'idx_companies_created_by'
  ) THEN
    CREATE INDEX idx_companies_created_by ON companies(created_by);
  END IF;
END $$;