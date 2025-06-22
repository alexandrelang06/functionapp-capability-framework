/*
  # Update Company Fields Schema

  This migration updates existing fields and adds new ones to the companies table
  to better capture company information.

  1. Changes
    - Modified company_size options
    - Added exact_employees field for precise employee count
    - Modified annual_revenue options
    - Added effective_revenue field for precise revenue amount

  2. Field Details
    - exact_employees: Integer field for exact employee count
    - effective_revenue: Numeric field for precise revenue amount
    - Updated check constraints for new fields
*/

-- First, add new columns
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS exact_employees integer,
ADD COLUMN IF NOT EXISTS effective_revenue numeric;

-- Add check constraints for new columns
ALTER TABLE companies
ADD CONSTRAINT check_exact_employees CHECK (exact_employees > 0),
ADD CONSTRAINT check_effective_revenue CHECK (effective_revenue > 0);

-- Create temporary columns for the transition
ALTER TABLE companies
ADD COLUMN company_size_new text,
ADD COLUMN annual_revenue_new text;

-- Update data in temporary columns with new format
UPDATE companies
SET company_size_new = 
  CASE company_size
    WHEN 'Small (< 100 employees)' THEN '< 500'
    WHEN 'Medium (100-999 employees)' THEN '500 - 2 000'
    WHEN 'Large (1000+ employees)' THEN '2 000 - 10 000'
    ELSE '< 500'  -- Default value
  END,
  annual_revenue_new = 
  CASE annual_revenue
    WHEN 'Less than $1M' THEN '< 250M€'
    WHEN '$1M-5M' THEN '< 250M€'
    WHEN '$5M-10M' THEN '< 250M€'
    WHEN '$10M-25M' THEN '< 250M€'
    WHEN '$25M-50M' THEN '< 250M€'
    WHEN '$50M-100M' THEN '250M€ - 500M€'
    WHEN '$100M+' THEN '500M€ - 1Md€'
    ELSE '< 250M€'  -- Default value
  END;

-- Drop old columns
ALTER TABLE companies 
DROP COLUMN company_size,
DROP COLUMN annual_revenue;

-- Rename new columns
ALTER TABLE companies 
RENAME COLUMN company_size_new TO company_size;

ALTER TABLE companies 
RENAME COLUMN annual_revenue_new TO annual_revenue;

-- Add constraints to ensure valid values
ALTER TABLE companies
ADD CONSTRAINT company_size_check CHECK (
  company_size IN (
    '< 500',
    '500 - 2 000',
    '2 000 - 10 000',
    '10 000 - 50 000',
    '50 000 - 200 000',
    '> 200 000'
  )
),
ADD CONSTRAINT annual_revenue_check CHECK (
  annual_revenue IN (
    '< 250M€',
    '250M€ - 500M€',
    '500M€ - 1Md€',
    '1Md€ - 10Bd€',
    '+10Bd€'
  )
);