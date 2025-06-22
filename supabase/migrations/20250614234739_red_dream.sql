/*
  # Drop conflicting category_scores view

  1. Changes
    - Drop the existing `category_scores` view that conflicts with the table
    - This allows the application to interact with the `category_scores` table as expected
    
  2. Background
    - The application expects a `category_scores` table with an `is_manual` column
    - Currently there's a view with the same name that doesn't have this column
    - Dropping the view resolves the naming conflict
*/

DROP VIEW IF EXISTS category_scores;