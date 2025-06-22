/*
  # Mise à jour complète du framework IT Process Maturity Assessment
  
  1. Suppression de l'ancien contenu
    - Suppression de tous les processus existants
    - Suppression de toutes les catégories existantes  
    - Suppression de tous les domaines existants
    
  2. Insertion du nouveau contenu
    - 8 nouveaux domaines organisés en 3 niveaux (Haut, Milieu, Bas)
    - 18 nouveaux macro-processus (catégories)
    - 74 nouveaux processus individuels
    
  3. Structure hiérarchique
    - Niveau Haut : Plan strategy, Govern technology, Manage architecture
    - Niveau Milieu : Manage demand, Deliver solutions, Operate solutions, Support users  
    - Niveau Bas : Steer Resources
*/

-- Suppression de l'ancien contenu (ordre important pour respecter les contraintes de clés étrangères)
DELETE FROM scores;
DELETE FROM processes;
DELETE FROM categories;
DELETE FROM domains;

-- Insertion des nouveaux domaines
INSERT INTO domains (id, title, description, order_index, created_at, updated_at) VALUES
  -- Niveau Haut
  ('plan-strategy', 'Plan strategy', 'Strategic planning and alignment processes', 1, now(), now()),
  ('govern-technology', 'Govern technology', 'Technology governance and risk management processes', 2, now(), now()),
  ('manage-architecture', 'Manage architecture', 'Enterprise and technology architecture management', 3, now(), now()),
  
  -- Niveau Milieu  
  ('manage-demand', 'Manage demand', 'Demand management and business relationship processes', 4, now(), now()),
  ('deliver-solutions', 'Deliver solutions', 'Solution delivery and engineering processes', 5, now(), now()),
  ('operate-solutions', 'Operate solutions', 'Solution operations and cybersecurity processes', 6, now(), now()),
  ('support-users', 'Support users', 'User support and service improvement processes', 7, now(), now()),
  
  -- Niveau Bas
  ('steer-resources', 'Steer Resources', 'Resource management and organizational processes', 8, now(), now());

-- Insertion des nouvelles catégories (macro-processus)
INSERT INTO categories (id, domain_id, title, order_index, created_at, updated_at) VALUES
  -- Plan strategy
  ('it-strategy', 'plan-strategy', 'IT STRATEGY', 1, now(), now()),
  ('portfolio-management', 'plan-strategy', 'PORTFOLIO MANAGEMENT', 2, now(), now()),
  
  -- Govern technology
  ('cybersecurity-governance', 'govern-technology', 'CYBERSECURITY GOVERNANCE', 1, now(), now()),
  ('it-risk-compliance', 'govern-technology', 'IT-RISK AND COMPLIANCE', 2, now(), now()),
  ('data-governance', 'govern-technology', 'DATA GOVERNANCE', 3, now(), now()),
  
  -- Manage architecture
  ('enterprise-architecture', 'manage-architecture', 'ENTERPRISE ARCHITECTURE', 1, now(), now()),
  ('technology-strategy', 'manage-architecture', 'TECHNOLOGY STRATEGY', 2, now(), now()),
  
  -- Manage demand
  ('business-relationship', 'manage-demand', 'BUSINESS RELATIONSHIP', 1, now(), now()),
  ('demand-management', 'manage-demand', 'DEMAND MANAGEMENT', 2, now(), now()),
  
  -- Deliver solutions
  ('projects-programs-delivery', 'deliver-solutions', 'PROJECTS & PROGRAMS DELIVERY', 1, now(), now()),
  ('solutions-engineering', 'deliver-solutions', 'SOLUTIONS ENGINEERING', 2, now(), now()),
  
  -- Operate solutions
  ('solutions-operations', 'operate-solutions', 'SOLUTIONS OPERATIONS', 1, now(), now()),
  ('cybersecurity-operations', 'operate-solutions', 'CYBERSECURITY OPERATIONS', 2, now(), now()),
  
  -- Support users
  ('support-improvement', 'support-users', 'SUPPORT & IMPROVEMENT', 1, now(), now()),
  
  -- Steer Resources
  ('it-finance-controlling', 'steer-resources', 'IT FINANCE & CONTROLLING', 1, now(), now()),
  ('it-organization-hr', 'steer-resources', 'IT ORGANIZATION & HR', 2, now(), now()),
  ('it-asset-management', 'steer-resources', 'IT ASSET MANAGEMENT', 3, now(), now()),
  ('it-sourcing-procurement', 'steer-resources', 'IT SOURCING & PROCUREMENT', 4, now(), now());

-- Insertion des nouveaux processus
INSERT INTO processes (id, category_id, name, order_index, created_at, updated_at) VALUES
  -- IT Strategy (2 processus)
  ('align-it-strategy-with-business-objectives', 'it-strategy', 'Align IT Strategy with business objectives', 1, now(), now()),
  ('define-and-execute-it-strategy', 'it-strategy', 'Define and execute IT Strategy', 2, now(), now()),
  
  -- Portfolio Management (3 processus)
  ('evaluate-and-prioritize-investments', 'portfolio-management', 'Evaluate and prioritize investments', 1, now(), now()),
  ('monitor-and-realign-portfolio', 'portfolio-management', 'Monitor and realign portfolio', 2, now(), now()),
  ('monitor-capability-performance', 'portfolio-management', 'Monitor capability performance', 3, now(), now()),
  
  -- Cybersecurity Governance (4 processus)
  ('define-and-implement-cyber-risk', 'cybersecurity-governance', 'Define and implement cyber risk', 1, now(), now()),
  ('define-cybersecurity-policies', 'cybersecurity-governance', 'Define cybersecurity policies', 2, now(), now()),
  ('manage-cybersecurity-supply-chain-risk', 'cybersecurity-governance', 'Manage cybersecurity supply chain risk', 3, now(), now()),
  ('oversee-cybersecurity-performance', 'cybersecurity-governance', 'Oversee cybersecurity performance', 4, now(), now()),
  
  -- IT-Risk and Compliance (4 processus)
  ('maintain-compliance-register-and-regulation-surveillance', 'it-risk-compliance', 'Maintain a compliance register and regulation surveillance', 1, now(), now()),
  ('define-manage-it-and-compliance-risks', 'it-risk-compliance', 'Define & Manage IT and compliance risks', 2, now(), now()),
  ('setup-control-system-for-it', 'it-risk-compliance', 'Setup control system for IT', 3, now(), now()),
  ('ensure-sustainability-and-ethics-in-it', 'it-risk-compliance', 'Ensure sustainability and ethics in IT', 4, now(), now()),
  
  -- Data Governance (3 processus)
  ('establish-and-maintain-data-catalog', 'data-governance', 'Establish and maintain data catalog', 1, now(), now()),
  ('ensure-data-quality-and-integrity', 'data-governance', 'Ensure data quality and integrity', 2, now(), now()),
  ('ensure-data-compliance-classification-and-risk-management', 'data-governance', 'Ensure data compliance, classification and risk management', 3, now(), now()),
  
  -- Enterprise Architecture (4 processus)
  ('define-architecture-vision', 'enterprise-architecture', 'Define architecture vision', 1, now(), now()),
  ('govern-architecture', 'enterprise-architecture', 'Govern architecture', 2, now(), now()),
  ('transform-architecture', 'enterprise-architecture', 'Transform architecture', 3, now(), now()),
  ('analyse-architecture', 'enterprise-architecture', 'Analyse architecture', 4, now(), now()),
  
  -- Technology Strategy (4 processus)
  ('define-technology-strategy', 'technology-strategy', 'Define technology strategy', 1, now(), now()),
  ('govern-technology', 'technology-strategy', 'Govern technology', 2, now(), now()),
  ('manage-technology-risk', 'technology-strategy', 'Manage technology risk', 3, now(), now()),
  ('foster-technology-innovation', 'technology-strategy', 'Foster technology innovation', 4, now(), now()),
  
  -- Business Relationship (3 processus)
  ('maintain-relationship-and-communication', 'business-relationship', 'Maintain relationship and communication', 1, now(), now()),
  ('ensure-transparency-on-service-performance', 'business-relationship', 'Ensure transparency on service performance', 2, now(), now()),
  ('capture-and-integrate-continuous-feedback', 'business-relationship', 'Capture and integrate continuous feedback', 3, now(), now()),
  
  -- Demand Management (3 processus)
  ('gather-and-filter-demand', 'demand-management', 'Gather and filter demand', 1, now(), now()),
  ('qualify-feasibility-and-compliance', 'demand-management', 'Qualify feasibility and compliance', 2, now(), now()),
  ('manage-demand-and-supply-capacity', 'demand-management', 'Manage demand and supply capacity', 3, now(), now()),
  
  -- Projects & Programs Delivery (6 processus)
  ('scope-projects-and-programs', 'projects-programs-delivery', 'Scope projects and programs', 1, now(), now()),
  ('plan-and-coordinate-delivery-roadmap', 'projects-programs-delivery', 'Plan and coordinate delivery roadmap', 2, now(), now()),
  ('engage-and-align-stakeholders', 'projects-programs-delivery', 'Engage and align stakeholders', 3, now(), now()),
  ('monitor-progress-and-quality', 'projects-programs-delivery', 'Monitor progress and quality', 4, now(), now()),
  ('create-and-maintain-it-documentation', 'projects-programs-delivery', 'Create and maintain IT documentation', 5, now(), now()),
  ('ensure-security-by-design-principles', 'projects-programs-delivery', 'Ensure security-by-design principles', 6, now(), now()),
  
  -- Solutions Engineering (6 processus)
  ('manage-govern-it-solutions-lifecycle', 'solutions-engineering', 'Manage & govern IT solutions lifecycle', 1, now(), now()),
  ('align-with-business-requirements', 'solutions-engineering', 'Align with business requirements', 2, now(), now()),
  ('design-and-architect-solutions', 'solutions-engineering', 'Design and architect solutions', 3, now(), now()),
  ('build-and-configure-solutions', 'solutions-engineering', 'Build and configure solutions', 4, now(), now()),
  ('conduct-validation-and-testing', 'solutions-engineering', 'Conduct validation and testing', 5, now(), now()),
  ('prepare-solution-deployment', 'solutions-engineering', 'Prepare solution deployment', 6, now(), now()),
  
  -- Solutions Operations (6 processus)
  ('manage-solution-monitoring-alerting', 'solutions-operations', 'Manage solution monitoring & alerting', 1, now(), now()),
  ('manage-events-incidents', 'solutions-operations', 'Manage events & incidents', 2, now(), now()),
  ('manage-changes-configurations', 'solutions-operations', 'Manage changes & configurations', 3, now(), now()),
  ('manage-availability-and-capacity', 'solutions-operations', 'Manage availability and capacity', 4, now(), now()),
  ('ensure-systems-resilience', 'solutions-operations', 'Ensure systems resilience', 5, now(), now()),
  ('provision-office-applications-and-devices', 'solutions-operations', 'Provision office applications and devices', 6, now(), now()),
  
  -- Cybersecurity Operations (4 processus)
  ('implement-manage-identity-access-controls', 'cybersecurity-operations', 'Implement & manage identity & access controls', 1, now(), now()),
  ('secure-data-at-rest-and-in-transit', 'cybersecurity-operations', 'Secure data at rest and in transit', 2, now(), now()),
  ('apply-endpoint-protection-and-system-hardening', 'cybersecurity-operations', 'Apply endpoint protection and system hardening', 3, now(), now()),
  ('manage-operational-cybersecurity-soc', 'cybersecurity-operations', 'Manage operational cybersecurity (SOC)', 4, now(), now()),
  
  -- Support & Improvement (6 processus)
  ('maintain-product-service-catalog', 'support-improvement', 'Maintain product & service catalog', 1, now(), now()),
  ('monitor-sla-and-service-performance', 'support-improvement', 'Monitor SLA and service performance', 2, now(), now()),
  ('manage-requests', 'support-improvement', 'Manage requests', 3, now(), now()),
  ('manage-problems', 'support-improvement', 'Manage problems', 4, now(), now()),
  ('deliver-user-documentation-training', 'support-improvement', 'Deliver user documentation & training', 5, now(), now()),
  ('improve-based-on-user-satisfaction', 'support-improvement', 'Improve based on user satisfaction', 6, now(), now()),
  
  -- IT Finance & Controlling (4 processus)
  ('manage-budgets-and-invest', 'it-finance-controlling', 'Manage budgets and invest', 1, now(), now()),
  ('allocate-costs', 'it-finance-controlling', 'Allocate costs', 2, now(), now()),
  ('control-costs-and-performance', 'it-finance-controlling', 'Control costs and performance', 3, now(), now()),
  ('perform-billing-and-reporting-to-customers', 'it-finance-controlling', 'Perform billing and reporting to customers', 4, now(), now()),
  
  -- IT Organization & HR (5 processus)
  ('design-manage-organization-structure', 'it-organization-hr', 'Design & manage organization structure', 1, now(), now()),
  ('plan-strategic-workforce', 'it-organization-hr', 'Plan strategic workforce', 2, now(), now()),
  ('manage-capacity-and-staffing', 'it-organization-hr', 'Manage capacity and staffing', 3, now(), now()),
  ('manage-trainings-and-knowledge', 'it-organization-hr', 'Manage trainings and knowledge', 4, now(), now()),
  ('lead-change-and-manage-communication', 'it-organization-hr', 'Lead change and manage communication', 5, now(), now()),
  
  -- IT Asset Management (3 processus)
  ('manage-application-portfolio-apm', 'it-asset-management', 'Manage application portfolio (APM)', 1, now(), now()),
  ('manage-software-assets-sam', 'it-asset-management', 'Manage software assets (SAM)', 2, now(), now()),
  ('manage-hardware-assets-ham', 'it-asset-management', 'Manage hardware assets (HAM)', 3, now(), now()),
  
  -- IT Sourcing & Procurement (4 processus)
  ('define-sourcing-strategy', 'it-sourcing-procurement', 'Define sourcing strategy', 1, now(), now()),
  ('select-supplier-and-manage-transition', 'it-sourcing-procurement', 'Select supplier and manage transition', 2, now(), now()),
  ('manage-service-supply', 'it-sourcing-procurement', 'Manage service supply', 3, now(), now()),
  ('manage-vendor-relationships-and-contracts', 'it-sourcing-procurement', 'Manage vendor relationships and contracts', 4, now(), now());

-- Mise à jour des niveaux de maturité par défaut pour tous les nouveaux processus
UPDATE processes 
SET maturity_levels = jsonb_build_object(
  '1', 'Initial/Ad-hoc: Basic or no processes exist',
  '2', 'Repeatable: Processes follow a regular pattern', 
  '3', 'Defined: Processes are documented and standardized',
  '4', 'Managed: Processes are measured and controlled',
  '5', 'Optimized: Focus on process improvement'
)
WHERE maturity_levels IS NULL;

-- Mise à jour des descriptions courtes par défaut
UPDATE processes 
SET short_description = 'En cours de définition'
WHERE short_description IS NULL;

-- Mise à jour des tableaux par défaut
UPDATE processes 
SET description = ARRAY[]::text[],
    key_questions = ARRAY[]::text[],
    key_artifacts = ARRAY[]::text[]
WHERE description IS NULL OR key_questions IS NULL OR key_artifacts IS NULL;