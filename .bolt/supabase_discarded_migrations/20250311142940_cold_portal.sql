/*
  # Add IT Department Size Validation

  1. Changes
    - Add check constraint for it_department_size column in companies table
    - Ensure values match predefined options
    - Make column type text to match frontend values

  2. Validation
    - Validates against specific size ranges
    - Allows "Je ne sais pas" option
*/

-- First modify the column type to text
ALTER TABLE companies 
ALTER COLUMN it_department_size TYPE text USING it_department_size::text;

-- Add check constraint for valid values
ALTER TABLE companies
ADD CONSTRAINT it_department_size_check
CHECK (
  it_department_size = ANY (ARRAY[
    'Moins de 50',
    '50-100',
    '100-200', 
    '200-500',
    '500-1000',
    '>1000',
    'Je ne sais pas'
  ])
);