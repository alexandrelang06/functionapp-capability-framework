/*
  # Fix Process Descriptions Access

  1. Changes
    - Add RLS policy for public access to process descriptions
    - Add index on process descriptions for faster lookups
    - Ensure proper column types and defaults

  2. Security
    - Allow public read access to process descriptions
    - Maintain existing RLS policies
*/

-- Enable RLS on processes table if not already enabled
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;

-- Add policy for public read access to process descriptions
CREATE POLICY "Everyone can view process descriptions"
  ON processes
  FOR SELECT
  TO public
  USING (true);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_processes_short_description
  ON processes (short_description);

-- Ensure short_description has proper type and default
ALTER TABLE processes 
  ALTER COLUMN short_description SET DEFAULT 'En cours de définition';