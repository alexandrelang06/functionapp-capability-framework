-- Create materialized view for latest assessments
CREATE MATERIALIZED VIEW latest_assessments AS
SELECT DISTINCT ON (company_id)
  id,
  company_id,
  created_at,
  created_by,
  status,
  completion_percentage
FROM assessments
ORDER BY company_id, created_at DESC;

-- Create index for better performance
CREATE INDEX latest_assessments_company_id_idx ON latest_assessments(company_id);

-- Create materialized view for domain scores
CREATE MATERIALIZED VIEW assessment_scores AS
SELECT 
  a.id as assessment_id,
  AVG(s.score) as avg_score
FROM assessments a
LEFT JOIN scores s ON s.assessment_id = a.id
GROUP BY a.id;

-- Create index for better performance
CREATE INDEX assessment_scores_assessment_id_idx ON assessment_scores(assessment_id);

-- Grant access to authenticated users
GRANT SELECT ON latest_assessments TO authenticated;
GRANT SELECT ON assessment_scores TO authenticated;

-- Create refresh function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW latest_assessments;
  REFRESH MATERIALIZED VIEW assessment_scores;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to refresh views
CREATE OR REPLACE FUNCTION refresh_materialized_views_trigger()
RETURNS trigger AS $$
BEGIN
  PERFORM refresh_materialized_views();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER refresh_views_after_assessment_change
AFTER INSERT OR UPDATE OR DELETE ON assessments
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_materialized_views_trigger();

CREATE TRIGGER refresh_views_after_score_change
AFTER INSERT OR UPDATE OR DELETE ON scores
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_materialized_views_trigger();