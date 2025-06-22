/*
  # Add IT Budget Percentage Column

  1. New Columns
    - Add it_budget_percentage column to companies table
    - Add validation for percentage range (0-100)

  2. Security
    - Maintain existing RLS policies
*/

-- Add IT budget percentage column with validation
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS it_budget_percentage numeric;

-- Add constraint to ensure percentage is between 0 and 100
ALTER TABLE companies 
ADD CONSTRAINT it_budget_percentage_range 
CHECK (it_budget_percentage IS NULL OR (it_budget_percentage >= 0 AND it_budget_percentage <= 100));