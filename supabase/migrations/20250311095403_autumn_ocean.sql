/*
  # Generate Test Data

  1. New Data
    - Test user for data ownership
    - 10 sample companies with realistic profiles
    - 10 assessments (5 complete, 5 partial)
    - Process scores with priority flags
    
  2. Structure
    - Maintains referential integrity
    - Handles duplicate scores gracefully with ON CONFLICT
    - Temporarily disables problematic triggers
*/

-- Temporarily disable problematic triggers
ALTER TABLE assessments DISABLE TRIGGER trigger_initialize_assessment_scores;
ALTER TABLE assessments DISABLE TRIGGER validate_assessment_trigger;
ALTER TABLE scores DISABLE TRIGGER validate_assessment_ownership_scores;
ALTER TABLE scores DISABLE TRIGGER validate_score_trigger;

-- Create test user if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000000'
  ) THEN
    INSERT INTO auth.users (id, email)
    VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com');
  END IF;
END $$;

-- Insert companies with fixed UUIDs
INSERT INTO companies (id, name, industry, country, company_size, annual_revenue, created_at, created_by)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'TechVision Solutions', 'Software edition', 'France', '500 - 2 000', '250M€ - 500M€', now(), '00000000-0000-0000-0000-000000000000'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'Global Banking Corp', 'Banking & Capital Markets', 'United Kingdom', '10 000 - 50 000', '1Md€ - 10Bd€', now(), '00000000-0000-0000-0000-000000000000'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'AutoTech Manufacturing', 'Automotive & Industrial Manufacturing', 'Germany', '2 000 - 10 000', '500M€ - 1Md€', now(), '00000000-0000-0000-0000-000000000000'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'HealthCare Solutions', 'Chemicals, Life Sciences & Resources', 'Switzerland', '500 - 2 000', '250M€ - 500M€', now(), '00000000-0000-0000-0000-000000000000'),
  ('55555555-5555-5555-5555-555555555555'::uuid, 'RetailPro Group', 'Consumer Goods & Retail', 'France', '2 000 - 10 000', '500M€ - 1Md€', now(), '00000000-0000-0000-0000-000000000000'),
  ('66666666-6666-6666-6666-666666666666'::uuid, 'InsureTech Services', 'Insurance', 'Netherlands', '500 - 2 000', '250M€ - 500M€', now(), '00000000-0000-0000-0000-000000000000'),
  ('77777777-7777-7777-7777-777777777777'::uuid, 'MediaStream Entertainment', 'Communications, Media & Entertainment', 'Spain', '2 000 - 10 000', '500M€ - 1Md€', now(), '00000000-0000-0000-0000-000000000000'),
  ('88888888-8888-8888-8888-888888888888'::uuid, 'EnergyGrid Utilities', 'Utilities, Postal & Transportation', 'Italy', '10 000 - 50 000', '1Md€ - 10Bd€', now(), '00000000-0000-0000-0000-000000000000'),
  ('99999999-9999-9999-9999-999999999999'::uuid, 'ConsultPro Services', 'Professional services', 'Belgium', '500 - 2 000', '250M€ - 500M€', now(), '00000000-0000-0000-0000-000000000000'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'GovTech Solutions', 'Government & Public Sector', 'France', '2 000 - 10 000', '500M€ - 1Md€', now(), '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Insert assessments with fixed UUIDs
INSERT INTO assessments (id, company_id, title, completion_percentage, status, is_open, created_at, created_by)
VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'TechVision Solutions Assessment', 100, 'complete', false, now(), '00000000-0000-0000-0000-000000000000'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Global Banking Corp Assessment', 100, 'complete', false, now(), '00000000-0000-0000-0000-000000000000'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'AutoTech Manufacturing Assessment', 100, 'complete', true, now(), '00000000-0000-0000-0000-000000000000'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, 'HealthCare Solutions Assessment', 100, 'complete', true, now(), '00000000-0000-0000-0000-000000000000'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'RetailPro Group Assessment', 100, 'complete', true, now(), '00000000-0000-0000-0000-000000000000'),
  ('11111111-2222-3333-4444-555555555555'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'InsureTech Services Assessment', 60, 'partial', true, now(), '00000000-0000-0000-0000-000000000000'),
  ('22222222-3333-4444-5555-666666666666'::uuid, '77777777-7777-7777-7777-777777777777'::uuid, 'MediaStream Entertainment Assessment', 45, 'partial', true, now(), '00000000-0000-0000-0000-000000000000'),
  ('33333333-4444-5555-6666-777777777777'::uuid, '88888888-8888-8888-8888-888888888888'::uuid, 'EnergyGrid Utilities Assessment', 75, 'partial', true, now(), '00000000-0000-0000-0000-000000000000'),
  ('44444444-5555-6666-7777-888888888888'::uuid, '99999999-9999-9999-9999-999999999999'::uuid, 'ConsultPro Services Assessment', 30, 'partial', true, now(), '00000000-0000-0000-0000-000000000000'),
  ('55555555-6666-7777-8888-999999999999'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'GovTech Solutions Assessment', 50, 'partial', true, now(), '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Create scores for complete assessments
WITH score_data AS (
  SELECT 
    a.id AS assessment_id,
    p.id AS process_id,
    ROUND((1 + random() * 4)::numeric, 1) AS score,
    random() < 0.2 AS priority,
    CASE 
      WHEN ROUND((1 + random() * 4)::numeric, 1) >= 4 THEN 'Excellent maturity level achieved'
      WHEN ROUND((1 + random() * 4)::numeric, 1) >= 3 THEN 'Good practices in place'
      WHEN ROUND((1 + random() * 4)::numeric, 1) >= 2 THEN 'Basic processes established'
      ELSE 'Needs improvement'
    END AS notes
  FROM assessments a
  CROSS JOIN processes p
  WHERE a.status = 'complete'
)
INSERT INTO scores (id, assessment_id, process_id, score, priority, notes)
SELECT 
  gen_random_uuid(),
  assessment_id,
  process_id,
  score,
  priority,
  notes
FROM score_data
ON CONFLICT (assessment_id, process_id) 
DO UPDATE SET
  score = EXCLUDED.score,
  priority = EXCLUDED.priority,
  notes = EXCLUDED.notes;

-- Create scores for partial assessments (60% of processes)
WITH score_data AS (
  SELECT 
    a.id AS assessment_id,
    p.id AS process_id,
    ROUND((1 + random() * 4)::numeric, 1) AS score,
    random() < 0.2 AS priority,
    CASE 
      WHEN ROUND((1 + random() * 4)::numeric, 1) >= 4 THEN 'Excellent maturity level achieved'
      WHEN ROUND((1 + random() * 4)::numeric, 1) >= 3 THEN 'Good practices in place'
      WHEN ROUND((1 + random() * 4)::numeric, 1) >= 2 THEN 'Basic processes established'
      ELSE 'Needs improvement'
    END AS notes
  FROM assessments a
  CROSS JOIN processes p
  WHERE a.status = 'partial'
    AND random() < 0.6
)
INSERT INTO scores (id, assessment_id, process_id, score, priority, notes)
SELECT 
  gen_random_uuid(),
  assessment_id,
  process_id,
  score,
  priority,
  notes
FROM score_data
ON CONFLICT (assessment_id, process_id) 
DO UPDATE SET
  score = EXCLUDED.score,
  priority = EXCLUDED.priority,
  notes = EXCLUDED.notes;

-- Re-enable triggers
ALTER TABLE assessments ENABLE TRIGGER trigger_initialize_assessment_scores;
ALTER TABLE assessments ENABLE TRIGGER validate_assessment_trigger;
ALTER TABLE scores ENABLE TRIGGER validate_assessment_ownership_scores;
ALTER TABLE scores ENABLE TRIGGER validate_score_trigger;