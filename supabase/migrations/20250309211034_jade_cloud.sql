/*
  # Make IT Department Fields Optional

  1. Changes
    - Remove NOT NULL constraints from:
      - it_department_size
      - annual_it_cost 
      - it_budget_percentage
    - Keep existing data intact
    - Maintain check constraints for valid values

  2. Security
    - No changes to RLS policies
    - Existing constraints for valid values remain
*/

-- Remove NOT NULL constraints while preserving check constraints
DO $$ 
BEGIN
  -- Remove NOT NULL constraint from it_department_size
  ALTER TABLE companies 
    ALTER COLUMN it_department_size DROP NOT NULL;

  -- Remove NOT NULL constraint from annual_it_cost
  ALTER TABLE companies 
    ALTER COLUMN annual_it_cost DROP NOT NULL;

  -- Remove NOT NULL constraint from it_budget_percentage
  ALTER TABLE companies 
    ALTER COLUMN it_budget_percentage DROP NOT NULL;
END $$;