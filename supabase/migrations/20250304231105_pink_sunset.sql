-- Drop existing views and functions if they exist
DROP TRIGGER IF EXISTS refresh_views_after_score_change ON scores;
DROP TRIGGER IF EXISTS refresh_views_after_assessment_change ON assessments;
DROP FUNCTION IF EXISTS refresh_materialized_views_trigger();
DROP FUNCTION IF EXISTS refresh_materialized_views();
DROP MATERIALIZED VIEW IF EXISTS assessment_scores;
DROP MATERIALIZED VIEW IF EXISTS latest_assessments;

-- Create materialized view for latest assessments with unique constraint
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

-- Create unique index on id to support joins
CREATE UNIQUE INDEX latest_assessments_id_idx ON latest_assessments(id);
CREATE INDEX latest_assessments_company_id_idx ON latest_assessments(company_id);
CREATE INDEX latest_assessments_created_by_idx ON latest_assessments(created_by);

-- Create materialized view for assessment scores with unique constraint
CREATE MATERIALIZED VIEW assessment_scores AS
SELECT 
  a.id as assessment_id,
  ROUND(CAST(AVG(s.score) AS NUMERIC), 1) as avg_score
FROM assessments a
LEFT JOIN scores s ON s.assessment_id = a.id
GROUP BY a.id;

-- Create unique index to support joins
CREATE UNIQUE INDEX assessment_scores_assessment_id_idx ON assessment_scores(assessment_id);

-- Create view for user emails (since we can't access auth.users directly)
CREATE OR REPLACE VIEW user_emails AS
SELECT id, email FROM auth.users;

-- Grant necessary permissions
GRANT SELECT ON latest_assessments TO authenticated;
GRANT SELECT ON assessment_scores TO authenticated;
GRANT SELECT ON user_emails TO authenticated;

-- Create refresh function that handles concurrent updates
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY latest_assessments;
  REFRESH MATERIALIZED VIEW CONCURRENTLY assessment_scores;
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

-- Create triggers to automatically refresh views
CREATE TRIGGER refresh_views_after_assessment_change
AFTER INSERT OR UPDATE OR DELETE ON assessments
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_materialized_views_trigger();

CREATE TRIGGER refresh_views_after_score_change
AFTER INSERT OR UPDATE OR DELETE ON scores
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_materialized_views_trigger();