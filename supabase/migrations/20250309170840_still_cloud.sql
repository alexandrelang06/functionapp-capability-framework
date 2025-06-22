/*
  # Fix views and remove unique constraint

  1. Changes
    - Remove unique constraint on company_id in assessments table
    - Drop and recreate views with correct syntax
    - Keep is_open and status columns

  This migration fixes the view creation syntax and maintains the ability to have
  multiple assessments per company.
*/

-- Drop the unique constraint on company_id
ALTER TABLE assessments
DROP CONSTRAINT IF EXISTS unique_company_assessment;

-- Drop existing views
DROP VIEW IF EXISTS assessment_scores;
DROP VIEW IF EXISTS category_scores;
DROP VIEW IF EXISTS domain_scores;

-- Recreate views with correct syntax
CREATE VIEW assessment_scores AS
SELECT 
  assessment_id,
  AVG(score) as avg_score
FROM scores
GROUP BY assessment_id;

CREATE VIEW category_scores AS
SELECT 
  s.assessment_id,
  p.category_id,
  c.domain_id,
  AVG(s.score) as avg_score
FROM scores s
JOIN processes p ON s.process_id = p.id
JOIN categories c ON p.category_id = c.id
GROUP BY s.assessment_id, p.category_id, c.domain_id;

CREATE VIEW domain_scores AS
SELECT 
  assessment_id,
  c.domain_id,
  AVG(score) as avg_score
FROM scores s
JOIN processes p ON s.process_id = p.id
JOIN categories c ON p.category_id = c.id
GROUP BY assessment_id, c.domain_id;