/*
  # Update for Support Users and Steer Resources domains

  1. Ensure domain data consistency
    - Make sure all domain data is available
    - Supports existing domains with proper ordering
  
  2. Add missing domain relationships
    - Ensures data integrity between domains and their relationships
*/

-- Check if domain data already exists and insert if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'support-users') THEN
    INSERT INTO domains (id, title, description, order_index, created_at, updated_at)
    VALUES ('support-users', 'Support users', 'Processes focused on supporting users and continuous improvement', 6, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM domains WHERE id = 'steer-resources') THEN
    INSERT INTO domains (id, title, description, order_index, created_at, updated_at)
    VALUES ('steer-resources', 'Steer resources', 'Supporting processes that enable effective IT operations', 7, now(), now());
  END IF;
END $$;

-- Ensure all relevant categories exist for Support Users domain
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'support-improve') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('support-improve', 'support-users', 'SUPPORT & IMPROVE', 1, now(), now());
  END IF;
END $$;

-- Ensure all relevant categories exist for Steer Resources domain
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'finance-controlling') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('finance-controlling', 'steer-resources', 'IT-FINANCE & CONTROLLING', 1, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'organization-hr') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('organization-hr', 'steer-resources', 'IT-ORGANIZATION & HR', 2, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'asset-management') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('asset-management', 'steer-resources', 'IT ASSET MANAGEMENT', 3, now(), now());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id = 'sourcing-procurement') THEN
    INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at)
    VALUES ('sourcing-procurement', 'steer-resources', 'IT-SOURCING & PROCUREMENT', 4, now(), now());
  END IF;
END $$;

-- Support & Improve processes
DO $$
BEGIN
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

-- Finance & Controlling processes
DO $$
BEGIN
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
END $$;

-- Organization & HR processes
DO $$
BEGIN
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
END $$;

-- Asset Management processes
DO $$
BEGIN
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
END $$;

-- Sourcing & Procurement processes
DO $$
BEGIN
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