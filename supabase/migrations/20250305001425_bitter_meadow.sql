-- Drop existing materialized views
DROP MATERIALIZED VIEW IF EXISTS latest_assessments CASCADE;

-- Create regular view instead of materialized view
CREATE OR REPLACE VIEW latest_assessments AS
SELECT DISTINCT ON (company_id)
  a.id,
  a.company_id,
  a.title,
  a.created_at,
  a.created_by,
  a.status,
  a.completion_percentage,
  ROUND(CAST(AVG(s.score) AS NUMERIC), 1) as avg_score
FROM assessments a
LEFT JOIN scores s ON s.assessment_id = a.id
GROUP BY 
  a.id, 
  a.company_id, 
  a.title,
  a.created_at, 
  a.created_by, 
  a.status, 
  a.completion_percentage
ORDER BY company_id, created_at DESC;

-- Drop existing functions and triggers
DROP FUNCTION IF EXISTS refresh_materialized_views() CASCADE;
DROP FUNCTION IF EXISTS refresh_materialized_views_trigger() CASCADE;

-- Grant necessary permissions
GRANT SELECT ON latest_assessments TO authenticated;

-- Update RLS policies for assessments
DROP POLICY IF EXISTS "Users can view all assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update assessments they created" ON assessments;

CREATE POLICY "Users can view all assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert assessments"
  ON assessments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update assessments they created"
  ON assessments FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Update RLS policies for companies
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
DROP POLICY IF EXISTS "Users can insert companies" ON companies;
DROP POLICY IF EXISTS "Users can update companies they created" ON companies;

CREATE POLICY "Users can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update companies they created"
  ON companies FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Update RLS policies for scores
DROP POLICY IF EXISTS "Users can view all scores" ON scores;
DROP POLICY IF EXISTS "Users can insert scores" ON scores;
DROP POLICY IF EXISTS "Users can update scores they created" ON scores;

CREATE POLICY "Users can view all scores"
  ON scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert scores"
  ON scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update scores they created"
  ON scores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments a
      WHERE a.id = scores.assessment_id
      AND a.created_by = auth.uid()
    )
  );

-- Create view for user emails
CREATE OR REPLACE VIEW user_emails AS
SELECT id, email FROM auth.users;

GRANT SELECT ON user_emails TO authenticated;