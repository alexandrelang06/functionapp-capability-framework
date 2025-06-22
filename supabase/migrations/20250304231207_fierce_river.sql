-- Insert sample companies
INSERT INTO companies (id, name, industry, country, company_size, annual_revenue, created_at)
VALUES
  ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'TechCorp Solutions', 'Technology', 'United States', 'Large (1000+ employees)', '$50M+', now()),
  ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'Global Banking Ltd', 'Banking & Financial Services', 'United Kingdom', 'Large (1000+ employees)', '$100M+', now()),
  ('d290f1ee-6c54-4b01-90e6-d701748f0853', 'HealthCare Plus', 'Healthcare', 'Germany', 'Medium (100-999 employees)', '$25M-50M', now()),
  ('d290f1ee-6c54-4b01-90e6-d701748f0854', 'Manufacturing Pro', 'Manufacturing', 'France', 'Medium (100-999 employees)', '$10M-25M', now()),
  ('d290f1ee-6c54-4b01-90e6-d701748f0855', 'Retail Innovations', 'Retail', 'Spain', 'Small (< 100 employees)', '$5M-10M', now());

-- Insert sample assessments
INSERT INTO assessments (id, company_id, title, status, is_open, completion_percentage, created_at)
VALUES
  ('a290f1ee-6c54-4b01-90e6-d701748f0851', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'Annual IT Assessment 2024', 'complete', true, 100, now()),
  ('a290f1ee-6c54-4b01-90e6-d701748f0852', 'd290f1ee-6c54-4b01-90e6-d701748f0852', 'Q1 2024 Assessment', 'partial', true, 75, now()),
  ('a290f1ee-6c54-4b01-90e6-d701748f0853', 'd290f1ee-6c54-4b01-90e6-d701748f0853', 'Initial Assessment', 'complete', false, 100, now()),
  ('a290f1ee-6c54-4b01-90e6-d701748f0854', 'd290f1ee-6c54-4b01-90e6-d701748f0854', 'Process Review 2024', 'partial', true, 45, now()),
  ('a290f1ee-6c54-4b01-90e6-d701748f0855', 'd290f1ee-6c54-4b01-90e6-d701748f0855', 'Baseline Assessment', 'complete', false, 100, now());

-- Insert sample scores (using processes from the framework)
INSERT INTO scores (assessment_id, process_id, score, notes)
SELECT
  'a290f1ee-6c54-4b01-90e6-d701748f0851',
  id,
  3.5 + random() * 1.5,
  'Sample assessment note for ' || name
FROM processes;

INSERT INTO scores (assessment_id, process_id, score, notes)
SELECT
  'a290f1ee-6c54-4b01-90e6-d701748f0852',
  id,
  3.0 + random() * 1.5,
  'Sample assessment note for ' || name
FROM processes
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE domain_id IN ('plan-strategy', 'manage-architecture', 'govern-it')
);

INSERT INTO scores (assessment_id, process_id, score, notes)
SELECT
  'a290f1ee-6c54-4b01-90e6-d701748f0853',
  id,
  2.5 + random() * 2.0,
  'Sample assessment note for ' || name
FROM processes;

INSERT INTO scores (assessment_id, process_id, score, notes)
SELECT
  'a290f1ee-6c54-4b01-90e6-d701748f0854',
  id,
  2.0 + random() * 2.0,
  'Sample assessment note for ' || name
FROM processes
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE domain_id IN ('plan-strategy', 'manage-architecture')
);

INSERT INTO scores (assessment_id, process_id, score, notes)
SELECT
  'a290f1ee-6c54-4b01-90e6-d701748f0855',
  id,
  3.0 + random() * 1.5,
  'Sample assessment note for ' || name
FROM processes;

-- Refresh materialized views to include new data
SELECT refresh_materialized_views();