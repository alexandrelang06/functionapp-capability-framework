/*
  # Update RLS policies for companies and assessments

  1. Security
    - Enable RLS on companies and assessments tables
    - Add policies for viewing and updating companies and assessments
    - Ensure users can only update records they created
    - Allow authenticated users to view all records

  2. Performance
    - Add index on companies.created_by
    - Add updated_at trigger for companies table
*/

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'companies' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'assessments' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view all companies" ON companies;
  DROP POLICY IF EXISTS "Users can update companies they created" ON companies;
  DROP POLICY IF EXISTS "Users can view all assessments" ON assessments;
  DROP POLICY IF EXISTS "Users can update assessments they created" ON assessments;
END $$;

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