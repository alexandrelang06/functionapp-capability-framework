-- Create view for assessment scores
CREATE OR REPLACE VIEW assessment_scores AS
SELECT 
  assessment_id,
  ROUND(CAST(AVG(score) AS NUMERIC), 1) as avg_score
FROM scores
GROUP BY assessment_id;

-- Grant access to authenticated users
GRANT SELECT ON assessment_scores TO authenticated;