/*
  # Drop unused tables safely

  1. Changes
    - Drop assessment_metadata table if it exists
    - Drop sub_processes table if it exists
    - Drop related triggers if they exist
    - Drop related foreign key constraints if they exist

  This migration uses DO blocks to safely handle drops without errors
*/

-- Safe drop for assessment_metadata and its dependencies
DO $$ 
BEGIN
  -- Drop foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'assessment_metadata_assessment_id_fkey'
  ) THEN
    ALTER TABLE assessment_metadata DROP CONSTRAINT assessment_metadata_assessment_id_fkey;
  END IF;

  -- Drop trigger if it exists
  IF EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_assessment_metadata_timestamp'
  ) THEN
    DROP TRIGGER IF EXISTS update_assessment_metadata_timestamp ON assessment_metadata;
  END IF;

  -- Drop table if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'assessment_metadata'
  ) THEN
    DROP TABLE assessment_metadata;
  END IF;
END $$;

-- Safe drop for sub_processes and its dependencies
DO $$ 
BEGIN
  -- Drop foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'sub_processes_process_id_fkey'
  ) THEN
    ALTER TABLE sub_processes DROP CONSTRAINT sub_processes_process_id_fkey;
  END IF;

  -- Drop trigger if it exists
  IF EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_sub_processes_timestamp'
  ) THEN
    DROP TRIGGER IF EXISTS update_sub_processes_timestamp ON sub_processes;
  END IF;

  -- Drop table if it exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'sub_processes'
  ) THEN
    DROP TABLE sub_processes;
  END IF;
END $$;