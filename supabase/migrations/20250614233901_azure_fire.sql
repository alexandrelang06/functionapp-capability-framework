/*
  # Création de la table category_scores pour les scores des macro-processus

  1. Nouvelle table
    - `category_scores` pour stocker les scores des macro-processus
    - Peut être soit calculé automatiquement soit saisi manuellement

  2. Structure
    - assessment_id: référence vers l'évaluation
    - category_id: référence vers le macro-processus
    - manual_score: score saisi manuellement (peut être null)
    - is_manual: booléen indiquant si le score est manuel ou calculé
    - created_at/updated_at: timestamps

  3. Sécurité
    - RLS activé
    - Politiques pour les utilisateurs authentifiés
*/

-- Création de la table category_scores
CREATE TABLE IF NOT EXISTS category_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  category_id text NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  manual_score numeric CHECK (manual_score IS NULL OR (manual_score >= 1 AND manual_score <= 5)),
  is_manual boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(assessment_id, category_id)
);

-- Activation de RLS
ALTER TABLE category_scores ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view all category scores"
  ON category_scores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert category scores"
  ON category_scores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update category scores"
  ON category_scores
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete category scores"
  ON category_scores
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger pour updated_at
CREATE TRIGGER update_category_scores_timestamp
  BEFORE UPDATE ON category_scores
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Index pour les performances
CREATE INDEX idx_category_scores_assessment_category ON category_scores(assessment_id, category_id);