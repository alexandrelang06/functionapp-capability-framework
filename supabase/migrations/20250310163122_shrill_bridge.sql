/*
  # Update IT Department Fields Schema

  This migration updates IT department fields and adds new ones to better capture IT information.

  1. Changes
    - Modified it_department_size to be a text field with predefined options
    - Added exact_it_employees field for precise IT employee count
    - Modified annual_it_cost to be a text field with predefined options
    - Added effective_it_cost field for precise IT cost
    - Added cio_organization field for CIO office structure
    - Removed it_budget_percentage field

  2. Field Details
    - exact_it_employees: Integer field for exact IT employee count
    - effective_it_cost: Numeric field for precise IT cost amount
    - cio_organization: Text field for CIO office structure (centralized/decentralized)
*/

-- First, add new columns
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS exact_it_employees integer,
ADD COLUMN IF NOT EXISTS effective_it_cost numeric,
ADD COLUMN IF NOT EXISTS cio_organization text;

-- Add check constraints for new columns
ALTER TABLE companies
ADD CONSTRAINT check_exact_it_employees CHECK (exact_it_employees > 0),
ADD CONSTRAINT check_effective_it_cost CHECK (effective_it_cost > 0),
ADD CONSTRAINT cio_organization_check CHECK (
  cio_organization IN (
    'Centralisée (+80% de la DSI dans une même entité)',
    'Décentralisée (DSI répartie entre plusieurs pays)'
  )
);

-- Create temporary columns for the transition
ALTER TABLE companies
ADD COLUMN it_department_size_new text,
ADD COLUMN annual_it_cost_new text;

-- Update data in temporary columns with new format
UPDATE companies
SET it_department_size_new = 
  CASE 
    WHEN it_department_size < 50 THEN 'Moins de 50'
    WHEN it_department_size BETWEEN 50 AND 100 THEN '50-100'
    WHEN it_department_size BETWEEN 101 AND 200 THEN '100-200'
    WHEN it_department_size BETWEEN 201 AND 500 THEN '200-500'
    WHEN it_department_size BETWEEN 501 AND 1000 THEN '500-1000'
    WHEN it_department_size > 1000 THEN '>1000'
    ELSE 'Je ne sais pas'
  END,
  annual_it_cost_new = 
  CASE 
    WHEN annual_it_cost < 10000000 THEN '<10M'
    WHEN annual_it_cost BETWEEN 10000000 AND 20000000 THEN '10-20'
    WHEN annual_it_cost BETWEEN 20000001 AND 50000000 THEN '20-50'
    WHEN annual_it_cost BETWEEN 50000001 AND 100000000 THEN '50-100'
    WHEN annual_it_cost BETWEEN 100000001 AND 200000000 THEN '100-200'
    WHEN annual_it_cost > 200000000 THEN '>200M'
    ELSE 'Je ne sais pas'
  END;

-- Drop old columns
ALTER TABLE companies 
DROP COLUMN it_department_size,
DROP COLUMN annual_it_cost,
DROP COLUMN it_budget_percentage;

-- Rename new columns
ALTER TABLE companies 
RENAME COLUMN it_department_size_new TO it_department_size;

ALTER TABLE companies 
RENAME COLUMN annual_it_cost_new TO annual_it_cost;

-- Add constraints to ensure valid values
ALTER TABLE companies
ADD CONSTRAINT it_department_size_check CHECK (
  it_department_size IN (
    'Moins de 50',
    '50-100',
    '100-200',
    '200-500',
    '500-1000',
    '>1000',
    'Je ne sais pas'
  )
),
ADD CONSTRAINT annual_it_cost_check CHECK (
  annual_it_cost IN (
    '<10M',
    '10-20',
    '20-50',
    '50-100',
    '100-200',
    '>200M',
    'Je ne sais pas'
  )
);