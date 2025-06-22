/*
  # Add company update trigger with existence check

  1. Changes
    - Add trigger to update company timestamp if it doesn't exist
    - Add function to update timestamp when company is modified
*/

-- Drop trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS update_company_timestamp ON companies;

-- Create or replace function to update company timestamp
CREATE OR REPLACE FUNCTION update_company_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_company_timestamp'
  ) THEN
    CREATE TRIGGER update_company_timestamp
      BEFORE UPDATE ON companies
      FOR EACH ROW
      EXECUTE FUNCTION update_company_timestamp();
  END IF;
END $$;