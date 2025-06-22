/*
  # Fix Data Loading Migration

  1. Ensures domain tables exist with proper structure
  2. Creates necessary domains, categories, and processes data
  3. Configures Row Level Security properly for each table
*/

-- Make sure tables exist first
CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY, 
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL, 
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS processes (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert or update all domains
INSERT INTO domains (id, title, description, order_index)
VALUES
  ('plan-strategy', 'Plan strategy', 'Core processes that directly create value for the organization', 1),
  ('manage-architecture', 'Manage architecture', 'Processes for designing and governing enterprise architecture', 2),
  ('govern-it', 'Govern IT', 'Processes for IT risk management, compliance, and security', 3),
  ('manage-customers', 'Manage customers and demand', 'Processes focused on business relationships and demand management', 4),
  ('implement-operate', 'Implement and operate solutions', 'Processes focused on delivering and operating IT solutions', 5),
  ('support-users', 'Support users', 'Processes focused on supporting users and continuous improvement', 6),
  ('steer-resources', 'Steer resources', 'Supporting processes that enable effective IT operations', 7)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  updated_at = now();

-- Insert or update all categories
INSERT INTO categories (id, domain_id, title, order_index)
VALUES
  -- Plan strategy domain
  ('it-strategy', 'plan-strategy', 'IT STRATEGY', 1),
  ('portfolio-management', 'plan-strategy', 'PORTFOLIO MANAGEMENT', 2),
  
  -- Manage architecture domain
  ('enterprise-architecture', 'manage-architecture', 'ENTERPRISE ARCHITECTURE', 1),
  
  -- Govern IT domain
  ('it-risk-compliance', 'govern-it', 'IT-RISK AND COMPLIANCE', 1),
  ('it-security', 'govern-it', 'IT SECURITY', 2),
  
  -- Manage customers and demand domain
  ('business-relationship', 'manage-customers', 'BUSINESS RELATIONSHIP', 1),
  ('demand-management', 'manage-customers', 'DEMAND MANAGEMENT', 2),
  
  -- Implement and operate solutions domain
  ('programs-projects', 'implement-operate', 'PROGRAMS & PROJECTS', 1),
  ('solution-delivery', 'implement-operate', 'SOLUTION DELIVERY', 2),
  ('operations', 'implement-operate', 'OPERATIONS', 3),
  
  -- Support users domain
  ('support-improve', 'support-users', 'SUPPORT & IMPROVE', 1),
  
  -- Steer resources domain
  ('finance-controlling', 'steer-resources', 'IT-FINANCE & CONTROLLING', 1),
  ('organization-hr', 'steer-resources', 'IT-ORGANIZATION & HR', 2),
  ('asset-management', 'steer-resources', 'IT ASSET MANAGEMENT', 3),
  ('sourcing-procurement', 'steer-resources', 'IT-SOURCING & PROCUREMENT', 4)
ON CONFLICT (id) DO UPDATE SET
  domain_id = EXCLUDED.domain_id,
  title = EXCLUDED.title,
  order_index = EXCLUDED.order_index,
  updated_at = now();

-- Insert or update all processes
INSERT INTO processes (id, category_id, name, order_index)
VALUES
  -- IT Strategy processes
  ('define-target-state', 'it-strategy', 'Define target state', 1),
  ('analyze-current-state', 'it-strategy', 'Analyze current state', 2),
  ('derive-initiatives', 'it-strategy', 'Derive initiatives', 3),
  ('execute-it-strategy', 'it-strategy', 'Execute IT strategy', 4),
  
  -- Portfolio Management processes
  ('evaluate-select-investments', 'portfolio-management', 'Evaluate and select investments', 1),
  ('monitor-realign-portfolio', 'portfolio-management', 'Monitor and realign portfolio', 2),
  
  -- Enterprise Architecture processes
  ('define-architecture-vision', 'enterprise-architecture', 'Define architecture vision', 1),
  ('govern-architecture', 'enterprise-architecture', 'Govern architecture', 2),
  ('transform-architecture', 'enterprise-architecture', 'Transform architecture', 3),
  ('analyze-architecture', 'enterprise-architecture', 'Analyze architecture', 4),
  
  -- IT Risk and Compliance processes
  ('maintain-compliance', 'it-risk-compliance', 'Maintain a compliance register and regulation surveillance', 1),
  ('manage-risk', 'it-risk-compliance', 'Manage risk', 2),
  ('setup-control-system', 'it-risk-compliance', 'Setup control system for IT', 3),
  ('ensure-sustainability', 'it-risk-compliance', 'Ensure sustainability and ethics in IT', 4),
  
  -- IT Security processes
  ('identify', 'it-security', 'Identify', 1),
  ('protect', 'it-security', 'Protect', 2),
  ('detect', 'it-security', 'Detect', 3),
  ('respond', 'it-security', 'Respond', 4),
  ('recover', 'it-security', 'Recover', 5),
  
  -- Business Relationship processes
  ('maintain-relationship', 'business-relationship', 'Maintain relationship and communication', 1),
  ('bring-transparency', 'business-relationship', 'Bring transparency to service performance', 2),
  
  -- Demand Management processes
  ('gather-filter-demand', 'demand-management', 'Gather and filter demand', 1),
  ('perform-feasibility', 'demand-management', 'Perform feasibility and compliance study', 2),
  ('manage-demand-supply', 'demand-management', 'Manage demand and supply capacity', 3),
  ('manage-it-innovation', 'demand-management', 'Manage IT innovation', 4),
  
  -- Programs & Projects processes
  ('scope-programs', 'programs-projects', 'Scope programs and projects', 1),
  ('manage-stakeholders', 'programs-projects', 'Manage stakeholders'' engagement & coordination', 2),
  ('plan-roadmap', 'programs-projects', 'Plan the roadmap', 3),
  ('monitor-progress', 'programs-projects', 'Monitor progress', 4),
  ('manage-risk-quality', 'programs-projects', 'Manage risk and quality', 5),
  ('evaluate-results-close', 'programs-projects', 'Evaluate results and close', 6),
  
  -- Solution Delivery processes
  ('design-solutions', 'solution-delivery', 'Design solutions', 1),
  ('develop-configure', 'solution-delivery', 'Develop or configure solutions', 2),
  ('conduct-testing', 'solution-delivery', 'Conduct testing and quality assurance', 3),
  ('deploy-release', 'solution-delivery', 'Deploy and release', 4),
  ('create-documentation', 'solution-delivery', 'Create documentation', 5),
  
  -- Operations processes
  ('manage-events-incidents', 'operations', 'Manage events and incidents', 1),
  ('manage-changes', 'operations', 'Manage changes', 2),
  ('manage-availability-capacity', 'operations', 'Manage availability and capacity', 3),
  ('manage-configurations', 'operations', 'Manage configurations', 4),
  ('ensure-continuity', 'operations', 'Ensure continuity', 5),
  ('secure-operations', 'operations', 'Secure operations', 6),
  
  -- Support & Improve processes
  ('manage-product-catalog', 'support-improve', 'Manage product/service catalog', 1),
  ('manage-sla-performance', 'support-improve', 'Manage SLA and performance', 2),
  ('manage-requests', 'support-improve', 'Manage requests', 3),
  ('manage-problems', 'support-improve', 'Manage problems', 4),
  ('manage-user-documentation', 'support-improve', 'Manage user documentation & trainings', 5),
  ('continuous-feedbacks', 'support-improve', 'Continuous feedbacks & improvement', 6),
  
  -- IT-Finance & Controlling processes
  ('manage-budgets', 'finance-controlling', 'Manage budgets and invest.', 1),
  ('allocate-costs', 'finance-controlling', 'Allocate costs', 2),
  ('control-costs-performance', 'finance-controlling', 'Control costs and performance', 3),
  ('perform-billing', 'finance-controlling', 'Perform billing and reporting to customers', 4),
  
  -- IT-Organization & HR processes
  ('design-org-structure', 'organization-hr', 'Design & manage org. structure', 1),
  ('plan-strategic-workforce', 'organization-hr', 'Plan strategic workforce', 2),
  ('manage-capacity-staffing', 'organization-hr', 'Manage capacity and staffing', 3),
  ('manage-trainings-knowledge', 'organization-hr', 'Manage trainings and knowledge', 4),
  ('communicate-manage-change', 'organization-hr', 'Communicate & manage change', 5),
  
  -- IT Asset Management processes
  ('manage-app-portfolio', 'asset-management', 'Manage app. portfolio (APM)', 1),
  ('manage-technology-portfolio', 'asset-management', 'Manage technology portfolio and risks (TPRM)', 2),
  ('manage-software-assets', 'asset-management', 'Manage software assets (SAM)', 3),
  ('manage-hardware-assets', 'asset-management', 'Manage hardware assets (HAM)', 4),
  
  -- IT-Sourcing & Procurement processes
  ('define-sourcing-strategy', 'sourcing-procurement', 'Define sourcing strategy', 1),
  ('select-supplier', 'sourcing-procurement', 'Select supplier and manage transition', 2),
  ('manage-service-supply', 'sourcing-procurement', 'Manage service supply', 3),
  ('manage-vendors-contracts', 'sourcing-procurement', 'Manage vendors & contracts', 4)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  order_index = EXCLUDED.order_index,
  updated_at = now();

-- Enable Row Level Security
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'domains' AND policyname = 'Everyone can view domains'
  ) THEN
    ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Everyone can view domains"
      ON domains
      FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Everyone can view categories'
  ) THEN
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Everyone can view categories"
      ON categories
      FOR SELECT
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'processes' AND policyname = 'Everyone can view processes'
  ) THEN
    ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Everyone can view processes"
      ON processes
      FOR SELECT
      USING (true);
  END IF;
END $$;