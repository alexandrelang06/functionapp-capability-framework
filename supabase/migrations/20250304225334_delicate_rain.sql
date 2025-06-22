/*
  # Add Missing Domains and Update Framework Structure

  1. Changes
    - Ensures all domains exist in the database
    - Updates domain titles and descriptions
    - Maintains existing data while adding any missing entries
    
  2. Security
    - Maintains existing RLS policies
    - No changes to security settings
*/

-- Ensure domains exist and are up to date
DO $$
BEGIN
  -- Plan Strategy domain
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'plan-strategy') THEN
    INSERT INTO domains (id, title, description, order_index)
    VALUES ('plan-strategy', 'Plan strategy', 'Core processes that directly create value for the organization', 1);
  ELSE
    UPDATE domains 
    SET title = 'Plan strategy',
        description = 'Core processes that directly create value for the organization',
        order_index = 1,
        updated_at = now()
    WHERE id = 'plan-strategy';
  END IF;

  -- Manage Architecture domain
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'manage-architecture') THEN
    INSERT INTO domains (id, title, description, order_index)
    VALUES ('manage-architecture', 'Manage architecture', 'Processes for designing and governing enterprise architecture', 2);
  ELSE
    UPDATE domains 
    SET title = 'Manage architecture',
        description = 'Processes for designing and governing enterprise architecture',
        order_index = 2,
        updated_at = now()
    WHERE id = 'manage-architecture';
  END IF;

  -- Govern IT domain
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'govern-it') THEN
    INSERT INTO domains (id, title, description, order_index)
    VALUES ('govern-it', 'Govern IT', 'Processes for IT risk management, compliance, and security', 3);
  ELSE
    UPDATE domains 
    SET title = 'Govern IT',
        description = 'Processes for IT risk management, compliance, and security',
        order_index = 3,
        updated_at = now()
    WHERE id = 'govern-it';
  END IF;

  -- Manage Customers domain
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'manage-customers') THEN
    INSERT INTO domains (id, title, description, order_index)
    VALUES ('manage-customers', 'Manage customers and demand', 'Processes focused on business relationships and demand management', 4);
  ELSE
    UPDATE domains 
    SET title = 'Manage customers and demand',
        description = 'Processes focused on business relationships and demand management',
        order_index = 4,
        updated_at = now()
    WHERE id = 'manage-customers';
  END IF;

  -- Implement and Operate domain
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'implement-operate') THEN
    INSERT INTO domains (id, title, description, order_index)
    VALUES ('implement-operate', 'Implement and operate solutions', 'Processes focused on delivering and operating IT solutions', 5);
  ELSE
    UPDATE domains 
    SET title = 'Implement and operate solutions',
        description = 'Processes focused on delivering and operating IT solutions',
        order_index = 5,
        updated_at = now()
    WHERE id = 'implement-operate';
  END IF;

  -- Support Users domain
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'support-users') THEN
    INSERT INTO domains (id, title, description, order_index)
    VALUES ('support-users', 'Support users', 'Processes focused on supporting users and continuous improvement', 6);
  ELSE
    UPDATE domains 
    SET title = 'Support users',
        description = 'Processes focused on supporting users and continuous improvement',
        order_index = 6,
        updated_at = now()
    WHERE id = 'support-users';
  END IF;

  -- Steer Resources domain
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'steer-resources') THEN
    INSERT INTO domains (id, title, description, order_index)
    VALUES ('steer-resources', 'Steer resources', 'Supporting processes that enable effective IT operations', 7);
  ELSE
    UPDATE domains 
    SET title = 'Steer resources',
        description = 'Supporting processes that enable effective IT operations',
        order_index = 7,
        updated_at = now()
    WHERE id = 'steer-resources';
  END IF;
END $$;