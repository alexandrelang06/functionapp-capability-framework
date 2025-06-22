/*
  # Reset Assessment Scores

  1. Changes
    - Delete all scores from all assessments
    - This will reset all assessment completion percentages to 0
    - Assessments and companies remain intact
    - Only the scoring data is removed

  2. Purpose
    - Clean slate for assessment scoring
    - Reset macro-process detail pages
    - Maintain assessment structure while clearing evaluation data
*/

-- Delete all scores from all assessments
DELETE FROM scores;

-- Update all assessments to reflect 0% completion
UPDATE assessments 
SET 
  completion_percentage = 0,
  status = 'partial'
WHERE completion_percentage > 0 OR status = 'complete';