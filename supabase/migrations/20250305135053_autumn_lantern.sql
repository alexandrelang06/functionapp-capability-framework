/*
  # Add Process Details

  1. Changes
    - Add description column to processes table
    - Add key_questions column to processes table (array of text)
    - Add key_artifacts column to processes table (array of text)
    - Add maturity_levels column to processes table (JSONB to store level descriptions)

  2. Data Structure
    - Maturity levels will be stored as JSONB with the following structure:
      {
        "1": { "description": "Initial/Ad-hoc..." },
        "2": { "description": "Repeatable..." },
        "3": { "description": "Defined..." },
        "4": { "description": "Managed..." },
        "5": { "description": "Optimized..." }
      }
*/

-- Add new columns to processes table
ALTER TABLE processes 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS key_questions TEXT[],
  ADD COLUMN IF NOT EXISTS key_artifacts TEXT[],
  ADD COLUMN IF NOT EXISTS maturity_levels JSONB;

-- Create a function to validate maturity levels structure
CREATE OR REPLACE FUNCTION validate_maturity_levels()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all required levels (1-5) exist
  IF NOT (
    NEW.maturity_levels ? '1' AND
    NEW.maturity_levels ? '2' AND
    NEW.maturity_levels ? '3' AND
    NEW.maturity_levels ? '4' AND
    NEW.maturity_levels ? '5'
  ) THEN
    RAISE EXCEPTION 'Maturity levels must include all levels from 1 to 5';
  END IF;

  -- Check if each level has a description
  IF NOT (
    NEW.maturity_levels->>'1' IS NOT NULL AND
    NEW.maturity_levels->>'2' IS NOT NULL AND
    NEW.maturity_levels->>'3' IS NOT NULL AND
    NEW.maturity_levels->>'4' IS NOT NULL AND
    NEW.maturity_levels->>'5' IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Each maturity level must have a description';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate maturity levels before insert or update
CREATE TRIGGER validate_process_maturity_levels
  BEFORE INSERT OR UPDATE ON processes
  FOR EACH ROW
  WHEN (NEW.maturity_levels IS NOT NULL)
  EXECUTE FUNCTION validate_maturity_levels();

-- Add example data for IT Strategy processes
UPDATE processes
SET 
  description = 'Define and maintain the target state of IT capabilities aligned with business strategy',
  key_questions = ARRAY[
    'How well is the IT strategy aligned with business objectives?',
    'Are IT capabilities adequately mapped to business needs?',
    'Is there a clear vision for future IT capabilities?'
  ],
  key_artifacts = ARRAY[
    'IT Strategy Document',
    'IT Capability Map',
    'Technology Roadmap',
    'Strategic Initiative Portfolio'
  ],
  maturity_levels = '{
    "1": {"description": "No formal IT strategy process exists. IT decisions are made reactively."},
    "2": {"description": "Basic IT strategy exists but is not well-documented or consistently followed."},
    "3": {"description": "Formal IT strategy process is defined and documented with clear alignment to business."},
    "4": {"description": "IT strategy process is managed with metrics and regular reviews."},
    "5": {"description": "IT strategy process is continuously optimized and serves as a competitive advantage."}
  }'::jsonb
WHERE id = 'define-target-state';

-- Add example data for Portfolio Management processes
UPDATE processes
SET 
  description = 'Evaluate and select IT investments based on strategic alignment and value',
  key_questions = ARRAY[
    'How are IT investments prioritized?',
    'What criteria are used to evaluate investments?',
    'How is the investment portfolio balanced?'
  ],
  key_artifacts = ARRAY[
    'Investment Portfolio',
    'Business Cases',
    'Portfolio Performance Reports',
    'Investment Criteria Matrix'
  ],
  maturity_levels = '{
    "1": {"description": "Investment decisions are ad-hoc with no formal evaluation process."},
    "2": {"description": "Basic portfolio management practices exist but are inconsistent."},
    "3": {"description": "Structured portfolio management process with defined criteria."},
    "4": {"description": "Portfolio is actively managed with performance metrics."},
    "5": {"description": "Advanced portfolio optimization with predictive analytics."}
  }'::jsonb
WHERE id = 'evaluate-select-investments';

-- Add example data for Enterprise Architecture processes
UPDATE processes
SET 
  description = 'Define and maintain enterprise architecture vision and principles',
  key_questions = ARRAY[
    'How well is the architecture aligned with business strategy?',
    'Are architecture principles clearly defined and followed?',
    'How is architecture governance implemented?'
  ],
  key_artifacts = ARRAY[
    'Architecture Vision Document',
    'Architecture Principles',
    'Reference Architectures',
    'Architecture Roadmap'
  ],
  maturity_levels = '{
    "1": {"description": "No formal architecture process. Solutions are designed in isolation."},
    "2": {"description": "Basic architecture guidelines exist but are not consistently followed."},
    "3": {"description": "Defined architecture process with clear principles and governance."},
    "4": {"description": "Managed architecture process with metrics and compliance tracking."},
    "5": {"description": "Optimized architecture process driving innovation and agility."}
  }'::jsonb
WHERE id = 'define-architecture-vision';

COMMENT ON COLUMN processes.description IS 'Detailed description of the process and its objectives';
COMMENT ON COLUMN processes.key_questions IS 'Array of key questions to evaluate the process';
COMMENT ON COLUMN processes.key_artifacts IS 'Array of key deliverables and artifacts produced by the process';
COMMENT ON COLUMN processes.maturity_levels IS 'JSON object containing descriptions for each maturity level (1-5)';