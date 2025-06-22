/*
  # Create Initial Test Data
  
  1. Overview
    Creates sample assessment data including company record and initial scores
    
  2. Data Structure
    - Company: TechCorp Solutions with initial assessment
    - Assessment: Initial maturity evaluation
    - Scores: 10 key processes evaluated
    
  3. Security
    - Uses security definer function to handle permissions
    - Maintains referential integrity
*/

-- Create function to insert test data with elevated privileges
CREATE OR REPLACE FUNCTION public.insert_test_data()
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_company_id uuid;
  v_assessment_id uuid;
  v_user_id uuid;
BEGIN
  -- Get first available user
  SELECT id INTO v_user_id 
  FROM auth.users 
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in auth.users - please create a user first';
  END IF;

  -- Insert company with ownership
  INSERT INTO companies (
    name,
    industry,
    country,
    company_size,
    annual_revenue,
    it_department_size,
    annual_it_cost,
    cio_organization,
    created_by
  ) VALUES (
    'TechCorp Solutions',
    'Software edition',
    'France',
    '500 - 2 000',
    '250M€ - 500M€',
    '100-200',
    '20-50',
    'Centralisée (+80% de la DSI dans une même entité)',
    v_user_id
  )
  RETURNING id INTO v_company_id;

  -- Create assessment with ownership
  INSERT INTO assessments (
    company_id,
    title,
    job_code,
    status,
    is_open,
    completion_percentage,
    strategy_context,
    technology_context,
    challenges,
    assessment_scope,
    bearingpoint_advisor,
    created_by
  ) VALUES (
    v_company_id,
    'TechCorp Solutions - IT Assessment 2025',
    'TECH-2025-001',
    'partial',
    true,
    0,
    'Entreprise en forte croissance avec une stratégie d''expansion internationale',
    'Modernisation du SI et adoption du cloud en cours',
    ARRAY['Modernisation technologique', 'Efficacité opérationnelle', 'Alignement stratégique'],
    'Périmètre : DSI Groupe et filiales France',
    'Jean Dupont',
    v_user_id
  )
  RETURNING id INTO v_assessment_id;

  -- Initialize scores for all processes
  INSERT INTO scores (assessment_id, process_id, score)
  SELECT v_assessment_id, id, NULL
  FROM processes;

  -- Update specific process scores
  UPDATE scores SET
    score = 4,
    notes = 'Stratégie IT bien définie et alignée avec les objectifs business',
    priority = true
  WHERE assessment_id = v_assessment_id AND process_id = 'define-target-state';

  UPDATE scores SET
    score = 3,
    notes = 'Cartographie des processus existante mais nécessite une mise à jour',
    priority = false
  WHERE assessment_id = v_assessment_id AND process_id = 'analyze-current-state';

  UPDATE scores SET
    score = 4,
    notes = 'Processus de priorisation des initiatives bien structuré',
    priority = true
  WHERE assessment_id = v_assessment_id AND process_id = 'derive-initiatives';

  UPDATE scores SET
    score = 3,
    notes = 'Bonne exécution mais suivi des KPIs à améliorer',
    priority = false
  WHERE assessment_id = v_assessment_id AND process_id = 'execute-it-strategy';

  UPDATE scores SET
    score = 4,
    notes = 'Processus de sélection des investissements mature',
    priority = false
  WHERE assessment_id = v_assessment_id AND process_id = 'evaluate-select-investments';

  UPDATE scores SET
    score = 3,
    notes = 'Revues de portefeuille régulières mais critères à affiner',
    priority = false
  WHERE assessment_id = v_assessment_id AND process_id = 'monitor-realign-portfolio';

  UPDATE scores SET
    score = 4,
    notes = 'Vision architecture claire et partagée',
    priority = true
  WHERE assessment_id = v_assessment_id AND process_id = 'define-architecture-vision';

  UPDATE scores SET
    score = 3,
    notes = 'Gouvernance en place mais processus de dérogation à formaliser',
    priority = false
  WHERE assessment_id = v_assessment_id AND process_id = 'govern-architecture';

  UPDATE scores SET
    score = 4,
    notes = 'Roadmap de transformation définie et suivie',
    priority = true
  WHERE assessment_id = v_assessment_id AND process_id = 'transform-architecture';

  UPDATE scores SET
    score = 3,
    notes = 'Analyses d''impact réalisées mais méthodologie à standardiser',
    priority = false
  WHERE assessment_id = v_assessment_id AND process_id = 'analyze-architecture';

  -- Update completion percentage
  UPDATE assessments 
  SET completion_percentage = (
    SELECT ROUND(COUNT(*)::numeric * 100 / (SELECT COUNT(*) FROM processes))
    FROM scores
    WHERE assessment_id = v_assessment_id
    AND score IS NOT NULL
  )
  WHERE id = v_assessment_id;

END;
$$;

-- Execute the function to insert test data
SELECT insert_test_data();

-- Drop the function after use
DROP FUNCTION insert_test_data();