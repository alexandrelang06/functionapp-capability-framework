/*
  # Add initial company data

  1. New Data
    - Insert initial company record for "Global Banking Ltd"
    - Set default values for required fields
    - Ensure company exists for assessment functionality

  2. Security
    - Uses existing RLS policies
*/

-- Insert company data if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM companies 
    WHERE name = 'Global Banking Ltd'
  ) THEN
    INSERT INTO companies (
      name,
      industry,
      country,
      company_size,
      annual_revenue,
      it_department_size,
      annual_it_cost,
      it_budget_percentage
    ) VALUES (
      'Global Banking Ltd',
      'Banking & Financial Services',
      'United States',
      'Small (< 100 employees)',
      'Less than $1M',
      10,
      100000,
      5.0
    );
  END IF;
END $$;