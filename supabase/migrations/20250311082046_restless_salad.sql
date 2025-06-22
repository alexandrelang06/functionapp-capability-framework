/*
  # Update Annual Revenue Description

  1. Changes
    - Updates the description for annual revenue field to be more precise
*/

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM field_descriptions 
    WHERE id = 'annualRevenue'
  ) THEN
    UPDATE field_descriptions 
    SET description = 'Chiffre d''affaires de l''entreprise à la dernière clôture'
    WHERE id = 'annualRevenue';
  ELSE
    INSERT INTO field_descriptions (id, description)
    VALUES ('annualRevenue', 'Chiffre d''affaires de l''entreprise à la dernière clôture');
  END IF;
END $$;