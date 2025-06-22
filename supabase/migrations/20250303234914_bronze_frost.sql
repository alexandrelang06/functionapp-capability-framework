/*
  # Complete Framework Data Migration
  
  1. New Data
    - Ensures domains, categories, and processes for all domains exist
  2. Changes
    - Adds all framework domains if they don't exist
    - Adds related categories and processes for each domain
  3. Safety
    - Uses idempotent SQL with existence checks to prevent duplicates
*/

-- Create domains if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'plan-strategy') THEN
    INSERT INTO domains (id, title, description, order_index, created_at, updated_at)
    VALUES ('plan-strategy', 'Plan strategy', 'Core processes that directly create value for the organization', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'manage-architecture') THEN
    INSERT INTO domains (id, title, description, order_index, created_at, updated_at)
    VALUES ('manage-architecture', 'Manage architecture', 'Processes for designing and governing enterprise architecture', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'govern-it') THEN
    INSERT INTO domains (id, title, description, order_index, created_at, updated_at)
    VALUES ('govern-it', 'Govern IT', 'Processes for IT risk management, compliance, and security', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'manage-customers') THEN
    INSERT INTO domains (id, title, description, order_index, created_at, updated_at)
    VALUES ('manage-customers', 'Manage customers and demand', 'Processes focused on business relationships and demand management', 4, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'implement-operate') THEN
    INSERT INTO domains (id, title, description, order_index, created_at, updated_at)
    VALUES ('implement-operate', 'Implement and operate solutions', 'Processes focused on delivering and operating IT solutions', 5, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'support-users') THEN
    INSERT INTO domains (id, title, description, order_index, created_at, updated_at)
    VALUES ('support-users', 'Support users', 'Processes focused on supporting users and continuous improvement', 6, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'steer-resources') THEN
    INSERT INTO domains (id, title, description, order_index, created_at, updated_at)
    VALUES ('steer-resources', 'Steer resources', 'Supporting processes that enable effective IT operations', 7, now(), now());
  END IF;
END $$;

-- Plan Strategy domain categories and processes
DO $$
BEGIN
  -- IT STRATEGY category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'it-strategy') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('it-strategy', 'plan-strategy', 'IT STRATEGY', 1, now(), now());
  END IF;
  
  -- IT STRATEGY processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'define-target-state') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('define-target-state', 'it-strategy', 'Define target state', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'analyze-current-state') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('analyze-current-state', 'it-strategy', 'Analyze current state', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'derive-initiatives') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('derive-initiatives', 'it-strategy', 'Derive initiatives', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'execute-it-strategy') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('execute-it-strategy', 'it-strategy', 'Execute IT strategy', 4, now(), now());
  END IF;
  
  -- PORTFOLIO MANAGEMENT category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'portfolio-management') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('portfolio-management', 'plan-strategy', 'PORTFOLIO MANAGEMENT', 2, now(), now());
  END IF;
  
  -- PORTFOLIO MANAGEMENT processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'evaluate-select-investments') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('evaluate-select-investments', 'portfolio-management', 'Evaluate and select investments', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'monitor-realign-portfolio') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('monitor-realign-portfolio', 'portfolio-management', 'Monitor and realign portfolio', 2, now(), now());
  END IF;
END $$;

-- Manage Architecture domain categories and processes
DO $$
BEGIN
  -- ENTERPRISE ARCHITECTURE category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'enterprise-architecture') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('enterprise-architecture', 'manage-architecture', 'ENTERPRISE ARCHITECTURE', 1, now(), now());
  END IF;
  
  -- ENTERPRISE ARCHITECTURE processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'define-architecture-vision') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('define-architecture-vision', 'enterprise-architecture', 'Define architecture vision', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'govern-architecture') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('govern-architecture', 'enterprise-architecture', 'Govern architecture', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'transform-architecture') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('transform-architecture', 'enterprise-architecture', 'Transform architecture', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'analyze-architecture') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('analyze-architecture', 'enterprise-architecture', 'Analyze architecture', 4, now(), now());
  END IF;
END $$;

-- Govern IT domain categories and processes
DO $$
BEGIN
  -- IT-RISK AND COMPLIANCE category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'it-risk-compliance') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('it-risk-compliance', 'govern-it', 'IT-RISK AND COMPLIANCE', 1, now(), now());
  END IF;
  
  -- IT-RISK AND COMPLIANCE processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'maintain-compliance') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('maintain-compliance', 'it-risk-compliance', 'Maintain a compliance register and regulation surveillance', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-risk') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-risk', 'it-risk-compliance', 'Manage risk', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'setup-control-system') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('setup-control-system', 'it-risk-compliance', 'Setup control system for IT', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'ensure-sustainability') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('ensure-sustainability', 'it-risk-compliance', 'Ensure sustainability and ethics in IT', 4, now(), now());
  END IF;
  
  -- IT SECURITY category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'it-security') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('it-security', 'govern-it', 'IT SECURITY', 2, now(), now());
  END IF;
  
  -- IT SECURITY processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'identify') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('identify', 'it-security', 'Identify', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'protect') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('protect', 'it-security', 'Protect', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'detect') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('detect', 'it-security', 'Detect', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'respond') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('respond', 'it-security', 'Respond', 4, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'recover') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('recover', 'it-security', 'Recover', 5, now(), now());
  END IF;
END $$;

-- Manage Customers and Demand domain categories and processes
DO $$
BEGIN
  -- BUSINESS RELATIONSHIP category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'business-relationship') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('business-relationship', 'manage-customers', 'BUSINESS RELATIONSHIP', 1, now(), now());
  END IF;
  
  -- BUSINESS RELATIONSHIP processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'maintain-relationship') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('maintain-relationship', 'business-relationship', 'Maintain relationship and communication', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'bring-transparency') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('bring-transparency', 'business-relationship', 'Bring transparency to service performance', 2, now(), now());
  END IF;
  
  -- DEMAND MANAGEMENT category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'demand-management') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('demand-management', 'manage-customers', 'DEMAND MANAGEMENT', 2, now(), now());
  END IF;
  
  -- DEMAND MANAGEMENT processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'gather-filter-demand') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('gather-filter-demand', 'demand-management', 'Gather and filter demand', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'perform-feasibility') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('perform-feasibility', 'demand-management', 'Perform feasibility and compliance study', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-demand-supply') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-demand-supply', 'demand-management', 'Manage demand and supply capacity', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-it-innovation') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-it-innovation', 'demand-management', 'Manage IT innovation', 4, now(), now());
  END IF;
END $$;

-- Implement and Operate Solutions domain categories and processes
DO $$
BEGIN
  -- PROGRAMS & PROJECTS category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'programs-projects') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('programs-projects', 'implement-operate', 'PROGRAMS & PROJECTS', 1, now(), now());
  END IF;
  
  -- PROGRAMS & PROJECTS processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'scope-programs') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('scope-programs', 'programs-projects', 'Scope programs and projects', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-stakeholders') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-stakeholders', 'programs-projects', 'Manage stakeholders'' engagement & coordination', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'plan-roadmap') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('plan-roadmap', 'programs-projects', 'Plan the roadmap', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'monitor-progress') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('monitor-progress', 'programs-projects', 'Monitor progress', 4, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-risk-quality') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-risk-quality', 'programs-projects', 'Manage risk and quality', 5, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'evaluate-results-close') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('evaluate-results-close', 'programs-projects', 'Evaluate results and close', 6, now(), now());
  END IF;
  
  -- SOLUTION DELIVERY category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'solution-delivery') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('solution-delivery', 'implement-operate', 'SOLUTION DELIVERY', 2, now(), now());
  END IF;
  
  -- SOLUTION DELIVERY processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'design-solutions') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('design-solutions', 'solution-delivery', 'Design solutions', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'develop-configure') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('develop-configure', 'solution-delivery', 'Develop or configure solutions', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'conduct-testing') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('conduct-testing', 'solution-delivery', 'Conduct testing and quality assurance', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'deploy-release') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('deploy-release', 'solution-delivery', 'Deploy and release', 4, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'create-documentation') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('create-documentation', 'solution-delivery', 'Create documentation', 5, now(), now());
  END IF;
  
  -- OPERATIONS category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'operations') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('operations', 'implement-operate', 'OPERATIONS', 3, now(), now());
  END IF;
  
  -- OPERATIONS processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-events-incidents') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-events-incidents', 'operations', 'Manage events and incidents', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-changes') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-changes', 'operations', 'Manage changes', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-availability-capacity') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-availability-capacity', 'operations', 'Manage availability and capacity', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-configurations') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-configurations', 'operations', 'Manage configurations', 4, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'ensure-continuity') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('ensure-continuity', 'operations', 'Ensure continuity', 5, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'secure-operations') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('secure-operations', 'operations', 'Secure operations', 6, now(), now());
  END IF;
END $$;

-- Support Users domain categories and processes
DO $$
BEGIN
  -- SUPPORT & IMPROVE category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'support-improve') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('support-improve', 'support-users', 'SUPPORT & IMPROVE', 1, now(), now());
  END IF;
  
  -- SUPPORT & IMPROVE processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-product-catalog') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-product-catalog', 'support-improve', 'Manage product/service catalog', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-sla-performance') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-sla-performance', 'support-improve', 'Manage SLA and performance', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-requests') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-requests', 'support-improve', 'Manage requests', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-problems') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-problems', 'support-improve', 'Manage problems', 4, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-user-documentation') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-user-documentation', 'support-improve', 'Manage user documentation & trainings', 5, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'continuous-feedbacks') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('continuous-feedbacks', 'support-improve', 'Continuous feedbacks & improvement', 6, now(), now());
  END IF;
END $$;

-- Steer Resources domain categories and processes
DO $$
BEGIN
  -- IT-FINANCE & CONTROLLING category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'finance-controlling') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('finance-controlling', 'steer-resources', 'IT-FINANCE & CONTROLLING', 1, now(), now());
  END IF;
  
  -- IT-FINANCE & CONTROLLING processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-budgets') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-budgets', 'finance-controlling', 'Manage budgets and invest.', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'allocate-costs') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('allocate-costs', 'finance-controlling', 'Allocate costs', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'control-costs-performance') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('control-costs-performance', 'finance-controlling', 'Control costs and performance', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'perform-billing') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('perform-billing', 'finance-controlling', 'Perform billing and reporting to customers', 4, now(), now());
  END IF;
  
  -- IT-ORGANIZATION & HR category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'organization-hr') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('organization-hr', 'steer-resources', 'IT-ORGANIZATION & HR', 2, now(), now());
  END IF;
  
  -- IT-ORGANIZATION & HR processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'design-org-structure') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('design-org-structure', 'organization-hr', 'Design & manage org. structure', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'plan-strategic-workforce') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('plan-strategic-workforce', 'organization-hr', 'Plan strategic workforce', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-capacity-staffing') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-capacity-staffing', 'organization-hr', 'Manage capacity and staffing', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-trainings-knowledge') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-trainings-knowledge', 'organization-hr', 'Manage trainings and knowledge', 4, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'communicate-manage-change') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('communicate-manage-change', 'organization-hr', 'Communicate & manage change', 5, now(), now());
  END IF;
  
  -- IT ASSET MANAGEMENT category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'asset-management') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('asset-management', 'steer-resources', 'IT ASSET MANAGEMENT', 3, now(), now());
  END IF;
  
  -- IT ASSET MANAGEMENT processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-app-portfolio') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-app-portfolio', 'asset-management', 'Manage app. portfolio (APM)', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-technology-portfolio') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-technology-portfolio', 'asset-management', 'Manage technology portfolio and risks (TPRM)', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-software-assets') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-software-assets', 'asset-management', 'Manage software assets (SAM)', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-hardware-assets') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-hardware-assets', 'asset-management', 'Manage hardware assets (HAM)', 4, now(), now());
  END IF;
  
  -- IT-SOURCING & PROCUREMENT category
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sourcing-procurement') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('sourcing-procurement', 'steer-resources', 'IT-SOURCING & PROCUREMENT', 4, now(), now());
  END IF;
  
  -- IT-SOURCING & PROCUREMENT processes
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'define-sourcing-strategy') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('define-sourcing-strategy', 'sourcing-procurement', 'Define sourcing strategy', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'select-supplier') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('select-supplier', 'sourcing-procurement', 'Select supplier and manage transition', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-service-supply') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-service-supply', 'sourcing-procurement', 'Manage service supply', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM processes WHERE id = 'manage-vendors-contracts') THEN
    INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at)
    VALUES ('manage-vendors-contracts', 'sourcing-procurement', 'Manage vendors & contracts', 4, now(), now());
  END IF;
END $$;