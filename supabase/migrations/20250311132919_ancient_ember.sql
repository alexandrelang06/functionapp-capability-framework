/*
  # Remove Test Data
  
  1. Changes
    - Remove all test scores
    - Remove all test assessments
    - Remove all test companies
    
  2. Safety
    - Uses safe deletion with proper order to respect foreign key constraints
    - Preserves database structure and schema
*/

-- Remove scores first (child table)
DELETE FROM scores;

-- Remove assessments (depends on companies)
DELETE FROM assessments;

-- Remove companies (parent table)
DELETE FROM companies;