/*
  # IT Process Framework - Initial Schema

  1. New Tables
    - `companies` - Stores organizations being assessed
    - `assessments` - Stores assessment metadata
    - `domains` - Stores framework domains
    - `categories` - Stores categories within domains
    - `processes` - Stores individual processes within categories
    - `scores` - Stores assessment scores for processes
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  country TEXT,
  company_size TEXT,
  annual_revenue TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id TEXT PRIMARY KEY, -- Using text IDs like 'plan-strategy' for better readability
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY, -- Using text IDs like 'it-strategy' for better readability
  domain_id TEXT NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create processes table
CREATE TABLE IF NOT EXISTS processes (
  id TEXT PRIMARY KEY, -- Using text IDs like 'define-target-state' for better readability
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sub_processes table
CREATE TABLE IF NOT EXISTS sub_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id TEXT NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'partial', -- 'partial' or 'complete'
  is_open BOOLEAN NOT NULL DEFAULT true,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  process_id TEXT NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
  score NUMERIC(3,1) NOT NULL CHECK (score >= 0 AND score <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (assessment_id, process_id)
);

-- Create domain_scores view (calculated from process scores)
CREATE OR REPLACE VIEW domain_scores AS
SELECT 
  a.id AS assessment_id,
  d.id AS domain_id,
  COALESCE(AVG(s.score), 0) AS avg_score
FROM 
  assessments a
CROSS JOIN
  domains d
LEFT JOIN
  categories c ON c.domain_id = d.id
LEFT JOIN
  processes p ON p.category_id = c.id
LEFT JOIN
  scores s ON s.process_id = p.id AND s.assessment_id = a.id
GROUP BY
  a.id, d.id;

-- Create category_scores view (calculated from process scores)
CREATE OR REPLACE VIEW category_scores AS
SELECT 
  a.id AS assessment_id,
  c.id AS category_id,
  c.domain_id,
  COALESCE(AVG(s.score), 0) AS avg_score
FROM 
  assessments a
CROSS JOIN
  categories c
LEFT JOIN
  processes p ON p.category_id = c.id
LEFT JOIN
  scores s ON s.process_id = p.id AND s.assessment_id = a.id
GROUP BY
  a.id, c.id, c.domain_id;

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Companies: users can read all companies, but only modify their own
CREATE POLICY "Users can view all companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own companies"
  ON companies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own companies"
  ON companies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Framework structure (domains, categories, processes): all users can read, only admins can modify
CREATE POLICY "Users can view all domains"
  ON domains
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view all categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view all processes"
  ON processes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view all sub-processes"
  ON sub_processes
  FOR SELECT
  TO authenticated
  USING (true);

-- Assessments: users can read all assessments, but only modify their own
CREATE POLICY "Users can view all assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own assessments"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Scores: users can view all scores, but only modify scores for their own assessments
CREATE POLICY "Users can view all scores"
  ON scores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert scores for their own assessments"
  ON scores
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT created_by FROM assessments WHERE id = assessment_id)
  );

CREATE POLICY "Users can update scores for their own assessments"
  ON scores
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = (SELECT created_by FROM assessments WHERE id = assessment_id)
  );

-- Insert initial framework data: domains
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
  order_index = EXCLUDED.order_index;

-- Insert initial framework data: categories for each domain
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
  order_index = EXCLUDED.order_index;

-- Insert initial framework data: processes for IT Strategy category
INSERT INTO processes (id, category_id, name, order_index)
VALUES
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
  order_index = EXCLUDED.order_index;

-- Create additional functions and triggers

-- Function to update the completion_percentage in assessments
CREATE OR REPLACE FUNCTION update_assessment_completion_percentage()
RETURNS TRIGGER AS $$
DECLARE
  total_processes INTEGER;
  scored_processes INTEGER;
  percentage INTEGER;
BEGIN
  -- Count total processes in the framework
  SELECT COUNT(*) INTO total_processes FROM processes;
  
  -- Count processes that have scores for this assessment
  SELECT COUNT(*) INTO scored_processes FROM scores WHERE assessment_id = NEW.assessment_id;
  
  -- Calculate percentage
  IF total_processes > 0 THEN
    percentage := (scored_processes * 100) / total_processes;
  ELSE
    percentage := 0;
  END IF;
  
  -- Update the assessment
  UPDATE assessments 
  SET 
    completion_percentage = percentage,
    status = CASE WHEN percentage = 100 THEN 'complete' ELSE 'partial' END,
    updated_at = now()
  WHERE id = NEW.assessment_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update assessment completion when scores are added/updated
CREATE TRIGGER update_assessment_completion
AFTER INSERT OR UPDATE OR DELETE ON scores
FOR EACH ROW
EXECUTE FUNCTION update_assessment_completion_percentage();

-- Function to update updated_at timestamp on tables
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamp
CREATE TRIGGER update_companies_timestamp
BEFORE UPDATE ON companies
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_domains_timestamp
BEFORE UPDATE ON domains
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_categories_timestamp
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_processes_timestamp
BEFORE UPDATE ON processes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_sub_processes_timestamp
BEFORE UPDATE ON sub_processes
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_assessments_timestamp
BEFORE UPDATE ON assessments
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_scores_timestamp
BEFORE UPDATE ON scores
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();