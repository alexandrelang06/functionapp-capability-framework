/*
  # Fix company data constraints

  1. Changes
    - Remove existing unique constraint on company name
    - Add ON UPDATE CASCADE to company foreign key constraints
    - Add updated_at column and trigger for companies table

  2. Security
    - No changes to RLS policies
*/

-- First, remove the existing unique constraint if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'companies_name_unique'
  ) THEN
    ALTER TABLE companies DROP CONSTRAINT companies_name_unique;
  END IF;
END $$;

-- Add ON UPDATE CASCADE to company foreign key constraints
ALTER TABLE assessments
DROP CONSTRAINT IF EXISTS assessments_company_id_fkey,
ADD CONSTRAINT assessments_company_id_fkey 
  FOREIGN KEY (company_id) 
  REFERENCES companies(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- Add updated_at column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE companies ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_company_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_company_timestamp ON companies;
CREATE TRIGGER update_company_timestamp
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_company_timestamp();