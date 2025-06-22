/*
  # Enhance Security Policies

  1. Changes
    - Add explicit deny policy for closed assessments
    - Add validation for score values (1-5 or null)
    - Add check for assessment ownership on score updates
    - Add cascade delete for scores when assessment is deleted

  2. Security
    - Strengthen RLS policies
    - Add data validation
    - Ensure proper cleanup
*/

-- Add explicit deny policy for closed assessments
CREATE POLICY "Users cannot update closed assessments"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (is_open = true)
  WITH CHECK (is_open = true);

-- Add validation for score values
ALTER TABLE scores
  ADD CONSTRAINT valid_score_range 
  CHECK (score IS NULL OR (score >= 1 AND score <= 5));

-- Add check for assessment ownership on score updates
CREATE POLICY "Users can only update scores for their assessments"
  ON scores
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = scores.assessment_id
      AND assessments.created_by = auth.uid()
      AND assessments.is_open = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = scores.assessment_id
      AND assessments.created_by = auth.uid()
      AND assessments.is_open = true
    )
  );

-- Add cascade delete for scores
ALTER TABLE scores
  DROP CONSTRAINT IF EXISTS scores_assessment_id_fkey,
  ADD CONSTRAINT scores_assessment_id_fkey
  FOREIGN KEY (assessment_id)
  REFERENCES assessments(id)
  ON DELETE CASCADE;