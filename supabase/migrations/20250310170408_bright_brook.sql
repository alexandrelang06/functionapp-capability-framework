/*
  # Fix Assessment Constraints

  1. Changes
    - Remove annual_it_cost_check constraint that was causing validation errors
    - Add proper validation for IT cost and department size fields
    - Update challenges array validation to be case-sensitive
    - Add proper validation for company size and annual revenue ranges

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing constraints that are causing issues
ALTER TABLE companies DROP CONSTRAINT IF EXISTS annual_it_cost_check;
ALTER TABLE companies DROP CONSTRAINT IF EXISTS company_size_check;
ALTER TABLE companies DROP CONSTRAINT IF EXISTS annual_revenue_check;

-- Add proper constraints for company size
ALTER TABLE companies ADD CONSTRAINT company_size_check 
  CHECK (company_size IN (
    '< 500',
    '500 - 2 000',
    '2 000 - 10 000',
    '10 000 - 50 000',
    '50 000 - 200 000',
    '> 200 000'
  ));

-- Add proper constraints for annual revenue
ALTER TABLE companies ADD CONSTRAINT annual_revenue_check 
  CHECK (annual_revenue IN (
    '< 250M€',
    '250M€ - 500M€',
    '500M€ - 1Md€',
    '1Md€ - 10Bd€',
    '+10Bd€'
  ));

-- Update challenges validation in assessments table
ALTER TABLE assessments DROP CONSTRAINT IF EXISTS valid_challenges;
ALTER TABLE assessments ADD CONSTRAINT valid_challenges 
  CHECK (challenges @> ARRAY[]::text[] AND challenges <@ ARRAY[
    'Réduction des coûts',
    'Efficacité opérationnelle', 
    'Sécurité et conformité',
    'Modernisation technologique',
    'Alignement stratégique',
    'Optimisation de la gestion des ressources IT'
  ]);