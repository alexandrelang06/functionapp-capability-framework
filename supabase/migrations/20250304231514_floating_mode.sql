-- Drop existing views and functions
DROP TRIGGER IF EXISTS refresh_views_after_score_change ON scores;
DROP TRIGGER IF EXISTS refresh_views_after_assessment_change ON assessments;
DROP FUNCTION IF EXISTS refresh_materialized_views_trigger();
DROP FUNCTION IF EXISTS refresh_materialized_views();
DROP MATERIALIZED VIEW IF EXISTS assessment_scores;
DROP MATERIALIZED VIEW IF EXISTS latest_assessments;
DROP VIEW IF EXISTS user_emails;

-- Create view for user emails
CREATE OR REPLACE VIEW user_emails AS
SELECT id, email FROM auth.users;

-- Create materialized view for latest assessments
CREATE MATERIALIZED VIEW latest_assessments AS
SELECT DISTINCT ON (company_id)
  a.id,
  a.company_id,
  a.created_at,
  a.created_by,
  a.status,
  a.completion_percentage,
  ROUND(CAST(AVG(s.score) AS NUMERIC), 1) as avg_score
FROM assessments a
LEFT JOIN scores s ON s.assessment_id = a.id
GROUP BY a.id, a.company_id, a.created_at, a.created_by, a.status, a.completion_percentage
ORDER BY company_id, created_at DESC;

-- Create indexes for better performance
CREATE UNIQUE INDEX latest_assessments_id_idx ON latest_assessments(id);
CREATE INDEX latest_assessments_company_id_idx ON latest_assessments(company_id);
CREATE INDEX latest_assessments_created_by_idx ON latest_assessments(created_by);

-- Grant necessary permissions
GRANT SELECT ON latest_assessments TO authenticated;
GRANT SELECT ON user_emails TO authenticated;

-- Create refresh function
CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY latest_assessments;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function
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