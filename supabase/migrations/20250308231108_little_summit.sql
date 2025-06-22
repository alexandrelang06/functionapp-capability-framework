/*
  # Fix company constraints and timestamps

  1. Changes
    - Add ON UPDATE CASCADE to company foreign key constraints
    - Add updated_at column to companies table
    - Remove duplicate company names
    - Add unique constraint on company name
    - Add trigger for updating timestamps

  2. Security
    - Maintain existing RLS policies
*/

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'companies' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE companies 
    ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add ON UPDATE CASCADE to company foreign key constraints
ALTER TABLE assessments
DROP CONSTRAINT assessments_company_id_fkey,
ADD CONSTRAINT assessments_company_id_fkey 
  FOREIGN KEY (company_id) 
  REFERENCES companies(id) 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- Remove duplicate company names before adding unique constraint
WITH duplicates AS (
  SELECT id, name,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
  FROM companies
),
updates AS (
  SELECT id, name || ' ' || rn as new_name
  FROM duplicates
  WHERE rn > 1
)
UPDATE companies c
SET name = u.new_name
FROM updates u
WHERE c.id = u.id;

-- Add unique constraint on company name
ALTER TABLE companies
ADD CONSTRAINT companies_name_unique UNIQUE (name);

-- Add trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_company_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_company_timestamp
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_company_timestamp();