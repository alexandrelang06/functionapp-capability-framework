/*
  # Update company functionality

  1. Changes
    - Drop existing trigger if it exists
    - Create or replace timestamp update function
    - Create new trigger for timestamp updates
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_company_timestamp ON companies;

-- Create or replace function to update company timestamp
CREATE OR REPLACE FUNCTION update_company_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamp
CREATE TRIGGER update_company_timestamp
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_company_timestamp();