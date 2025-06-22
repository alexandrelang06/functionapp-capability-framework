/*
  # Add RLS policies for scores table

  1. Security Changes
    - Enable RLS on scores table
    - Add policies for:
      - Selecting scores (authenticated users can view scores for assessments they created)
      - Inserting scores (authenticated users can add scores to their assessments)
      - Updating scores (authenticated users can update scores for their open assessments)
      - Deleting scores (authenticated users can delete scores from their assessments)

  2. Changes
    - Adds proper RLS policies to control access to scores
    - Ensures users can only modify scores for assessments they own
    - Prevents modification of scores for closed assessments
*/

-- Enable RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Policy for viewing scores
CREATE POLICY "Users can view scores for their assessments"
ON scores
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = scores.assessment_id
    AND assessments.created_by = auth.uid()
  )
);

-- Policy for inserting scores
CREATE POLICY "Users can insert scores for their assessments"
ON scores
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = assessment_id
    AND assessments.created_by = auth.uid()
    AND assessments.is_open = true
  )
);

-- Policy for updating scores
CREATE POLICY "Users can update scores for their open assessments"
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

-- Policy for deleting scores
CREATE POLICY "Users can delete scores from their assessments"
ON scores
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM assessments
    WHERE assessments.id = scores.assessment_id
    AND assessments.created_by = auth.uid()
    AND assessments.is_open = true
  )
);