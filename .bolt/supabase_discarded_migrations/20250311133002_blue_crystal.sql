/*
  # Update Framework Metadata
  
  1. Changes
    - Update domains with correct titles and descriptions
    - Update categories with proper titles
    - Update processes with proper metadata and names
    - Fix maturity levels format to ensure proper string values
    - Update order indexes
    
  2. Data Quality
    - Ensures consistent formatting
    - Maintains data integrity
    - Preserves existing relationships
*/

-- Update domains with correct information
UPDATE domains
SET 
  title = CASE id
    WHEN 'plan-strategy' THEN 'Plan strategy'
    WHEN 'manage-architecture' THEN 'Manage architecture'
    WHEN 'govern-it' THEN 'Govern IT'
    WHEN 'manage-customers' THEN 'Manage customers and demand'
    WHEN 'implement-operate' THEN 'Implement and operate solutions'
    WHEN 'support-users' THEN 'Support users'
    WHEN 'steer-resources' THEN 'Steer resources'
    END,
  description = CASE id
    WHEN 'plan-strategy' THEN 'Core processes that directly create value for the organization'
    WHEN 'manage-architecture' THEN 'Processes for designing and governing enterprise architecture'
    WHEN 'govern-it' THEN 'Processes for IT risk management, compliance, and security'
    WHEN 'manage-customers' THEN 'Processes focused on business relationships and demand management'
    WHEN 'implement-operate' THEN 'Processes focused on delivering and operating IT solutions'
    WHEN 'support-users' THEN 'Processes focused on supporting users and continuous improvement'
    WHEN 'steer-resources' THEN 'Supporting processes that enable effective IT operations'
    END
WHERE id IN ('plan-strategy', 'manage-architecture', 'govern-it', 'manage-customers', 'implement-operate', 'support-users', 'steer-resources');

-- Update categories with proper titles
UPDATE categories
SET 
  title = CASE id
    WHEN 'it-strategy' THEN 'IT STRATEGY'
    WHEN 'portfolio-management' THEN 'PORTFOLIO MANAGEMENT'
    WHEN 'enterprise-architecture' THEN 'ENTERPRISE ARCHITECTURE'
    WHEN 'risk-compliance' THEN 'IT-RISK AND COMPLIANCE'
    WHEN 'it-security' THEN 'IT SECURITY'
    WHEN 'business-relationship' THEN 'BUSINESS RELATIONSHIP'
    WHEN 'demand-management' THEN 'DEMAND MANAGEMENT'
    WHEN 'programs-projects' THEN 'PROGRAMS & PROJECTS'
    WHEN 'solution-delivery' THEN 'SOLUTION DELIVERY'
    WHEN 'operations' THEN 'OPERATIONS'
    WHEN 'support-improve' THEN 'SUPPORT & IMPROVE'
    WHEN 'finance-controlling' THEN 'IT-FINANCE & CONTROLLING'
    WHEN 'organization-hr' THEN 'IT-ORGANIZATION & HR'
    WHEN 'asset-management' THEN 'IT ASSET MANAGEMENT'
    WHEN 'sourcing-procurement' THEN 'IT-SOURCING & PROCUREMENT'
    END
WHERE id IN (
  'it-strategy', 'portfolio-management', 'enterprise-architecture',
  'risk-compliance', 'it-security', 'business-relationship',
  'demand-management', 'programs-projects', 'solution-delivery',
  'operations', 'support-improve', 'finance-controlling',
  'organization-hr', 'asset-management', 'sourcing-procurement'
);

-- Update processes with proper metadata
UPDATE processes
SET 
  description = ARRAY['Process description to be defined'],
  key_questions = ARRAY['Key evaluation questions to be defined'],
  key_artifacts = ARRAY['Key deliverables to be defined'],
  maturity_levels = jsonb_build_object(
    '1', jsonb_build_object('description', 'Initial/Ad-hoc: Basic or no processes exist'),
    '2', jsonb_build_object('description', 'Repeatable: Processes follow a regular pattern'),
    '3', jsonb_build_object('description', 'Defined: Processes are documented and standardized'),
    '4', jsonb_build_object('description', 'Managed: Processes are measured and controlled'),
    '5', jsonb_build_object('description', 'Optimized: Focus on process improvement')
  ),
  short_description = 'En cours de définition'
WHERE short_description IS NULL;

-- Update process names to be more descriptive
UPDATE processes
SET name = CASE id
  WHEN 'it-strategy' THEN 'Define and Execute IT Strategy'
  WHEN 'portfolio-management' THEN 'Manage IT Portfolio'
  WHEN 'enterprise-architecture' THEN 'Enterprise Architecture Management'
  WHEN 'risk-compliance' THEN 'IT Risk and Compliance Management'
  WHEN 'it-security' THEN 'Information Security Management'
  END
WHERE id IN ('it-strategy', 'portfolio-management', 'enterprise-architecture', 'risk-compliance', 'it-security');

-- Ensure proper order_index values
UPDATE domains SET order_index = CASE id
  WHEN 'plan-strategy' THEN 1
  WHEN 'manage-architecture' THEN 2
  WHEN 'govern-it' THEN 3
  WHEN 'manage-customers' THEN 4
  WHEN 'implement-operate' THEN 5
  WHEN 'support-users' THEN 6
  WHEN 'steer-resources' THEN 7
  END
WHERE id IN ('plan-strategy', 'manage-architecture', 'govern-it', 'manage-customers', 'implement-operate', 'support-users', 'steer-resources');

-- Update timestamps
UPDATE domains SET updated_at = now();
UPDATE categories SET updated_at = now();
UPDATE processes SET updated_at = now();