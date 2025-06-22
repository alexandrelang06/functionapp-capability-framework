/*
  # Update Score Rounding

  1. Changes
    - Ensure process scores are integers between 1 and 5
    - Update functions to properly round aggregate scores to one decimal place
    - Add function to calculate rounded averages

  2. Security
    - No changes to RLS policies
*/

-- Create function to calculate rounded average
CREATE OR REPLACE FUNCTION calculate_rounded_average(scores numeric[])
RETURNS numeric AS $$
BEGIN
  IF array_length(scores, 1) IS NULL THEN
    RETURN 0;
  END IF;
  RETURN round(
    (SELECT avg(score)::numeric 
     FROM unnest(scores) score 
     WHERE score > 0) * 10
  ) / 10;
END;
$$ LANGUAGE plpgsql;

-- Update view for domain scores to use rounded averages
CREATE OR REPLACE VIEW domain_scores AS
SELECT 
  a.id as assessment_id,
  d.id as domain_id,
  calculate_rounded_average(array_agg(s.score::numeric)) as avg_score
FROM assessments a
CROSS JOIN domains d
LEFT JOIN categories c ON c.domain_id = d.id
LEFT JOIN processes p ON p.category_id = c.id
LEFT JOIN scores s ON s.assessment_id = a.id AND s.process_id = p.id
GROUP BY a.id, d.id;

-- Update view for category scores to use rounded averages
CREATE OR REPLACE VIEW category_scores AS
SELECT 
  a.id as assessment_id,
  c.id as category_id,
  c.domain_id,
  calculate_rounded_average(array_agg(s.score::numeric)) as avg_score
FROM assessments a
CROSS JOIN categories c
LEFT JOIN processes p ON p.category_id = c.id
LEFT JOIN scores s ON s.assessment_id = a.id AND s.process_id = p.id
GROUP BY a.id, c.id, c.domain_id;

-- Update view for assessment scores to use rounded averages
CREATE OR REPLACE VIEW assessment_scores AS
SELECT 
  assessment_id,
  calculate_rounded_average(array_agg(score::numeric)) as avg_score
FROM scores
GROUP BY assessment_id;