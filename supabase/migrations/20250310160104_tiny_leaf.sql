/*
  # Document Existing Scores RLS Policies

  This migration documents the existing RLS policies on the scores table
  for reference purposes only. These policies are already in place and
  working - this file serves as documentation.

  1. Current Policies Overview
    - SELECT: Authenticated users can view scores
    - INSERT: Authenticated users can add scores
    - UPDATE: Authenticated users can modify scores
    - DELETE: Authenticated users can remove scores

  2. Access Control
    - All operations require authentication
    - Access is further restricted by triggers:
      - validate_assessment_ownership_scores: Ensures users only access their own assessments
      - validate_score: Validates score values (1-5 range)
      - update_assessment_completion: Updates completion percentage

  3. Implementation Details
    - Policies work with triggers to enforce:
      - Data ownership
      - Score validation
      - Assessment status tracking
*/

-- Document the existing RLS setup (no policy creation)
COMMENT ON TABLE scores IS 'Assessment scores with RLS policies enforcing ownership-based access control';

-- Document existing policy purposes
COMMENT ON POLICY "allow_select_scores" ON scores IS 'Allows authenticated users to view scores they have access to';
COMMENT ON POLICY "allow_insert_scores" ON scores IS 'Allows authenticated users to add scores to assessments they own';
COMMENT ON POLICY "allow_update_scores" ON scores IS 'Allows authenticated users to update scores on their assessments';
COMMENT ON POLICY "allow_delete_scores" ON scores IS 'Allows authenticated users to delete scores from their assessments';