/*
  # Add Sample Assessment Data
  
  1. Changes
    - Add sample company and assessment
    - Add sample scores with efficient batch insert
    - Uses dynamic UUIDs to avoid conflicts
  
  2. Notes
    - Optimized for performance to avoid timeouts
    - Uses single transaction for data consistency
*/

DO $$
DECLARE
  v_company_id UUID;
  v_assessment_id UUID;
  v_process RECORD;
BEGIN
  -- Generate new UUIDs
  v_company_id := gen_random_uuid();
  v_assessment_id := gen_random_uuid();

  -- Insert company
  INSERT INTO companies (
    id,
    name,
    industry,
    country,
    company_size,
    annual_revenue,
    created_at
  )
  VALUES (
    v_company_id,
    'TechCorp Solutions',
    'Technology',
    'United States',
    'Large (1000+ employees)',
    '$50M+',
    now()
  );

  -- Insert assessment
  INSERT INTO assessments (
    id,
    company_id,
    title,
    status,
    is_open,
    completion_percentage,
    created_at,
    scope,
    objectives
  )
  VALUES (
    v_assessment_id,
    v_company_id,
    'Annual IT Assessment 2024',
    'complete',
    true,
    100,
    now(),
    'Complete IT process maturity assessment',
    'Evaluate and improve IT processes across all domains'
  );

  -- Insert scores for each process
  FOR v_process IN SELECT id, name FROM processes LOOP
    INSERT INTO scores (
      assessment_id,
      process_id,
      score,
      notes
    )
    VALUES (
      v_assessment_id,
      v_process.id,
      3.5 + random() * 1.5,
      'Sample assessment note for ' || v_process.name
    );
  END LOOP;

END $$;