/*
  # Update Assessment Form Fields

  This migration updates the assessment form fields structure with new field descriptions and challenge options.

  1. Changes
    - Updates challenges array constraint with new predefined options
    - Adds field descriptions to the database schema
*/

-- Add field descriptions table to store help text
CREATE TABLE IF NOT EXISTS field_descriptions (
  id text PRIMARY KEY,
  description text NOT NULL
);

-- Insert field descriptions
INSERT INTO field_descriptions (id, description) VALUES
  ('country', 'Pays de l''entité principale auditée ou, en cas de décentralisation totale, pays du siège social'),
  ('company_name', 'Nom légal complet de l''entreprise'),
  ('industry', 'Secteur d''activité principal de l''entreprise'),
  ('company_size', 'Nombre total d''employés dans l''entreprise'),
  ('annual_revenue', 'Chiffre d''affaires annuel de l''entreprise'),
  ('it_department_size', 'Nombre total d''employés IT (internes et externes)'),
  ('annual_it_cost', 'Coût IT annuel total incluant les coûts directs et indirects'),
  ('cio_organization', 'Structure organisationnelle de la DSI'),
  ('strategy_context', 'Description du contexte stratégique et business de l''entreprise'),
  ('technology_context', 'Description de la stratégie et du contexte technologique'),
  ('challenges', 'Principaux défis et objectifs de transformation'),
  ('assessment_scope', 'Périmètre précis de l''évaluation'),
  ('bearingpoint_advisor', 'Nom du consultant BearingPoint en charge de la mission')
ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description;