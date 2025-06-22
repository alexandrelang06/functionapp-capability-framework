/*
  # Nettoyage complet de la base de données

  1. Suppression des données
    - Supprime tous les scores existants
    - Supprime toutes les évaluations existantes
    - Supprime toutes les entreprises existantes
    - Préserve la structure du framework (domaines, catégories, processus)

  2. Sécurité
    - Respecte l'ordre des suppressions pour éviter les erreurs de contraintes
    - Préserve l'intégrité référentielle
*/

-- Suppression des scores (table enfant)
DELETE FROM scores;

-- Suppression des métadonnées d'évaluation
DELETE FROM assessment_metadata;

-- Suppression des évaluations
DELETE FROM assessments;

-- Suppression des entreprises
DELETE FROM companies;

-- Vérification que la structure du framework est bien en place
-- (Les domaines, catégories et processus doivent rester intacts)

-- Log de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Base de données nettoyée avec succès. Structure du framework préservée.';
END $$;