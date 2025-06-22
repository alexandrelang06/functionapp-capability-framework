-- Function to generate a random score between min and max
CREATE OR REPLACE FUNCTION random_score(min_score NUMERIC, max_score NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(CAST((min_score + (max_score - min_score) * random()) AS NUMERIC), 1);
END;
$$ LANGUAGE plpgsql;

-- Add scores for each assessment based on completion percentage
DO $$
DECLARE
  v_assessment RECORD;
  v_process RECORD;
  v_score NUMERIC;
  v_min_score NUMERIC;
  v_max_score NUMERIC;
  v_completion_factor NUMERIC;
BEGIN
  -- Loop through each assessment
  FOR v_assessment IN SELECT * FROM assessments LOOP
    -- Calculate completion factor (0 to 1)
    v_completion_factor := v_assessment.completion_percentage / 100.0;
    
    -- Set score ranges based on completion
    IF v_assessment.status = 'complete' THEN
      v_min_score := 3.0;
      v_max_score := 5.0;
    ELSE
      v_min_score := 1.0;
      v_max_score := 4.0;
    END IF;

    -- Calculate how many processes should have scores based on completion percentage
    FOR v_process IN 
      SELECT p.* 
      FROM processes p
      LEFT JOIN scores s ON s.process_id = p.id AND s.assessment_id = v_assessment.id
      WHERE s.id IS NULL
      ORDER BY random()
      LIMIT (
        SELECT CEIL(COUNT(*) * v_completion_factor)::INTEGER
        FROM processes
        WHERE NOT EXISTS (
          SELECT 1 FROM scores 
          WHERE process_id = processes.id 
          AND assessment_id = v_assessment.id
        )
      )
    LOOP
      -- Generate score
      v_score := random_score(v_min_score, v_max_score);
      
      -- Insert score
      INSERT INTO scores (
        assessment_id,
        process_id,
        score,
        notes,
        created_at,
        updated_at
      ) VALUES (
        v_assessment.id,
        v_process.id,
        v_score,
        CASE 
          WHEN v_score >= 4.0 THEN 'Excellent performance with established best practices'
          WHEN v_score >= 3.0 THEN 'Good performance with room for optimization'
          WHEN v_score >= 2.0 THEN 'Basic implementation needs improvement'
          ELSE 'Initial stage requiring significant development'
        END,
        now(),
        now()
      );
    END LOOP;
  END LOOP;
END $$;

-- Update completion percentages based on actual scores
UPDATE assessments a
SET completion_percentage = (
  SELECT ROUND(100.0 * COUNT(DISTINCT s.process_id)::NUMERIC / COUNT(DISTINCT p.id)::NUMERIC)
  FROM processes p
  LEFT JOIN scores s ON s.process_id = p.id AND s.assessment_id = a.id
  WHERE s.score > 0
);

-- Update status to 'complete' if 100% completion
UPDATE assessments
SET status = 'complete'
WHERE completion_percentage = 100;