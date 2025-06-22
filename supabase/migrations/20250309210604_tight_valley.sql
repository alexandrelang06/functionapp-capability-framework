/*
  # Clean Up Assessment Data

  1. Changes
    - Delete all assessment scores
    - Delete all assessment metadata
    - Delete all assessments
    - Delete all companies
    
  2. Security
    - Maintain referential integrity
    - Use transactions for data safety
    - Preserve table structures
*/

-- Start transaction
BEGIN;

-- First delete scores (child table)
DELETE FROM scores;

-- Then delete assessment metadata (child table)
DELETE FROM assessment_metadata;

-- Delete assessments
DELETE FROM assessments;

-- Finally delete companies
DELETE FROM companies;

-- Commit transaction
COMMIT;