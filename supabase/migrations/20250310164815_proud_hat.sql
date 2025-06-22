/*
  # Update Assessment Fields Schema

  This migration updates the assessment fields structure to better capture assessment context.

  1. Changes
    - Adds new context fields for strategy, technology, and challenges
    - Adds advisor field
    - Removes old metadata fields that are no longer needed

  2. Field Details
    - strategy_context: Text field for strategy and business context
    - technology_context: Text field for technology strategy and context
    - challenges: Text[] array for selected challenges
    - assessment_scope: Text field for scope definition
    - bearingpoint_advisor: Text field for advisor name
*/

-- First, add new columns to assessments table
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS strategy_context text,
ADD COLUMN IF NOT EXISTS technology_context text,
ADD COLUMN IF NOT EXISTS challenges text[],
ADD COLUMN IF NOT EXISTS assessment_scope text,
ADD COLUMN IF NOT EXISTS bearingpoint_advisor text;

-- Add array constraint for challenges
ALTER TABLE assessments
ADD CONSTRAINT valid_challenges CHECK (
  challenges @> ARRAY[]::text[] AND
  challenges <@ ARRAY[
    'Réduction des coûts',
    'Efficacité opérationnelle',
    'Sécurité et conformité',
    'Modernisation technologique',
    'Alignement stratégique',
    'Optimisation de la gestion des ressources IT'
  ]::text[]
);

-- Drop old metadata table since we're moving to a simpler structure
DROP TABLE IF EXISTS assessment_metadata CASCADE;

-- Remove old columns that are no longer needed
ALTER TABLE assessments
DROP COLUMN IF EXISTS objectives,
DROP COLUMN IF EXISTS methodology,
DROP COLUMN IF EXISTS stakeholders,
DROP COLUMN IF EXISTS constraints;